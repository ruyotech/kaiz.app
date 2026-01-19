import { View, Text, ScrollView } from 'react-native';
import { useEffect, useState } from 'react';
import { Container } from '../../../components/layout/Container';
import { ScreenHeader } from '../../../components/layout/ScreenHeader';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { mockApi } from '../../../services/mockApi';

export default function MotivationScreen() {
    const [dailyQuote, setDailyQuote] = useState<any>(null);

    useEffect(() => {
        mockApi.getDailyQuote().then(setDailyQuote);
    }, []);

    const getNewQuote = async () => {
        const quote = await mockApi.getDailyQuote();
        setDailyQuote(quote);
    };

    if (!dailyQuote) {
        return (
            <Container>
                <Text>Loading...</Text>
            </Container>
        );
    }

    return (
        <Container>
            <ScreenHeader
                title="Daily Motivation"
                subtitle="Inspire your day"
            />

            <ScrollView className="flex-1 p-4">
                <Card className="mb-4">
                    <Text className="text-4xl mb-6 text-center">💪</Text>

                    <Text className="text-2xl font-serif italic text-gray-900 mb-4 text-center">
                        "{dailyQuote.text}"
                    </Text>

                    <Text className="text-lg text-gray-600 text-center mb-6">
                        — {dailyQuote.author}
                    </Text>

                    <Button onPress={getNewQuote} variant="outline">
                        Get Another Quote
                    </Button>
                </Card>

                <Card>
                    <Text className="text-lg font-semibold mb-3">Apply to Your Life</Text>
                    <Text className="text-gray-600 mb-3">
                        How can this quote inspire your tasks today?
                    </Text>
                    <Button variant="secondary">
                        Create Task from Quote
                    </Button>
                </Card>
            </ScrollView>
        </Container>
    );
}
