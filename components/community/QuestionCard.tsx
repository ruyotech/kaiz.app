import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { CommunityQuestion } from '../../types/models';

interface QuestionCardProps {
    question: CommunityQuestion;
    onPress?: () => void;
    onUpvote?: () => void;
}

export function QuestionCard({ question, onPress, onUpvote }: QuestionCardProps) {
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
            className="bg-white rounded-2xl p-4 mb-3 shadow-sm border border-gray-100"
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
                        color={question.isUpvotedByUser ? '#9333EA' : '#9CA3AF'} 
                    />
                    <Text 
                        className={`text-sm font-bold ${
                            question.isUpvotedByUser ? 'text-purple-600' : 'text-gray-500'
                        }`}
                    >
                        {question.upvoteCount}
                    </Text>
                </TouchableOpacity>
                
                {/* Content */}
                <View className="flex-1">
                    {/* Status badge */}
                    <View className="flex-row items-center mb-2">
                        <View 
                            className={`px-2 py-0.5 rounded-full ${
                                question.status === 'answered' 
                                    ? 'bg-green-100' 
                                    : question.status === 'closed'
                                    ? 'bg-gray-100'
                                    : 'bg-blue-100'
                            }`}
                        >
                            <Text 
                                className={`text-xs font-medium ${
                                    question.status === 'answered' 
                                        ? 'text-green-700' 
                                        : question.status === 'closed'
                                        ? 'text-gray-600'
                                        : 'text-blue-700'
                                }`}
                            >
                                {question.status === 'answered' ? '✓ Answered' : 
                                 question.status === 'closed' ? 'Closed' : 'Open'}
                            </Text>
                        </View>
                        <Text className="text-xs text-gray-400 ml-2">
                            {getTimeAgo(question.createdAt)}
                        </Text>
                    </View>
                    
                    {/* Title */}
                    <Text className="text-base font-semibold text-gray-900 mb-2">
                        {question.title}
                    </Text>
                    
                    {/* Tags */}
                    <View className="flex-row flex-wrap mb-3">
                        {question.tags.slice(0, 3).map((tag, index) => (
                            <View 
                                key={index} 
                                className="bg-purple-50 rounded-full px-2 py-0.5 mr-2 mb-1"
                            >
                                <Text className="text-xs text-purple-600">{tag}</Text>
                            </View>
                        ))}
                    </View>
                    
                    {/* Footer */}
                    <View className="flex-row items-center">
                        <Text className="text-xl mr-2">{question.authorAvatar}</Text>
                        <Text className="text-xs text-gray-600">{question.authorName}</Text>
                        
                        <View className="flex-1" />
                        
                        <View className="flex-row items-center mr-4">
                            <MaterialCommunityIcons name="eye-outline" size={14} color="#9CA3AF" />
                            <Text className="text-xs text-gray-500 ml-1">{question.viewCount}</Text>
                        </View>
                        
                        <View className="flex-row items-center">
                            <MaterialCommunityIcons 
                                name={question.answerCount > 0 ? 'message-reply' : 'message-reply-outline'} 
                                size={14} 
                                color={question.answerCount > 0 ? '#10B981' : '#9CA3AF'} 
                            />
                            <Text 
                                className={`text-xs ml-1 ${
                                    question.answerCount > 0 ? 'text-green-600 font-medium' : 'text-gray-500'
                                }`}
                            >
                                {question.answerCount}
                            </Text>
                        </View>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
}
