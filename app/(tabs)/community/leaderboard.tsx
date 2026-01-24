import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCommunityStore } from '../../../store/communityStore';
import { LeaderboardRow } from '../../../components/community/LeaderboardRow';
import { LeaderboardPeriod, LeaderboardCategory } from '../../../types/models';

const PERIODS: { key: LeaderboardPeriod; label: string }[] = [
    { key: 'weekly', label: 'This Week' },
    { key: 'monthly', label: 'This Month' },
    { key: 'all_time', label: 'All Time' },
];

const CATEGORIES: { key: LeaderboardCategory; label: string; icon: string; color: string }[] = [
    { key: 'reputation', label: 'Reputation', icon: 'star', color: '#F59E0B' },
    { key: 'helpful', label: 'Most Helpful', icon: 'hand-heart', color: '#EC4899' },
    { key: 'streaks', label: 'Streak Kings', icon: 'fire', color: '#EF4444' },
    { key: 'velocity', label: 'Velocity', icon: 'speedometer', color: '#3B82F6' },
];

export default function LeaderboardScreen() {
    const router = useRouter();
    const [refreshing, setRefreshing] = useState(false);
    
    const { 
        leaderboard, 
        userRank, 
        fetchLeaderboard, 
        filters, 
        setFilters,
        currentMember,
        loading 
    } = useCommunityStore();

    useEffect(() => {
        fetchLeaderboard(filters.leaderboardPeriod, filters.leaderboardCategory);
    }, [filters.leaderboardPeriod, filters.leaderboardCategory]);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchLeaderboard(filters.leaderboardPeriod, filters.leaderboardCategory);
        setRefreshing(false);
    };

    const selectedCategory = CATEGORIES.find(c => c.key === filters.leaderboardCategory);

    return (
        <View className="flex-1 bg-gray-50">
            {/* Header */}
            <SafeAreaView edges={['top']} className="bg-gradient-to-b" style={{ backgroundColor: '#4F46E5' }}>
                <View className="px-4 py-4">
                    <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center">
                            <TouchableOpacity onPress={() => router.back()}>
                                <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
                            </TouchableOpacity>
                            <View className="ml-3">
                                <Text className="text-white text-xl font-bold">Leaderboard</Text>
                                <Text className="text-purple-200 text-xs">Community rankings</Text>
                            </View>
                        </View>
                        <View className="flex-row items-center bg-white/20 rounded-full px-3 py-1">
                            <MaterialCommunityIcons name="podium-gold" size={16} color="#F59E0B" />
                            <Text className="text-white text-sm font-medium ml-1">
                                #{userRank?.rank || '--'}
                            </Text>
                        </View>
                    </View>

                    {/* Period Filter */}
                    <View className="flex-row mt-4 bg-white/20 rounded-xl p-1">
                        {PERIODS.map((period) => (
                            <TouchableOpacity
                                key={period.key}
                                className={`flex-1 py-2 rounded-lg ${
                                    filters.leaderboardPeriod === period.key ? 'bg-white' : ''
                                }`}
                                onPress={() => setFilters({ leaderboardPeriod: period.key })}
                            >
                                <Text 
                                    className={`text-center text-sm font-medium ${
                                        filters.leaderboardPeriod === period.key 
                                            ? 'text-purple-700' 
                                            : 'text-white'
                                    }`}
                                >
                                    {period.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </SafeAreaView>

            {/* Category Filter */}
            <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                className="bg-white border-b border-gray-100"
                contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12 }}
            >
                {CATEGORIES.map((cat) => (
                    <TouchableOpacity
                        key={cat.key}
                        className={`flex-row items-center px-4 py-2 rounded-full mr-2 ${
                            filters.leaderboardCategory === cat.key 
                                ? 'bg-purple-600' 
                                : 'bg-gray-100'
                        }`}
                        onPress={() => setFilters({ leaderboardCategory: cat.key })}
                    >
                        <MaterialCommunityIcons 
                            name={cat.icon as any} 
                            size={16} 
                            color={filters.leaderboardCategory === cat.key ? '#fff' : cat.color} 
                        />
                        <Text 
                            className={`ml-1 text-sm font-medium ${
                                filters.leaderboardCategory === cat.key ? 'text-white' : 'text-gray-600'
                            }`}
                        >
                            {cat.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Your Rank Card */}
            {userRank && (
                <View className="mx-4 mt-4 bg-gradient-to-r rounded-2xl p-4" style={{ backgroundColor: '#7C3AED' }}>
                    <View className="flex-row items-center">
                        <View className="bg-white/20 w-12 h-12 rounded-full items-center justify-center">
                            <Text className="text-white text-lg font-bold">#{userRank.rank}</Text>
                        </View>
                        <View className="ml-3 flex-1">
                            <Text className="text-white font-bold">{userRank.displayName}</Text>
                            <View className="flex-row items-center mt-1">
                                <Text className="text-purple-200 text-sm">
                                    {userRank.value.toLocaleString()} {selectedCategory?.label.toLowerCase() || 'points'}
                                </Text>
                                {userRank.change !== 0 && (
                                    <View className="flex-row items-center ml-3 bg-white/20 px-2 py-0.5 rounded-full">
                                        <MaterialCommunityIcons 
                                            name={userRank.change > 0 ? 'arrow-up' : 'arrow-down'} 
                                            size={12} 
                                            color={userRank.change > 0 ? '#4ADE80' : '#F87171'} 
                                        />
                                        <Text className="text-white text-xs ml-0.5">
                                            {Math.abs(userRank.change)}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        </View>
                        <Text className="text-4xl">{currentMember?.avatar}</Text>
                    </View>
                </View>
            )}

            {/* Leaderboard List */}
            <ScrollView 
                className="flex-1"
                contentContainerStyle={{ padding: 16 }}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {/* Top 3 Podium */}
                {leaderboard.length >= 3 && (
                    <View className="flex-row items-end justify-center mb-6 pt-4">
                        {/* 2nd Place */}
                        <View className="items-center mx-2">
                            <Text className="text-4xl mb-2">{leaderboard[1].avatar}</Text>
                            <View className="bg-gray-200 w-20 rounded-t-xl items-center py-3" style={{ height: 60 }}>
                                <Text className="text-2xl">🥈</Text>
                                <Text className="text-xs font-bold text-gray-700">
                                    {leaderboard[1].value.toLocaleString()}
                                </Text>
                            </View>
                            <Text className="text-xs font-medium text-gray-600 mt-1" numberOfLines={1}>
                                {leaderboard[1].displayName}
                            </Text>
                        </View>
                        
                        {/* 1st Place */}
                        <View className="items-center mx-2">
                            <Text className="text-5xl mb-2">{leaderboard[0].avatar}</Text>
                            <View className="bg-yellow-100 w-20 rounded-t-xl items-center py-3" style={{ height: 80 }}>
                                <Text className="text-3xl">🥇</Text>
                                <Text className="text-sm font-bold text-yellow-700">
                                    {leaderboard[0].value.toLocaleString()}
                                </Text>
                            </View>
                            <Text className="text-xs font-medium text-gray-700 mt-1" numberOfLines={1}>
                                {leaderboard[0].displayName}
                            </Text>
                        </View>
                        
                        {/* 3rd Place */}
                        <View className="items-center mx-2">
                            <Text className="text-4xl mb-2">{leaderboard[2].avatar}</Text>
                            <View className="bg-orange-100 w-20 rounded-t-xl items-center py-2" style={{ height: 50 }}>
                                <Text className="text-xl">🥉</Text>
                                <Text className="text-xs font-bold text-orange-700">
                                    {leaderboard[2].value.toLocaleString()}
                                </Text>
                            </View>
                            <Text className="text-xs font-medium text-gray-600 mt-1" numberOfLines={1}>
                                {leaderboard[2].displayName}
                            </Text>
                        </View>
                    </View>
                )}

                {/* Rest of leaderboard */}
                {leaderboard.slice(3).map((entry) => (
                    <LeaderboardRow 
                        key={entry.memberId}
                        entry={entry}
                        isCurrentUser={entry.memberId === currentMember?.id}
                    />
                ))}

                {/* Motivation */}
                <View className="bg-purple-50 rounded-2xl p-4 mt-4">
                    <View className="flex-row items-center">
                        <MaterialCommunityIcons name="lightbulb-on" size={24} color="#9333EA" />
                        <View className="ml-3 flex-1">
                            <Text className="text-purple-800 font-bold">How to climb the ranks</Text>
                            <Text className="text-purple-600 text-sm mt-1">
                                Answer questions, share templates, help others, and complete challenges!
                            </Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}
