/**
 * Family Shared Tasks Screen - Family Backlog
 * 
 * Features:
 * - View all shared family tasks
 * - Create new shared tasks
 * - Filter by status, assignee, visibility
 * - Assign tasks to family members
 */

import React, { useEffect, useState, useMemo } from 'react';
import { 
    View, 
    Text, 
    ScrollView, 
    TouchableOpacity, 
    RefreshControl,
    Modal,
    TextInput,
    Pressable,
    Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeContext } from '../../../providers/ThemeProvider';
import { useFamilyStore } from '../../../store/familyStore';
import { SharedTaskCard } from '../../../components/family/SharedTaskCard';
import { 
    SharedTask, 
    TaskVisibility,
    TASK_VISIBILITY_OPTIONS,
} from '../../../types/family.types';

type FilterStatus = 'all' | 'todo' | 'in_progress' | 'done' | 'blocked';
type SortOption = 'dueDate' | 'priority' | 'created';

export default function SharedTasksScreen() {
    const router = useRouter();
    const { colors, isDark } = useThemeContext();
    const {
        sharedTasks,
        sharedEpics,
        members,
        loading,
        hasPermission,
        fetchSharedTasks,
        createSharedTask,
        updateSharedTask,
        completeTask,
        assignTask,
    } = useFamilyStore();
    
    const [refreshing, setRefreshing] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
    const [filterAssignee, setFilterAssignee] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState<SortOption>('dueDate');
    const [selectedTask, setSelectedTask] = useState<SharedTask | null>(null);
    
    // New task form
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskDescription, setNewTaskDescription] = useState('');
    const [newTaskVisibility, setNewTaskVisibility] = useState<TaskVisibility>('shared');
    const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
    const [newTaskAssignee, setNewTaskAssignee] = useState<string | null>(null);
    
    useEffect(() => {
        fetchSharedTasks();
    }, []);
    
    const onRefresh = async () => {
        setRefreshing(true);
        await fetchSharedTasks();
        setRefreshing(false);
    };
    
    // Filter and sort tasks
    const filteredTasks = useMemo(() => {
        let tasks = [...sharedTasks];
        
        // Filter by status
        if (filterStatus !== 'all') {
            tasks = tasks.filter(t => t.status === filterStatus);
        }
        
        // Filter by assignee
        if (filterAssignee) {
            tasks = tasks.filter(t => t.assignedTo === filterAssignee);
        }
        
        // Sort
        tasks.sort((a, b) => {
            if (sortBy === 'dueDate') {
                if (!a.dueDate) return 1;
                if (!b.dueDate) return -1;
                return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
            }
            if (sortBy === 'priority') {
                const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
                return priorityOrder[a.priority] - priorityOrder[b.priority];
            }
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        
        return tasks;
    }, [sharedTasks, filterStatus, filterAssignee, sortBy]);
    
    // Group tasks by status for Kanban-like view
    const tasksByStatus = useMemo(() => ({
        todo: filteredTasks.filter(t => t.status === 'todo'),
        in_progress: filteredTasks.filter(t => t.status === 'in_progress'),
        done: filteredTasks.filter(t => t.status === 'done'),
        blocked: filteredTasks.filter(t => t.status === 'blocked'),
    }), [filteredTasks]);
    
    const handleCreateTask = async () => {
        if (!newTaskTitle.trim()) {
            Alert.alert('Error', 'Please enter a task title');
            return;
        }
        
        try {
            await createSharedTask({
                title: newTaskTitle.trim(),
                description: newTaskDescription.trim(),
                visibility: newTaskVisibility,
                priority: newTaskPriority,
                assignedTo: newTaskAssignee,
            });
            
            setShowCreateModal(false);
            resetForm();
        } catch (error) {
            Alert.alert('Error', 'Failed to create task');
        }
    };
    
    const handleAssign = async (userId: string | null) => {
        if (selectedTask) {
            try {
                await assignTask(selectedTask.id, userId);
                setShowAssignModal(false);
                setSelectedTask(null);
            } catch (error) {
                Alert.alert('Error', 'Failed to assign task');
            }
        }
    };
    
    const handleComplete = async (task: SharedTask) => {
        try {
            await completeTask(task.id);
        } catch (error) {
            Alert.alert('Error', 'Failed to complete task');
        }
    };
    
    const resetForm = () => {
        setNewTaskTitle('');
        setNewTaskDescription('');
        setNewTaskVisibility('shared');
        setNewTaskPriority('medium');
        setNewTaskAssignee(null);
    };
    
    const PRIORITY_OPTIONS = [
        { value: 'low', label: 'Low', color: '#6B7280' },
        { value: 'medium', label: 'Medium', color: '#F59E0B' },
        { value: 'high', label: 'High', color: '#EF4444' },
        { value: 'urgent', label: 'Urgent', color: '#DC2626' },
    ];
    
    const STATUS_TABS = [
        { value: 'all', label: 'All', count: sharedTasks.length },
        { value: 'todo', label: 'To Do', count: tasksByStatus.todo.length },
        { value: 'in_progress', label: 'In Progress', count: tasksByStatus.in_progress.length },
        { value: 'done', label: 'Done', count: tasksByStatus.done.length },
    ];
    
    return (
        <View className="flex-1" style={{ backgroundColor: colors.background }}>
            {/* Header */}
            <SafeAreaView edges={['top']} className="bg-blue-600">
                <View className="px-4 py-4">
                    <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center">
                            <TouchableOpacity onPress={() => router.back()}>
                                <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
                            </TouchableOpacity>
                            <View className="ml-3">
                                <Text className="text-white text-xl font-bold">Family Backlog</Text>
                                <Text className="text-blue-200 text-xs">
                                    {sharedTasks.length} task{sharedTasks.length !== 1 ? 's' : ''}
                                </Text>
                            </View>
                        </View>
                        
                        {hasPermission('create_shared_tasks') && (
                            <TouchableOpacity 
                                onPress={() => setShowCreateModal(true)}
                                className="flex-row items-center bg-white/20 px-4 py-2 rounded-full"
                            >
                                <MaterialCommunityIcons name="plus" size={20} color="#fff" />
                                <Text className="text-white font-medium ml-1">New Task</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
                
                {/* Status Tabs */}
                <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 12 }}
                >
                    {STATUS_TABS.map(tab => (
                        <TouchableOpacity
                            key={tab.value}
                            onPress={() => setFilterStatus(tab.value as FilterStatus)}
                            className="mr-2 px-4 py-2 rounded-full flex-row items-center"
                            style={{ 
                                backgroundColor: filterStatus === tab.value ? '#fff' : 'rgba(255,255,255,0.2)'
                            }}
                        >
                            <Text 
                                className="font-medium"
                                style={{ 
                                    color: filterStatus === tab.value ? '#2563EB' : '#fff'
                                }}
                            >
                                {tab.label}
                            </Text>
                            <View 
                                className="ml-2 px-1.5 py-0.5 rounded-full"
                                style={{ 
                                    backgroundColor: filterStatus === tab.value 
                                        ? '#2563EB' 
                                        : 'rgba(255,255,255,0.3)'
                                }}
                            >
                                <Text 
                                    className="text-xs font-bold"
                                    style={{ color: '#fff' }}
                                >
                                    {tab.count}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </SafeAreaView>
            
            {/* Filter Bar */}
            <View 
                className="flex-row items-center justify-between px-4 py-3"
                style={{ borderBottomWidth: 1, borderBottomColor: colors.border }}
            >
                {/* Assignee Filter */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-1 mr-2">
                    <TouchableOpacity
                        onPress={() => setFilterAssignee(null)}
                        className="mr-2 px-3 py-1.5 rounded-full"
                        style={{ 
                            backgroundColor: !filterAssignee 
                                ? '#3B82F620' 
                                : isDark ? '#374151' : '#F3F4F6'
                        }}
                    >
                        <Text 
                            className="text-sm font-medium"
                            style={{ color: !filterAssignee ? '#3B82F6' : colors.textSecondary }}
                        >
                            All
                        </Text>
                    </TouchableOpacity>
                    {members.map(member => (
                        <TouchableOpacity
                            key={member.userId}
                            onPress={() => setFilterAssignee(
                                filterAssignee === member.userId ? null : member.userId
                            )}
                            className="mr-2 px-3 py-1.5 rounded-full flex-row items-center"
                            style={{ 
                                backgroundColor: filterAssignee === member.userId 
                                    ? '#3B82F620' 
                                    : isDark ? '#374151' : '#F3F4F6'
                            }}
                        >
                            <Text className="text-sm mr-1">{member.avatar}</Text>
                            <Text 
                                className="text-sm font-medium"
                                style={{ 
                                    color: filterAssignee === member.userId 
                                        ? '#3B82F6' 
                                        : colors.textSecondary 
                                }}
                            >
                                {member.displayName.split(' ')[0]}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
                
                {/* Sort */}
                <TouchableOpacity
                    onPress={() => {
                        const options: SortOption[] = ['dueDate', 'priority', 'created'];
                        const currentIndex = options.indexOf(sortBy);
                        setSortBy(options[(currentIndex + 1) % options.length]);
                    }}
                    className="flex-row items-center px-3 py-1.5 rounded-full"
                    style={{ backgroundColor: isDark ? '#374151' : '#F3F4F6' }}
                >
                    <MaterialCommunityIcons name="sort" size={16} color={colors.textSecondary} />
                    <Text 
                        className="text-xs font-medium ml-1"
                        style={{ color: colors.textSecondary }}
                    >
                        {sortBy === 'dueDate' ? 'Due' : sortBy === 'priority' ? 'Priority' : 'Recent'}
                    </Text>
                </TouchableOpacity>
            </View>
            
            {/* Tasks List */}
            <ScrollView
                className="flex-1"
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                showsVerticalScrollIndicator={false}
            >
                <View className="px-4 py-4">
                    {filteredTasks.length === 0 ? (
                        <View className="items-center py-12">
                            <MaterialCommunityIcons 
                                name="clipboard-text-outline" 
                                size={48} 
                                color={colors.textSecondary}
                            />
                            <Text 
                                className="text-lg font-semibold mt-3"
                                style={{ color: colors.text }}
                            >
                                No tasks found
                            </Text>
                            <Text 
                                className="text-sm text-center mt-1"
                                style={{ color: colors.textSecondary }}
                            >
                                {filterStatus !== 'all' || filterAssignee 
                                    ? 'Try adjusting your filters'
                                    : 'Create your first shared task!'
                                }
                            </Text>
                        </View>
                    ) : (
                        filteredTasks.map(task => (
                            <SharedTaskCard
                                key={task.id}
                                task={task}
                                onPress={() => router.push(`/family/task/${task.id}` as any)}
                                onComplete={() => handleComplete(task)}
                                onAssign={() => {
                                    setSelectedTask(task);
                                    setShowAssignModal(true);
                                }}
                            />
                        ))
                    )}
                </View>
            </ScrollView>
            
            {/* Create Task Modal */}
            <Modal
                visible={showCreateModal}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setShowCreateModal(false)}
            >
                <View className="flex-1" style={{ backgroundColor: colors.background }}>
                    {/* Modal Header */}
                    <View 
                        className="flex-row items-center justify-between px-4 py-3 border-b"
                        style={{ borderBottomColor: colors.border }}
                    >
                        <TouchableOpacity onPress={() => {
                            setShowCreateModal(false);
                            resetForm();
                        }}>
                            <Text style={{ color: colors.textSecondary }}>Cancel</Text>
                        </TouchableOpacity>
                        <Text 
                            className="text-lg font-bold"
                            style={{ color: colors.text }}
                        >
                            New Task
                        </Text>
                        <TouchableOpacity 
                            onPress={handleCreateTask}
                            disabled={!newTaskTitle.trim()}
                            style={{ opacity: newTaskTitle.trim() ? 1 : 0.5 }}
                        >
                            <Text className="text-blue-500 font-bold">Create</Text>
                        </TouchableOpacity>
                    </View>
                    
                    <ScrollView className="flex-1 px-4 py-4">
                        {/* Title */}
                        <Text 
                            className="text-sm font-semibold mb-2"
                            style={{ color: colors.textSecondary }}
                        >
                            Title *
                        </Text>
                        <TextInput
                            value={newTaskTitle}
                            onChangeText={setNewTaskTitle}
                            placeholder="What needs to be done?"
                            placeholderTextColor={colors.textSecondary}
                            className="p-4 rounded-xl mb-4"
                            style={{ 
                                backgroundColor: isDark ? '#374151' : '#F3F4F6',
                                color: colors.text,
                            }}
                        />
                        
                        {/* Description */}
                        <Text 
                            className="text-sm font-semibold mb-2"
                            style={{ color: colors.textSecondary }}
                        >
                            Description
                        </Text>
                        <TextInput
                            value={newTaskDescription}
                            onChangeText={setNewTaskDescription}
                            placeholder="Add more details..."
                            placeholderTextColor={colors.textSecondary}
                            multiline
                            numberOfLines={3}
                            className="p-4 rounded-xl mb-4"
                            style={{ 
                                backgroundColor: isDark ? '#374151' : '#F3F4F6',
                                color: colors.text,
                                minHeight: 80,
                                textAlignVertical: 'top',
                            }}
                        />
                        
                        {/* Visibility */}
                        <Text 
                            className="text-sm font-semibold mb-2"
                            style={{ color: colors.textSecondary }}
                        >
                            Visibility
                        </Text>
                        <View className="flex-row flex-wrap gap-2 mb-4">
                            {TASK_VISIBILITY_OPTIONS.map(option => (
                                <TouchableOpacity
                                    key={option.type}
                                    onPress={() => setNewTaskVisibility(option.type)}
                                    className="flex-row items-center px-4 py-3 rounded-xl"
                                    style={{ 
                                        backgroundColor: newTaskVisibility === option.type 
                                            ? `${option.color}20` 
                                            : isDark ? '#374151' : '#F3F4F6',
                                        borderWidth: newTaskVisibility === option.type ? 2 : 0,
                                        borderColor: option.color,
                                    }}
                                >
                                    <MaterialCommunityIcons 
                                        name={option.icon as any} 
                                        size={18} 
                                        color={newTaskVisibility === option.type ? option.color : colors.textSecondary}
                                    />
                                    <Text 
                                        className="font-medium ml-2"
                                        style={{ 
                                            color: newTaskVisibility === option.type 
                                                ? option.color 
                                                : colors.text 
                                        }}
                                    >
                                        {option.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        
                        {/* Priority */}
                        <Text 
                            className="text-sm font-semibold mb-2"
                            style={{ color: colors.textSecondary }}
                        >
                            Priority
                        </Text>
                        <View className="flex-row flex-wrap gap-2 mb-4">
                            {PRIORITY_OPTIONS.map(option => (
                                <TouchableOpacity
                                    key={option.value}
                                    onPress={() => setNewTaskPriority(option.value as any)}
                                    className="flex-row items-center px-4 py-3 rounded-xl"
                                    style={{ 
                                        backgroundColor: newTaskPriority === option.value 
                                            ? `${option.color}20` 
                                            : isDark ? '#374151' : '#F3F4F6',
                                        borderWidth: newTaskPriority === option.value ? 2 : 0,
                                        borderColor: option.color,
                                    }}
                                >
                                    <View 
                                        className="w-3 h-3 rounded-full mr-2"
                                        style={{ backgroundColor: option.color }}
                                    />
                                    <Text 
                                        className="font-medium"
                                        style={{ 
                                            color: newTaskPriority === option.value 
                                                ? option.color 
                                                : colors.text 
                                        }}
                                    >
                                        {option.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        
                        {/* Assignee */}
                        <Text 
                            className="text-sm font-semibold mb-2"
                            style={{ color: colors.textSecondary }}
                        >
                            Assign to
                        </Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            <TouchableOpacity
                                onPress={() => setNewTaskAssignee(null)}
                                className="mr-2 px-4 py-3 rounded-xl flex-row items-center"
                                style={{ 
                                    backgroundColor: !newTaskAssignee 
                                        ? '#3B82F620' 
                                        : isDark ? '#374151' : '#F3F4F6',
                                    borderWidth: !newTaskAssignee ? 2 : 0,
                                    borderColor: '#3B82F6',
                                }}
                            >
                                <MaterialCommunityIcons 
                                    name="account-question" 
                                    size={20} 
                                    color={!newTaskAssignee ? '#3B82F6' : colors.textSecondary}
                                />
                                <Text 
                                    className="font-medium ml-2"
                                    style={{ color: !newTaskAssignee ? '#3B82F6' : colors.text }}
                                >
                                    Unassigned
                                </Text>
                            </TouchableOpacity>
                            {members.map(member => (
                                <TouchableOpacity
                                    key={member.userId}
                                    onPress={() => setNewTaskAssignee(member.userId)}
                                    className="mr-2 px-4 py-3 rounded-xl flex-row items-center"
                                    style={{ 
                                        backgroundColor: newTaskAssignee === member.userId 
                                            ? '#3B82F620' 
                                            : isDark ? '#374151' : '#F3F4F6',
                                        borderWidth: newTaskAssignee === member.userId ? 2 : 0,
                                        borderColor: '#3B82F6',
                                    }}
                                >
                                    <Text className="text-lg mr-2">{member.avatar}</Text>
                                    <Text 
                                        className="font-medium"
                                        style={{ 
                                            color: newTaskAssignee === member.userId 
                                                ? '#3B82F6' 
                                                : colors.text 
                                        }}
                                    >
                                        {member.displayName.split(' ')[0]}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </ScrollView>
                </View>
            </Modal>
            
            {/* Assign Modal */}
            <Modal
                visible={showAssignModal}
                animationType="slide"
                transparent
                onRequestClose={() => {
                    setShowAssignModal(false);
                    setSelectedTask(null);
                }}
            >
                <Pressable 
                    className="flex-1 justify-end"
                    style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
                    onPress={() => {
                        setShowAssignModal(false);
                        setSelectedTask(null);
                    }}
                >
                    <Pressable 
                        className="rounded-t-3xl p-6"
                        style={{ backgroundColor: colors.background }}
                        onPress={(e) => e.stopPropagation()}
                    >
                        <Text 
                            className="text-xl font-bold mb-4"
                            style={{ color: colors.text }}
                        >
                            Assign Task
                        </Text>
                        
                        <TouchableOpacity
                            onPress={() => handleAssign(null)}
                            className="flex-row items-center p-4 rounded-xl mb-2"
                            style={{ backgroundColor: isDark ? '#374151' : '#F3F4F6' }}
                        >
                            <MaterialCommunityIcons 
                                name="account-remove" 
                                size={24} 
                                color={colors.textSecondary}
                            />
                            <Text 
                                className="font-medium ml-3"
                                style={{ color: colors.text }}
                            >
                                Unassign
                            </Text>
                        </TouchableOpacity>
                        
                        {members.map(member => (
                            <TouchableOpacity
                                key={member.userId}
                                onPress={() => handleAssign(member.userId)}
                                className="flex-row items-center p-4 rounded-xl mb-2"
                                style={{ 
                                    backgroundColor: selectedTask?.assignedTo === member.userId
                                        ? '#3B82F620'
                                        : isDark ? '#374151' : '#F3F4F6',
                                    borderWidth: selectedTask?.assignedTo === member.userId ? 2 : 0,
                                    borderColor: '#3B82F6',
                                }}
                            >
                                <Text className="text-2xl mr-3">{member.avatar}</Text>
                                <Text 
                                    className="font-medium flex-1"
                                    style={{ color: colors.text }}
                                >
                                    {member.displayName}
                                </Text>
                                {selectedTask?.assignedTo === member.userId && (
                                    <MaterialCommunityIcons 
                                        name="check-circle" 
                                        size={24} 
                                        color="#3B82F6"
                                    />
                                )}
                            </TouchableOpacity>
                        ))}
                    </Pressable>
                </Pressable>
            </Modal>
        </View>
    );
}
