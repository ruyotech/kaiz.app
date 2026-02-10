import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCommunityStore } from '../../../store/communityStore';
import { LeaderboardRow } from '../../../components/community/LeaderboardRow';
import { LeaderboardPeriod, LeaderboardCategory } from '../../../types/models';
import { useThemeContext } from '../../../providers/ThemeProvider';

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
    const { colors, isDark } = useThemeContext();
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
        <View className="flex-1" style={{ backgroundColor: colors.background }}>
            {/* Header */}
            <SafeAreaView edges={['top']} className="bg-gradient-to-b" style={{ backgroundColor: isDark ? '#312E81' : '#4F46E5' }}>
                <View className="px-4 py-4">
                    <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center">
                            <TouchableOpacity onPress={() => router.back()}>
                                <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
                            </TouchableOpacity>
                            <View className="ml-3">
                                <Text className="text-white text-xl font-bold">Leaderboard</Text>
                                <Text style={{ color: 'rgba(255,255,255,0.7)' }} className="text-xs">Community rankings</Text>
                            </View>
                        </View>
                        <View className="flex-row items-center rounded-full px-3 py-1" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
                            <MaterialCommunityIcons name="podium-gold" size={16} color="#F59E0B" />
                            <Text className="text-white text-sm font-medium ml-1">
                                #{userRank?.rank || '--'}
                            </Text>
                        </View>
                    </View>

                    {/* Period Filter */}
                    <View className="flex-row mt-4 rounded-xl p-1" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
                        {PERIODS.map((period) => (
                            <TouchableOpacity
                                key={period.key}
                                className="flex-1 py-2 rounded-lg"
                                style={{
                                    backgroundColor: filters.leaderboardPeriod === period.key 
                                        ? (isDark ? 'rgba(255,255,255,0.9)' : '#fff') 
                                        : 'transparent'
                                }}
                                onPress={() => setFilters({ leaderboardPeriod: period.key })}
                            >
                                <Text 
                                    className="text-center text-sm font-medium"
                                    style={{
                                        color: filters.leaderboardPeriod === period.key 
                                            ? (isDark ? '#4338CA' : '#7E22CE') 
                                            : '#fff'
                                    }}
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
                style={{ backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border, flexGrow: 0 }}
                contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12, alignItems: 'center' }}
            >
                {CATEGORIES.map((cat) => (
                    <TouchableOpacity
                        key={cat.key}
                        className="flex-row items-center px-4 py-2 rounded-full mr-2"
                        style={{
                            backgroundColor: filters.leaderboardCategory === cat.key 
                                ? '#9333EA' 
                                : colors.backgroundSecondary
                        }}
                        onPress={() => setFilters({ leaderboardCategory: cat.key })}
                    >
                        <MaterialCommunityIcons 
                            name={cat.icon as any} 
                            size={16} 
                            color={filters.leaderboardCategory === cat.key ? '#fff' : cat.color} 
                        />
                        <Text 
                            className="ml-1 text-sm font-medium"
                            style={{
                                color: filters.leaderboardCategory === cat.key ? '#fff' : colors.textSecondary
                            }}
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
                            <View 
                                className="w-20 rounded-t-xl items-center py-3" 
                                style={{ height: 60, backgroundColor: isDark ? '#374151' : '#E5E7EB' }}
                            >
                                <Text className="text-2xl">2nd</Text>
                                <Text className="text-xs font-bold" style={{ color: colors.textSecondary }}>
                                    {leaderboard[1].value.toLocaleString()}
                                </Text>
                            </View>
                            <Text className="text-xs font-medium mt-1" style={{ color: colors.textSecondary }} numberOfLines={1}>
                                {leaderboard[1].displayName}
                            </Text>
                        </View>
                        
                        {/* 1st Place */}
                        <View className="items-center mx-2">
                            <Text className="text-5xl mb-2">{leaderboard[0].avatar}</Text>
                            <View 
                                className="w-20 rounded-t-xl items-center py-3" 
                                style={{ height: 80, backgroundColor: isDark ? 'rgba(250, 204, 21, 0.2)' : '#FEF9C3' }}
                            >
                                <Text className="text-3xl">1st</Text>
                                <Text className="text-sm font-bold" style={{ color: isDark ? '#FACC15' : '#A16207' }}>
                                    {leaderboard[0].value.toLocaleString()}
                                </Text>
                            </View>
                            <Text className="text-xs font-medium mt-1" style={{ color: colors.text }} numberOfLines={1}>
                                {leaderboard[0].displayName}
                            </Text>
                        </View>
                        
                        {/* 3rd Place */}
                        <View className="items-center mx-2">
                            <Text className="text-4xl mb-2">{leaderboard[2].avatar}</Text>
                            <View 
                                className="w-20 rounded-t-xl items-center py-2" 
                                style={{ height: 50, backgroundColor: isDark ? 'rgba(251, 146, 60, 0.2)' : '#FFEDD5' }}
                            >
                                <Text className="text-xl">3rd</Text>
                                <Text className="text-xs font-bold" style={{ color: isDark ? '#FB923C' : '#C2410C' }}>
                                    {leaderboard[2].value.toLocaleString()}
                                </Text>
                            </View>
                            <Text className="text-xs font-medium mt-1" style={{ color: colors.textSecondary }} numberOfLines={1}>
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
                <View 
                    className="rounded-2xl p-4 mt-4"
                    style={{ backgroundColor: isDark ? 'rgba(147, 51, 234, 0.15)' : '#FAF5FF' }}
                >
                    <View className="flex-row items-center">
                        <MaterialCommunityIcons name="lightbulb-on" size={24} color="#9333EA" />
                        <View className="ml-3 flex-1">
                            <Text className="font-bold" style={{ color: isDark ? '#C4B5FD' : '#6B21A8' }}>How to climb the ranks</Text>
                            <Text className="text-sm mt-1" style={{ color: isDark ? '#A78BFA' : '#7C3AED' }}>
                                Answer questions, share templates, help others, and complete challenges!
                            </Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}
