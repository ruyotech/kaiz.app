import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LeaderboardEntry, CommunityBadgeType } from '../../types/models';
import { useThemeContext } from '../../providers/ThemeProvider';

interface LeaderboardRowProps {
    entry: LeaderboardEntry;
    isCurrentUser?: boolean;
    onPress?: () => void;
}

const BADGE_ICONS: Partial<Record<CommunityBadgeType, string>> = {
    community_champion: 'trophy-outline',
    streak_legend: 'fire',
    velocity_master: 'lightning-bolt',
    knowledge_keeper: 'book-open-variant',
    sprint_mentor: 'school-outline',
    helpful_hero: 'arm-flex-outline',
    template_creator: 'palette-outline',
    accountability_ace: 'handshake-outline',
};

export function LeaderboardRow({ entry, isCurrentUser = false, onPress }: LeaderboardRowProps) {
    const { colors, isDark } = useThemeContext();
    
    const getRankStyle = (rank: number) => {
        switch (rank) {
            case 1:
                return { bg: isDark ? 'rgba(250, 204, 21, 0.2)' : '#FEF9C3', text: isDark ? '#FACC15' : '#A16207', icon: 'medal' };
            case 2:
                return { bg: isDark ? 'rgba(156, 163, 175, 0.2)' : '#F3F4F6', text: colors.textSecondary, icon: 'medal-outline' };
            case 3:
                return { bg: isDark ? 'rgba(251, 146, 60, 0.2)' : '#FFEDD5', text: isDark ? '#FB923C' : '#C2410C', icon: 'medal-outline' };
            default:
                return { bg: colors.backgroundSecondary, text: colors.textSecondary, icon: null };
        }
    };

    const rankStyle = getRankStyle(entry.rank);

    return (
        <TouchableOpacity 
            className="flex-row items-center p-4 rounded-2xl mb-2"
            style={{
                backgroundColor: isCurrentUser 
                    ? (isDark ? 'rgba(147, 51, 234, 0.15)' : '#FAF5FF')
                    : colors.card,
                borderWidth: isCurrentUser ? 2 : 1,
                borderColor: isCurrentUser 
                    ? (isDark ? 'rgba(147, 51, 234, 0.3)' : '#E9D5FF')
                    : colors.border
            }}
            onPress={onPress}
            activeOpacity={0.8}
        >
            {/* Rank */}
            <View 
                className="w-10 h-10 rounded-full items-center justify-center mr-3"
                style={{ backgroundColor: rankStyle.bg }}
            >
                {rankStyle.icon ? (
                    <MaterialCommunityIcons name={rankStyle.icon as any} size={22} color={rankStyle.text} />
                ) : (
                    <Text className="text-sm font-bold" style={{ color: rankStyle.text }}>
                        {entry.rank}
                    </Text>
                )}
            </View>
            
            {/* Avatar & Name */}
            <Text className="text-3xl mr-3">{entry.avatar}</Text>
            <View className="flex-1">
                <View className="flex-row items-center">
                    <Text 
                        className="text-sm font-semibold"
                        style={{ color: isCurrentUser ? (isDark ? '#C4B5FD' : '#7E22CE') : colors.text }}
                    >
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
                    <Text className="text-xs" style={{ color: colors.textSecondary }}>Lvl {entry.level}</Text>
                    <View className="flex-row ml-2">
                        {entry.badges.slice(0, 3).map((badge, index) => (
                            <MaterialCommunityIcons key={index} name={(BADGE_ICONS[badge] || 'medal-outline') as any} size={14} color={colors.textSecondary} style={{ marginRight: 2 }} />
                        ))}
                    </View>
                </View>
            </View>
            
            {/* Points & Change */}
            <View className="items-end">
                <Text 
                    className="text-base font-bold"
                    style={{ color: isCurrentUser ? (isDark ? '#C4B5FD' : '#9333EA') : colors.text }}
                >
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
                                className="text-xs ml-0.5"
                                style={{ 
                                    color: entry.change > 0 
                                        ? (isDark ? '#86EFAC' : '#10B981') 
                                        : (isDark ? '#FCA5A5' : '#EF4444')
                                }}
                            >
                                {Math.abs(entry.change)}
                            </Text>
                        </>
                    )}
                    {entry.change === 0 && (
                        <Text className="text-xs" style={{ color: colors.textTertiary }}>—</Text>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
}
