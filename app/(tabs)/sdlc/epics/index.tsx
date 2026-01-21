import { View, Text, FlatList, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Container } from '../../../../components/layout/Container';
import { ScreenHeader } from '../../../../components/layout/ScreenHeader';
import { useState } from 'react';

// Mock data for initial dev
const MOCK_EPICS = [
    {
        id: '1',
        title: 'Mobile App Redesign',
        description: 'Complete overhaul of the mobile UI/UX',
        progress: 0.75,
        status: 'in_progress',
        color: '#3B82F6',
        startDate: '2025-01-01',
        endDate: '2025-03-31',
        taskCount: 24,
        completedTaskCount: 18
    },
    {
        id: '2',
        title: 'Backend Migration',
        description: 'Move from Node.js to Go',
        progress: 0.30,
        status: 'blocked',
        color: '#EF4444',
        startDate: '2025-02-01',
        endDate: '2025-05-01',
        taskCount: 45,
        completedTaskCount: 13
    },
    {
        id: '3',
        title: 'Q3 Feature Set',
        description: 'New features for the upcoming quarter',
        progress: 0.0,
        status: 'todo',
        color: '#8B5CF6',
        startDate: '2025-04-01',
        endDate: '2025-06-30',
        taskCount: 12,
        completedTaskCount: 0
    }
];

export default function EpicsScreen() {
    const router = useRouter();
    const [filter, setFilter] = useState('all');

    const renderEpicCard = ({ item }: { item: typeof MOCK_EPICS[0] }) => (
        <Pressable
            onPress={() => router.push(`/(tabs)/sdlc/epic/${item.id}` as any)}
            className="bg-white rounded-2xl mb-4 overflow-hidden shadow-sm border border-gray-100"
        >
            {/* Determine Header Color based on status or custom color */}
            <View className="h-2 w-full" style={{ backgroundColor: item.color }} />

            <View className="p-5">
                <View className="flex-row justify-between items-start mb-2">
                    <Text className="text-lg font-bold text-gray-900 flex-1 mr-2">{item.title}</Text>
                    <View className={`px-2 py-1 rounded-md bg-${item.status === 'blocked' ? 'red' : item.status === 'in_progress' ? 'blue' : 'gray'}-100`}>
                        <Text className={`text-xs font-bold capitalize text-${item.status === 'blocked' ? 'red' : item.status === 'in_progress' ? 'blue' : 'gray'}-700`}>
                            {item.status.replace('_', ' ')}
                        </Text>
                    </View>
                </View>

                <Text className="text-gray-500 text-sm mb-4 line-clamp-2">{item.description}</Text>

                {/* Progress Bar */}
                <View className="mb-4">
                    <View className="flex-row justify-between mb-1">
                        <Text className="text-xs text-gray-500 font-medium">Progress</Text>
                        <Text className="text-xs text-gray-900 font-bold">{Math.round(item.progress * 100)}%</Text>
                    </View>
                    <View className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <View
                            className="h-full rounded-full"
                            style={{
                                width: `${item.progress * 100}%`,
                                backgroundColor: item.color
                            }}
                        />
                    </View>
                </View>

                {/* Footer Info */}
                <View className="flex-row justify-between items-center pt-3 border-t border-gray-50">
                    <View className="flex-row items-center">
                        <MaterialCommunityIcons name="checkbox-multiple-marked-circle-outline" size={16} color="#6B7280" />
                        <Text className="text-xs text-gray-500 ml-1">{item.completedTaskCount}/{item.taskCount} Tasks</Text>
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

    return (
        <Container>
            <ScreenHeader
                title="Epics"
                subtitle="Strategic high-level goals"
                showBack
                rightAction={
                    <Pressable
                        onPress={() => router.push('/(tabs)/sdlc/epics/create')}
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
                        <Text className="text-2xl font-bold text-blue-700">{MOCK_EPICS.length}</Text>
                        <Text className="text-blue-600 text-xs font-medium">Active Epics</Text>
                    </View>
                    <View className="flex-1 bg-green-50 p-4 rounded-xl border border-green-100">
                        <Text className="text-2xl font-bold text-green-700">75%</Text>
                        <Text className="text-green-600 text-xs font-medium">Avg Completion</Text>
                    </View>
                    <View className="flex-1 bg-purple-50 p-4 rounded-xl border border-purple-100">
                        <Text className="text-2xl font-bold text-purple-700">81</Text>
                        <Text className="text-purple-600 text-xs font-medium">Total Tasks</Text>
                    </View>
                </View>

                <FlatList
                    data={MOCK_EPICS}
                    renderItem={renderEpicCard}
                    keyExtractor={item => item.id}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 20 }}
                />
            </View>
        </Container>
    );
}
