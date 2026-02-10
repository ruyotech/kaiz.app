import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Challenge } from '../../types/models';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { ProgressBar } from '../ui/ProgressBar';
import { useRouter } from 'expo-router';

interface ChallengeCardProps {
    challenge: Challenge;
    onQuickLog?: () => void;
}

const getLifeWheelColor = (areaId: string): string => {
    const colors: Record<string, string> = {
        'life-health': '#10b981',
        'life-career': '#3b82f6',
        'life-finance': '#f59e0b',
        'life-family': '#ec4899',
        'life-romance': '#ef4444',
        'life-friends': '#8b5cf6',
        'life-growth': '#06b6d4',
        'life-fun': '#f97316',
        'life-environment': '#84cc16',
    };
    return colors[areaId] || '#6b7280';
};

const getLifeWheelName = (areaId: string): string => {
    const names: Record<string, string> = {
        'life-health': 'Health',
        'life-career': 'Career',
        'life-finance': 'Finance',
        'life-family': 'Family',
        'life-romance': 'Romance',
        'life-friends': 'Friends',
        'life-growth': 'Growth',
        'life-fun': 'Fun',
        'life-environment': 'Environment',
    };
    return names[areaId] || 'General';
};

const getMetricIcon = (metricType: string): string => {
    const icons: Record<string, string> = {
        count: '#',
        yesno: 'Y',
        streak: 'S',
        time: 'T',
        completion: 'C',
    };
    return icons[metricType] || 'M';
};

export const ChallengeCard = React.memo(function ChallengeCard({ challenge, onQuickLog }: ChallengeCardProps) {
    const router = useRouter();
    const color = getLifeWheelColor(challenge.lifeWheelAreaId);
    
    // Calculate progress
    const daysElapsed = Math.floor(
        (new Date().getTime() - new Date(challenge.startDate).getTime()) / (1000 * 60 * 60 * 24)
    );
    const progressPercentage = Math.min(100, (daysElapsed / challenge.duration) * 100);
    
    const completionRate = challenge.totalCompletions > 0
        ? (challenge.totalCompletions / (challenge.totalCompletions + challenge.totalMissed)) * 100
        : 0;

    const handlePress = () => {
        router.push(`/(tabs)/challenges/challenge/${challenge.id}`);
    };

    return (
        <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
            <Card className="mb-4" style={{ borderLeftWidth: 4, borderLeftColor: color }}>
                {/* Life Wheel Area Badge */}
                <View className="mb-3">
                    <View className="flex-row items-center">
                        <View className="px-3 py-1 rounded-full" style={{ backgroundColor: color + '20' }}>
                            <Text className="text-sm font-semibold" style={{ color }}>
                                {getLifeWheelName(challenge.lifeWheelAreaId)}
                            </Text>
                        </View>
                    </View>
                </View>
                
                {/* Header */}
                <View className="flex-row items-start justify-between mb-3">
                    <View className="flex-1">
                        <View className="flex-row items-center mb-1">
                            <Text className="text-2xl mr-2">{getMetricIcon(challenge.metricType)}</Text>
                            <Text className="text-lg font-bold flex-1" numberOfLines={1}>
                                {challenge.name}
                            </Text>
                        </View>
                        <View className="flex-row items-center gap-2 flex-wrap">
                            <Badge variant="default">
                                {challenge.challengeType === 'solo' ? 'Solo' : 'Group'}
                            </Badge>
                            <Badge variant="default">
                                Day {daysElapsed}/{challenge.duration}
                            </Badge>
                        </View>
                    </View>
                </View>

                {/* Streak Display */}
                {challenge.currentStreak > 0 && (
                    <View className="flex-row items-center mb-3">
                        <MaterialCommunityIcons name="fire" size={24} color="#ef4444" style={{ marginRight: 8 }} />
                        <Text className="text-lg font-semibold" style={{ color }}>
                            {challenge.currentStreak} day streak
                        </Text>
                        {challenge.bestStreak > challenge.currentStreak && (
                            <Text className="text-sm text-gray-500 ml-2">
                                (Best: {challenge.bestStreak})
                            </Text>
                        )}
                    </View>
                )}

                {/* Progress Bar */}
                <View className="mb-3">
                    <ProgressBar
                        progress={completionRate}
                        color={color}
                        showLabel
                        label={`${completionRate.toFixed(0)}%`}
                    />
                    <Text className="text-xs text-gray-500 mt-1">
                        {challenge.totalCompletions} completed • {challenge.totalMissed} missed
                    </Text>
                </View>

                {/* Today's Status or Target */}
                {challenge.targetValue && (
                    <View className="bg-gray-50 rounded-lg p-3 mb-3">
                        <Text className="text-sm text-gray-600">
                            Target: {challenge.targetValue} {challenge.unit} {challenge.recurrence}
                        </Text>
                    </View>
                )}

                {/* Action Buttons */}
                <View className="flex-row gap-2">
                    {onQuickLog && (
                        <TouchableOpacity
                            onPress={(e) => {
                                e.stopPropagation();
                                onQuickLog();
                            }}
                            className="flex-1 bg-blue-600 rounded-lg py-2 px-4"
                        >
                            <Text className="text-white text-center font-semibold">
                                Log Today
                            </Text>
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity
                        onPress={handlePress}
                        className="bg-gray-200 rounded-lg py-2 px-4"
                    >
                        <Text className="text-gray-700 text-center font-semibold">
                            View Details
                        </Text>
                    </TouchableOpacity>
                </View>
            </Card>
        </TouchableOpacity>
    );
});
