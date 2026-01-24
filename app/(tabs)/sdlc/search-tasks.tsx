import { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, Pressable, ScrollView, TouchableOpacity } from 'react-native';
import { Container } from '../../../components/layout/Container';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Task, LifeWheelArea, EisenhowerQuadrant } from '../../../types/models';
import { useTaskStore } from '../../../store/taskStore';
import { mockApi } from '../../../services/mockApi';

export default function SearchTasksScreen() {
    const router = useRouter();
    const { tasks, fetchTasks } = useTaskStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
    const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
    const [selectedLifeWheel, setSelectedLifeWheel] = useState<string | null>(null);
    const [selectedQuadrant, setSelectedQuadrant] = useState<string | null>(null);
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    const [lifeWheelAreas, setLifeWheelAreas] = useState<LifeWheelArea[]>([]);
    const [eisenhowerQuadrants, setEisenhowerQuadrants] = useState<EisenhowerQuadrant[]>([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        await fetchTasks({});
        const [areas, quadrants] = await Promise.all([
            mockApi.getLifeWheelAreas(),
            mockApi.getEisenhowerQuadrants()
        ]);
        setLifeWheelAreas(areas);
        setEisenhowerQuadrants(quadrants);
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
        const styles: Record<string, { bg: string; text: string; border: string }> = {
            'eq-1': { bg: 'bg-red-50', text: 'text-red-900', border: 'border-red-200' },
            'eq-2': { bg: 'bg-blue-50', text: 'text-blue-900', border: 'border-blue-200' },
            'eq-3': { bg: 'bg-yellow-50', text: 'text-yellow-900', border: 'border-yellow-200' },
            'eq-4': { bg: 'bg-gray-50', text: 'text-gray-900', border: 'border-gray-200' },
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

        return (
            <Pressable onPress={() => router.push(`/(tabs)/sdlc/task/${item.id}` as any)}>
                <Card className="mb-3">
                    <View className="flex-row items-start justify-between mb-2">
                        <Text className="text-base font-semibold flex-1 mr-2">{item.title}</Text>
                        <Badge className={getStatusColor(item.status)} size="sm">
                            {item.storyPoints}
                        </Badge>
                    </View>
                    {item.description && (
                        <Text className="text-sm text-gray-600 mb-2" numberOfLines={2}>
                            {item.description}
                        </Text>
                    )}
                    <View className="flex-row gap-2">
                        <Badge className={getStatusColor(item.status)} size="sm">
                            {getStatusLabel(item.status)}
                        </Badge>
                    </View>
                </Card>
            </Pressable>
        );
    };

    return (
        <Container safeArea={false}>
            {/* Header */}
            <View className="bg-white border-b border-gray-200 px-4 pt-12 pb-3">
                <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center flex-1">
                        <Pressable onPress={() => router.back()} className="mr-3">
                            <MaterialCommunityIcons name="arrow-left" size={24} color="#2563EB" />
                        </Pressable>
                        <View className="flex-1">
                            <Text className="text-xl font-bold text-gray-900">Task Search</Text>
                            <Text className="text-sm text-gray-600 mt-0.5">Search and filter all tasks</Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* Filters Section */}
            <View className="bg-white border-b border-gray-200 py-3">
                {/* Search Input */}
                <View className="px-4 mb-3">
                    <View className="bg-gray-50 rounded-xl p-3 flex-row items-center border border-gray-200">
                        <MaterialCommunityIcons name="magnify" size={20} color="#9CA3AF" />
                        <TextInput
                            value={searchQuery}
                            onChangeText={handleSearch}
                            placeholder="Search tasks..."
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
                                setSelectedStatus(null);
                            }}
                            className={`px-3 py-1.5 rounded-full ${!selectedLifeWheel && !selectedQuadrant && !selectedStatus ? 'bg-blue-600' : 'bg-gray-100 border border-gray-300'}`}
                        >
                            <Text className={`font-medium text-sm ${!selectedLifeWheel && !selectedQuadrant && !selectedStatus ? 'text-white' : 'text-gray-700'}`}>
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

                {/* Status Filters */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4">
                    <View className="flex-row gap-2">
                        {statusFilters.map((filter) => (
                            <Pressable
                                key={filter.label}
                                onPress={() => setSelectedStatus(filter.value)}
                                className={`px-3 py-1.5 rounded-full ${selectedStatus === filter.value
                                    ? 'bg-blue-600'
                                    : 'bg-gray-100 border border-gray-300'
                                    }`}
                            >
                                <Text
                                    className={`text-sm font-medium ${selectedStatus === filter.value ? 'text-white' : 'text-gray-700'
                                        }`}
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
                    <Text className="text-sm text-gray-600 mb-3">
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
                            <MaterialCommunityIcons name="magnify" size={64} color="#E5E7EB" />
                            <Text className="text-gray-500 mt-4">No tasks found</Text>
                        </View>
                    )}
                </View>
            </View>
        </Container>
    );
}
