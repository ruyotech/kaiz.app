import { View, Text, ScrollView, FlatList } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Container } from '../../../../components/layout/Container';
import { ScreenHeader } from '../../../../components/layout/ScreenHeader';
import { Card } from '../../../../components/ui/Card';
import { Avatar } from '../../../../components/ui/Avatar';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { useChallengeStore } from '../../../../store/challengeStore';
import { useEffect, useState } from 'react';
import { mockApi } from '../../../../services/mockApi';
import { formatNumber } from '../../../../utils/formatters';
import { REACTION_TYPES } from '../../../../utils/constants';

export default function ChallengeDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { participants, entries, fetchChallengeDetail, addEntry, addReaction } = useChallengeStore();
    const [challenge, setChallenge] = useState<any>(null);
    const [entryValue, setEntryValue] = useState('');

    useEffect(() => {
        const loadChallenge = async () => {
            const challengeData = await mockApi.getChallengeById(id);
            setChallenge(challengeData);
            await fetchChallengeDetail(id);
        };

        loadChallenge();
    }, [id]);

    const handleAddEntry = () => {
        if (entryValue && !isNaN(Number(entryValue))) {
            addEntry(id, Number(entryValue));
            setEntryValue('');
        }
    };

    if (!challenge) {
        return (
            <Container>
                <Text>Loading...</Text>
            </Container>
        );
    }

    const currentUser = participants.find(p => p.userId === 'user-1');

    return (
        <Container>
            <ScreenHeader
                title={challenge.goal}
                subtitle={`${challenge.challengeType} challenge`}
                showBack
            />

            <ScrollView className="flex-1 p-4">
                {/* Your Progress */}
                {currentUser && (
                    <Card className="mb-4">
                        <Text className="text-lg font-semibold mb-3">Your Progress</Text>
                        <View className="flex-row items-center justify-between mb-3">
                            <View>
                                <Text className="text-3xl font-bold text-blue-600">
                                    {formatNumber(currentUser.currentProgress)}
                                </Text>
                                <Text className="text-gray-600">{challenge.unit}</Text>
                            </View>
                            <View className="items-end">
                                <Text className="text-2xl font-bold text-orange-600">
                                    🔥 {currentUser.streakDays}
                                </Text>
                                <Text className="text-sm text-gray-600">day streak</Text>
                            </View>
                        </View>

                        <Text className="text-sm text-gray-600 mb-2">Log Today</Text>
                        <View className="flex-row gap-2">
                            <View className="flex-1">
                                <Input
                                    value={entryValue}
                                    onChangeText={setEntryValue}
                                    placeholder={`Enter ${challenge.unit}`}
                                    keyboardType="numeric"
                                />
                            </View>
                            <Button onPress={handleAddEntry} size="sm">
                                Log
                            </Button>
                        </View>
                    </Card>
                )}

                {/* Leaderboard */}
                <Card className="mb-4">
                    <Text className="text-lg font-semibold mb-3">
                        🏆 Leaderboard
                    </Text>
                    {participants.map((participant, index) => (
                        <View
                            key={participant.id}
                            className="flex-row items-center justify-between py-3 border-b border-gray-200 last:border-b-0"
                        >
                            <View className="flex-row items-center flex-1">
                                <Text className="text-lg font-bold text-gray-400 w-8">
                                    #{index + 1}
                                </Text>
                                <Avatar name={`User ${participant.userId.split('-')[1]}`} size="sm" />
                                <View className="ml-3 flex-1">
                                    <Text className="font-semibold">
                                        {participant.userId === 'user-1' ? 'You' : `User ${participant.userId.split('-')[1]}`}
                                    </Text>
                                    <Text className="text-sm text-gray-600">
                                        🔥 {participant.streakDays} days
                                    </Text>
                                </View>
                            </View>
                            <Text className="text-lg font-bold text-blue-600">
                                {formatNumber(participant.currentProgress)}
                            </Text>
                        </View>
                    ))}
                </Card>

                {/* Recent Activity */}
                <Card>
                    <Text className="text-lg font-semibold mb-3">
                        Recent Activity
                    </Text>
                    {entries.slice(0, 5).map((entry) => (
                        <View key={entry.id} className="mb-3 pb-3 border-b border-gray-200 last:border-b-0">
                            <View className="flex-row justify-between items-start mb-2">
                                <Text className="font-semibold">
                                    {entry.userId === 'user-1' ? 'You' : `User ${entry.userId.split('-')[1]}`}
                                </Text>
                                <Text className="text-blue-600 font-bold">
                                    +{formatNumber(entry.entryValue)}
                                </Text>
                            </View>
                            {entry.reactions.length > 0 && (
                                <View className="flex-row gap-2">
                                    {entry.reactions.map((reaction, idx) => (
                                        <Text key={idx} className="text-lg">
                                            {REACTION_TYPES[reaction.type as keyof typeof REACTION_TYPES]}
                                        </Text>
                                    ))}
                                </View>
                            )}
                        </View>
                    ))}
                </Card>
            </ScrollView>
        </Container>
    );
}
