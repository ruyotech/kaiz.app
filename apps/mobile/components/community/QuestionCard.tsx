import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { CommunityQuestion } from '../../types/models';
import { useThemeContext } from '../../providers/ThemeProvider';

interface QuestionCardProps {
    question: CommunityQuestion;
    onPress?: () => void;
    onUpvote?: () => void;
}

export const QuestionCard = React.memo(function QuestionCard({ question, onPress, onUpvote }: QuestionCardProps) {
    const { colors, isDark } = useThemeContext();
    
    const getTimeAgo = (timestamp: string) => {
        const now = new Date();
        const then = new Date(timestamp);
        const diffMs = now.getTime() - then.getTime();
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return `${Math.floor(diffDays / 7)}w ago`;
    };

    return (
        <TouchableOpacity 
            className="rounded-2xl p-4 mb-3"
            style={{ 
                backgroundColor: colors.card,
                borderWidth: 1,
                borderColor: colors.border,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
            }}
            onPress={onPress}
            activeOpacity={0.8}
        >
            <View className="flex-row">
                {/* Upvote section */}
                <TouchableOpacity 
                    className="items-center mr-4"
                    onPress={onUpvote}
                >
                    <MaterialCommunityIcons 
                        name={question.isUpvotedByUser ? 'arrow-up-bold' : 'arrow-up-bold-outline'} 
                        size={24} 
                        color={question.isUpvotedByUser ? '#9333EA' : colors.textTertiary} 
                    />
                    <Text 
                        className="text-sm font-bold"
                        style={{ 
                            color: question.isUpvotedByUser ? '#9333EA' : colors.textSecondary 
                        }}
                    >
                        {question.upvoteCount}
                    </Text>
                </TouchableOpacity>
                
                {/* Content */}
                <View className="flex-1">
                    {/* Status badge */}
                    <View className="flex-row items-center mb-2">
                        <View 
                            className="px-2 py-0.5 rounded-full"
                            style={{
                                backgroundColor: question.status === 'answered' 
                                    ? (isDark ? 'rgba(34, 197, 94, 0.2)' : '#DCFCE7') 
                                    : question.status === 'closed'
                                    ? colors.backgroundSecondary
                                    : (isDark ? 'rgba(59, 130, 246, 0.2)' : '#DBEAFE')
                            }}
                        >
                            <Text 
                                className="text-xs font-medium"
                                style={{
                                    color: question.status === 'answered' 
                                        ? (isDark ? '#86EFAC' : '#15803D') 
                                        : question.status === 'closed'
                                        ? colors.textSecondary
                                        : (isDark ? '#93C5FD' : '#1D4ED8')
                                }}
                            >
                                {question.status === 'answered' ? '✓ Answered' : 
                                 question.status === 'closed' ? 'Closed' : 'Open'}
                            </Text>
                        </View>
                        <Text className="text-xs ml-2" style={{ color: colors.textTertiary }}>
                            {getTimeAgo(question.createdAt)}
                        </Text>
                    </View>
                    
                    {/* Title */}
                    <Text className="text-base font-semibold mb-2" style={{ color: colors.text }}>
                        {question.title}
                    </Text>
                    
                    {/* Tags */}
                    <View className="flex-row flex-wrap mb-3">
                        {question.tags.slice(0, 3).map((tag, index) => (
                            <View 
                                key={index} 
                                className="rounded-full px-2 py-0.5 mr-2 mb-1"
                                style={{ backgroundColor: isDark ? 'rgba(147, 51, 234, 0.2)' : '#FAF5FF' }}
                            >
                                <Text className="text-xs" style={{ color: isDark ? '#C4B5FD' : '#9333EA' }}>{tag}</Text>
                            </View>
                        ))}
                    </View>
                    
                    {/* Footer */}
                    <View className="flex-row items-center">
                        <Text className="text-xl mr-2">{question.authorAvatar}</Text>
                        <Text className="text-xs" style={{ color: colors.textSecondary }}>{question.authorName}</Text>
                        
                        <View className="flex-1" />
                        
                        <View className="flex-row items-center mr-4">
                            <MaterialCommunityIcons name="eye-outline" size={14} color={colors.textTertiary} />
                            <Text className="text-xs ml-1" style={{ color: colors.textSecondary }}>{question.viewCount}</Text>
                        </View>
                        
                        <View className="flex-row items-center">
                            <MaterialCommunityIcons 
                                name={question.answerCount > 0 ? 'message-reply' : 'message-reply-outline'} 
                                size={14} 
                                color={question.answerCount > 0 ? '#10B981' : colors.textTertiary} 
                            />
                            <Text 
                                className="text-xs ml-1"
                                style={{
                                    color: question.answerCount > 0 
                                        ? (isDark ? '#86EFAC' : '#10B981') 
                                        : colors.textSecondary,
                                    fontWeight: question.answerCount > 0 ? '500' : 'normal'
                                }}
                            >
                                {question.answerCount}
                            </Text>
                        </View>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
});
