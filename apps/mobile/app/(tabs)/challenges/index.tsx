import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, TextInput, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Container } from '../../../components/layout/Container';
import { ScreenHeader } from '../../../components/layout/ScreenHeader';
import { ChallengeCard } from '../../../components/challenges/ChallengeCard';
import { LogEntryModal } from '../../../components/challenges/LogEntryModal';
import { EmptyState } from '../../../components/ui/EmptyState';
import { useChallengeStore } from '../../../store/challengeStore';
import { Challenge, LifeWheelArea } from '../../../types/models';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { lifeWheelApi } from '../../../services/api';

// Map challenge Life Wheel IDs to actual Life Wheel area IDs
const LIFE_WHEEL_ID_MAP: Record<string, string> = {
    'life-health': 'lw-1',      // Health & Fitness
    'life-career': 'lw-2',      // Career & Work
    'life-finance': 'lw-3',     // Finance & Money
    'life-growth': 'lw-4',      // Personal Growth
    'life-family': 'lw-5',      // Relationships & Family
    'life-friends': 'lw-6',     // Social Life
    'life-fun': 'lw-7',         // Fun & Recreation
    'life-environment': 'lw-8', // Environment & Home
    'life-romance': 'lw-5',     // Map romance to Relationships & Family
};

export default function ChallengesScreen() {
    const router = useRouter();
    const { challenges, loading, fetchChallenges, logEntry } = useChallengeStore();
    const [refreshing, setRefreshing] = useState(false);
    const [logModalVisible, setLogModalVisible] = useState(false);
    const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedLifeWheel, setSelectedLifeWheel] = useState<string | null>(null);
    const [lifeWheelAreas, setLifeWheelAreas] = useState<LifeWheelArea[]>([]);
    const [activeExpanded, setActiveExpanded] = useState(true);
    const [completedExpanded, setCompletedExpanded] = useState(false);
    
    // Helper function to get mapped Life Wheel ID
    const getMappedLifeWheelId = (challengeLifeWheelId: string): string => {
        return LIFE_WHEEL_ID_MAP[challengeLifeWheelId] || challengeLifeWheelId;
    };
    
    // Filter challenges
    const filteredChallenges = useMemo(() => {
        let filtered = challenges;
        
        // Search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (c) => c.name.toLowerCase().includes(query) || c.description?.toLowerCase().includes(query)
            );
        }
        
        // Life wheel filter
        if (selectedLifeWheel) {
            filtered = filtered.filter(c => getMappedLifeWheelId(c.lifeWheelAreaId) === selectedLifeWheel);
        }
        
        return filtered;
    }, [challenges, searchQuery, selectedLifeWheel]);
    
    const activeChallenges = filteredChallenges.filter(c => c.status === 'active');
    const completedChallenges = filteredChallenges.filter(c => c.status === 'completed');
    
    // Group active challenges by Life Wheel area
    const groupedActiveChallenges = useMemo(() => {
        const groups: Record<string, Challenge[]> = {};
        
        activeChallenges.forEach(challenge => {
            const mappedAreaId = getMappedLifeWheelId(challenge.lifeWheelAreaId);
            if (!groups[mappedAreaId]) {
                groups[mappedAreaId] = [];
            }
            groups[mappedAreaId].push(challenge);
        });
        
        return groups;
    }, [activeChallenges]);
    
    // Sort Life Wheel areas by challenge count
    const sortedLifeWheelAreas = useMemo(() => {
        return lifeWheelAreas
            .map(area => ({
                ...area,
                count: activeChallenges.filter(c => getMappedLifeWheelId(c.lifeWheelAreaId) === area.id).length
            }))
            .filter(area => area.count > 0)
            .sort((a, b) => b.count - a.count);
    }, [lifeWheelAreas, activeChallenges]);
    
    useEffect(() => {
        fetchChallenges();
        loadLifeWheelAreas();
    }, []);
    
    const loadLifeWheelAreas = async () => {
        const areas = await lifeWheelApi.getLifeWheelAreas();
        setLifeWheelAreas(areas);
    };
    
    const onRefresh = async () => {
        setRefreshing(true);
        await fetchChallenges();
        setRefreshing(false);
    };
    
    const handleQuickLog = (challenge: Challenge) => {
        setSelectedChallenge(challenge);
        setLogModalVisible(true);
    };
    
    const handleLogSubmit = async (value: number | boolean, note?: string) => {
        if (selectedChallenge) {
            await logEntry(selectedChallenge.id, value, note);
            setLogModalVisible(false);
            setSelectedChallenge(null);
        }
    };
    
    return (
        <Container safeArea={false}>
            <ScreenHeader
                title="Challenges"
                subtitle="Build habits that compound"
                useSafeArea={false}
            >
                {/* Search Input */}
                <View className="px-4 mb-3">
                    <View className="bg-gray-50 rounded-xl p-3 flex-row items-center border border-gray-200">
                        <MaterialCommunityIcons name="magnify" size={20} color="#9CA3AF" />
                        <TextInput
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            placeholder="Search challenges..."
                            className="flex-1 ml-2 text-base"
                            placeholderTextColor="#9CA3AF"
                        />
                        {searchQuery.length > 0 && (
                            <Pressable onPress={() => setSearchQuery('')}>
                                <MaterialCommunityIcons name="close-circle" size={18} color="#9CA3AF" />
                            </Pressable>
                        )}
                    </View>
                </View>

                {/* Life Wheel Filters */}
                <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    className="px-4 pb-3"
                >
                    <View className="flex-row gap-2">
                        <Pressable
                            onPress={() => setSelectedLifeWheel(null)}
                            className={`px-3 py-1.5 rounded-full ${!selectedLifeWheel ? 'bg-blue-600' : 'bg-gray-100 border border-gray-300'}`}
                        >
                            <Text className={`font-medium text-sm ${!selectedLifeWheel ? 'text-white' : 'text-gray-700'}`}>
                                All ({challenges.length})
                            </Text>
                        </Pressable>
                        
                        {lifeWheelAreas.map((area) => {
                            const count = challenges.filter(c => getMappedLifeWheelId(c.lifeWheelAreaId) === area.id).length;
                            if (count === 0) return null;
                            return (
                                <Pressable
                                    key={area.id}
                                    onPress={() => setSelectedLifeWheel(area.id === selectedLifeWheel ? null : area.id)}
                                    className={`px-3 py-1.5 rounded-full flex-row items-center ${selectedLifeWheel === area.id ? 'bg-blue-600' : 'bg-gray-100 border border-gray-300'}`}
                                >
                                    <Text className="mr-1 text-sm">{area.icon}</Text>
                                    <Text className={`font-medium text-sm ${selectedLifeWheel === area.id ? 'text-white' : 'text-gray-700'}`}>
                                        {area.name.split('&')[0].trim()} ({count})
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </View>
                </ScrollView>
            </ScreenHeader>
            
            <ScrollView
                className="flex-1 p-4"
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {/* Active Challenges - Grouped by Life Wheel */}
                <View className="mb-6">
                    <TouchableOpacity 
                        onPress={() => setActiveExpanded(!activeExpanded)}
                        className="flex-row justify-between items-center mb-4"
                    >
                        <Text className="text-xl font-bold">
                            Active Challenges ({activeChallenges.length})
                        </Text>
                        <MaterialCommunityIcons 
                            name={activeExpanded ? 'chevron-up' : 'chevron-down'} 
                            size={24} 
                            color="#374151" 
                        />
                    </TouchableOpacity>
                    
                    {activeExpanded && (
                        activeChallenges.length === 0 ? (
                            <EmptyState
                                icon="🎯"
                                title="No Active Challenges"
                                message="Start a challenge to build lasting habits"
                            />
                        ) : (
                            <>
                                {/* All challenges view (when no filter selected) */}
                                {!selectedLifeWheel && sortedLifeWheelAreas.map(area => {
                                    const areaChallenges = groupedActiveChallenges[area.id] || [];
                                    if (areaChallenges.length === 0) return null;
                                    
                                    return (
                                        <View key={area.id} className="mb-6">
                                            {/* Life Wheel Category Header */}
                                            <View className="flex-row items-center mb-3">
                                                <View 
                                                    className="w-10 h-10 rounded-full items-center justify-center mr-3"
                                                    style={{ backgroundColor: area.color + '20' }}
                                                >
                                                    <Text className="text-2xl">{area.icon}</Text>
                                                </View>
                                                <View className="flex-1">
                                                    <Text className="text-lg font-bold text-gray-900">
                                                        {area.name}
                                                    </Text>
                                                    <Text className="text-sm text-gray-600">
                                                        {areaChallenges.length} {areaChallenges.length === 1 ? 'challenge' : 'challenges'}
                                                    </Text>
                                                </View>
                                            </View>
                                            
                                            {/* Challenges in this category */}
                                            {areaChallenges.map(challenge => (
                                                <ChallengeCard
                                                    key={challenge.id}
                                                    challenge={challenge}
                                                    onQuickLog={() => handleQuickLog(challenge)}
                                                />
                                            ))}
                                        </View>
                                    );
                                })}
                                
                                {/* Filtered view (when Life Wheel filter selected) */}
                                {selectedLifeWheel && activeChallenges.map(challenge => (
                                    <ChallengeCard
                                        key={challenge.id}
                                        challenge={challenge}
                                        onQuickLog={() => handleQuickLog(challenge)}
                                    />
                                ))}
                            </>
                        )
                    )}
                </View>
                
                {/* Completed Challenges */}
                {completedChallenges.length > 0 && (
                    <View className="mb-6">
                        <View className="flex-row justify-between items-center mb-4">
                            <TouchableOpacity 
                                onPress={() => setCompletedExpanded(!completedExpanded)}
                                className="flex-row items-center flex-1"
                            >
                                <Text className="text-xl font-bold mr-2">
                                    Completed ({completedChallenges.length})
                                </Text>
                                <MaterialCommunityIcons 
                                    name={completedExpanded ? 'chevron-up' : 'chevron-down'} 
                                    size={24} 
                                    color="#374151" 
                                />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => router.push('/(tabs)/challenges/completed' as any)}>
                                <Text className="text-blue-600 font-semibold">View All →</Text>
                            </TouchableOpacity>
                        </View>
                        
                        {completedExpanded && (
                            completedChallenges.slice(0, 3).map(challenge => (
                                <ChallengeCard
                                    key={challenge.id}
                                    challenge={challenge}
                                />
                            ))
                        )}
                    </View>
                )}
                
                {/* Community Challenges Teaser */}
                <View className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-xl p-6 items-center mb-6">
                    <Text className="text-3xl mb-2">👥</Text>
                    <Text className="text-lg font-bold mb-2">Join Community Challenges</Text>
                    <Text className="text-center text-gray-600 mb-4">
                        Connect with others and stay motivated together
                    </Text>
                    <TouchableOpacity 
                        onPress={() => router.push('/(tabs)/challenges/community' as any)}
                        className="bg-purple-600 rounded-lg py-2 px-6"
                    >
                        <Text className="text-white font-semibold">Explore Community</Text>
                    </TouchableOpacity>
                </View>
                
                {/* Leaderboard Teaser */}
                <View className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-xl p-6 items-center mb-6">
                    <Text className="text-3xl mb-2">🏆</Text>
                    <Text className="text-lg font-bold mb-2">Check Leaderboard</Text>
                    <Text className="text-center text-gray-600 mb-4">
                        See how you rank among top performers
                    </Text>
                    <TouchableOpacity 
                        onPress={() => router.push('/(tabs)/challenges/leaderboard' as any)}
                        className="bg-orange-600 rounded-lg py-2 px-6"
                    >
                        <Text className="text-white font-semibold">View Rankings</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
            
            {/* Log Entry Modal */}
            {selectedChallenge && (
                <LogEntryModal
                    visible={logModalVisible}
                    challenge={selectedChallenge}
                    onClose={() => {
                        setLogModalVisible(false);
                        setSelectedChallenge(null);
                    }}
                    onSubmit={handleLogSubmit}
                />
            )}
        </Container>
    );
}
