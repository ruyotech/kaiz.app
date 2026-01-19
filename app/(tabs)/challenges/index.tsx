import { View, Text, ScrollView } from 'react-native';
import { Container } from '../../../components/layout/Container';
import { ScreenHeader } from '../../../components/layout/ScreenHeader';
import { Card } from '../../../components/ui/Card';

export default function ChallengesScreen() {
    return (
        <Container>
            <ScreenHeader
                title="Challenges"
                subtitle="Compete and stay motivated"
            />
            <ScrollView className="flex-1 p-4">
                <Card className="mb-4">
                    <Text className="text-lg font-semibold mb-2">🏃 10,000 Steps Daily</Text>
                    <Text className="text-gray-600 mb-3">
                        Group challenge • 18 days streak
                    </Text>
                    <View className="bg-blue-100 rounded-full h-2 mb-2">
                        <View className="bg-blue-600 rounded-full h-2" style={{ width: '75%' }} />
                    </View>
                    <Text className="text-sm text-gray-500">
                        143,250 / 190,000 steps this month
                    </Text>
                </Card>

                <Card className="mb-4">
                    <Text className="text-lg font-semibold mb-2">📚 Read 1 Book Per Week</Text>
                    <Text className="text-gray-600 mb-3">
                        Group challenge • 3 weeks streak
                    </Text>
                    <View className="bg-green-100 rounded-full h-2 mb-2">
                        <View className="bg-green-600 rounded-full h-2" style={{ width: '100%' }} />
                    </View>
                    <Text className="text-sm text-gray-500">
                        3 / 3 books completed
                    </Text>
                </Card>

                <Card>
                    <Text className="text-lg font-semibold mb-2">🧘 Meditate 20 Minutes Daily</Text>
                    <Text className="text-gray-600 mb-3">
                        Solo challenge • 5 days streak
                    </Text>
                    <View className="bg-purple-100 rounded-full h-2 mb-2">
                        <View className="bg-purple-600 rounded-full h-2" style={{ width: '25%' }} />
                    </View>
                    <Text className="text-sm text-gray-500">
                        5 / 20 days completed
                    </Text>
                </Card>
            </ScrollView>
        </Container>
    );
}
