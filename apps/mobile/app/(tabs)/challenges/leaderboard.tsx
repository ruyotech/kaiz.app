import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Container } from '../../../components/layout/Container';
import { ScreenHeader } from '../../../components/layout/ScreenHeader';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useThemeContext } from '../../../providers/ThemeProvider';

interface LeaderboardEntry {
    rank: number;
    userId: string;
    name: string;
    avatar?: string;
    points: number;
    challengesCompleted: number;
    currentStreak: number;
}

export default function LeaderboardScreen() {
    const router = useRouter();
    const { colors, isDark } = useThemeContext();
    const [timeframe, setTimeframe] = useState<'week' | 'month' | 'allTime'>('week');
    
    // Mock leaderboard data
    const leaderboardData: LeaderboardEntry[] = [
        {
            rank: 1,
            userId: 'user-1',
            name: 'You',
            points: 2850,
            challengesCompleted: 12,
            currentStreak: 45,
        },
        {
            rank: 2,
            userId: 'user-2',
            name: 'Sarah Chen',
            points: 2720,
            challengesCompleted: 11,
            currentStreak: 38,
        },
        {
            rank: 3,
            userId: 'user-3',
            name: 'Mike Johnson',
            points: 2680,
            challengesCompleted: 10,
            currentStreak: 42,
        },
        {
            rank: 4,
            userId: 'user-4',
            name: 'Emma Davis',
            points: 2540,
            challengesCompleted: 9,
            currentStreak: 35,
        },
        {
            rank: 5,
            userId: 'user-5',
            name: 'Alex Kim',
            points: 2420,
            challengesCompleted: 9,
            currentStreak: 30,
        },
    ];
    
    const getRankIcon = (rank: number) => {
        if (rank === 1) return '🥇';
        if (rank === 2) return '🥈';
        if (rank === 3) return '🥉';
        return `${rank}`;
    };
    
    const getRankColor = (rank: number) => {
        if (rank === 1) return '#f59e0b';
        if (rank === 2) return '#94a3b8';
        if (rank === 3) return '#cd7f32';
        return '#6b7280';
    };
    
    return (
        <Container safeArea={false}>
            <ScreenHeader
                title="Leaderboard"
                subtitle="Compete and win"
                showBack
                useSafeArea={false}
            />
            
            <ScrollView className="flex-1">
                {/* Timeframe Selector */}
                <View 
                    className="flex-row px-4 py-3"
                    style={{ 
                        backgroundColor: colors.backgroundSecondary,
                        borderBottomWidth: 1,
                        borderBottomColor: colors.border
                    }}
                >
                    <TouchableOpacity
                        onPress={() => setTimeframe('week')}
                        className="flex-1 py-2 items-center rounded-lg"
                        style={{ backgroundColor: timeframe === 'week' ? colors.primary : 'transparent' }}
                    >
                        <Text 
                            className="font-semibold"
                            style={{ color: timeframe === 'week' ? '#FFFFFF' : colors.textSecondary }}
                        >
                            This Week
                        </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                        onPress={() => setTimeframe('month')}
                        className="flex-1 py-2 items-center rounded-lg mx-2"
                        style={{ backgroundColor: timeframe === 'month' ? colors.primary : 'transparent' }}
                    >
                        <Text 
                            className="font-semibold"
                            style={{ color: timeframe === 'month' ? '#FFFFFF' : colors.textSecondary }}
                        >
                            This Month
                        </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                        onPress={() => setTimeframe('allTime')}
                        className="flex-1 py-2 items-center rounded-lg"
                        style={{ backgroundColor: timeframe === 'allTime' ? colors.primary : 'transparent' }}
                    >
                        <Text 
                            className="font-semibold"
                            style={{ color: timeframe === 'allTime' ? '#FFFFFF' : colors.textSecondary }}
                        >
                            All Time
                        </Text>
                    </TouchableOpacity>
                </View>
                
                <View className="p-4">
                    {/* Your Stats */}
                    <Card className="mb-4">
                        <View className="flex-row items-center justify-between mb-3">
                            <Text className="text-lg font-bold" style={{ color: colors.text }}>Your Stats</Text>
                            <Badge variant="success">
                                #{leaderboardData[0].rank}
                            </Badge>
                        </View>
                        <View className="flex-row justify-around">
                            <View className="items-center">
                                <Text className="text-2xl font-bold" style={{ color: colors.primary }}>
                                    {leaderboardData[0].points}
                                </Text>
                                <Text style={{ color: colors.textSecondary }}>Points</Text>
                            </View>
                            <View className="items-center">
                                <Text className="text-2xl font-bold" style={{ color: colors.primary }}>
                                    {leaderboardData[0].challengesCompleted}
                                </Text>
                                <Text style={{ color: colors.textSecondary }}>Completed</Text>
                            </View>
                            <View className="items-center">
                                <Text className="text-2xl font-bold" style={{ color: colors.primary }}>
                                    {leaderboardData[0].currentStreak}
                                </Text>
                                <Text style={{ color: colors.textSecondary }}>Day Streak</Text>
                            </View>
                        </View>
                    </Card>
                    
                    {/* Leaderboard List */}
                    <Text className="text-xl font-bold mb-4" style={{ color: colors.text }}>Top Performers</Text>
                    
                    {leaderboardData.map((entry, index) => (
                        <Card 
                            key={entry.userId} 
                            className="mb-3"
                            style={entry.userId === 'user-1' ? { borderWidth: 2, borderColor: colors.primary } : undefined}
                        >
                            <View className="flex-row items-center">
                                {/* Rank */}
                                <View 
                                    className="w-12 h-12 rounded-full items-center justify-center mr-3"
                                    style={{ backgroundColor: getRankColor(entry.rank) + '20' }}
                                >
                                    <Text 
                                        className="text-xl font-bold"
                                        style={{ color: getRankColor(entry.rank) }}
                                    >
                                        {getRankIcon(entry.rank)}
                                    </Text>
                                </View>
                                
                                {/* User Info */}
                                <View className="flex-1">
                                    <View className="flex-row items-center mb-1">
                                        <Text className="text-lg font-bold" style={{ color: colors.text }}>
                                            {entry.name}
                                        </Text>
                                        {entry.userId === 'user-1' && (
                                            <View className="ml-2">
                                                <Badge variant="info">
                                                    You
                                                </Badge>
                                            </View>
                                        )}
                                    </View>
                                    <View className="flex-row items-center gap-3">
                                        <View className="flex-row items-center">
                                            <MaterialCommunityIcons 
                                                name="star" 
                                                size={16} 
                                                color="#f59e0b" 
                                            />
                                            <Text className="text-sm ml-1" style={{ color: colors.textSecondary }}>
                                                {entry.points}
                                            </Text>
                                        </View>
                                        <View className="flex-row items-center">
                                            <MaterialCommunityIcons 
                                                name="trophy" 
                                                size={16} 
                                                color="#10b981" 
                                            />
                                            <Text className="text-sm ml-1" style={{ color: colors.textSecondary }}>
                                                {entry.challengesCompleted}
                                            </Text>
                                        </View>
                                        <View className="flex-row items-center">
                                            <MaterialCommunityIcons 
                                                name="fire" 
                                                size={16} 
                                                color="#ef4444" 
                                            />
                                            <Text className="text-sm ml-1" style={{ color: colors.textSecondary }}>
                                                {entry.currentStreak}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        </Card>
                    ))
                    }
                    
                    {/* Rewards Section */}
                    <Card className="mt-4">
                        <View className="items-center">
                            <Text className="text-4xl mb-2">🏆</Text>
                            <Text className="text-lg font-bold mb-2" style={{ color: colors.text }}>Rewards & Badges</Text>
                            <Text className="text-center mb-3" style={{ color: colors.textSecondary }}>
                                Earn badges and unlock rewards as you climb the leaderboard
                            </Text>
                            <View className="flex-row gap-2">
                                <Text className="text-2xl">🥇</Text>
                                <Text className="text-2xl">🥈</Text>
                                <Text className="text-2xl">🥉</Text>
                                <Text className="text-2xl">⭐</Text>
                                <Text className="text-2xl">🔥</Text>
                            </View>
                        </View>
                    </Card>
                </View>
            </ScrollView>
        </Container>
    );
}
