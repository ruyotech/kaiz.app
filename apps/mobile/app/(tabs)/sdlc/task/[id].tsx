import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, Pressable } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Task } from '../../../../types/models';
import { lifeWheelApi } from '../../../../services/api';
import { useEpicStore } from '../../../../store/epicStore';
import { useTaskStore } from '../../../../store/taskStore';

type TabType = 'overview' | 'comments' | 'checklist' | 'history';

type Comment = {
    id: string;
    userId: string;
    userName: string;
    text: string;
    timestamp: Date;
};

type ChecklistItem = {
    id: string;
    text: string;
    completed: boolean;
};

type HistoryItem = {
    id: string;
    userId: string;
    userName: string;
    action: string;
    timestamp: Date;
    details: string;
};

interface LifeWheelArea {
    id: string;
    displayId: string;
    name: string;
    icon: string;
}

export default function TaskWorkView() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const { epics, fetchEpics } = useEpicStore();
    const { tasks, fetchTasks, getTaskHistory, addTaskHistory } = useTaskStore();
    const [loading, setLoading] = useState(true);
    const [task, setTask] = useState<Task | null>(null);
    const [activeTab, setActiveTab] = useState<TabType>('overview');
    const [lifeWheelAreas, setLifeWheelAreas] = useState<LifeWheelArea[]>([]);

    // Comments
    const [comments, setComments] = useState<Comment[]>([
        {
            id: '1',
            userId: 'user1',
            userName: 'John Doe',
            text: 'Started working on this task. Will focus on the backend integration first.',
            timestamp: new Date(Date.now() - 3600000),
        },
    ]);
    const [newComment, setNewComment] = useState('');

    // Checklist
    const [checklist, setChecklist] = useState<ChecklistItem[]>([
        { id: '1', text: 'Review requirements', completed: true },
        { id: '2', text: 'Design solution', completed: true },
        { id: '3', text: 'Implement backend', completed: false },
        { id: '4', text: 'Write tests', completed: false },
        { id: '5', text: 'Deploy to staging', completed: false },
    ]);
    const [newChecklistItem, setNewChecklistItem] = useState('');
    const [showAddChecklist, setShowAddChecklist] = useState(false);

    // Quick status update
    const [showStatusMenu, setShowStatusMenu] = useState(false);

    // Get history from store
    const history = task ? getTaskHistory(task.id) : [];

    useEffect(() => {
        loadTask();
        fetchEpics();
        loadLifeWheelAreas();
    }, [id]);

    const loadTask = async () => {
        try {
            setLoading(true);
            await fetchTasks();
        } catch (error) {
            console.error('Error loading task:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadLifeWheelAreas = async () => {
        try {
            const areas = await lifeWheelApi.getLifeWheelAreas();
            setLifeWheelAreas(areas);
        } catch (error) {
            console.error('Error loading life wheel areas:', error);
        }
    };

    // Update task when tasks are loaded
    useEffect(() => {
        const foundTask = tasks.find((t: Task) => t.id === id);
        if (foundTask) {
            setTask(foundTask);

            // Initialize history if empty
            const existingHistory = getTaskHistory(foundTask.id);
            if (existingHistory.length === 0) {
                addTaskHistory(foundTask.id, {
                    userId: 'user2',
                    userName: 'Jane Smith',
                    action: 'Task created',
                    details: 'Created task in Sprint 03',
                });
            }
        }
    }, [tasks, id]);

    const getTaskEpic = () => {
        if (!task || !task.epicId) return null;
        return epics.find(e => e.id === task.epicId);
    };

    const getLifeWheelName = () => {
        if (!task) return '';
        const area = lifeWheelAreas.find(a => a.displayId === task.lifeWheelAreaId || a.id === task.lifeWheelAreaId);
        return area ? `${area.icon} ${area.name}` : '';
    };

    const statusOptions: Array<{ value: Task['status'] | 'blocked'; label: string; icon: string; color: string; bgColor: string }> = [
        { value: 'draft', label: 'Draft', icon: 'file-document-edit', color: '#9CA3AF', bgColor: '#6B7280' },
        { value: 'todo', label: 'To Do', icon: 'checkbox-blank-circle-outline', color: '#6B7280', bgColor: '#4B5563' },
        { value: 'in_progress', label: 'In Progress', icon: 'progress-clock', color: '#3B82F6', bgColor: '#2563EB' },
        { value: 'blocked', label: 'Blocked', icon: 'alert-circle', color: '#EF4444', bgColor: '#DC2626' },
        { value: 'done', label: 'Done', icon: 'check-circle', color: '#10B981', bgColor: '#059669' },
    ];

    const handleStatusChange = (newStatus: Task['status']) => {
        if (task) {
            setTask({ ...task, status: newStatus });
            // Add to history
            addTaskHistory(task.id, {
                userId: 'current-user',
                userName: 'You',
                action: 'Status changed',
                details: `Changed from "${task.status}" to "${newStatus}"`,
            });
        }
        setShowStatusMenu(false);
    };

    const handleAddComment = () => {
        if (newComment.trim()) {
            const comment: Comment = {
                id: Date.now().toString(),
                userId: 'current-user',
                userName: 'You',
                text: newComment,
                timestamp: new Date(),
            };
            setComments([...comments, comment]);
            setNewComment('');
        }
    };

    const toggleChecklistItem = (itemId: string) => {
        setChecklist(checklist.map(item =>
            item.id === itemId ? { ...item, completed: !item.completed } : item
        ));
    };

    const handleAddChecklistItem = () => {
        if (newChecklistItem.trim()) {
            const item: ChecklistItem = {
                id: Date.now().toString(),
                text: newChecklistItem,
                completed: false,
            };
            setChecklist([...checklist, item]);
            setNewChecklistItem('');
            setShowAddChecklist(false);
        }
    };

    if (loading || !task) {
        return (
            <View className="flex-1 items-center justify-center bg-white">
                <Text>Loading...</Text>
            </View>
        );
    }

    const currentStatus = statusOptions.find(s => s.value === task.status) || statusOptions[0];
    const completedChecklist = checklist.filter(item => item.completed).length;
    const totalChecklist = checklist.length;

    return (
        <View className="flex-1 bg-gray-50">
            {/* Header with Task Name - Status Based Color */}
            <View style={{ backgroundColor: currentStatus.bgColor }} className="pt-12 pb-4 px-4">
                <View className="flex-row items-center mb-3">
                    <TouchableOpacity onPress={() => router.back()} className="mr-3">
                        <MaterialCommunityIcons name="arrow-left" size={24} color="white" />
                    </TouchableOpacity>
                    <Text className="text-white text-lg font-bold flex-1" numberOfLines={2}>
                        {task.title}
                    </Text>
                    {/* Compact Icon Buttons */}
                    <View className="flex-row gap-2">
                        <TouchableOpacity
                            onPress={() => setShowStatusMenu(true)}
                            className="w-9 h-9 bg-white/20 rounded-lg items-center justify-center border border-white/40"
                        >
                            <MaterialCommunityIcons name={currentStatus.icon as any} size={18} color="white" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => router.push(`/(tabs)/sdlc/task/edit?id=${task.id}` as any)}
                            className="w-9 h-9 bg-white/20 rounded-lg items-center justify-center border border-white/40"
                        >
                            <MaterialCommunityIcons name="pencil" size={18} color="white" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => {
                                // Navigate to Pomodoro with task context
                                router.push({
                                    pathname: '/(tabs)/pomodoro',
                                    params: { 
                                        taskId: task.id, 
                                        taskTitle: task.title,
                                        taskDescription: task.description,
                                        taskStoryPoints: task.storyPoints,
                                        taskQuadrant: task.quadrant,
                                        returnTo: 'task'
                                    }
                                } as any);
                            }}
                            className="w-9 h-9 bg-white/20 rounded-lg items-center justify-center border border-white/40"
                        >
                            <MaterialCommunityIcons name="bullseye-arrow" size={18} color="white" />
                        </TouchableOpacity>
                    </View>
                </View>

            </View>

            {/* Tab Bar */}
            <View className="bg-white border-b border-gray-200 flex-row">
                {[
                    { id: 'overview', label: 'Overview', icon: 'information-outline' },
                    { id: 'comments', label: 'Comments', icon: 'comment-outline', badge: comments.length },
                    { id: 'checklist', label: 'Checklist', icon: 'checkbox-marked-outline', badge: `${completedChecklist}/${totalChecklist}` },
                    { id: 'history', label: 'History', icon: 'history' },
                ].map((tab) => (
                    <TouchableOpacity
                        key={tab.id}
                        onPress={() => setActiveTab(tab.id as TabType)}
                        className={`flex-1 py-3 border-b-2 ${activeTab === tab.id ? 'border-blue-600' : 'border-transparent'
                            }`}
                    >
                        <View className="items-center">
                            <View className="flex-row items-center">
                                <MaterialCommunityIcons
                                    name={tab.icon as any}
                                    size={18}
                                    color={activeTab === tab.id ? '#3B82F6' : '#9CA3AF'}
                                />
                                {tab.badge && (
                                    <View className="ml-1 bg-blue-100 px-1.5 py-0.5 rounded-full">
                                        <Text className="text-xs text-blue-600 font-semibold">{tab.badge}</Text>
                                    </View>
                                )}
                            </View>
                            <Text
                                className={`text-xs mt-1 ${activeTab === tab.id ? 'text-blue-600 font-semibold' : 'text-gray-600'
                                    }`}
                            >
                                {tab.label}
                            </Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Tab Content */}
            <ScrollView className="flex-1">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <View className="p-4">
                        {/* Task Info Cards */}
                        <View className="bg-white rounded-xl p-4 mb-3 shadow-sm">
                            <Text className="text-sm font-semibold text-gray-700 mb-3">Task Details</Text>
                            {task.description && (
                                <View className="mb-4 pb-4 border-b border-gray-100">
                                    <Text className="text-xs text-gray-500 mb-1.5">Description</Text>
                                    <Text className="text-gray-700 leading-5">{task.description}</Text>
                                </View>
                            )}
                            <View className="flex-row flex-wrap gap-3">
                                <View className="flex-1 min-w-[45%]">
                                    <Text className="text-xs text-gray-500 mb-1">Story Points</Text>
                                    <View className="flex-row items-center">
                                        <View className="w-8 h-8 bg-blue-100 rounded-full items-center justify-center mr-2">
                                            <Text className="text-blue-600 font-bold text-sm">{task.storyPoints}</Text>
                                        </View>
                                        <Text className="text-gray-600 text-xs">points</Text>
                                    </View>
                                </View>
                                <View className="flex-1 min-w-[45%]">
                                    <Text className="text-xs text-gray-500 mb-1">Life Wheel</Text>
                                    <Text className="text-gray-800 font-medium">{getLifeWheelName()}</Text>
                                </View>
                            </View>
                        </View>

                        {/* Eisenhower Matrix & Tags */}
                        <View className="bg-white rounded-xl p-4 mb-3 shadow-sm">
                            <Text className="text-sm font-semibold text-gray-700 mb-3">Priority & Tags</Text>

                            {/* Eisenhower Quadrant */}
                            <View className="mb-3">
                                <Text className="text-xs text-gray-500 mb-2">Eisenhower Matrix</Text>
                                <View className={`px-4 py-2.5 rounded-lg border-2 ${task.eisenhowerQuadrantId === 'eq-1' ? 'bg-red-50 border-red-300' :
                                    task.eisenhowerQuadrantId === 'eq-2' ? 'bg-blue-50 border-blue-300' :
                                        task.eisenhowerQuadrantId === 'eq-3' ? 'bg-yellow-50 border-yellow-300' :
                                            'bg-gray-50 border-gray-300'
                                    }`}>
                                    <Text className="font-medium text-gray-800">
                                        {task.eisenhowerQuadrantId === 'eq-1' && '🔴 Urgent & Important'}
                                        {task.eisenhowerQuadrantId === 'eq-2' && '🔵 Not Urgent & Important'}
                                        {task.eisenhowerQuadrantId === 'eq-3' && '🟡 Urgent & Not Important'}
                                        {task.eisenhowerQuadrantId === 'eq-4' && '⚪ Not Urgent & Not Important'}
                                    </Text>
                                </View>
                            </View>

                            {/* Sprint & Epic Tags */}
                            <View className="flex-row gap-2 flex-wrap">
                                {task.sprintId && (
                                    <View className="bg-purple-100 px-3 py-1.5 rounded-lg border border-purple-200">
                                        <Text className="text-purple-700 font-medium text-xs">📅 Sprint {task.sprintId}</Text>
                                    </View>
                                )}
                                {task.epicId && getTaskEpic() && (
                                    <View 
                                        className="px-3 py-1.5 rounded-lg flex-row items-center"
                                        style={{ 
                                            backgroundColor: getTaskEpic()!.color + '20',
                                            borderColor: getTaskEpic()!.color,
                                            borderWidth: 1
                                        }}
                                    >
                                        <MaterialCommunityIcons 
                                            name={getTaskEpic()!.icon as any} 
                                            size={14} 
                                            color={getTaskEpic()!.color} 
                                        />
                                        <Text 
                                            className="font-bold text-xs ml-1.5"
                                            style={{ color: getTaskEpic()!.color }}
                                        >
                                            {getTaskEpic()!.title}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        </View>

                        {/* Quick Actions */}
                        <View className="bg-white rounded-xl p-4 shadow-sm">
                            <Text className="text-sm font-semibold text-gray-700 mb-3">Quick Actions</Text>
                            <TouchableOpacity className="bg-gray-100 py-3.5 rounded-lg mb-2 flex-row items-center justify-center">
                                <MaterialCommunityIcons name="playlist-plus" size={20} color="#4B5563" />
                                <Text className="text-gray-700 font-semibold ml-2">Add Sub-task</Text>
                            </TouchableOpacity>
                            <TouchableOpacity className="bg-gray-100 py-3.5 rounded-lg flex-row items-center justify-center">
                                <MaterialCommunityIcons name="link-variant-plus" size={20} color="#4B5563" />
                                <Text className="text-gray-700 font-semibold ml-2">Add Related Task</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {/* Comments Tab */}
                {activeTab === 'comments' && (
                    <View className="p-4">
                        {comments.map((comment) => (
                            <View key={comment.id} className="bg-white rounded-lg p-4 mb-3">
                                <View className="flex-row justify-between items-start mb-2">
                                    <Text className="font-semibold text-gray-800">{comment.userName}</Text>
                                    <Text className="text-xs text-gray-500">
                                        {comment.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </Text>
                                </View>
                                <Text className="text-gray-600">{comment.text}</Text>
                            </View>
                        ))}

                        <View className="bg-white rounded-lg p-4">
                            <TextInput
                                value={newComment}
                                onChangeText={setNewComment}
                                placeholder="Add a comment about your progress..."
                                multiline
                                numberOfLines={3}
                                className="border border-gray-300 rounded-lg px-3 py-2 mb-3"
                                textAlignVertical="top"
                            />

                            {/* Attachment Options */}
                            <View className="flex-row gap-2 mb-3">
                                <TouchableOpacity className="flex-1 bg-gray-100 py-2.5 rounded-lg flex-row items-center justify-center">
                                    <MaterialCommunityIcons name="image" size={18} color="#6B7280" />
                                    <Text className="text-gray-700 text-xs font-medium ml-1.5">Image</Text>
                                </TouchableOpacity>
                                <TouchableOpacity className="flex-1 bg-gray-100 py-2.5 rounded-lg flex-row items-center justify-center">
                                    <MaterialCommunityIcons name="camera" size={18} color="#6B7280" />
                                    <Text className="text-gray-700 text-xs font-medium ml-1.5">Camera</Text>
                                </TouchableOpacity>
                                <TouchableOpacity className="flex-1 bg-gray-100 py-2.5 rounded-lg flex-row items-center justify-center">
                                    <MaterialCommunityIcons name="file" size={18} color="#6B7280" />
                                    <Text className="text-gray-700 text-xs font-medium ml-1.5">File</Text>
                                </TouchableOpacity>
                                <TouchableOpacity className="flex-1 bg-gray-100 py-2.5 rounded-lg flex-row items-center justify-center">
                                    <MaterialCommunityIcons name="microphone" size={18} color="#6B7280" />
                                    <Text className="text-gray-700 text-xs font-medium ml-1.5">Voice</Text>
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity
                                onPress={handleAddComment}
                                disabled={!newComment.trim()}
                                className={`py-3 rounded-lg ${newComment.trim() ? 'bg-blue-600' : 'bg-gray-300'}`}
                            >
                                <Text className="text-white text-center font-semibold">Post Comment</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {/* Checklist Tab */}
                {
                    activeTab === 'checklist' && (
                        <View className="p-4">
                            <View className="bg-white rounded-lg overflow-hidden mb-3">
                                {checklist.map((item) => (
                                    <TouchableOpacity
                                        key={item.id}
                                        onPress={() => toggleChecklistItem(item.id)}
                                        className="flex-row items-center p-4 border-b border-gray-100"
                                    >
                                        <View className={`w-6 h-6 rounded border-2 items-center justify-center mr-3 ${item.completed ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
                                            }`}>
                                            {item.completed && (
                                                <MaterialCommunityIcons name="check" size={16} color="white" />
                                            )}
                                        </View>
                                        <Text className={`flex-1 ${item.completed ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                                            {item.text}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {showAddChecklist ? (
                                <View className="bg-white rounded-lg p-4">
                                    <TextInput
                                        value={newChecklistItem}
                                        onChangeText={setNewChecklistItem}
                                        placeholder="Enter checklist item..."
                                        className="border border-gray-300 rounded-lg px-3 py-2 mb-3"
                                        autoFocus
                                    />
                                    <View className="flex-row gap-2">
                                        <TouchableOpacity
                                            onPress={handleAddChecklistItem}
                                            disabled={!newChecklistItem.trim()}
                                            className={`flex-1 py-3 rounded-lg ${newChecklistItem.trim() ? 'bg-blue-600' : 'bg-gray-300'}`}
                                        >
                                            <Text className="text-white text-center font-semibold">Add</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            onPress={() => {
                                                setShowAddChecklist(false);
                                                setNewChecklistItem('');
                                            }}
                                            className="flex-1 py-3 rounded-lg bg-gray-100"
                                        >
                                            <Text className="text-gray-700 text-center font-semibold">Cancel</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ) : (
                                <TouchableOpacity
                                    onPress={() => setShowAddChecklist(true)}
                                    className="bg-white rounded-lg p-4 flex-row items-center justify-center"
                                >
                                    <MaterialCommunityIcons name="plus-circle-outline" size={20} color="#3B82F6" />
                                    <Text className="text-blue-600 font-semibold ml-2">Add Checklist Item</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    )
                }

                {/* History Tab */}
                {
                    activeTab === 'history' && (
                        <View className="p-4">
                            {history.map((item) => (
                                <View key={item.id} className="bg-white rounded-lg p-4 mb-3">
                                    <View className="flex-row items-start">
                                        <View className="w-8 h-8 rounded-full bg-blue-100 items-center justify-center mr-3">
                                            <MaterialCommunityIcons name="account" size={18} color="#3B82F6" />
                                        </View>
                                        <View className="flex-1">
                                            <View className="flex-row justify-between items-start mb-1">
                                                <Text className="font-semibold text-gray-800">{item.userName}</Text>
                                                <Text className="text-xs text-gray-500">
                                                    {item.timestamp.toLocaleString()}
                                                </Text>
                                            </View>
                                            <Text className="text-sm text-gray-600 mb-1">{item.action}</Text>
                                            <Text className="text-sm text-gray-500">{item.details}</Text>
                                        </View>
                                    </View>
                                </View>
                            ))}
                        </View>
                    )
                }
            </ScrollView >

            {/* Quick Status Change Modal */}
            < Modal visible={showStatusMenu} transparent animationType="slide" >
                <Pressable
                    className="flex-1 bg-black/50 justify-end"
                    onPress={() => setShowStatusMenu(false)}
                >
                    <Pressable>
                        <View className="bg-white rounded-t-3xl pt-4 pb-8 px-4">
                            <View className="flex-row justify-between items-center mb-4">
                                <Text className="text-lg font-bold">Change Status</Text>
                                <TouchableOpacity onPress={() => setShowStatusMenu(false)}>
                                    <MaterialCommunityIcons name="close" size={24} color="#000" />
                                </TouchableOpacity>
                            </View>

                            {statusOptions.map((option) => (
                                <TouchableOpacity
                                    key={option.value}
                                    onPress={() => handleStatusChange(option.value)}
                                    className={`flex-row items-center p-4 rounded-lg mb-2 ${task.status === option.value ? 'bg-blue-50 border-2 border-blue-600' : 'bg-gray-50'
                                        }`}
                                >
                                    <MaterialCommunityIcons
                                        name={option.icon as any}
                                        size={24}
                                        color={option.color}
                                    />
                                    <Text className={`ml-3 text-base font-medium ${task.status === option.value ? 'text-blue-600' : 'text-gray-800'
                                        }`}>
                                        {option.label}
                                    </Text>
                                    {task.status === option.value && (
                                        <MaterialCommunityIcons
                                            name="check"
                                            size={20}
                                            color="#3B82F6"
                                            className="ml-auto"
                                        />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>
                    </Pressable>
                </Pressable>
            </Modal >
        </View >
    );
}
