import { View, Text, ScrollView } from 'react-native';
import { Container } from '../../../components/layout/Container';
import { ScreenHeader } from '../../../components/layout/ScreenHeader';
import { Card } from '../../../components/ui/Card';

export default function ReportsScreen() {
    return (
        <Container>
            <ScreenHeader
                title="Reports & Analytics"
                subtitle="Track your progress"
                showBack
            />

            <ScrollView className="flex-1 p-4">
                {/* Velocity Chart */}
                <Card className="mb-4">
                    <Text className="text-lg font-semibold mb-3">🚀 Sprint Velocity</Text>
                    <Text className="text-gray-600 mb-4">
                        Story points completed per week
                    </Text>

                    {/* Simple bar chart representation */}
                    <View className="space-y-2">
                        <View className="flex-row items-center">
                            <Text className="w-16 text-sm text-gray-600">Week 1</Text>
                            <View className="flex-1 bg-gray-200 rounded-full h-6 ml-2">
                                <View className="bg-green-600 rounded-full h-6" style={{ width: '100%' }}>
                                    <Text className="text-white text-xs text-center leading-6">21 pts</Text>
                                </View>
                            </View>
                        </View>
                        <View className="flex-row items-center">
                            <Text className="w-16 text-sm text-gray-600">Week 2</Text>
                            <View className="flex-1 bg-gray-200 rounded-full h-6 ml-2">
                                <View className="bg-green-600 rounded-full h-6" style={{ width: '89%' }}>
                                    <Text className="text-white text-xs text-center leading-6">16 pts</Text>
                                </View>
                            </View>
                        </View>
                        <View className="flex-row items-center">
                            <Text className="w-16 text-sm text-gray-600">Week 3</Text>
                            <View className="flex-1 bg-gray-200 rounded-full h-6 ml-2">
                                <View className="bg-blue-600 rounded-full h-6" style={{ width: '50%' }}>
                                    <Text className="text-white text-xs text-center leading-6">12 pts</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </Card>

                {/* Life Wheel */}
                <Card className="mb-4">
                    <Text className="text-lg font-semibold mb-3">⚖️ Life Balance</Text>
                    <Text className="text-gray-600 mb-4">
                        Points distributed across life areas
                    </Text>

                    <View className="bg-gray-100 rounded-lg p-4">
                        <View className="flex-row justify-between mb-2">
                            <Text className="text-sm">💼 Career & Work</Text>
                            <Text className="font-semibold">34 pts</Text>
                        </View>
                        <View className="flex-row justify-between mb-2">
                            <Text className="text-sm">💪 Health & Fitness</Text>
                            <Text className="font-semibold">16 pts</Text>
                        </View>
                        <View className="flex-row justify-between mb-2">
                            <Text className="text-sm">💰 Finance & Money</Text>
                            <Text className="font-semibold">5 pts</Text>
                        </View>
                        <View className="flex-row justify-between mb-2">
                            <Text className="text-sm">📚 Personal Growth</Text>
                            <Text className="font-semibold">8 pts</Text>
                        </View>
                    </View>
                </Card>

                {/* Eisenhower Distribution */}
                <Card>
                    <Text className="text-lg font-semibold mb-3">📊 Priority Distribution</Text>

                    <View className="grid grid-cols-2 gap-2">
                        <View className="bg-red-50 border-2 border-red-200 rounded-lg p-3">
                            <Text className="text-xs text-red-600 font-semibold mb-1">URGENT & IMPORTANT</Text>
                            <Text className="text-2xl font-bold text-red-600">13 pts</Text>
                        </View>
                        <View className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-3">
                            <Text className="text-xs text-yellow-600 font-semibold mb-1">NOT URGENT & IMPORTANT</Text>
                            <Text className="text-2xl font-bold text-yellow-600">26 pts</Text>
                        </View>
                        <View className="bg-blue-50 border-2 border-blue-200 rounded-lg p-3">
                            <Text className="text-xs text-blue-600 font-semibold mb-1">URGENT & NOT IMPORTANT</Text>
                            <Text className="text-2xl font-bold text-blue-600">2 pts</Text>
                        </View>
                        <View className="bg-gray-50 border-2 border-gray-200 rounded-lg p-3">
                            <Text className="text-xs text-gray-600 font-semibold mb-1">NOT URGENT & NOT IMPORTANT</Text>
                            <Text className="text-2xl font-bold text-gray-600">0 pts</Text>
                        </View>
                    </View>
                </Card>
            </ScrollView>
        </Container>
    );
}
