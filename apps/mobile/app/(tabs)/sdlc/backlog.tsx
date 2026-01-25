import { useState, useEffect, useMemo } from 'react';
import { View, Text, FlatList, Pressable, ScrollView, Modal, TouchableOpacity, TextInput } from 'react-native';
import { Container } from '../../../components/layout/Container';
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

export default function BacklogScreen() {
    const router = useRouter();
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
        const styles: Record<string, { bg: string; text: string; border: string }> = {
            'eq-1': { bg: 'bg-red-50', text: 'text-red-900', border: 'border-red-200' },
            'eq-2': { bg: 'bg-blue-50', text: 'text-blue-900', border: 'border-blue-200' },
            'eq-3': { bg: 'bg-yellow-50', text: 'text-yellow-900', border: 'border-yellow-200' },
            'eq-4': { bg: 'bg-gray-50', text: 'text-gray-900', border: 'border-gray-200' },
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
                <Card className={`border-l-4 ${style.border} ${style.bg} shadow-md`}>
                    <Pressable onPress={() => router.push(`/(tabs)/sdlc/task/${item.id}` as any)}>
                        <View className="flex-row items-start justify-between mb-3">
                            <View className="flex-row items-center flex-1 mr-2">
                                <View className="w-10 h-10 rounded-full bg-white items-center justify-center mr-3 shadow-sm">
                                    <Text className="text-2xl">{lifeWheel?.icon}</Text>
                                </View>
                                <Text className={`text-base font-bold flex-1 ${style.text}`}>
                                    {item.title}
                                </Text>
                            </View>
                            <View className={`px-2.5 py-1.5 rounded-lg ${style.bg} border ${style.border}`}>
                                <Text className={`text-sm font-bold ${style.text}`}>
                                    {item.storyPoints} pts
                                </Text>
                            </View>
                        </View>
                        
                        {item.description && (
                            <Text className="text-sm text-gray-700 mb-3 ml-13 leading-5" numberOfLines={2}>
                                {item.description}
                            </Text>
                        )}
                        
                        <View className="flex-row items-center justify-between ml-13">
                            <View className="flex-row gap-2 flex-wrap flex-1">
                                <View className="px-2.5 py-1 rounded-full bg-white border border-gray-300">
                                    <Text className="text-xs font-medium text-gray-700">
                                        {lifeWheel?.name}
                                    </Text>
                                </View>
                                <View className={`px-2.5 py-1 rounded-full border ${style.border} ${style.bg}`}>
                                    <Text className={`text-xs font-semibold ${style.text}`}>
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
                    
                    <View className="mt-4 pt-4 border-t-2 border-gray-200 ml-13">
                        <Button
                            onPress={() => handleAddToSprint(item)}
                            size="sm"
                            variant="outline"
                            className="w-full shadow-sm"
                        >
                            <Text className="font-semibold">📅 Add to Sprint</Text>
                        </Button>
                    </View>
                </Card>
            </View>
        );
    };

    const renderFilters = () => (
        <View className="bg-white border-b border-gray-200 py-3">
            {/* Search Input */}
            <View className="px-4 mb-3">
                <View className="bg-gray-50 rounded-xl p-3 flex-row items-center border border-gray-200">
                    <MaterialCommunityIcons name="magnify" size={20} color="#9CA3AF" />
                    <TextInput
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholder="Search backlog items..."
                        className="flex-1 ml-2 text-base"
                        placeholderTextColor="#9CA3AF"
                    />
                    {searchQuery.length > 0 && (
                        <Pressable onPress={() => setSearchQuery('')}>
                            <MaterialCommunityIcons name="close-circle" size={18} color="#9CA3AF" />
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
                        className={`px-3 py-1.5 rounded-full ${!selectedLifeWheel && !selectedQuadrant ? 'bg-blue-600' : 'bg-gray-100 border border-gray-300'}`}
                    >
                        <Text className={`font-medium text-sm ${!selectedLifeWheel && !selectedQuadrant ? 'text-white' : 'text-gray-700'}`}>
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
                                className={`px-3 py-1.5 rounded-full flex-row items-center ${selectedLifeWheel === area.id ? 'bg-blue-600' : 'bg-gray-100 border border-gray-300'}`}
                            >
                                <Text className="mr-1 text-sm">{area.icon}</Text>
                                <Text className={`font-medium text-sm ${selectedLifeWheel === area.id ? 'text-white' : 'text-gray-700'}`}>
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
                                className={`px-3 py-1.5 rounded-lg ${isSelected ? `${style.bg} border-2 ${style.border}` : `${style.bg} border ${style.border} opacity-60`}`}
                            >
                                <Text className={`text-xs font-bold ${style.text}`}>
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
                <View className="bg-white border-b border-gray-200 px-4 pt-12 pb-3">
                    <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center flex-1">
                            <Pressable onPress={() => router.back()} className="mr-3">
                                <MaterialCommunityIcons name="arrow-left" size={24} color="#2563EB" />
                            </Pressable>
                            <View className="flex-1">
                                <Text className="text-lg font-bold text-gray-900">Backlog</Text>
                                <Text className="text-xs text-gray-600">{tasks.length} unplanned items</Text>
                            </View>
                        </View>
                    </View>
                </View>
                <Loading />
            </Container>
        );
    }

    return (
        <Container safeArea={false}>
            <View className="bg-white border-b border-gray-200 px-4 pt-12 pb-3">
                <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center flex-1">
                        <Pressable onPress={() => router.back()} className="mr-3">
                            <MaterialCommunityIcons name="arrow-left" size={24} color="#2563EB" />
                        </Pressable>
                        <View className="flex-1">
                            <Text className="text-lg font-bold text-gray-900">Backlog</Text>
                            <Text className="text-xs text-gray-600">{filteredTasks.length} unplanned items</Text>
                        </View>
                    </View>
                    <Button
                        onPress={() => router.push('/(tabs)/sdlc/create-task' as any)}
                        size="sm"
                    >
                        + Add
                    </Button>
                </View>
            </View>
            
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
                        <View className="flex-1 items-center justify-center p-8">
                            <Text className="text-6xl mb-4">🔍</Text>
                            <Text className="text-lg font-semibold text-gray-900 mb-2">No matches</Text>
                            <Text className="text-sm text-gray-600 text-center">
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
                <View className="flex-1 bg-black/50 justify-end">
                    <View className="bg-white rounded-t-3xl p-6 max-h-[70%] shadow-2xl">
                        <View className="flex-row items-center justify-between mb-6">
                            <Text className="text-2xl font-bold text-gray-900">Add to Sprint</Text>
                            <Pressable 
                                onPress={() => setShowSprintPicker(false)}
                                className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center active:bg-gray-200"
                            >
                                <Text className="text-2xl text-gray-600">×</Text>
                            </Pressable>
                        </View>
                        
                        {selectedTask && (
                            <View className="bg-blue-50 p-4 rounded-2xl mb-6 border border-blue-200 shadow-sm">
                                <Text className="font-bold text-gray-900 text-base mb-1">{selectedTask.title}</Text>
                                <Text className="text-sm text-gray-600">{selectedTask.storyPoints} story points</Text>
                            </View>
                        )}
                        
                        <ScrollView showsVerticalScrollIndicator={false}>
                            {sprints.map((sprint, index) => (
                                <TouchableOpacity
                                    key={sprint.id}
                                    onPress={() => assignToSprint(sprint.id)}
                                    className={`p-5 border-2 border-gray-200 rounded-2xl mb-3 active:bg-gray-50 shadow-sm ${
                                        sprint.status === 'active' ? 'bg-green-50 border-green-300' : 'bg-white'
                                    }`}
                                >
                                    <View className="flex-row items-center justify-between">
                                        <View className="flex-1">
                                            <Text className="font-bold text-gray-900 text-base mb-1">
                                                Sprint {sprint.weekNumber}
                                                {sprint.status === 'active' && ' 🔥'}
                                            </Text>
                                            <Text className="text-sm text-gray-600">
                                                {new Date(sprint.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(sprint.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                            </Text>
                                        </View>
                                        <View className="items-end ml-3">
                                            <View className={`px-3 py-1 rounded-full ${
                                                sprint.status === 'active' ? 'bg-green-100' :
                                                sprint.status === 'planned' ? 'bg-blue-100' :
                                                'bg-gray-100'
                                            }`}>
                                                <Text className={`text-xs font-semibold ${
                                                    sprint.status === 'active' ? 'text-green-800' :
                                                    sprint.status === 'planned' ? 'text-blue-800' :
                                                    'text-gray-800'
                                                }`}>
                                                    {sprint.status}
                                                </Text>
                                            </View>
                                            <Text className="text-xs text-gray-500 mt-2 font-medium">
                                                {sprint.totalPoints} pts
                                            </Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </Container>
    );
}
