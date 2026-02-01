import { useState, useEffect, useMemo } from 'react';
import { View, Text, FlatList, Pressable, ScrollView, Modal, TouchableOpacity, TextInput } from 'react-native';
import { Container } from '../../../components/layout/Container';
import { ScreenHeader } from '../../../components/layout/ScreenHeader';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Loading } from '../../../components/ui/Loading';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Task, LifeWheelArea, EisenhowerQuadrant, Sprint } from '../../../types/models';
import { useTaskStore } from '../../../store/taskStore';
import { useEpicStore } from '../../../store/epicStore';
import { lifeWheelApi, sprintApi } from '../../../services/api';
import { toLocaleDateStringLocalized } from '../../../utils/localizedDate';
import { useThemeContext } from '../../../providers/ThemeProvider';

export default function BacklogScreen() {
    const router = useRouter();
    const { colors, isDark } = useThemeContext();
    const { tasks, loading, fetchTasks, updateTask } = useTaskStore();
    const [lifeWheelAreas, setLifeWheelAreas] = useState<LifeWheelArea[]>([]);
    const [eisenhowerQuadrants, setEisenhowerQuadrants] = useState<EisenhowerQuadrant[]>([]);
    const [sprints, setSprints] = useState<Sprint[]>([]);
    const [epics, setEpics] = useState<any[]>([]);
    const [selectedLifeWheel, setSelectedLifeWheel] = useState<string | null>(null);
    const [selectedQuadrant, setSelectedQuadrant] = useState<string | null>(null);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [showSprintPicker, setShowSprintPicker] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        await fetchTasks({ backlog: true });
        const [areas, quadrants, sprintsList] = await Promise.all([
            lifeWheelApi.getLifeWheelAreas(),
            lifeWheelApi.getEisenhowerQuadrants(),
            sprintApi.getSprints()
        ]);
        setLifeWheelAreas(areas);
        setEisenhowerQuadrants(quadrants);
        setSprints(sprintsList.filter((s: Sprint) => s.status !== 'completed'));
        // Epics can be loaded from epicStore if needed
    };

    const filteredTasks = useMemo(() => {
        let filtered = tasks;
        
        // Search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (task) =>
                    task.title.toLowerCase().includes(query) ||
                    task.description?.toLowerCase().includes(query)
            );
        }
        
        // Life wheel filter
        if (selectedLifeWheel) {
            filtered = filtered.filter(t => t.lifeWheelAreaId === selectedLifeWheel);
        }
        
        // Quadrant filter
        if (selectedQuadrant) {
            filtered = filtered.filter(t => t.eisenhowerQuadrantId === selectedQuadrant);
        }
        
        return filtered.sort((a, b) => {
            // Sort by quadrant priority: Q1 > Q2 > Q3 > Q4
            const qOrder = { 'eq-1': 0, 'eq-2': 1, 'eq-3': 2, 'eq-4': 3 };
            return (qOrder[a.eisenhowerQuadrantId as keyof typeof qOrder] || 4) - 
                   (qOrder[b.eisenhowerQuadrantId as keyof typeof qOrder] || 4);
        });
    }, [tasks, selectedLifeWheel, selectedQuadrant, searchQuery]);

    const getLifeWheelInfo = (id: string) => lifeWheelAreas.find(a => a.id === id);
    const getQuadrantInfo = (id: string) => eisenhowerQuadrants.find(q => q.id === id);

    const handleAddToSprint = (task: Task) => {
        setSelectedTask(task);
        setShowSprintPicker(true);
    };

    const assignToSprint = (sprintId: string) => {
        if (selectedTask) {
            updateTask(selectedTask.id, { sprintId });
            setShowSprintPicker(false);
            setSelectedTask(null);
            loadData(); // Refresh list
        }
    };

    const getQuadrantStyle = (quadrantId: string) => {
        // Theme-aware quadrant styles with accent colors
        const styles: Record<string, { 
            bgColor: string; 
            textColor: string; 
            borderColor: string;
            accentColor: string;
        }> = {
            'eq-1': { 
                bgColor: isDark ? 'rgba(220, 38, 38, 0.15)' : 'rgba(254, 242, 242, 1)', 
                textColor: isDark ? '#FCA5A5' : '#991B1B', 
                borderColor: isDark ? '#DC2626' : '#FECACA',
                accentColor: '#DC2626'
            },
            'eq-2': { 
                bgColor: isDark ? 'rgba(37, 99, 235, 0.15)' : 'rgba(239, 246, 255, 1)', 
                textColor: isDark ? '#93C5FD' : '#1E40AF', 
                borderColor: isDark ? '#2563EB' : '#BFDBFE',
                accentColor: '#2563EB'
            },
            'eq-3': { 
                bgColor: isDark ? 'rgba(202, 138, 4, 0.15)' : 'rgba(254, 252, 232, 1)', 
                textColor: isDark ? '#FCD34D' : '#92400E', 
                borderColor: isDark ? '#CA8A04' : '#FDE68A',
                accentColor: '#CA8A04'
            },
            'eq-4': { 
                bgColor: isDark ? 'rgba(107, 114, 128, 0.15)' : 'rgba(249, 250, 251, 1)', 
                textColor: isDark ? '#D1D5DB' : '#374151', 
                borderColor: isDark ? '#6B7280' : '#E5E7EB',
                accentColor: '#6B7280'
            },
        };
        return styles[quadrantId] || styles['eq-2'];
    };

    const renderTask = ({ item }: { item: Task }) => {
        const lifeWheel = getLifeWheelInfo(item.lifeWheelAreaId);
        const quadrant = getQuadrantInfo(item.eisenhowerQuadrantId);
        const style = getQuadrantStyle(item.eisenhowerQuadrantId);
        const taskEpic = epics.find(e => e.id === item.epicId);

        return (
            <View className="mb-4">
                <View 
                    className="rounded-2xl p-4 shadow-md"
                    style={{
                        backgroundColor: colors.card,
                        borderLeftWidth: 4,
                        borderLeftColor: style.accentColor,
                    }}
                >
                    <Pressable onPress={() => router.push(`/(tabs)/sdlc/task/${item.id}` as any)}>
                        <View className="flex-row items-start justify-between mb-3">
                            <View className="flex-row items-center flex-1 mr-2">
                                <View 
                                    className="w-10 h-10 rounded-full items-center justify-center mr-3 shadow-sm"
                                    style={{ backgroundColor: colors.backgroundSecondary }}
                                >
                                    <Text className="text-2xl">{lifeWheel?.icon}</Text>
                                </View>
                                <Text 
                                    className="text-base font-bold flex-1"
                                    style={{ color: colors.text }}
                                >
                                    {item.title}
                                </Text>
                            </View>
                            <View 
                                className="px-2.5 py-1.5 rounded-lg"
                                style={{ 
                                    backgroundColor: style.bgColor, 
                                    borderWidth: 1, 
                                    borderColor: style.borderColor 
                                }}
                            >
                                <Text 
                                    className="text-sm font-bold"
                                    style={{ color: style.textColor }}
                                >
                                    {item.storyPoints} pts
                                </Text>
                            </View>
                        </View>
                        
                        {item.description && (
                            <Text 
                                className="text-sm mb-3 ml-13 leading-5" 
                                numberOfLines={2}
                                style={{ color: colors.textSecondary }}
                            >
                                {item.description}
                            </Text>
                        )}
                        
                        <View className="flex-row items-center justify-between ml-13">
                            <View className="flex-row gap-2 flex-wrap flex-1">
                                <View 
                                    className="px-2.5 py-1 rounded-full"
                                    style={{ 
                                        backgroundColor: colors.backgroundSecondary, 
                                        borderWidth: 1, 
                                        borderColor: colors.border 
                                    }}
                                >
                                    <Text 
                                        className="text-xs font-medium"
                                        style={{ color: colors.textSecondary }}
                                    >
                                        {lifeWheel?.name}
                                    </Text>
                                </View>
                                <View 
                                    className="px-2.5 py-1 rounded-full"
                                    style={{ 
                                        backgroundColor: style.bgColor, 
                                        borderWidth: 1, 
                                        borderColor: style.borderColor 
                                    }}
                                >
                                    <Text 
                                        className="text-xs font-semibold"
                                        style={{ color: style.textColor }}
                                    >
                                        {quadrant?.label}
                                    </Text>
                                </View>
                                {taskEpic && (
                                    <View 
                                        className="px-2.5 py-1 rounded-full flex-row items-center"
                                        style={{ backgroundColor: taskEpic.color + '20', borderColor: taskEpic.color, borderWidth: 1 }}
                                    >
                                        <MaterialCommunityIcons 
                                            name={taskEpic.icon as any} 
                                            size={10} 
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
                    
                    <View 
                        className="mt-4 pt-4 ml-13"
                        style={{ borderTopWidth: 1, borderTopColor: colors.border }}
                    >
                        <Button
                            onPress={() => handleAddToSprint(item)}
                            size="sm"
                            variant="outline"
                            className="w-full shadow-sm"
                        >
                            <Text className="font-semibold" style={{ color: colors.primary }}>📅 Add to Sprint</Text>
                        </Button>
                    </View>
                </View>
            </View>
        );
    };

    const renderFilters = () => (
        <View 
            className="py-3"
            style={{ 
                backgroundColor: colors.card, 
                borderBottomWidth: 1, 
                borderBottomColor: colors.border 
            }}
        >
            {/* Search Input */}
            <View className="px-4 mb-3">
                <View 
                    className="rounded-xl p-3 flex-row items-center"
                    style={{ 
                        backgroundColor: colors.inputBackground, 
                        borderWidth: 1, 
                        borderColor: colors.border 
                    }}
                >
                    <MaterialCommunityIcons name="magnify" size={20} color={colors.placeholder} />
                    <TextInput
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholder="Search backlog items..."
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
                        }}
                        className="px-3 py-1.5 rounded-full"
                        style={{
                            backgroundColor: !selectedLifeWheel && !selectedQuadrant ? colors.primary : colors.backgroundSecondary,
                            borderWidth: !selectedLifeWheel && !selectedQuadrant ? 0 : 1,
                            borderColor: colors.border,
                        }}
                    >
                        <Text 
                            className="font-medium text-sm"
                            style={{ color: !selectedLifeWheel && !selectedQuadrant ? '#FFFFFF' : colors.textSecondary }}
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
                className="px-4"
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
        </View>
    );

    if (loading) {
        return (
            <Container safeArea={false}>
                <ScreenHeader
                    title="Backlog"
                    subtitle={`${tasks.length} unplanned items`}
                    showBack
                    useSafeArea={false}
                    showNotifications={false}
                />
                <Loading />
            </Container>
        );
    }

    return (
        <Container safeArea={false}>
            <ScreenHeader
                title="Backlog"
                subtitle={`${filteredTasks.length} unplanned items`}
                showBack
                useSafeArea={false}
                showNotifications={false}
                rightAction={
                    <Button
                        onPress={() => router.push('/(tabs)/sdlc/create-task' as any)}
                        size="sm"
                    >
                        + Add
                    </Button>
                }
            />
            
            {tasks.length === 0 ? (
                <EmptyState
                    icon="📋"
                    title="No backlog items"
                    message="Your backlog is empty. Add tasks that you'll plan into future sprints."
                    actionLabel="Create Task"
                    onAction={() => router.push('/(tabs)/sdlc/create-task' as any)}
                />
            ) : (
                <>
                    {renderFilters()}
                    {filteredTasks.length === 0 ? (
                        <View 
                            className="flex-1 items-center justify-center p-8"
                            style={{ backgroundColor: colors.background }}
                        >
                            <Text className="text-6xl mb-4">🔍</Text>
                            <Text 
                                className="text-lg font-semibold mb-2"
                                style={{ color: colors.text }}
                            >
                                No matches
                            </Text>
                            <Text 
                                className="text-sm text-center"
                                style={{ color: colors.textSecondary }}
                            >
                                Try different filters to see your backlog items
                            </Text>
                        </View>
                    ) : (
                        <FlatList
                            data={filteredTasks}
                            renderItem={renderTask}
                            keyExtractor={(item) => item.id}
                            contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 24 }}
                            ItemSeparatorComponent={() => <View className="h-1" />}
                        />
                    )}
                </>
            )}

            {/* Sprint Picker Modal */}
            <Modal
                visible={showSprintPicker}
                transparent
                animationType="slide"
                onRequestClose={() => setShowSprintPicker(false)}
            >
                <View className="flex-1 justify-end" style={{ backgroundColor: colors.overlay }}>
                    <View 
                        className="rounded-t-3xl p-6 max-h-[70%] shadow-2xl"
                        style={{ backgroundColor: colors.card }}
                    >
                        <View className="flex-row items-center justify-between mb-6">
                            <Text 
                                className="text-2xl font-bold"
                                style={{ color: colors.text }}
                            >
                                Add to Sprint
                            </Text>
                            <Pressable 
                                onPress={() => setShowSprintPicker(false)}
                                className="w-8 h-8 rounded-full items-center justify-center"
                                style={{ backgroundColor: colors.backgroundSecondary }}
                            >
                                <Text 
                                    className="text-2xl"
                                    style={{ color: colors.textSecondary }}
                                >
                                    ×
                                </Text>
                            </Pressable>
                        </View>
                        
                        {selectedTask && (
                            <View 
                                className="p-4 rounded-2xl mb-6 shadow-sm"
                                style={{ 
                                    backgroundColor: isDark ? 'rgba(37, 99, 235, 0.15)' : 'rgba(239, 246, 255, 1)',
                                    borderWidth: 1,
                                    borderColor: isDark ? '#2563EB' : '#BFDBFE'
                                }}
                            >
                                <Text 
                                    className="font-bold text-base mb-1"
                                    style={{ color: colors.text }}
                                >
                                    {selectedTask.title}
                                </Text>
                                <Text 
                                    className="text-sm"
                                    style={{ color: colors.textSecondary }}
                                >
                                    {selectedTask.storyPoints} story points
                                </Text>
                            </View>
                        )}
                        
                        <ScrollView showsVerticalScrollIndicator={false}>
                            {sprints.map((sprint, index) => {
                                const getSprintStatusStyle = () => {
                                    if (sprint.status === 'active') {
                                        return {
                                            bg: isDark ? 'rgba(22, 163, 74, 0.15)' : 'rgba(240, 253, 244, 1)',
                                            border: isDark ? '#16A34A' : '#BBF7D0',
                                            badgeBg: isDark ? 'rgba(22, 163, 74, 0.3)' : '#DCFCE7',
                                            badgeText: isDark ? '#86EFAC' : '#166534',
                                        };
                                    }
                                    if (sprint.status === 'planned') {
                                        return {
                                            bg: colors.card,
                                            border: colors.border,
                                            badgeBg: isDark ? 'rgba(37, 99, 235, 0.2)' : '#DBEAFE',
                                            badgeText: isDark ? '#93C5FD' : '#1E40AF',
                                        };
                                    }
                                    return {
                                        bg: colors.card,
                                        border: colors.border,
                                        badgeBg: colors.backgroundSecondary,
                                        badgeText: colors.textSecondary,
                                    };
                                };
                                const statusStyle = getSprintStatusStyle();
                                
                                return (
                                    <TouchableOpacity
                                        key={sprint.id}
                                        onPress={() => assignToSprint(sprint.id)}
                                        className="p-5 rounded-2xl mb-3 shadow-sm"
                                        style={{
                                            backgroundColor: statusStyle.bg,
                                            borderWidth: 2,
                                            borderColor: statusStyle.border,
                                        }}
                                    >
                                        <View className="flex-row items-center justify-between">
                                            <View className="flex-1">
                                                <Text 
                                                    className="font-bold text-base mb-1"
                                                    style={{ color: colors.text }}
                                                >
                                                    Sprint {sprint.weekNumber}
                                                    {sprint.status === 'active' && ' 🔥'}
                                                </Text>
                                                <Text 
                                                    className="text-sm"
                                                    style={{ color: colors.textSecondary }}
                                                >
                                                    {toLocaleDateStringLocalized(sprint.startDate, { month: 'short', day: 'numeric' })} - {toLocaleDateStringLocalized(sprint.endDate, { month: 'short', day: 'numeric' })}
                                                </Text>
                                            </View>
                                            <View className="items-end ml-3">
                                                <View 
                                                    className="px-3 py-1 rounded-full"
                                                    style={{ backgroundColor: statusStyle.badgeBg }}
                                                >
                                                    <Text 
                                                        className="text-xs font-semibold"
                                                        style={{ color: statusStyle.badgeText }}
                                                    >
                                                        {sprint.status}
                                                    </Text>
                                                </View>
                                                <Text 
                                                    className="text-xs mt-2 font-medium"
                                                    style={{ color: colors.textTertiary }}
                                                >
                                                    {sprint.totalPoints} pts
                                                </Text>
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </Container>
    );
}
