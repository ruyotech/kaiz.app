import { View, Text, ScrollView, Pressable, TouchableOpacity, FlatList, Modal } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Container } from '../../../../components/layout/Container';
import { ScreenHeader } from '../../../../components/layout/ScreenHeader';
import { useState, useEffect } from 'react';
import { useEpicStore } from '../../../../store/epicStore';
import { useTaskStore } from '../../../../store/taskStore';
import { Task } from '../../../../types/models';

export default function EpicDetailScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const epicId = Array.isArray(id) ? id[0] : id;
    
    const { epics, fetchEpics, addTaskToEpic, removeTaskFromEpic } = useEpicStore();
    const { tasks, fetchTasks, updateTask } = useTaskStore();
    const [showAddTaskModal, setShowAddTaskModal] = useState(false);
    const [selectedTab, setSelectedTab] = useState<'tasks' | 'stats'>('tasks');

    useEffect(() => {
        fetchEpics();
        fetchTasks();
    }, []);

    const epic = epics.find(e => e.id === epicId);
    const epicTasks = tasks.filter(t => epic?.taskIds?.includes(t.id));
    const availableTasks = tasks.filter(t => !t.epicId || t.epicId === null);

    if (!epic) {
        return (
            <Container>
                <ScreenHeader title="Epic Not Found" showBack />
                <View className="flex-1 items-center justify-center p-6">
                    <Text className="text-gray-500">Epic not found</Text>
                </View>
            </Container>
        );
    }

    const progress = epic.totalPoints > 0 ? epic.completedPoints / epic.totalPoints : 0;
    const completedTasks = epicTasks.filter(t => t.status === 'done').length;

    const handleAddTask = (taskId: string) => {
        addTaskToEpic(epicId, taskId);
        updateTask(taskId, { epicId });
        setShowAddTaskModal(false);
    };

    const handleRemoveTask = (taskId: string) => {
        removeTaskFromEpic(epicId, taskId);
        updateTask(taskId, { epicId: null });
    };

    const renderTaskItem = ({ item }: { item: Task }) => (
        <View className="bg-white rounded-xl p-4 mb-3 border border-gray-100">
            <View className="flex-row items-start justify-between mb-2">
                <View className="flex-1">
                    <Text className="text-base font-semibold text-gray-900 mb-1">{item.title}</Text>
                    <Text className="text-sm text-gray-500" numberOfLines={2}>{item.description}</Text>
                </View>
                <TouchableOpacity
                    onPress={() => handleRemoveTask(item.id)}
                    className="ml-2 p-2"
                >
                    <MaterialCommunityIcons name="close-circle" size={20} color="#EF4444" />
                </TouchableOpacity>
            </View>
            
            <View className="flex-row items-center justify-between mt-3 pt-3 border-t border-gray-50">
                <View className="flex-row items-center gap-3">
                    <View className="flex-row items-center">
                        <MaterialCommunityIcons name="checkbox-marked-circle" size={16} color="#6B7280" />
                        <Text className="text-xs text-gray-600 ml-1 font-medium">{item.storyPoints} pts</Text>
                    </View>
                    <View className={`px-2 py-1 rounded-md ${
                        item.status === 'done' ? 'bg-green-100' :
                        item.status === 'in_progress' ? 'bg-blue-100' :
                        'bg-gray-100'
                    }`}>
                        <Text className={`text-xs font-bold capitalize ${
                            item.status === 'done' ? 'text-green-700' :
                            item.status === 'in_progress' ? 'text-blue-700' :
                            'text-gray-700'
                        }`}>
                            {item.status.replace('_', ' ')}
                        </Text>
                    </View>
                </View>
                
                <TouchableOpacity
                    onPress={() => router.push(`/(tabs)/sprints/task/${item.id}` as any)}
                >
                    <MaterialCommunityIcons name="chevron-right" size={20} color="#9CA3AF" />
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderAvailableTask = ({ item }: { item: Task }) => (
        <TouchableOpacity
            onPress={() => handleAddTask(item.id)}
            className="bg-white rounded-xl p-4 mb-3 border border-gray-200"
        >
            <View className="flex-row items-center justify-between">
                <View className="flex-1 mr-3">
                    <Text className="text-base font-semibold text-gray-900 mb-1">{item.title}</Text>
                    <Text className="text-sm text-gray-500" numberOfLines={1}>{item.description}</Text>
                    <View className="flex-row items-center mt-2">
                        <MaterialCommunityIcons name="checkbox-marked-circle" size={14} color="#6B7280" />
                        <Text className="text-xs text-gray-600 ml-1">{item.storyPoints} pts</Text>
                    </View>
                </View>
                <MaterialCommunityIcons name="plus-circle" size={28} color="#3B82F6" />
            </View>
        </TouchableOpacity>
    );

    return (
        <Container>
            <ScreenHeader 
                title={epic.title} 
                showBack
                rightAction={
                    <TouchableOpacity className="p-2">
                        <MaterialCommunityIcons name="dots-vertical" size={24} color="#374151" />
                    </TouchableOpacity>
                }
            />

            <ScrollView className="flex-1">
                {/* Epic Header Card */}
                <View className="mx-4 mt-4 mb-4">
                    <View className="bg-white rounded-2xl overflow-hidden border border-gray-100">
                        <View className="h-2" style={{ backgroundColor: epic.color }} />
                        
                        <View className="p-5">
                            <View className="flex-row items-center justify-between mb-4">
                                <View className="flex-row items-center">
                                    <View 
                                        className="w-12 h-12 rounded-xl items-center justify-center mr-3"
                                        style={{ backgroundColor: epic.color + '20' }}
                                    >
                                        <MaterialCommunityIcons 
                                            name={epic.icon as any} 
                                            size={24} 
                                            color={epic.color} 
                                        />
                                    </View>
                                    <View>
                                        <Text className="text-xl font-bold text-gray-900">{epic.title}</Text>
                                        <Text className="text-sm text-gray-500 mt-1">
                                            {new Date(epic.startDate).toLocaleDateString()} - {new Date(epic.endDate).toLocaleDateString()}
                                        </Text>
                                    </View>
                                </View>
                                <View className={`px-3 py-1.5 rounded-lg ${
                                    epic.status === 'active' ? 'bg-blue-100' :
                                    epic.status === 'completed' ? 'bg-green-100' :
                                    'bg-gray-100'
                                }`}>
                                    <Text className={`text-xs font-bold capitalize ${
                                        epic.status === 'active' ? 'text-blue-700' :
                                        epic.status === 'completed' ? 'text-green-700' :
                                        'text-gray-700'
                                    }`}>
                                        {epic.status}
                                    </Text>
                                </View>
                            </View>

                            <Text className="text-gray-600 mb-4 leading-relaxed">{epic.description}</Text>

                            {/* Progress Bar */}
                            <View className="mb-4">
                                <View className="flex-row justify-between mb-2">
                                    <Text className="text-xs text-gray-500 font-semibold">PROGRESS</Text>
                                    <Text className="text-xs text-gray-900 font-bold">
                                        {Math.round(progress * 100)}% • {epic.completedPoints}/{epic.totalPoints} pts
                                    </Text>
                                </View>
                                <View className="h-3 bg-gray-100 rounded-full overflow-hidden">
                                    <View
                                        className="h-full rounded-full"
                                        style={{
                                            width: `${progress * 100}%`,
                                            backgroundColor: epic.color
                                        }}
                                    />
                                </View>
                            </View>

                            {/* Stats Grid */}
                            <View className="flex-row gap-2">
                                <View className="flex-1 bg-blue-50 p-3 rounded-xl">
                                    <Text className="text-lg font-bold text-blue-700">{epicTasks.length}</Text>
                                    <Text className="text-xs text-blue-600 font-medium">Tasks</Text>
                                </View>
                                <View className="flex-1 bg-green-50 p-3 rounded-xl">
                                    <Text className="text-lg font-bold text-green-700">{completedTasks}</Text>
                                    <Text className="text-xs text-green-600 font-medium">Done</Text>
                                </View>
                                <View className="flex-1 bg-purple-50 p-3 rounded-xl">
                                    <Text className="text-lg font-bold text-purple-700">{epicTasks.length - completedTasks}</Text>
                                    <Text className="text-xs text-purple-600 font-medium">Remaining</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Tasks Section */}
                <View className="px-4 pb-6">
                    <View className="flex-row items-center justify-between mb-4">
                        <Text className="text-lg font-bold text-gray-900">Tasks</Text>
                        <TouchableOpacity
                            onPress={() => setShowAddTaskModal(true)}
                            className="flex-row items-center bg-blue-600 px-4 py-2 rounded-lg"
                        >
                            <MaterialCommunityIcons name="plus" size={18} color="white" />
                            <Text className="text-white font-semibold ml-1">Add Task</Text>
                        </TouchableOpacity>
                    </View>

                    {epicTasks.length === 0 ? (
                        <View className="bg-gray-50 rounded-xl p-8 items-center">
                            <MaterialCommunityIcons name="clipboard-text-outline" size={48} color="#9CA3AF" />
                            <Text className="text-gray-500 mt-3 text-center">No tasks yet</Text>
                            <Text className="text-gray-400 text-sm mt-1 text-center">Add existing tasks or create new ones</Text>
                        </View>
                    ) : (
                        <FlatList
                            data={epicTasks}
                            renderItem={renderTaskItem}
                            keyExtractor={item => item.id}
                            scrollEnabled={false}
                        />
                    )}
                </View>
            </ScrollView>

            {/* Add Task Modal */}
            <Modal
                visible={showAddTaskModal}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setShowAddTaskModal(false)}
            >
                <View className="flex-1 bg-gray-50">
                    <View className="bg-white border-b border-gray-200">
                        <View className="flex-row items-center justify-between px-4 pt-4 pb-3">
                            <TouchableOpacity onPress={() => setShowAddTaskModal(false)}>
                                <MaterialCommunityIcons name="close" size={24} color="#374151" />
                            </TouchableOpacity>
                            <Text className="text-lg font-bold text-gray-900">Add Tasks to Epic</Text>
                            <View style={{ width: 24 }} />
                        </View>
                    </View>

                    <ScrollView className="flex-1 px-4 pt-4">
                        <Text className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                            Available Tasks ({availableTasks.length})
                        </Text>

                        {availableTasks.length === 0 ? (
                            <View className="bg-white rounded-xl p-8 items-center">
                                <MaterialCommunityIcons name="checkbox-marked-circle-outline" size={48} color="#9CA3AF" />
                                <Text className="text-gray-500 mt-3">No available tasks</Text>
                                <Text className="text-gray-400 text-sm mt-1 text-center">
                                    All tasks are already assigned to epics
                                </Text>
                            </View>
                        ) : (
                            <FlatList
                                data={availableTasks}
                                renderItem={renderAvailableTask}
                                keyExtractor={item => item.id}
                                scrollEnabled={false}
                            />
                        )}

                        <TouchableOpacity
                            onPress={() => {
                                setShowAddTaskModal(false);
                                router.push('/(tabs)/sprints/create-task' as any);
                            }}
                            className="bg-gray-900 rounded-xl p-4 mt-4 mb-6 flex-row items-center justify-center"
                        >
                            <MaterialCommunityIcons name="plus-circle" size={20} color="white" />
                            <Text className="text-white font-bold ml-2">Create New Task</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </Modal>
        </Container>
    );
}
