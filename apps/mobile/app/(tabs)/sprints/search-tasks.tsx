import { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, Pressable, ScrollView, TouchableOpacity } from 'react-native';
import { Container } from '../../../components/layout/Container';
import { ScreenHeader } from '../../../components/layout/ScreenHeader';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Task, LifeWheelArea, EisenhowerQuadrant } from '../../../types/models';
import { useTaskStore } from '../../../store/taskStore';
import { useEpicStore } from '../../../store/epicStore';
import { lifeWheelApi } from '../../../services/api';
import { useThemeContext } from '../../../providers/ThemeProvider';

export default function SearchTasksScreen() {
    const router = useRouter();
    const { colors, isDark } = useThemeContext();
    const { tasks, fetchTasks } = useTaskStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
    const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
    const [selectedLifeWheel, setSelectedLifeWheel] = useState<string | null>(null);
    const [selectedQuadrant, setSelectedQuadrant] = useState<string | null>(null);
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    const [lifeWheelAreas, setLifeWheelAreas] = useState<LifeWheelArea[]>([]);
    const [eisenhowerQuadrants, setEisenhowerQuadrants] = useState<EisenhowerQuadrant[]>([]);
    const [epics, setEpics] = useState<any[]>([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        await fetchTasks({});
        const [areas, quadrants] = await Promise.all([
            lifeWheelApi.getLifeWheelAreas(),
            lifeWheelApi.getEisenhowerQuadrants()
        ]);
        setLifeWheelAreas(areas as LifeWheelArea[]);
        setEisenhowerQuadrants(quadrants as EisenhowerQuadrant[]);
        // Epics are loaded from epicStore
    };

    useEffect(() => {
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

        if (selectedQuadrant) {
            results = results.filter((task) => task.eisenhowerQuadrantId === selectedQuadrant);
        }

        setFilteredTasks(results);
    }, [searchQuery, selectedStatus, selectedLifeWheel, selectedQuadrant, tasks]);

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        if (query.trim() && !recentSearches.includes(query)) {
            setRecentSearches([query, ...recentSearches.slice(0, 4)]);
        }
    };

    const getQuadrantStyle = (quadrantId: string) => {
        const styles: Record<string, { bgColor: string; textColor: string; borderColor: string }> = {
            'eq-1': { 
                bgColor: isDark ? 'rgba(220, 38, 38, 0.15)' : 'rgba(254, 242, 242, 1)', 
                textColor: isDark ? '#FCA5A5' : '#991B1B', 
                borderColor: isDark ? '#DC2626' : '#FECACA'
            },
            'eq-2': { 
                bgColor: isDark ? 'rgba(37, 99, 235, 0.15)' : 'rgba(239, 246, 255, 1)', 
                textColor: isDark ? '#93C5FD' : '#1E40AF', 
                borderColor: isDark ? '#2563EB' : '#BFDBFE'
            },
            'eq-3': { 
                bgColor: isDark ? 'rgba(202, 138, 4, 0.15)' : 'rgba(254, 252, 232, 1)', 
                textColor: isDark ? '#FCD34D' : '#92400E', 
                borderColor: isDark ? '#CA8A04' : '#FDE68A'
            },
            'eq-4': { 
                bgColor: isDark ? 'rgba(107, 114, 128, 0.15)' : 'rgba(249, 250, 251, 1)', 
                textColor: isDark ? '#D1D5DB' : '#374151', 
                borderColor: isDark ? '#6B7280' : '#E5E7EB'
            },
        };
        return styles[quadrantId] || styles['eq-2'];
    };

    const statusFilters = [
        { label: 'All', value: null, color: 'bg-gray-100 text-gray-800' },
        { label: 'Backlog', value: 'backlog', color: 'bg-purple-100 text-purple-800' },
        { label: 'To Do', value: 'todo', color: 'bg-blue-100 text-blue-800' },
        { label: 'In Progress', value: 'in_progress', color: 'bg-yellow-100 text-yellow-800' },
        { label: 'Blocked', value: 'blocked', color: 'bg-red-100 text-red-800' },
        { label: 'Done', value: 'done', color: 'bg-green-100 text-green-800' },
    ];

    const renderTask = ({ item }: { item: Task }) => {
        const getStatusColor = (status: string) => {
            const colors: Record<string, string> = {
                backlog: 'bg-purple-100 text-purple-800',
                todo: 'bg-blue-100 text-blue-800',
                in_progress: 'bg-yellow-100 text-yellow-800',
                blocked: 'bg-red-100 text-red-800',
                done: 'bg-green-100 text-green-800',
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
            };
            return labels[status] || status;
        };

        const taskEpic = epics.find(e => e.id === item.epicId);
        const style = getQuadrantStyle(item.eisenhowerQuadrantId || 'eq-2');

        return (
            <Pressable onPress={() => router.push(`/(tabs)/sprints/task/${item.id}` as any)}>
                <View 
                    className="mb-3 p-4 rounded-xl"
                    style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }}
                >
                    <View className="flex-row items-start justify-between mb-2">
                        <Text 
                            className="text-base font-semibold flex-1 mr-2"
                            style={{ color: colors.text }}
                        >{item.title}</Text>
                        <View 
                            className="px-2 py-1 rounded-lg"
                            style={{ backgroundColor: style.bgColor, borderWidth: 1, borderColor: style.borderColor }}
                        >
                            <Text className="text-xs font-bold" style={{ color: style.textColor }}>
                                {item.storyPoints} pts
                            </Text>
                        </View>
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
                                {getStatusLabel(item.status)}
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
                </View>
            </Pressable>
        );
    };

    return (
        <Container safeArea={false}>
            <ScreenHeader
                title="Task Search"
                subtitle="Search and filter all tasks"
                showBack
                useSafeArea={false}
                showNotifications={false}
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
                                setSelectedQuadrant(null);
                                setSelectedStatus(null);
                            }}
                            className="px-3 py-1.5 rounded-full"
                            style={{
                                backgroundColor: !selectedLifeWheel && !selectedQuadrant && !selectedStatus ? colors.primary : colors.backgroundSecondary,
                                borderWidth: !selectedLifeWheel && !selectedQuadrant && !selectedStatus ? 0 : 1,
                                borderColor: colors.border,
                            }}
                        >
                            <Text 
                                className="font-medium text-sm"
                                style={{ color: !selectedLifeWheel && !selectedQuadrant && !selectedStatus ? '#FFFFFF' : colors.textSecondary }}
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
                                        setSelectedQuadrant(null);
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
                
                {/* Eisenhower Quadrant Filters - Distinct Style */}
                <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    className="px-4 mb-2"
                >
                    <View className="flex-row gap-2">
                        {eisenhowerQuadrants.map((quadrant) => {
                            const count = tasks.filter(t => t.eisenhowerQuadrantId === quadrant.id).length;
                            if (count === 0) return null;
                            const style = getQuadrantStyle(quadrant.id);
                            const isSelected = selectedQuadrant === quadrant.id;
                            return (
                                <Pressable
                                    key={quadrant.id}
                                    onPress={() => {
                                        setSelectedQuadrant(quadrant.id === selectedQuadrant ? null : quadrant.id);
                                    }}
                                    className="px-3 py-1.5 rounded-lg"
                                    style={{
                                        backgroundColor: style.bgColor,
                                        borderWidth: isSelected ? 2 : 1,
                                        borderColor: style.borderColor,
                                        opacity: isSelected ? 1 : 0.7,
                                    }}
                                >
                                    <Text 
                                        className="text-xs font-bold"
                                        style={{ color: style.textColor }}
                                    >
                                        {quadrant.label} ({count})
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

            <View className="p-4">
                {/* Results */}
                <View>
                    <Text 
                        className="text-sm mb-3"
                        style={{ color: colors.textSecondary }}
                    >
                        {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'} found
                    </Text>
                    {filteredTasks.length > 0 ? (
                        <FlatList
                            data={filteredTasks}
                            renderItem={renderTask}
                            keyExtractor={(item) => item.id}
                            scrollEnabled={false}
                        />
                    ) : (
                        <View className="items-center justify-center py-12">
                            <MaterialCommunityIcons name="magnify" size={64} color={colors.textTertiary} />
                            <Text style={{ color: colors.textSecondary, marginTop: 16 }}>No tasks found</Text>
                        </View>
                    )}
                </View>
            </View>
        </Container>
    );
}
