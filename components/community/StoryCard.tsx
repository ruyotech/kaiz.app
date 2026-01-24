import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SuccessStory } from '../../types/models';

interface StoryCardProps {
    story: SuccessStory;
    onPress?: () => void;
    onLike?: () => void;
    onCelebrate?: () => void;
}

const CATEGORY_CONFIG: Record<string, { label: string; icon: string; color: string }> = {
    sprint_complete: { label: 'Sprint Win', icon: 'check-circle', color: '#10B981' },
    challenge_done: { label: 'Challenge', icon: 'trophy', color: '#F59E0B' },
    habit_streak: { label: 'Streak', icon: 'fire', color: '#EF4444' },
    milestone: { label: 'Milestone', icon: 'flag-checkered', color: '#8B5CF6' },
    transformation: { label: 'Transform', icon: 'account-convert', color: '#EC4899' },
    other: { label: 'Win', icon: 'star', color: '#3B82F6' },
};

export function StoryCard({ story, onPress, onLike, onCelebrate }: StoryCardProps) {
    const config = CATEGORY_CONFIG[story.category] || CATEGORY_CONFIG.other;
    
    const getTimeAgo = (timestamp: string) => {
        const now = new Date();
        const then = new Date(timestamp);
        const diffMs = now.getTime() - then.getTime();
        const diffDays = Math.floor(diffMs / 86400000);
        
        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays}d ago`;
        return `${Math.floor(diffDays / 7)}w ago`;
    };

    return (
        <TouchableOpacity 
            className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-gray-100"
            onPress={onPress}
            activeOpacity={0.8}
        >
            {/* Header */}
            <View className="flex-row items-center mb-3">
                <Text className="text-3xl">{story.authorAvatar}</Text>
                <View className="ml-3 flex-1">
                    <Text className="text-sm font-semibold text-gray-900">
                        {story.authorName}
                    </Text>
                    <Text className="text-xs text-gray-500">
                        {getTimeAgo(story.createdAt)}
                    </Text>
                </View>
                <View 
                    className="flex-row items-center px-2.5 py-1 rounded-full"
                    style={{ backgroundColor: config.color + '15' }}
                >
                    <MaterialCommunityIcons 
                        name={config.icon as any} 
                        size={14} 
                        color={config.color} 
                    />
                    <Text 
                        className="text-xs font-medium ml-1"
                        style={{ color: config.color }}
                    >
                        {config.label}
                    </Text>
                </View>
            </View>
            
            {/* Title & Story */}
            <Text className="text-base font-bold text-gray-900 mb-2">
                {story.title}
            </Text>
            <Text className="text-sm text-gray-600 leading-5" numberOfLines={3}>
                {story.story}
            </Text>
            
            {/* Metrics */}
            {story.metrics && story.metrics.length > 0 && (
                <View className="flex-row flex-wrap mt-3 -mx-1">
                    {story.metrics.map((metric, index) => (
                        <View 
                            key={index}
                            className="bg-purple-50 rounded-lg px-3 py-2 m-1"
                        >
                            <Text className="text-xs text-gray-500">{metric.label}</Text>
                            <Text className="text-sm font-bold text-purple-700">
                                {metric.value}
                            </Text>
                        </View>
                    ))}
                </View>
            )}
            
            {/* Actions */}
            <View className="flex-row items-center mt-4 pt-3 border-t border-gray-100">
                <TouchableOpacity 
                    className={`flex-row items-center mr-4 ${story.isLikedByUser ? 'opacity-100' : 'opacity-70'}`}
                    onPress={onLike}
                >
                    <MaterialCommunityIcons 
                        name={story.isLikedByUser ? 'heart' : 'heart-outline'} 
                        size={20} 
                        color={story.isLikedByUser ? '#EF4444' : '#6B7280'} 
                    />
                    <Text className="text-sm text-gray-600 ml-1">{story.likeCount}</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                    className={`flex-row items-center mr-4 ${story.isCelebratedByUser ? 'opacity-100' : 'opacity-70'}`}
                    onPress={onCelebrate}
                >
                    <Text className="text-lg">🎉</Text>
                    <Text className="text-sm text-gray-600 ml-1">{story.celebrateCount}</Text>
                </TouchableOpacity>
                
                <TouchableOpacity className="flex-row items-center">
                    <MaterialCommunityIcons name="comment-outline" size={20} color="#6B7280" />
                    <Text className="text-sm text-gray-600 ml-1">{story.commentCount}</Text>
                </TouchableOpacity>
                
                <View className="flex-1" />
                
                <TouchableOpacity>
                    <MaterialCommunityIcons name="share-variant" size={20} color="#6B7280" />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );
}
