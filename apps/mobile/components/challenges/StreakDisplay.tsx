import React from 'react';
import { View, Text } from 'react-native';

interface StreakDisplayProps {
    currentStreak: number;
    bestStreak: number;
    animated?: boolean;
}

export function StreakDisplay({ currentStreak, bestStreak, animated = false }: StreakDisplayProps) {
    const isNewRecord = currentStreak === bestStreak && currentStreak > 0;
    
    return (
        <View className="items-center py-4">
            {/* Main Streak */}
            <View className="flex-row items-center mb-2">
                <Text className={`text-6xl ${animated ? 'animate-pulse' : ''}`}></Text>
            </View>
            
            <Text className="text-4xl font-bold text-orange-500 mb-1">
                {currentStreak}
            </Text>
            
            <Text className="text-lg text-gray-600 mb-4">
                {currentStreak === 1 ? 'Day Streak' : 'Days Streak'}
            </Text>
            
            {/* Best Streak */}
            {bestStreak > 0 && (
                <View className="flex-row items-center gap-2">
                    <Text className="text-sm text-gray-500">
                        {isNewRecord ? 'New Record!' : `Best: ${bestStreak} days`}
                    </Text>
                </View>
            )}
        </View>
    );
}
