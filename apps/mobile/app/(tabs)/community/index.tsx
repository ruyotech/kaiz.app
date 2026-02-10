import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Image } from 'expo-image';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCommunityStore } from '../../../store/communityStore';
import { ActivityCard } from '../../../components/community/ActivityCard';
import { StoryCard } from '../../../components/community/StoryCard';
import { TemplateCard } from '../../../components/community/TemplateCard';
import { useTranslation } from '../../../hooks/useTranslation';
import { useThemeContext } from '../../../providers/ThemeProvider';

export default function CommunityHubScreen() {
    const router = useRouter();
    const { t } = useTranslation();
    const { colors } = useThemeContext();
    const [refreshing, setRefreshing] = useState(false);
    
    const {
        currentMember,
        featuredArticle,
        activePoll,
        weeklyChallenge,
        activityFeed,
        stories,
        fetchCommunityHome,
        fetchTemplates,
        featuredTemplates,
        votePoll,
        joinWeeklyChallenge,
        likeStory,
        celebrateStory,
        loading,
    } = useCommunityStore();

    useEffect(() => {
        fetchCommunityHome();
        fetchTemplates();
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchCommunityHome();
        setRefreshing(false);
    };

    const handleVote = (optionId: string) => {
        if (activePoll && !activePoll.userVotedOptionId) {
            votePoll(activePoll.id, optionId);
        }
    };

    return (
        <View className="flex-1" style={{ backgroundColor: colors.background }}>
            {/* Header */}
            <SafeAreaView edges={['top']} className="bg-purple-600">
                <View className="px-4 py-4">
                    <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center">
                            <TouchableOpacity onPress={() => router.back()}>
                                <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
                            </TouchableOpacity>
                            <View className="ml-3">
                                <Text className="text-white text-xl font-bold">{t('community.title')}</Text>
                                <Text className="text-purple-200 text-xs">{t('community.subtitle')}</Text>
                            </View>
                        </View>
                        
                        {/* User Profile */}
                        <TouchableOpacity 
                            className="flex-row items-center bg-purple-500/50 rounded-full px-3 py-2"
                            onPress={() => router.push('/community/profile' as any)}
                        >
                            <Text className="text-2xl">{currentMember?.avatar}</Text>
                            <View className="ml-2">
                                <Text className="text-white text-xs font-medium">
                                    {t('community.level')} {currentMember?.level}
                                </Text>
                                <View className="flex-row items-center">
                                    <MaterialCommunityIcons name="star" size={10} color="#F59E0B" />
                                    <Text className="text-yellow-300 text-xs ml-0.5">
                                        {currentMember?.reputationPoints}
                                    </Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>

            <ScrollView 
                className="flex-1"
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                showsVerticalScrollIndicator={false}
            >
                {/* Weekly Challenge Banner */}
                {weeklyChallenge && (
                    <TouchableOpacity 
                        className="mx-4 mt-4 bg-gradient-to-r rounded-2xl overflow-hidden"
                        style={{ backgroundColor: '#4F46E5' }}
                        onPress={() => weeklyChallenge.isJoined ? null : joinWeeklyChallenge(weeklyChallenge.id)}
                    >
                        <View className="p-4">
                            <View className="flex-row items-center mb-2">
                                <MaterialCommunityIcons name="trophy" size={20} color="#F59E0B" />
                                <Text className="text-yellow-300 text-xs font-semibold ml-1 uppercase">
                                    {t('community.weeklyChallenge')}
                                </Text>
                            </View>
                            <Text className="text-white text-lg font-bold mb-1">
                                {weeklyChallenge.title}
                            </Text>
                            <Text className="text-purple-200 text-sm mb-3">
                                {weeklyChallenge.description}
                            </Text>
                            <View className="flex-row items-center justify-between">
                                <View className="flex-row items-center">
                                    <MaterialCommunityIcons name="account-group" size={16} color="#fff" />
                                    <Text className="text-white text-xs ml-1">
                                        {weeklyChallenge.participantCount} {t('community.joined')}
                                    </Text>
                                    <Text className="text-purple-300 text-xs ml-3">
                                        +{weeklyChallenge.rewardXp} XP
                                    </Text>
                                </View>
                                <View 
                                    className={`px-4 py-2 rounded-full ${
                                        weeklyChallenge.isJoined ? 'bg-white/20' : 'bg-white'
                                    }`}
                                >
                                    <Text 
                                        className={`text-xs font-bold ${
                                            weeklyChallenge.isJoined ? 'text-white' : 'text-purple-600'
                                        }`}
                                    >
                                        {weeklyChallenge.isJoined ? '✓ ' + t('community.joined') : t('community.joinNow')}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </TouchableOpacity>
                )}

                {/* Quick Actions */}
                <View className="flex-row px-4 mt-4">
                    <TouchableOpacity 
                        className="flex-1 rounded-2xl p-4 mr-2 shadow-sm"
                        style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }}
                        onPress={() => router.push('/community/questions' as any)}
                    >
                        <View className="w-10 h-10 bg-blue-100 rounded-xl items-center justify-center mb-2">
                            <MaterialCommunityIcons name="help-circle" size={24} color="#3B82F6" />
                        </View>
                        <Text className="text-sm font-semibold" style={{ color: colors.text }}>{t('community.askQuestion')}</Text>
                        <Text className="text-xs mt-0.5" style={{ color: colors.textSecondary }}>{t('community.getHelpFromCommunity')}</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        className="flex-1 rounded-2xl p-4 ml-2 shadow-sm"
                        style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }}
                        onPress={() => router.push('/community/wins' as any)}
                    >
                        <View className="w-10 h-10 bg-yellow-100 rounded-xl items-center justify-center mb-2">
                            <MaterialCommunityIcons name="trophy" size={24} color="#F59E0B" />
                        </View>
                        <Text className="text-sm font-semibold" style={{ color: colors.text }}>{t('community.shareWin')}</Text>
                        <Text className="text-xs mt-0.5" style={{ color: colors.textSecondary }}>{t('community.celebrateYourSuccess')}</Text>
                    </TouchableOpacity>
                </View>

                {/* Weekly Poll */}
                {activePoll && (
                    <View className="mx-4 mt-4 rounded-2xl p-4 shadow-sm" style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }}>
                        <View className="flex-row items-center mb-3">
                            <MaterialCommunityIcons name="poll" size={20} color="#8B5CF6" />
                            <Text className="text-purple-600 text-xs font-semibold ml-1 uppercase">
                                {t('community.weeklyPoll')}
                            </Text>
                            <View className="flex-1" />
                            <Text className="text-xs" style={{ color: colors.textTertiary }}>
                                {activePoll.totalVotes} {t('community.votes')}
                            </Text>
                        </View>
                        
                        <Text className="text-base font-semibold mb-3" style={{ color: colors.text }}>
                            {activePoll.question}
                        </Text>
                        
                        {activePoll.options.map((option) => {
                            const percentage = Math.round((option.voteCount / activePoll.totalVotes) * 100) || 0;
                            const isVoted = activePoll.userVotedOptionId === option.id;
                            const hasVoted = !!activePoll.userVotedOptionId;
                            
                            return (
                                <TouchableOpacity 
                                    key={option.id}
                                    className="mb-2 rounded-xl overflow-hidden"
                                    style={{ borderWidth: hasVoted ? 0 : 1, borderColor: colors.border }}
                                    onPress={() => handleVote(option.id)}
                                    disabled={hasVoted}
                                >
                                    <View className="relative">
                                        {hasVoted && (
                                            <View 
                                                className="absolute top-0 left-0 bottom-0"
                                                style={{ 
                                                    width: `${percentage}%`,
                                                    backgroundColor: isVoted ? colors.primaryLight : colors.backgroundSecondary 
                                                }}
                                            />
                                        )}
                                        <View className="flex-row items-center justify-between p-3 relative">
                                            <View className="flex-row items-center flex-1">
                                                {isVoted && (
                                                    <MaterialCommunityIcons 
                                                        name="check-circle" 
                                                        size={18} 
                                                        color={colors.primary} 
                                                        style={{ marginRight: 8 }}
                                                    />
                                                )}
                                                <Text 
                                                    className="text-sm"
                                                    style={{ 
                                                        color: isVoted ? colors.primary : colors.textSecondary,
                                                        fontWeight: isVoted ? '500' : 'normal'
                                                    }}
                                                >
                                                    {option.text}
                                                </Text>
                                            </View>
                                            {hasVoted && (
                                                <Text 
                                                    className="text-sm font-semibold"
                                                    style={{ color: isVoted ? colors.primary : colors.textSecondary }}
                                                >
                                                    {percentage}%
                                                </Text>
                                            )}
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                )}

                {/* Featured Article */}
                {featuredArticle && (
                    <TouchableOpacity 
                        className="mx-4 mt-4 rounded-2xl overflow-hidden shadow-sm"
                        style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }}
                        onPress={() => router.push({
                            pathname: '/community/article',
                            params: { id: featuredArticle.id }
                        } as any)}
                    >
                        {featuredArticle.coverImageUrl && (
                            <Image 
                                source={{ uri: featuredArticle.coverImageUrl }}
                                className="w-full h-32"
                                contentFit="cover"
                                cachePolicy="memory-disk"
                            />
                        )}
                        <View className="p-4">
                            <View className="flex-row items-center mb-2">
                                <MaterialCommunityIcons name="newspaper" size={16} color="#10B981" />
                                <Text className="text-green-600 text-xs font-semibold ml-1 uppercase">
                                    {t('community.featured')}
                                </Text>
                            </View>
                            <Text className="text-base font-bold mb-1" style={{ color: colors.text }}>
                                {featuredArticle.title}
                            </Text>
                            <Text className="text-sm" style={{ color: colors.textSecondary }} numberOfLines={2}>
                                {featuredArticle.excerpt}
                            </Text>
                            <View className="flex-row items-center mt-3">
                                <Text className="text-xs" style={{ color: colors.textTertiary }}>
                                    {featuredArticle.readTimeMinutes} {t('community.minRead')}
                                </Text>
                                <View className="flex-1" />
                                <View className="flex-row items-center">
                                    <MaterialCommunityIcons name="heart" size={14} color="#EF4444" />
                                    <Text className="text-xs ml-1" style={{ color: colors.textSecondary }}>
                                        {featuredArticle.likeCount}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </TouchableOpacity>
                )}

                {/* Featured Templates */}
                <View className="mt-6">
                    <View className="flex-row items-center justify-between px-4 mb-3">
                        <Text className="text-lg font-bold" style={{ color: colors.text }}>{t('community.popularTemplates')}</Text>
                        <TouchableOpacity onPress={() => router.push('/community/templates' as any)}>
                            <Text className="text-sm font-medium" style={{ color: colors.primary }}>{t('community.seeAll')}</Text>
                        </TouchableOpacity>
                    </View>
                    <ScrollView 
                        horizontal 
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: 16 }}
                    >
                        {featuredTemplates.map((template) => (
                            <TemplateCard 
                                key={template.id}
                                template={template}
                                compact
                                onPress={() => router.push({
                                    pathname: '/community/templates',
                                    params: { id: template.id }
                                } as any)}
                            />
                        ))}
                    </ScrollView>
                </View>

                {/* Recent Wins */}
                <View className="mt-6">
                    <View className="flex-row items-center justify-between px-4 mb-3">
                        <Text className="text-lg font-bold" style={{ color: colors.text }}>{t('community.recentWins')}</Text>
                        <TouchableOpacity onPress={() => router.push('/community/wins' as any)}>
                            <Text className="text-sm font-medium" style={{ color: colors.primary }}>{t('community.seeAll')}</Text>
                        </TouchableOpacity>
                    </View>
                    <View className="px-4">
                        {stories.slice(0, 2).map((story) => (
                            <StoryCard 
                                key={story.id}
                                story={story}
                                onLike={() => likeStory(story.id)}
                                onCelebrate={() => celebrateStory(story.id)}
                            />
                        ))}
                    </View>
                </View>

                {/* Activity Feed */}
                <View className="mt-6">
                    <Text className="text-lg font-bold px-4 mb-3" style={{ color: colors.text }}>
                        {t('community.activityFeed')}
                    </Text>
                    <View className="px-4">
                        {activityFeed.slice(0, 5).map((activity) => (
                            <ActivityCard 
                                key={activity.id}
                                activity={activity}
                            />
                        ))}
                    </View>
                </View>

                {/* Kudos Section */}
                <View className="mx-4 mt-6 mb-4 bg-gradient-to-r rounded-2xl p-4" style={{ backgroundColor: '#FEF3C7' }}>
                    <View className="flex-row items-center">
                        <View className="flex-1">
                            <View className="flex-row items-center mb-2">
                                <Text className="text-2xl mr-2"></Text>
                                <Text className="text-amber-800 font-bold">{t('community.secretCompliment')}</Text>
                            </View>
                            <Text className="text-amber-700 text-sm">
                                {t('community.secretComplimentDesc')}
                            </Text>
                        </View>
                        <TouchableOpacity className="bg-amber-500 px-4 py-2 rounded-full">
                            <Text className="text-white text-sm font-semibold">{t('community.send')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Bottom spacing */}
                <View className="h-4" />
            </ScrollView>
        </View>
    );
}
