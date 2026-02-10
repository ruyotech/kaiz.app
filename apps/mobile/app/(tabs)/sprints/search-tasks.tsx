import { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, FlatList, Pressable, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Container } from '../../../components/layout/Container';
import { ScreenHeader } from '../../../components/layout/ScreenHeader';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Task, LifeWheelArea } from '../../../types/models';
import { useTaskStore } from '../../../store/taskStore';
import { useEpicStore } from '../../../store/epicStore';
import { lifeWheelApi, taskApi } from '../../../services/api';
import { useThemeContext } from '../../../providers/ThemeProvider';
import { useDeleteTask } from '../../../hooks/queries';
import { logger } from '../../../utils/logger';

export default function SearchTasksScreen() {
    const router = useRouter();
    const { colors, isDark } = useThemeContext();
    const { tasks, fetchTasks } = useTaskStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
    const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
    const [selectedLifeWheel, setSelectedLifeWheel] = useState<string | null>(null);
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    const [lifeWheelAreas, setLifeWheelAreas] = useState<LifeWheelArea[]>([]);
    const [epics, setEpics] = useState<any[]>([]);
    const [deletedTasks, setDeletedTasks] = useState<Task[]>([]);
    const [bulkSelectMode, setBulkSelectMode] = useState(false);
    const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(new Set());
    const deleteTaskMutation = useDeleteTask();

    const loadDeletedTasks = async () => {
        try {
            const result = await taskApi.getDeletedTasks();
            setDeletedTasks((result || []) as Task[]);
        } catch (error) {
            logger.error('Error loading deleted tasks:', error);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        await fetchTasks({});
        const areas = await lifeWheelApi.getLifeWheelAreas();
        setLifeWheelAreas(areas as LifeWheelArea[]);
    };

    // When deletedTasks loads, update filteredTasks if we're showing deleted
    useEffect(() => {
        if (selectedStatus === 'deleted') {
            let results = deletedTasks as Task[];
            if (searchQuery.trim()) {
                const query = searchQuery.toLowerCase();
                results = results.filter(
                    (task) =>
                        task.title.toLowerCase().includes(query) ||
                        task.description?.toLowerCase().includes(query)
                );
            }
            setFilteredTasks(results);
        }
    }, [deletedTasks, selectedStatus, searchQuery]);

    useEffect(() => {
        // Exit bulk select when filters change
        setBulkSelectMode(false);
        setSelectedTaskIds(new Set());

        // When "Deleted" filter is selected, show deleted tasks from API
        if (selectedStatus === 'deleted') {
            loadDeletedTasks();
            return;
        }

        // Filter tasks based on search query, status, life wheel, and quadrant
        let results = tasks;

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            results = results.filter(
                (task) =>
                    task.title.toLowerCase().includes(query) ||
                    task.description?.toLowerCase().includes(query)
            );
        }

        if (selectedStatus) {
            results = results.filter((task) => task.status === selectedStatus);
        }

        if (selectedLifeWheel) {
            results = results.filter((task) => task.lifeWheelAreaId === selectedLifeWheel);
        }

        setFilteredTasks(results);
    }, [searchQuery, selectedStatus, selectedLifeWheel, tasks]);

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        if (query.trim() && !recentSearches.includes(query)) {
            setRecentSearches([query, ...recentSearches.slice(0, 4)]);
        }
    };

    const handleRestoreTask = async (taskId: string) => {
        try {
            await taskApi.restoreTask(taskId);
            await loadDeletedTasks();
            await fetchTasks({});
        } catch (error) {
            logger.error('Error restoring task:', error);
        }
    };

    const handleHardDeleteTask = (taskId: string, taskTitle: string) => {
        Alert.alert(
            'Delete Permanently',
            `This will permanently delete "${taskTitle}". This action cannot be undone.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete Forever',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await taskApi.hardDeleteTask(taskId);
                            await loadDeletedTasks();
                        } catch (error) {
                            logger.error('Error permanently deleting task:', error);
                        }
                    },
                },
            ]
        );
    };

    // ── Bulk select handlers ──────────────────────────────────────────────

    const handleToggleSelect = useCallback((taskId: string) => {
        if (!bulkSelectMode) {
            setBulkSelectMode(true);
            setSelectedTaskIds(new Set([taskId]));
            return;
        }
        setSelectedTaskIds(prev => {
            const next = new Set(prev);
            if (next.has(taskId)) next.delete(taskId);
            else next.add(taskId);
            return next;
        });
    }, [bulkSelectMode]);

    const handleCancelBulkSelect = useCallback(() => {
        setBulkSelectMode(false);
        setSelectedTaskIds(new Set());
    }, []);

    const handleSelectAll = useCallback(() => {
        const allIds = new Set(filteredTasks.map(t => t.id));
        setSelectedTaskIds(allIds);
    }, [filteredTasks]);

    const handleBulkSoftDelete = useCallback(() => {
        if (selectedTaskIds.size === 0) return;
        Alert.alert(
            'Delete Tasks',
            `Are you sure you want to delete ${selectedTaskIds.size} task${selectedTaskIds.size > 1 ? 's' : ''}? They will be moved to Deleted and can be restored later.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        for (const taskId of selectedTaskIds) {
                            deleteTaskMutation.mutate(taskId);
                        }
                        setBulkSelectMode(false);
                        setSelectedTaskIds(new Set());
                        // Refresh task list
                        await fetchTasks({});
                    },
                },
            ]
        );
    }, [selectedTaskIds, deleteTaskMutation, fetchTasks]);

    const statusFilters = [
        { label: 'All', value: null, color: 'bg-gray-100 text-gray-800' },
        { label: 'Backlog', value: 'backlog', color: 'bg-purple-100 text-purple-800' },
        { label: 'To Do', value: 'todo', color: 'bg-blue-100 text-blue-800' },
        { label: 'In Progress', value: 'in_progress', color: 'bg-yellow-100 text-yellow-800' },
        { label: 'Blocked', value: 'blocked', color: 'bg-red-100 text-red-800' },
        { label: 'Done', value: 'done', color: 'bg-green-100 text-green-800' },
        { label: 'Deleted', value: 'deleted', color: 'bg-red-100 text-red-800' },
    ];

    const renderTask = ({ item }: { item: Task }) => {
        const getStatusColor = (status: string) => {
            const colors: Record<string, string> = {
                backlog: 'bg-purple-100 text-purple-800',
                todo: 'bg-blue-100 text-blue-800',
                in_progress: 'bg-yellow-100 text-yellow-800',
                blocked: 'bg-red-100 text-red-800',
                done: 'bg-green-100 text-green-800',
                deleted: 'bg-red-100 text-red-800',
            };
            return colors[status] || 'bg-gray-100 text-gray-800';
        };

        const getStatusLabel = (status: string) => {
            const labels: Record<string, string> = {
                backlog: 'Backlog',
                todo: 'To Do',
                in_progress: 'In Progress',
                blocked: 'Blocked',
                done: 'Done',
                deleted: 'Deleted',
            };
            return labels[status] || status;
        };

        const taskEpic = epics.find(e => e.id === item.epicId);

        const isSelected = bulkSelectMode && selectedTaskIds.has(item.id);

        return (
            <Pressable
                onPress={() => {
                    if (bulkSelectMode) {
                        handleToggleSelect(item.id);
                    } else {
                        router.push(`/(tabs)/sprints/task/${item.id}` as any);
                    }
                }}
                onLongPress={() => handleToggleSelect(item.id)}
            >
                <View 
                    className="mb-3 p-4 rounded-xl"
                    style={{
                        backgroundColor: isSelected ? (isDark ? 'rgba(37, 99, 235, 0.15)' : '#EFF6FF') : colors.card,
                        borderWidth: isSelected ? 2 : 1,
                        borderColor: isSelected ? colors.primary : colors.border,
                    }}
                >
                    <View className="flex-row items-start justify-between mb-2">
                        {bulkSelectMode && (
                            <View className="mr-3 mt-0.5">
                                <MaterialCommunityIcons
                                    name={isSelected ? 'checkbox-marked' : 'checkbox-blank-outline'}
                                    size={22}
                                    color={isSelected ? colors.primary : colors.textTertiary}
                                />
                            </View>
                        )}
                        <Text 
                            className="text-base font-semibold flex-1 mr-2"
                            style={{ color: colors.text }}
                        >{item.title}</Text>
                        {item.storyPoints > 0 && (
                            <View 
                                className="px-2 py-1 rounded-lg"
                                style={{ backgroundColor: colors.backgroundSecondary, borderWidth: 1, borderColor: colors.border }}
                            >
                                <Text className="text-xs font-bold" style={{ color: colors.textSecondary }}>
                                    {item.storyPoints} pts
                                </Text>
                            </View>
                        )}
                    </View>
                    {item.description && (
                        <Text 
                            className="text-sm mb-3" 
                            numberOfLines={2}
                            style={{ color: colors.textSecondary }}
                        >
                            {item.description}
                        </Text>
                    )}
                    <View className="flex-row gap-2 flex-wrap">
                        <View 
                            className="px-2 py-1 rounded-full"
                            style={{ backgroundColor: colors.backgroundSecondary }}
                        >
                            <Text className="text-xs font-medium" style={{ color: colors.textSecondary }}>
                                {selectedStatus === 'deleted' ? 'Deleted' : getStatusLabel(item.status)}
                            </Text>
                        </View>
                        {taskEpic && (
                            <View 
                                className="px-2.5 py-1 rounded-full flex-row items-center"
                                style={{ backgroundColor: taskEpic.color + '20', borderColor: taskEpic.color, borderWidth: 1 }}
                            >
                                <MaterialCommunityIcons 
                                    name={taskEpic.icon as any} 
                                    size={12} 
                                    color={taskEpic.color} 
                                />
                                <Text 
                                    className="text-xs font-bold ml-1" 
                                    style={{ color: taskEpic.color }}
                                >
                                    {taskEpic.title}
                                </Text>
                            </View>
                        )}
                    </View>
                    {/* Restore / Hard Delete actions for deleted tasks */}
                    {selectedStatus === 'deleted' && (
                        <View className="flex-row gap-2 mt-3 pt-3" style={{ borderTopWidth: 1, borderTopColor: colors.border }}>
                            <TouchableOpacity
                                onPress={() => handleRestoreTask(item.id)}
                                className="flex-1 flex-row items-center justify-center py-2 rounded-lg"
                                style={{ backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : '#D1FAE5' }}
                            >
                                <MaterialCommunityIcons name="restore" size={16} color="#10B981" />
                                <Text className="text-sm font-medium ml-1.5" style={{ color: '#10B981' }}>Restore</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => handleHardDeleteTask(item.id, item.title)}
                                className="flex-1 flex-row items-center justify-center py-2 rounded-lg"
                                style={{ backgroundColor: isDark ? 'rgba(239, 68, 68, 0.15)' : '#FEF2F2' }}
                            >
                                <MaterialCommunityIcons name="delete-forever" size={16} color="#EF4444" />
                                <Text className="text-sm font-medium ml-1.5" style={{ color: '#EF4444' }}>Delete Forever</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </Pressable>
        );
    };

    return (
        <Container safeArea={false}>
            <ScreenHeader
                title="All Tasks"
                showBack
                useSafeArea={false}
                showNotifications={false}
                rightAction={
                    <View className="flex-row items-center gap-2">
                        {!bulkSelectMode && selectedStatus !== 'deleted' && (
                            <TouchableOpacity
                                onPress={() => setBulkSelectMode(true)}
                                className="p-2 rounded-lg"
                                style={{ backgroundColor: colors.backgroundSecondary }}
                            >
                                <MaterialCommunityIcons name="checkbox-multiple-outline" size={20} color={colors.textSecondary} />
                            </TouchableOpacity>
                        )}
                        {bulkSelectMode && (
                            <>
                                <TouchableOpacity onPress={handleSelectAll} className="p-2 rounded-lg" style={{ backgroundColor: colors.primary + '20' }}>
                                    <MaterialCommunityIcons name="select-all" size={20} color={colors.primary} />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={handleBulkSoftDelete}
                                    disabled={selectedTaskIds.size === 0}
                                    className="p-2 rounded-lg"
                                    style={{ backgroundColor: selectedTaskIds.size > 0 ? '#DC262620' : colors.backgroundSecondary }}
                                >
                                    <MaterialCommunityIcons name="delete-outline" size={20} color={selectedTaskIds.size > 0 ? '#DC2626' : colors.textTertiary} />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={handleCancelBulkSelect} className="p-2 rounded-lg" style={{ backgroundColor: colors.backgroundSecondary }}>
                                    <MaterialCommunityIcons name="close" size={20} color={colors.text} />
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                }
            />

            {/* Filters Section */}
            <View 
                className="py-3"
                style={{ backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border }}
            >
                {/* Search Input */}
                <View className="px-4 mb-3">
                    <View 
                        className="rounded-xl p-3 flex-row items-center"
                        style={{ backgroundColor: colors.inputBackground, borderWidth: 1, borderColor: colors.border }}
                    >
                        <MaterialCommunityIcons name="magnify" size={20} color={colors.placeholder} />
                        <TextInput
                            value={searchQuery}
                            onChangeText={handleSearch}
                            placeholder="Search tasks..."
                            className="flex-1 ml-2 text-base"
                            placeholderTextColor={colors.placeholder}
                            style={{ color: colors.text }}
                        />
                        {searchQuery.length > 0 && (
                            <Pressable onPress={() => setSearchQuery('')}>
                                <MaterialCommunityIcons name="close-circle" size={18} color={colors.placeholder} />
                            </Pressable>
                        )}
                    </View>
                </View>

                {/* Life Wheel Filters */}
                <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    className="px-4 mb-2"
                >
                    <View className="flex-row gap-2">
                        <Pressable
                            onPress={() => {
                                setSelectedLifeWheel(null);
                                setSelectedStatus(null);
                            }}
                            className="px-3 py-1.5 rounded-full"
                            style={{
                                backgroundColor: !selectedLifeWheel && !selectedStatus ? colors.primary : colors.backgroundSecondary,
                                borderWidth: !selectedLifeWheel && !selectedStatus ? 0 : 1,
                                borderColor: colors.border,
                            }}
                        >
                            <Text 
                                className="font-medium text-sm"
                                style={{ color: !selectedLifeWheel && !selectedStatus ? '#FFFFFF' : colors.textSecondary }}
                            >
                                All ({tasks.length})
                            </Text>
                        </Pressable>
                        
                        {lifeWheelAreas.map((area) => {
                            const count = tasks.filter(t => t.lifeWheelAreaId === area.id).length;
                            if (count === 0) return null;
                            return (
                                <Pressable
                                    key={area.id}
                                    onPress={() => {
                                        setSelectedLifeWheel(area.id === selectedLifeWheel ? null : area.id);
                                    }}
                                    className="px-3 py-1.5 rounded-full flex-row items-center"
                                    style={{
                                        backgroundColor: selectedLifeWheel === area.id ? colors.primary : colors.backgroundSecondary,
                                        borderWidth: selectedLifeWheel === area.id ? 0 : 1,
                                        borderColor: colors.border,
                                    }}
                                >
                                    <Text className="mr-1 text-sm">{area.icon}</Text>
                                    <Text 
                                        className="font-medium text-sm"
                                        style={{ color: selectedLifeWheel === area.id ? '#FFFFFF' : colors.textSecondary }}
                                    >
                                        {area.name.split('&')[0].trim()} ({count})
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </View>
                </ScrollView>

                {/* Status Filters */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4">
                    <View className="flex-row gap-2">
                        {statusFilters.map((filter) => (
                            <Pressable
                                key={filter.label}
                                onPress={() => setSelectedStatus(filter.value)}
                                className="px-3 py-1.5 rounded-full"
                                style={{
                                    backgroundColor: selectedStatus === filter.value ? colors.primary : colors.backgroundSecondary,
                                    borderWidth: selectedStatus === filter.value ? 0 : 1,
                                    borderColor: colors.border,
                                }}
                            >
                                <Text
                                    className="text-sm font-medium"
                                    style={{ color: selectedStatus === filter.value ? '#FFFFFF' : colors.textSecondary }}
                                >
                                    {filter.label}
                                </Text>
                            </Pressable>
                        ))}
                    </View>
                </ScrollView>
            </View>

            {/* Bulk select info bar */}
            {bulkSelectMode && (
                <View
                    className="flex-row items-center px-4 py-2"
                    style={{ backgroundColor: isDark ? 'rgba(37, 99, 235, 0.15)' : '#EFF6FF', borderBottomWidth: 1, borderBottomColor: colors.border }}
                >
                    <MaterialCommunityIcons name="information-outline" size={16} color={colors.primary} />
                    <Text className="text-xs font-semibold ml-1.5" style={{ color: colors.primary }}>
                        {selectedTaskIds.size} of {filteredTasks.length} selected — long press or tap to select
                    </Text>
                </View>
            )}

            {/* Task List */}
            <FlatList
                className="flex-1"
                data={filteredTasks}
                renderItem={renderTask}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 32 }}
                ListHeaderComponent={
                    <Text className="text-xs mb-2" style={{ color: colors.textSecondary }}>
                        {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'}
                    </Text>
                }
                ListEmptyComponent={
                    <View className="items-center justify-center py-12">
                        <MaterialCommunityIcons name="magnify" size={64} color={colors.textTertiary} />
                        <Text style={{ color: colors.textSecondary, marginTop: 16 }}>No tasks found</Text>
                    </View>
                }
            />
        </Container>
    );
}
