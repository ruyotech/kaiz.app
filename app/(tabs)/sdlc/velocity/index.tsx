import { View, Text, ScrollView, Dimensions } from 'react-native';
import { Container } from '../../../../components/layout/Container';
import { ScreenHeader } from '../../../../components/layout/ScreenHeader';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Mock data for velocity
const VELOCITY_DATA = [
    { sprint: 'S01', committed: 20, completed: 18 },
    { sprint: 'S02', committed: 24, completed: 22 },
    { sprint: 'S03', committed: 22, completed: 15 },
    { sprint: 'S04', committed: 25, completed: 28 },
    { sprint: 'S05', committed: 30, completed: 25 },
];

export default function VelocityScreen() {
    const averageVelocity = Math.round(
        VELOCITY_DATA.reduce((acc, curr) => acc + curr.completed, 0) / VELOCITY_DATA.length
    );

    const maxPoints = Math.max(...VELOCITY_DATA.map(d => Math.max(d.committed, d.completed))) + 5;
    const chartHeight = 200;

    return (
        <Container>
            <ScreenHeader title="Team Velocity" subtitle="AI-Driven Performance Insights" showBack />

            <ScrollView className="flex-1 p-4">
                {/* Summary Cards */}
                <View className="flex-row gap-3 mb-6">
                    <View className="flex-1 bg-white p-4 rounded-2xl shadow-sm border border-gray-100 items-center">
                        <MaterialCommunityIcons name="speedometer" size={32} color="#3B82F6" className="mb-2" />
                        <Text className="text-3xl font-bold text-gray-900">{averageVelocity}</Text>
                        <Text className="text-xs text-gray-500 font-medium text-center">Avg Velocity</Text>
                    </View>
                    <View className="flex-1 bg-white p-4 rounded-2xl shadow-sm border border-gray-100 items-center">
                        <MaterialCommunityIcons name="trending-up" size={32} color="#10B981" className="mb-2" />
                        <Text className="text-3xl font-bold text-gray-900">+12%</Text>
                        <Text className="text-xs text-gray-500 font-medium text-center">Trend</Text>
                    </View>
                    <View className="flex-1 bg-white p-4 rounded-2xl shadow-sm border border-gray-100 items-center">
                        <MaterialCommunityIcons name="target" size={32} color="#8B5CF6" className="mb-2" />
                        <Text className="text-3xl font-bold text-gray-900">26</Text>
                        <Text className="text-xs text-gray-500 font-medium text-center">Next Commit</Text>
                    </View>
                </View>

                {/* Velocity Chart */}
                <View className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-6">
                    <Text className="text-lg font-bold text-gray-900 mb-6">Sprint Performance</Text>

                    <View className="h-[200px] flex-row items-end justify-between px-2">
                        {VELOCITY_DATA.map((data, index) => {
                            const committedHeight = (data.committed / maxPoints) * chartHeight;
                            const completedHeight = (data.completed / maxPoints) * chartHeight;

                            return (
                                <View key={index} className="items-center w-12 group">
                                    <View className="flex-row items-end gap-1">
                                        <View
                                            className="w-3 bg-gray-200 rounded-t-sm"
                                            style={{ height: committedHeight }}
                                        />
                                        <View
                                            className="w-3 bg-blue-500 rounded-t-sm"
                                            style={{ height: completedHeight }}
                                        />
                                    </View>
                                    <Text className="text-xs text-gray-500 mt-2 font-medium">{data.sprint}</Text>
                                </View>
                            );
                        })}
                    </View>
                    <View className="flex-row justify-center gap-6 mt-4">
                        <View className="flex-row items-center">
                            <View className="w-3 h-3 bg-gray-200 rounded-full mr-2" />
                            <Text className="text-xs text-gray-500">Committed</Text>
                        </View>
                        <View className="flex-row items-center">
                            <View className="w-3 h-3 bg-blue-500 rounded-full mr-2" />
                            <Text className="text-xs text-gray-500">Completed</Text>
                        </View>
                    </View>
                </View>

                {/* AI Insights */}
                <View className="bg-indigo-50 p-5 rounded-2xl border border-indigo-100 mb-20">
                    <View className="flex-row items-center mb-3">
                        <MaterialCommunityIcons name="robot" size={24} color="#4F46E5" />
                        <Text className="text-lg font-bold text-indigo-900 ml-2">Kaizen Insights</Text>
                    </View>
                    <Text className="text-indigo-800 leading-relaxed">
                        Your team's velocity has stabilized around <Text className="font-bold">25 points</Text> over the last 3 sprints.
                        However, in S03, completion dropped significantly. This correlates with the high number of "Blocked" tasks recorded that week.
                        {"\n\n"}
                        <Text className="font-bold">Recommendation:</Text> For the next sprint, consider committing to <Text className="font-bold">26 points</Text> but reserve 10% capacity for unplanned hotfixes.
                    </Text>
                </View>

            </ScrollView>
        </Container>
    );
}
