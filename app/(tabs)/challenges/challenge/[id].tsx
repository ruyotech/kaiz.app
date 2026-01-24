import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Container } from '../../../../components/layout/Container';
import { ScreenHeader } from '../../../../components/layout/ScreenHeader';
import { Card } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { StreakDisplay } from '../../../../components/challenges/StreakDisplay';
import { ChallengeCalendar } from '../../../../components/challenges/ChallengeCalendar';
import { ChallengeAnalyticsView } from '../../../../components/challenges/ChallengeAnalyticsView';
import { LogEntryModal } from '../../../../components/challenges/LogEntryModal';
import { useChallengeStore } from '../../../../store/challengeStore';
import { Challenge } from '../../../../types/models';

export default function ChallengeDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const {
        challenges,
        entries,
        fetchChallengeDetail,
        logEntry,
        getAnalytics,
        pauseChallenge,
        resumeChallenge,
        completeChallenge,
        deleteChallenge,
    } = useChallengeStore();
    
    const [logModalVisible, setLogModalVisible] = useState(false);
    const [showAnalytics, setShowAnalytics] = useState(false);
    
    const challenge = challenges.find(c => c.id === id);
    const challengeEntries = entries.filter(e => e.challengeId === id);
    const analytics = challenge ? getAnalytics(id) : null;
    
    useEffect(() => {
        fetchChallengeDetail(id);
    }, [id]);
    
    const handleLogSubmit = async (value: number | boolean, note?: string) => {
        await logEntry(id, value, note);
        setLogModalVisible(false);
    };
    
    const handlePause = async () => {
        Alert.alert(
            'Pause Challenge',
            'Are you sure you want to pause this challenge?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Pause',
                    onPress: async () => {
                        await pauseChallenge(id);
                    },
                },
            ]
        );
    };
    
    const handleResume = async () => {
        await resumeChallenge(id);
    };
    
    const handleComplete = async () => {
        Alert.alert(
            'Complete Challenge',
            'Mark this challenge as completed?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Complete',
                    onPress: async () => {
                        await completeChallenge(id);
                        router.back();
                    },
                },
            ]
        );
    };
    
    const handleDelete = async () => {
        Alert.alert(
            'Delete Challenge',
            'Are you sure? This cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        await deleteChallenge(id);
                        router.back();
                    },
                },
            ]
        );
    };
    
    if (!challenge) {
        return (
            <Container safeArea={false}>
                <ScreenHeader title="Challenge" useSafeArea={false} />
                <View className="flex-1 items-center justify-center">
                    <Text className="text-gray-500">Loading challenge...</Text>
                </View>
            </Container>
        );
    }
    
    const daysElapsed = Math.floor(
        (new Date().getTime() - new Date(challenge.startDate).getTime()) / (1000 * 60 * 60 * 24)
    );
    const daysRemaining = challenge.duration - daysElapsed;
    
    return (
        <Container safeArea={false}>
            <ScreenHeader
                title={challenge.name}
                subtitle={`${challenge.challengeType === 'solo' ? 'Solo' : 'Group'} Challenge`}
                showBack
                useSafeArea={false}
            />
            
            <ScrollView className="flex-1 p-4">
                {/* Status Badge */}
                <View className="mb-4">
                    <View className="flex-row gap-2">
                        <View className={`px-3 py-1 rounded-full ${
                            challenge.status === 'active' ? 'bg-green-100' :
                            challenge.status === 'paused' ? 'bg-yellow-100' :
                            challenge.status === 'completed' ? 'bg-blue-100' : 'bg-gray-100'
                        }`}>
                            <Text className={`text-sm font-semibold ${
                                challenge.status === 'active' ? 'text-green-700' :
                                challenge.status === 'paused' ? 'text-yellow-700' :
                                challenge.status === 'completed' ? 'text-blue-700' : 'text-gray-700'
                            }`}>
                                {challenge.status.charAt(0).toUpperCase() + challenge.status.slice(1)}
                            </Text>
                        </View>
                        <View className="px-3 py-1 rounded-full bg-gray-100">
                            <Text className="text-sm font-semibold text-gray-700">
                                Day {daysElapsed}/{challenge.duration}
                            </Text>
                        </View>
                    </View>
                </View>
                
                {/* Why Statement */}
                {challenge.whyStatement && (
                    <Card className="mb-4 bg-blue-50">
                        <Text className="text-sm text-gray-600 mb-1">Why I'm doing this:</Text>
                        <Text className="text-base italic">{challenge.whyStatement}</Text>
                    </Card>
                )}
                
                {/* Streak Display */}
                <Card className="mb-4">
                    <StreakDisplay
                        currentStreak={challenge.currentStreak}
                        bestStreak={challenge.bestStreak}
                    />
                </Card>
                
                {/* Quick Stats */}
                <Card className="mb-4">
                    <View className="flex-row justify-around">
                        <View className="items-center">
                            <Text className="text-2xl font-bold text-green-600">
                                {challenge.totalCompletions}
                            </Text>
                            <Text className="text-sm text-gray-600">Completed</Text>
                        </View>
                        <View className="items-center">
                            <Text className="text-2xl font-bold text-red-600">
                                {challenge.totalMissed}
                            </Text>
                            <Text className="text-sm text-gray-600">Missed</Text>
                        </View>
                        <View className="items-center">
                            <Text className="text-2xl font-bold text-blue-600">
                                {daysRemaining > 0 ? daysRemaining : 0}
                            </Text>
                            <Text className="text-sm text-gray-600">Days Left</Text>
                        </View>
                    </View>
                </Card>
                
                {/* Calendar View */}
                <Card className="mb-4">
                    <ChallengeCalendar
                        entries={challengeEntries}
                        startDate={challenge.startDate}
                        daysToShow={14}
                    />
                </Card>
                
                {/* Analytics Toggle */}
                <TouchableOpacity
                    onPress={() => setShowAnalytics(!showAnalytics)}
                    className="mb-4"
                >
                    <Card>
                        <View className="flex-row justify-between items-center">
                            <Text className="text-lg font-semibold">Performance Analytics</Text>
                            <Text className="text-xl">{showAnalytics ? '▼' : '▶'}</Text>
                        </View>
                    </Card>
                </TouchableOpacity>
                
                {showAnalytics && analytics && (
                    <Card className="mb-4">
                        <ChallengeAnalyticsView analytics={analytics} />
                    </Card>
                )}
                
                {/* Reward Display */}
                {challenge.rewardDescription && (
                    <Card className="mb-4 bg-yellow-50">
                        <Text className="text-sm text-gray-600 mb-1">🎁 Reward:</Text>
                        <Text className="text-base font-semibold">{challenge.rewardDescription}</Text>
                    </Card>
                )}
                
                {/* Action Buttons */}
                {challenge.status === 'active' && (
                    <View className="gap-3 mb-4">
                        <Button
                            onPress={() => setLogModalVisible(true)}
                        >
                            Log Today's Entry
                        </Button>
                        
                        <View className="flex-row gap-3">
                            <View className="flex-1">
                                <Button
                                    onPress={handlePause}
                                    variant="outline"
                                >
                                    Pause
                                </Button>
                            </View>
                            <View className="flex-1">
                                <Button
                                    onPress={handleComplete}
                                    variant="primary"
                                >
                                    Complete
                                </Button>
                            </View>
                        </View>
                    </View>
                )}
                
                {challenge.status === 'paused' && (
                    <Button
                        onPress={handleResume}
                    >
                        Resume Challenge
                    </Button>
                )}
                
                {/* Settings / Danger Zone */}
                <Card className="mb-6 border border-red-200">
                    <Text className="text-sm font-semibold text-red-600 mb-3">Danger Zone</Text>
                    <Button
                        onPress={handleDelete}
                        variant="outline"
                    >
                        Delete Challenge
                    </Button>
                </Card>
            </ScrollView>
            
            {/* Log Entry Modal */}
            <LogEntryModal
                visible={logModalVisible}
                challenge={challenge}
                onClose={() => setLogModalVisible(false)}
                onSubmit={handleLogSubmit}
            />
        </Container>
    );
}
