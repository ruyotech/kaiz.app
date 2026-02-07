import { View, Text, Pressable, ScrollView } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Container } from '../../../../components/layout/Container';
import { ScreenHeader } from '../../../../components/layout/ScreenHeader';
import { useState, useEffect } from 'react';
import { useEpicStore } from '../../../../store/epicStore';
import { useTaskStore } from '../../../../store/taskStore';
import { Epic } from '../../../../types/models';

export default function EpicsScreen() {
    const router = useRouter();
    const { epics, fetchEpics } = useEpicStore();
    const { tasks, fetchTasks } = useTaskStore();
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchEpics();
        fetchTasks();
    }, []);

    const getEpicStats = (epic: Epic) => {
        const epicTasks = tasks.filter(t => epic.taskIds?.includes(t.id));
        const completedTasks = epicTasks.filter(t => t.status === 'done');
        const progress = epic.totalPoints > 0 ? epic.completedPoints / epic.totalPoints : 0;
        
        return {
            taskCount: epicTasks.length,
            completedTaskCount: completedTasks.length,
            progress
        };
    };

    const totalTasks = epics.reduce((sum, e) => sum + (e.taskIds?.length || 0), 0);
    const avgCompletion = epics.length > 0
        ? epics.reduce((sum, e) => {
            const progress = e.totalPoints > 0 ? e.completedPoints / e.totalPoints : 0;
            return sum + progress;
        }, 0) / epics.length
        : 0;

    const renderEpicCard = ({ item }: { item: Epic }) => {
        const stats = getEpicStats(item);
        
        return (
            <Pressable
                onPress={() => router.push(`/(tabs)/sprints/epic/${item.id}` as any)}
                className="bg-white rounded-2xl mb-4 overflow-hidden shadow-sm border border-gray-100"
            >
                <View className="h-2 w-full" style={{ backgroundColor: item.color }} />

                <View className="p-5">
                    <View className="flex-row justify-between items-start mb-2">
                        <Text className="text-lg font-bold text-gray-900 flex-1 mr-2">{item.title}</Text>
                        <View className={`px-2 py-1 rounded-md ${
                            item.status === 'active' ? 'bg-blue-100' :
                            item.status === 'completed' ? 'bg-green-100' :
                            item.status === 'cancelled' ? 'bg-red-100' :
                            'bg-gray-100'
                        }`}>
                            <Text className={`text-xs font-bold capitalize ${
                                item.status === 'active' ? 'text-blue-700' :
                                item.status === 'completed' ? 'text-green-700' :
                                item.status === 'cancelled' ? 'text-red-700' :
                                'text-gray-700'
                            }`}>
                                {item.status}
                            </Text>
                        </View>
                    </View>

                    <Text className="text-gray-500 text-sm mb-4" numberOfLines={2}>{item.description}</Text>

                    {/* Progress Bar */}
                    <View className="mb-4">
                        <View className="flex-row justify-between mb-1">
                            <Text className="text-xs text-gray-500 font-medium">Progress</Text>
                            <Text className="text-xs text-gray-900 font-bold">{Math.round(stats.progress * 100)}%</Text>
                        </View>
                        <View className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <View
                                className="h-full rounded-full"
                                style={{
                                    width: `${stats.progress * 100}%`,
                                    backgroundColor: item.color
                                }}
                            />
                        </View>
                    </View>

                    {/* Footer Info */}
                    <View className="flex-row justify-between items-center pt-3 border-t border-gray-50">
                        <View className="flex-row items-center">
                            <MaterialCommunityIcons name="checkbox-multiple-marked-circle-outline" size={16} color="#6B7280" />
                            <Text className="text-xs text-gray-500 ml-1">
                                {stats.completedTaskCount}/{stats.taskCount} Tasks
                            </Text>
                        </View>
                        <View className="flex-row items-center">
                            <MaterialCommunityIcons name="calendar-range" size={16} color="#6B7280" />
                            <Text className="text-xs text-gray-500 ml-1">
                                {new Date(item.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </Text>
                        </View>
                    </View>
                </View>
            </Pressable>
        );
    };

    return (
        <Container>
            <ScreenHeader
                title="Epics"
                subtitle="Strategic high-level goals"
                showBack
                rightAction={
                    <Pressable
                        onPress={() => router.push('/(tabs)/sprints/epics/create' as any)}
                        className="bg-blue-600 rounded-full w-8 h-8 items-center justify-center shadow-lg"
                    >
                        <MaterialCommunityIcons name="plus" size={20} color="white" />
                    </Pressable>
                }
            />

            <View className="flex-1 px-4 pt-4">
                {/* Visual Summary / Stats Header */}
                <View className="flex-row gap-3 mb-6">
                    <View className="flex-1 bg-blue-50 p-4 rounded-xl border border-blue-100">
                        <Text className="text-2xl font-bold text-blue-700">{epics.length}</Text>
                        <Text className="text-blue-600 text-xs font-medium">Active Epics</Text>
                    </View>
                    <View className="flex-1 bg-green-50 p-4 rounded-xl border border-green-100">
                        <Text className="text-2xl font-bold text-green-700">{Math.round(avgCompletion * 100)}%</Text>
                        <Text className="text-green-600 text-xs font-medium">Avg Completion</Text>
                    </View>
                    <View className="flex-1 bg-purple-50 p-4 rounded-xl border border-purple-100">
                        <Text className="text-2xl font-bold text-purple-700">{totalTasks}</Text>
                        <Text className="text-purple-600 text-xs font-medium">Total Tasks</Text>
                    </View>
                </View>

                {epics.length === 0 ? (
                    <View className="flex-1 items-center justify-center p-8">
                        <MaterialCommunityIcons name="rocket-launch-outline" size={64} color="#D1D5DB" />
                        <Text className="text-gray-900 text-lg font-bold mt-4">No Epics Yet</Text>
                        <Text className="text-gray-500 text-center mt-2">
                            Create your first epic to organize tasks into strategic goals
                        </Text>
                        <Pressable
                            onPress={() => router.push('/(tabs)/sprints/epics/create' as any)}
                            className="bg-blue-600 px-6 py-3 rounded-xl mt-6"
                        >
                            <Text className="text-white font-bold">Create Epic</Text>
                        </Pressable>
                    </View>
                ) : (
                    <FlashList
                        data={epics}
                        renderItem={renderEpicCard}
                        keyExtractor={item => item.id}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 20 }}
                    />
                )}
            </View>
        </Container>
    );
}
