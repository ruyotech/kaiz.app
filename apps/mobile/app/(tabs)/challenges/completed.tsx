import React, { useEffect } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Container } from '../../../components/layout/Container';
import { ScreenHeader } from '../../../components/layout/ScreenHeader';
import { ChallengeCard } from '../../../components/challenges/ChallengeCard';
import { EmptyState } from '../../../components/ui/EmptyState';
import { useChallengeStore } from '../../../store/challengeStore';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function CompletedChallengesScreen() {
    const router = useRouter();
    const { challenges, fetchChallenges } = useChallengeStore();
    
    const completedChallenges = challenges.filter(c => c.status === 'completed');
    
    // Calculate stats
    const totalCompleted = completedChallenges.length;
    const totalDays = completedChallenges.reduce((sum, c) => sum + c.duration, 0);
    const avgCompletionRate = completedChallenges.length > 0
        ? completedChallenges.reduce((sum, c) => {
            const rate = c.totalCompletions > 0 
                ? (c.totalCompletions / (c.totalCompletions + c.totalMissed)) * 100 
                : 0;
            return sum + rate;
        }, 0) / completedChallenges.length
        : 0;
    
    useEffect(() => {
        fetchChallenges();
    }, []);
    
    return (
        <Container safeArea={false}>
            <ScreenHeader
                title="Completed Challenges"
                subtitle="Your success story"
                showBack
                useSafeArea={false}
            />
            
            <ScrollView className="flex-1 p-4">
                {/* Stats Summary */}
                <View className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 mb-6">
                    <View className="flex-row items-center mb-3">
                        <MaterialCommunityIcons name="trophy" size={32} color="#10b981" />
                        <Text className="text-2xl font-bold ml-2">Achievements</Text>
                    </View>
                    
                    <View className="flex-row justify-around">
                        <View className="items-center">
                            <Text className="text-3xl font-bold text-green-600">{totalCompleted}</Text>
                            <Text className="text-gray-600">Challenges</Text>
                        </View>
                        <View className="items-center">
                            <Text className="text-3xl font-bold text-green-600">{totalDays}</Text>
                            <Text className="text-gray-600">Days</Text>
                        </View>
                        <View className="items-center">
                            <Text className="text-3xl font-bold text-green-600">{avgCompletionRate.toFixed(0)}%</Text>
                            <Text className="text-gray-600">Avg Rate</Text>
                        </View>
                    </View>
                </View>
                
                {/* Completed Challenges List */}
                {completedChallenges.length === 0 ? (
                    <EmptyState
                        icon="trophy-outline"
                        title="No Completed Challenges Yet"
                        message="Complete your first challenge to see it here"
                    />
                ) : (
                    <>
                        <Text className="text-lg font-bold mb-4">
                            All Completed Challenges
                        </Text>
                        {completedChallenges.map(challenge => (
                            <ChallengeCard
                                key={challenge.id}
                                challenge={challenge}
                            />
                        ))}
                    </>
                )}
            </ScrollView>
        </Container>
    );
}
