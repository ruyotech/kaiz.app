import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCommunityStore } from '../../../store/communityStore';
import { CommunityBadgeType } from '../../../types/models';

const BADGE_INFO: Record<CommunityBadgeType, { name: string; description: string; icon: string; rarity: string; color: string }> = {
    sprint_starter: { name: 'Sprint Starter', description: 'Completed your first sprint', icon: '🚀', rarity: 'Common', color: '#10B981' },
    sprint_mentor: { name: 'Sprint Mentor', description: 'Helped 10+ community members', icon: '🎓', rarity: 'Rare', color: '#3B82F6' },
    velocity_master: { name: 'Velocity Master', description: 'Achieved consistent velocity for 4 weeks', icon: '⚡', rarity: 'Epic', color: '#8B5CF6' },
    community_champion: { name: 'Community Champion', description: 'Top 10 contributor for a month', icon: '🏆', rarity: 'Legendary', color: '#F59E0B' },
    knowledge_keeper: { name: 'Knowledge Keeper', description: 'Answered 50+ questions', icon: '📚', rarity: 'Epic', color: '#06B6D4' },
    template_creator: { name: 'Template Creator', description: 'Created a popular template', icon: '🎨', rarity: 'Rare', color: '#EC4899' },
    streak_legend: { name: 'Streak Legend', description: '100+ day streak achieved', icon: '🔥', rarity: 'Legendary', color: '#EF4444' },
    first_post: { name: 'First Post', description: 'Made your first community post', icon: '✍️', rarity: 'Common', color: '#6B7280' },
    helpful_hero: { name: 'Helpful Hero', description: 'Got 100+ upvotes on answers', icon: '💪', rarity: 'Epic', color: '#10B981' },
    accountability_ace: { name: 'Accountability Ace', description: 'Supported 5+ accountability partners', icon: '🤝', rarity: 'Rare', color: '#8B5CF6' },
    early_adopter: { name: 'Early Adopter', description: 'Joined in the first month', icon: '🌟', rarity: 'Legendary', color: '#F59E0B' },
    bug_hunter: { name: 'Bug Hunter', description: 'Reported valid bugs', icon: '🐛', rarity: 'Rare', color: '#EF4444' },
    ama_participant: { name: 'AMA Participant', description: 'Participated in an AMA session', icon: '🎤', rarity: 'Common', color: '#3B82F6' },
};

const LEVEL_TITLES = [
    { min: 1, max: 5, title: 'Novice', color: '#9CA3AF' },
    { min: 6, max: 15, title: 'Achiever', color: '#10B981' },
    { min: 16, max: 30, title: 'Expert', color: '#3B82F6' },
    { min: 31, max: 50, title: 'Master', color: '#8B5CF6' },
    { min: 51, max: 100, title: 'Legend', color: '#F59E0B' },
];

export default function CommunityProfileScreen() {
    const router = useRouter();
    const { currentMember } = useCommunityStore();

    if (!currentMember) return null;

    const getLevelProgress = () => {
        const pointsPerLevel = 200;
        const currentLevelPoints = currentMember.reputationPoints % pointsPerLevel;
        return (currentLevelPoints / pointsPerLevel) * 100;
    };

    const levelInfo = LEVEL_TITLES.find(l => currentMember.level >= l.min && currentMember.level <= l.max) || LEVEL_TITLES[0];

    return (
        <View className="flex-1 bg-gray-50">
            {/* Header */}
            <SafeAreaView edges={['top']} className="bg-purple-600">
                <View className="px-4 py-4">
                    <View className="flex-row items-center justify-between">
                        <TouchableOpacity onPress={() => router.back()}>
                            <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
                        </TouchableOpacity>
                        <Text className="text-white text-lg font-bold">My Profile</Text>
                        <TouchableOpacity>
                            <MaterialCommunityIcons name="cog" size={24} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* Profile Card */}
                <View className="bg-purple-600 pb-8 px-4">
                    <View className="items-center">
                        <Text className="text-7xl mb-3">{currentMember.avatar}</Text>
                        <Text className="text-white text-xl font-bold">{currentMember.displayName}</Text>
                        <View 
                            className="px-3 py-1 rounded-full mt-2"
                            style={{ backgroundColor: levelInfo.color + '40' }}
                        >
                            <Text className="text-white text-sm font-medium">
                                Level {currentMember.level} • {levelInfo.title}
                            </Text>
                        </View>
                        {currentMember.bio && (
                            <Text className="text-purple-200 text-center mt-3 px-8">
                                {currentMember.bio}
                            </Text>
                        )}
                    </View>
                </View>

                {/* Stats Grid */}
                <View className="bg-white mx-4 -mt-4 rounded-2xl shadow-sm border border-gray-100 p-4">
                    <View className="flex-row">
                        <View className="flex-1 items-center py-2">
                            <Text className="text-2xl font-bold text-gray-900">
                                {currentMember.reputationPoints.toLocaleString()}
                            </Text>
                            <Text className="text-xs text-gray-500 mt-1">Reputation</Text>
                        </View>
                        <View className="w-px bg-gray-200" />
                        <View className="flex-1 items-center py-2">
                            <Text className="text-2xl font-bold text-gray-900">
                                {currentMember.sprintsCompleted}
                            </Text>
                            <Text className="text-xs text-gray-500 mt-1">Sprints</Text>
                        </View>
                        <View className="w-px bg-gray-200" />
                        <View className="flex-1 items-center py-2">
                            <View className="flex-row items-center">
                                <MaterialCommunityIcons name="fire" size={20} color="#EF4444" />
                                <Text className="text-2xl font-bold text-gray-900 ml-1">
                                    {currentMember.currentStreak}
                                </Text>
                            </View>
                            <Text className="text-xs text-gray-500 mt-1">Day Streak</Text>
                        </View>
                    </View>

                    {/* Level Progress */}
                    <View className="mt-4 pt-4 border-t border-gray-100">
                        <View className="flex-row justify-between mb-2">
                            <Text className="text-sm text-gray-600">Level Progress</Text>
                            <Text className="text-sm font-medium" style={{ color: levelInfo.color }}>
                                {Math.round(getLevelProgress())}% to Level {currentMember.level + 1}
                            </Text>
                        </View>
                        <View className="bg-gray-200 h-2 rounded-full overflow-hidden">
                            <View 
                                className="h-full rounded-full"
                                style={{ 
                                    width: `${getLevelProgress()}%`,
                                    backgroundColor: levelInfo.color 
                                }}
                            />
                        </View>
                    </View>
                </View>

                {/* Contributions */}
                <View className="mx-4 mt-4 bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                    <Text className="text-lg font-bold text-gray-900 mb-4">Contributions</Text>
                    
                    <View className="flex-row flex-wrap -mx-1">
                        {[
                            { icon: 'message-reply', label: 'Answers', value: currentMember.helpfulAnswers, color: '#10B981' },
                            { icon: 'file-document-multiple', label: 'Templates', value: currentMember.templatesShared, color: '#8B5CF6' },
                            { icon: 'trophy', label: 'Challenges', value: 8, color: '#F59E0B' },
                            { icon: 'account-group', label: 'Partners', value: 2, color: '#EC4899' },
                        ].map((item, index) => (
                            <View key={index} className="w-1/2 p-1">
                                <View className="bg-gray-50 rounded-xl p-3">
                                    <View className="flex-row items-center">
                                        <View 
                                            className="w-8 h-8 rounded-lg items-center justify-center"
                                            style={{ backgroundColor: item.color + '20' }}
                                        >
                                            <MaterialCommunityIcons 
                                                name={item.icon as any} 
                                                size={18} 
                                                color={item.color} 
                                            />
                                        </View>
                                        <View className="ml-2">
                                            <Text className="text-lg font-bold text-gray-900">{item.value}</Text>
                                            <Text className="text-xs text-gray-500">{item.label}</Text>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Badges */}
                <View className="mx-4 mt-4 bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6">
                    <View className="flex-row items-center justify-between mb-4">
                        <Text className="text-lg font-bold text-gray-900">Badges</Text>
                        <Text className="text-sm text-gray-500">
                            {currentMember.badges.length}/13
                        </Text>
                    </View>
                    
                    {/* Earned Badges */}
                    <View className="flex-row flex-wrap">
                        {currentMember.badges.map((badgeType) => {
                            const badge = BADGE_INFO[badgeType];
                            return (
                                <TouchableOpacity 
                                    key={badgeType}
                                    className="w-1/4 items-center mb-4"
                                >
                                    <View 
                                        className="w-14 h-14 rounded-full items-center justify-center"
                                        style={{ backgroundColor: badge.color + '20' }}
                                    >
                                        <Text className="text-2xl">{badge.icon}</Text>
                                    </View>
                                    <Text 
                                        className="text-xs text-center mt-1 font-medium"
                                        style={{ color: badge.color }}
                                        numberOfLines={1}
                                    >
                                        {badge.name.split(' ')[0]}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    {/* Locked Badges Preview */}
                    <View className="border-t border-gray-100 pt-4 mt-2">
                        <Text className="text-sm text-gray-500 mb-3">Next badges to unlock</Text>
                        <View className="flex-row">
                            {(Object.keys(BADGE_INFO) as CommunityBadgeType[])
                                .filter(b => !currentMember.badges.includes(b))
                                .slice(0, 4)
                                .map((badgeType) => {
                                    const badge = BADGE_INFO[badgeType];
                                    return (
                                        <View key={badgeType} className="flex-1 items-center">
                                            <View className="w-12 h-12 rounded-full bg-gray-100 items-center justify-center">
                                                <Text className="text-xl opacity-30">{badge.icon}</Text>
                                            </View>
                                            <Text className="text-xs text-gray-400 mt-1" numberOfLines={1}>
                                                {badge.name.split(' ')[0]}
                                            </Text>
                                        </View>
                                    );
                                })}
                        </View>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}
