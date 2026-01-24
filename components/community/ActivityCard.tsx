import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { CommunityActivity, ActivityType } from '../../types/models';

interface ActivityCardProps {
    activity: CommunityActivity;
    onCelebrate?: () => void;
}

const ACTIVITY_ICONS: Record<ActivityType, { icon: string; color: string }> = {
    sprint_completed: { icon: 'check-circle', color: '#10B981' },
    challenge_joined: { icon: 'flag', color: '#3B82F6' },
    challenge_completed: { icon: 'trophy', color: '#F59E0B' },
    badge_earned: { icon: 'medal', color: '#8B5CF6' },
    streak_milestone: { icon: 'fire', color: '#EF4444' },
    template_shared: { icon: 'share-variant', color: '#06B6D4' },
    question_answered: { icon: 'message-reply', color: '#10B981' },
    story_posted: { icon: 'book-open-page-variant', color: '#EC4899' },
    level_up: { icon: 'arrow-up-circle', color: '#F59E0B' },
};

export function ActivityCard({ activity, onCelebrate }: ActivityCardProps) {
    const config = ACTIVITY_ICONS[activity.type];
    
    const getTimeAgo = (timestamp: string) => {
        const now = new Date();
        const then = new Date(timestamp);
        const diffMs = now.getTime() - then.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        return `${diffDays}d ago`;
    };

    return (
        <View className="bg-white rounded-2xl p-4 mb-3 shadow-sm border border-gray-100">
            <View className="flex-row items-start">
                {/* Avatar with activity icon */}
                <View className="relative">
                    <Text className="text-3xl">{activity.userAvatar}</Text>
                    <View 
                        className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full items-center justify-center"
                        style={{ backgroundColor: config.color }}
                    >
                        <MaterialCommunityIcons 
                            name={config.icon as any} 
                            size={12} 
                            color="#fff" 
                        />
                    </View>
                </View>
                
                {/* Content */}
                <View className="ml-3 flex-1">
                    <Text className="text-sm text-gray-900">
                        <Text className="font-semibold">{activity.userName}</Text>
                        {' '}{activity.title}
                    </Text>
                    {activity.description && (
                        <Text className="text-xs text-gray-500 mt-0.5">
                            {activity.description}
                        </Text>
                    )}
                    <Text className="text-xs text-gray-400 mt-1">
                        {getTimeAgo(activity.timestamp)}
                    </Text>
                </View>
                
                {/* Celebrate button */}
                <TouchableOpacity 
                    className="flex-row items-center px-3 py-1.5 bg-gray-50 rounded-full"
                    onPress={onCelebrate}
                >
                    <Text className="text-sm mr-1">🎉</Text>
                    <Text className="text-xs text-gray-600 font-medium">
                        {activity.celebrateCount}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
