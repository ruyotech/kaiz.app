import { View, Text, ScrollView } from 'react-native';
import { Container } from '../../../components/layout/Container';
import { ScreenHeader } from '../../../components/layout/ScreenHeader';
import { Card } from '../../../components/ui/Card';
import { useEffect, useState } from 'react';
import { mockApi } from '../../../services/mockApi';

export default function CalendarScreen() {
    const [sprints, setSprints] = useState<any[]>([]);

    useEffect(() => {
        mockApi.getSprints().then(setSprints);
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
                return 'bg-green-100 border-green-500';
            case 'active':
                return 'bg-blue-100 border-blue-500';
            default:
                return 'bg-gray-100 border-gray-300';
        }
    };

    return (
        <Container>
            <ScreenHeader
                title="Sprint Calendar"
                subtitle="52 week view"
                showBack
            />

            <ScrollView className="flex-1 p-4">
                <Text className="text-2xl font-bold mb-4">2026 Sprints</Text>

                <View className="flex-row flex-wrap gap-2">
                    {sprints.map((sprint) => (
                        <Card
                            key={sprint.id}
                            className={`w-[48%] border-l-4 ${getStatusColor(sprint.status)}`}
                        >
                            <Text className="font-bold text-lg">Week {sprint.weekNumber}</Text>
                            <Text className="text-sm text-gray-600 mb-2">
                                {sprint.startDate.split('-')[1]}/{sprint.startDate.split('-')[2]}
                            </Text>
                            <View className="flex-row items-center">
                                <View className="bg-gray-200 rounded-full h-2 flex-1 mr-2">
                                    <View
                                        className="bg-blue-600 rounded-full h-2"
                                        style={{
                                            width: sprint.totalPoints > 0
                                                ? `${(sprint.completedPoints / sprint.totalPoints) * 100}%`
                                                : '0%'
                                        }}
                                    />
                                </View>
                                <Text className="text-xs text-gray-600">
                                    {sprint.completedPoints}/{sprint.totalPoints}
                                </Text>
                            </View>
                        </Card>
                    ))}
                </View>

                {/* Generate placeholder for remaining weeks */}
                {sprints.length < 52 && (
                    <View className="flex-row flex-wrap gap-2 mt-2">
                        {Array.from({ length: Math.min(10, 52 - sprints.length) }).map((_, i) => (
                            <Card key={`future-${i}`} className="w-[48%] bg-gray-50">
                                <Text className="font-bold text-lg text-gray-400">
                                    Week {sprints.length + i + 1}
                                </Text>
                                <Text className="text-sm text-gray-400">Planned</Text>
                            </Card>
                        ))}
                    </View>
                )}
            </ScrollView>
        </Container>
    );
}
