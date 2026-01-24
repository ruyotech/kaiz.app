import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LeaderboardEntry, CommunityBadgeType } from '../../types/models';

interface LeaderboardRowProps {
    entry: LeaderboardEntry;
    isCurrentUser?: boolean;
    onPress?: () => void;
}

const BADGE_ICONS: Partial<Record<CommunityBadgeType, string>> = {
    community_champion: '🏆',
    streak_legend: '🔥',
    velocity_master: '⚡',
    knowledge_keeper: '📚',
    sprint_mentor: '🎓',
    helpful_hero: '💪',
    template_creator: '🎨',
    accountability_ace: '🤝',
};

export function LeaderboardRow({ entry, isCurrentUser = false, onPress }: LeaderboardRowProps) {
    const getRankStyle = (rank: number) => {
        switch (rank) {
            case 1:
                return { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: '🥇' };
            case 2:
                return { bg: 'bg-gray-100', text: 'text-gray-600', icon: '🥈' };
            case 3:
                return { bg: 'bg-orange-100', text: 'text-orange-600', icon: '🥉' };
            default:
                return { bg: 'bg-gray-50', text: 'text-gray-500', icon: null };
        }
    };

    const rankStyle = getRankStyle(entry.rank);

    return (
        <TouchableOpacity 
            className={`flex-row items-center p-4 rounded-2xl mb-2 ${
                isCurrentUser ? 'bg-purple-50 border-2 border-purple-200' : 'bg-white border border-gray-100'
            }`}
            onPress={onPress}
            activeOpacity={0.8}
        >
            {/* Rank */}
            <View 
                className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${rankStyle.bg}`}
            >
                {rankStyle.icon ? (
                    <Text className="text-lg">{rankStyle.icon}</Text>
                ) : (
                    <Text className={`text-sm font-bold ${rankStyle.text}`}>
                        {entry.rank}
                    </Text>
                )}
            </View>
            
            {/* Avatar & Name */}
            <Text className="text-3xl mr-3">{entry.avatar}</Text>
            <View className="flex-1">
                <View className="flex-row items-center">
                    <Text className={`text-sm font-semibold ${isCurrentUser ? 'text-purple-700' : 'text-gray-900'}`}>
                        {entry.displayName}
                    </Text>
                    {isCurrentUser && (
                        <View className="bg-purple-600 px-2 py-0.5 rounded-full ml-2">
                            <Text className="text-white text-xs">You</Text>
                        </View>
                    )}
                </View>
                
                {/* Level & Badges */}
                <View className="flex-row items-center mt-1">
                    <Text className="text-xs text-gray-500">Lvl {entry.level}</Text>
                    <View className="flex-row ml-2">
                        {entry.badges.slice(0, 3).map((badge, index) => (
                            <Text key={index} className="text-xs mr-0.5">
                                {BADGE_ICONS[badge] || '🏅'}
                            </Text>
                        ))}
                    </View>
                </View>
            </View>
            
            {/* Points & Change */}
            <View className="items-end">
                <Text className={`text-base font-bold ${isCurrentUser ? 'text-purple-600' : 'text-gray-900'}`}>
                    {entry.value.toLocaleString()}
                </Text>
                <View className="flex-row items-center mt-1">
                    {entry.change !== 0 && (
                        <>
                            <MaterialCommunityIcons 
                                name={entry.change > 0 ? 'arrow-up' : 'arrow-down'} 
                                size={12} 
                                color={entry.change > 0 ? '#10B981' : '#EF4444'} 
                            />
                            <Text 
                                className={`text-xs ml-0.5 ${
                                    entry.change > 0 ? 'text-green-600' : 'text-red-500'
                                }`}
                            >
                                {Math.abs(entry.change)}
                            </Text>
                        </>
                    )}
                    {entry.change === 0 && (
                        <Text className="text-xs text-gray-400">—</Text>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
}
