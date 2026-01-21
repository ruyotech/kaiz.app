import { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, Pressable, ScrollView } from 'react-native';
import { Container } from '../../../components/layout/Container';
import { ScreenHeader } from '../../../components/layout/ScreenHeader';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Task } from '../../../types/models';
import { useTaskStore } from '../../../store/taskStore';

export default function SearchTasksScreen() {
    const router = useRouter();
    const { tasks, fetchTasks } = useTaskStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
    const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
    const [recentSearches, setRecentSearches] = useState<string[]>([]);

    useEffect(() => {
        fetchTasks({});
    }, []);

    useEffect(() => {
        // Filter tasks based on search query and status
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

        setFilteredTasks(results);
    }, [searchQuery, selectedStatus, tasks]);

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        if (query.trim() && !recentSearches.includes(query)) {
            setRecentSearches([query, ...recentSearches.slice(0, 4)]);
        }
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
        <Container>
            <ScreenHeader title="Search Tasks" subtitle="Find any task quickly" showBack />

            <View className="p-4">
                {/* Search Input */}
                <View className="bg-white rounded-xl p-3 mb-4 flex-row items-center shadow-sm">
                    <MaterialCommunityIcons name="magnify" size={24} color="#9CA3AF" />
                    <TextInput
                        value={searchQuery}
                        onChangeText={handleSearch}
                        placeholder="Search by title or description..."
                        className="flex-1 ml-2 text-base"
                        autoFocus
                    />
                    {searchQuery.length > 0 && (
                        <Pressable onPress={() => setSearchQuery('')}>
                            <MaterialCommunityIcons name="close-circle" size={20} color="#9CA3AF" />
                        </Pressable>
                    )}
                </View>

                {/* Status Filters */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
                    <View className="flex-row gap-2">
                        {statusFilters.map((filter) => (
                            <Pressable
                                key={filter.label}
                                onPress={() => setSelectedStatus(filter.value)}
                                className={`px-4 py-2 rounded-full ${selectedStatus === filter.value
                                    ? 'bg-blue-600'
                                    : 'bg-gray-100'
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

                {/* Recent Searches */}
                {!searchQuery && recentSearches.length > 0 && (
                    <View className="mb-4">
                        <Text className="text-sm font-semibold text-gray-700 mb-2">Recent Searches</Text>
                        {recentSearches.map((search, index) => (
                            <Pressable
                                key={index}
                                onPress={() => setSearchQuery(search)}
                                className="flex-row items-center py-2 border-b border-gray-100"
                            >
                                <MaterialCommunityIcons name="history" size={20} color="#9CA3AF" />
                                <Text className="ml-2 text-gray-700">{search}</Text>
                            </Pressable>
                        ))}
                    </View>
                )}

                {/* Results */}
                {/* Results - Always shown */}
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
