import { View, Text, ScrollView } from 'react-native';
import { Container } from '../../../components/layout/Container';
import { ScreenHeader } from '../../../components/layout/ScreenHeader';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';

export default function CommandCenterScreen() {
    return (
        <Container>
            <ScreenHeader
                title="Command Center"
                subtitle="Multi-modal input & drafts"
            />
            <ScrollView className="flex-1 p-4">
                <Card className="mb-4">
                    <Text className="text-lg font-semibold mb-3">Input Options</Text>
                    <View className="flex-row justify-around">
                        <View className="items-center">
                            <Text className="text-4xl mb-2">📷</Text>
                            <Text className="text-sm text-gray-600">Photo</Text>
                        </View>
                        <View className="items-center">
                            <Text className="text-4xl mb-2">🎙️</Text>
                            <Text className="text-sm text-gray-600">Voice</Text>
                        </View>
                        <View className="items-center">
                            <Text className="text-4xl mb-2">⌨️</Text>
                            <Text className="text-sm text-gray-600">Text</Text>
                        </View>
                    </View>
                </Card>

                <Text className="text-xl font-semibold mb-3">Drafts</Text>

                <Card className="mb-3">
                    <View className="flex-row justify-between items-start mb-2">
                        <Text className="text-base font-semibold flex-1">
                            Call dentist for checkup
                        </Text>
                        <Badge variant="info">78%</Badge>
                    </View>
                    <Text className="text-sm text-gray-600">
                        AI-parsed task from voice note
                    </Text>
                </Card>

                <Card>
                    <View className="flex-row justify-between items-start mb-2">
                        <Text className="text-base font-semibold flex-1">
                            Comcast Internet Bill
                        </Text>
                        <Badge variant="warning">87%</Badge>
                    </View>
                    <Text className="text-sm text-gray-600">
                        AI-parsed from photo • $89.99
                    </Text>
                </Card>
            </ScrollView>
        </Container>
    );
}
