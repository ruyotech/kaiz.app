import { View, Text, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCommunityStore } from '../../../store/communityStore';

export default function QuestionDetailScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const [newAnswer, setNewAnswer] = useState('');
    
    const { 
        currentQuestion, 
        answers, 
        fetchQuestionDetail, 
        postAnswer,
        upvoteAnswer,
        loading 
    } = useCommunityStore();

    useEffect(() => {
        if (id) {
            fetchQuestionDetail(id as string);
        }
    }, [id]);

    const handleSubmitAnswer = async () => {
        if (newAnswer.trim() && id) {
            await postAnswer(id as string, newAnswer);
            setNewAnswer('');
        }
    };

    const getTimeAgo = (timestamp: string) => {
        const now = new Date();
        const then = new Date(timestamp);
        const diffMs = now.getTime() - then.getTime();
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        
        if (diffHours < 1) return 'Just now';
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return new Date(timestamp).toLocaleDateString();
    };

    if (!currentQuestion) {
        return (
            <View className="flex-1 bg-gray-50 items-center justify-center">
                <MaterialCommunityIcons name="loading" size={32} color="#9333EA" />
            </View>
        );
    }

    return (
        <KeyboardAvoidingView 
            className="flex-1 bg-gray-50"
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            {/* Header */}
            <SafeAreaView edges={['top']} className="bg-white border-b border-gray-200">
                <View className="px-4 py-3 flex-row items-center">
                    <TouchableOpacity onPress={() => router.back()}>
                        <MaterialCommunityIcons name="arrow-left" size={24} color="#374151" />
                    </TouchableOpacity>
                    <Text className="text-lg font-bold text-gray-900 ml-3">Question</Text>
                </View>
            </SafeAreaView>

            <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
                {/* Question Card */}
                <View className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-4">
                    {/* Status & Time */}
                    <View className="flex-row items-center mb-3">
                        <View 
                            className={`px-2.5 py-1 rounded-full ${
                                currentQuestion.status === 'answered' 
                                    ? 'bg-green-100' 
                                    : 'bg-blue-100'
                            }`}
                        >
                            <Text 
                                className={`text-xs font-medium ${
                                    currentQuestion.status === 'answered' 
                                        ? 'text-green-700' 
                                        : 'text-blue-700'
                                }`}
                            >
                                {currentQuestion.status === 'answered' ? '✓ Answered' : 'Open'}
                            </Text>
                        </View>
                        <Text className="text-xs text-gray-400 ml-2">
                            Asked {getTimeAgo(currentQuestion.createdAt)}
                        </Text>
                    </View>

                    {/* Title */}
                    <Text className="text-xl font-bold text-gray-900 mb-3">
                        {currentQuestion.title}
                    </Text>

                    {/* Body */}
                    <Text className="text-base text-gray-600 leading-6 mb-4">
                        {currentQuestion.body}
                    </Text>

                    {/* Tags */}
                    <View className="flex-row flex-wrap mb-4">
                        {currentQuestion.tags.map((tag, index) => (
                            <View 
                                key={index}
                                className="bg-purple-50 rounded-full px-3 py-1 mr-2 mb-1"
                            >
                                <Text className="text-sm text-purple-600">#{tag}</Text>
                            </View>
                        ))}
                    </View>

                    {/* Author */}
                    <View className="flex-row items-center pt-4 border-t border-gray-100">
                        <Text className="text-2xl mr-2">{currentQuestion.authorAvatar}</Text>
                        <View>
                            <Text className="text-sm font-medium text-gray-900">
                                {currentQuestion.authorName}
                            </Text>
                        </View>
                        <View className="flex-1" />
                        <View className="flex-row items-center">
                            <MaterialCommunityIcons name="eye" size={14} color="#9CA3AF" />
                            <Text className="text-xs text-gray-500 ml-1">{currentQuestion.viewCount} views</Text>
                        </View>
                    </View>
                </View>

                {/* Answers Section */}
                <View className="flex-row items-center justify-between mb-3">
                    <Text className="text-lg font-bold text-gray-900">
                        {answers.length} {answers.length === 1 ? 'Answer' : 'Answers'}
                    </Text>
                </View>

                {answers.map((answer) => (
                    <View 
                        key={answer.id}
                        className={`bg-white rounded-2xl p-4 mb-3 shadow-sm border ${
                            answer.isAccepted 
                                ? 'border-green-300 bg-green-50/50' 
                                : answer.isVerified
                                ? 'border-purple-200'
                                : 'border-gray-100'
                        }`}
                    >
                        {/* Badges */}
                        <View className="flex-row mb-3">
                            {answer.isAccepted && (
                                <View className="flex-row items-center bg-green-100 px-2 py-0.5 rounded-full mr-2">
                                    <MaterialCommunityIcons name="check-circle" size={14} color="#10B981" />
                                    <Text className="text-xs text-green-700 font-medium ml-1">Accepted</Text>
                                </View>
                            )}
                            {answer.isVerified && (
                                <View className="flex-row items-center bg-purple-100 px-2 py-0.5 rounded-full">
                                    <MaterialCommunityIcons name="shield-check" size={14} color="#9333EA" />
                                    <Text className="text-xs text-purple-700 font-medium ml-1">Official</Text>
                                </View>
                            )}
                        </View>

                        {/* Content */}
                        <Text className="text-base text-gray-700 leading-6 mb-4">
                            {answer.body}
                        </Text>

                        {/* Footer */}
                        <View className="flex-row items-center pt-3 border-t border-gray-100">
                            <Text className="text-xl mr-2">{answer.authorAvatar}</Text>
                            <View>
                                <View className="flex-row items-center">
                                    <Text className="text-sm font-medium text-gray-900">
                                        {answer.authorName}
                                    </Text>
                                    {answer.authorRole !== 'member' && (
                                        <View 
                                            className="px-1.5 py-0.5 rounded ml-2"
                                            style={{ 
                                                backgroundColor: answer.authorRole === 'mentor' 
                                                    ? '#8B5CF620' 
                                                    : '#10B98120' 
                                            }}
                                        >
                                            <Text 
                                                className="text-xs font-medium capitalize"
                                                style={{ 
                                                    color: answer.authorRole === 'mentor' 
                                                        ? '#8B5CF6' 
                                                        : '#10B981' 
                                                }}
                                            >
                                                {answer.authorRole}
                                            </Text>
                                        </View>
                                    )}
                                </View>
                                <Text className="text-xs text-gray-400">
                                    {getTimeAgo(answer.createdAt)}
                                </Text>
                            </View>
                            
                            <View className="flex-1" />
                            
                            {/* Upvote */}
                            <TouchableOpacity 
                                className="flex-row items-center"
                                onPress={() => upvoteAnswer(answer.id)}
                            >
                                <MaterialCommunityIcons 
                                    name={answer.isUpvotedByUser ? 'arrow-up-bold' : 'arrow-up-bold-outline'} 
                                    size={20} 
                                    color={answer.isUpvotedByUser ? '#9333EA' : '#9CA3AF'} 
                                />
                                <Text 
                                    className={`text-sm font-medium ml-1 ${
                                        answer.isUpvotedByUser ? 'text-purple-600' : 'text-gray-500'
                                    }`}
                                >
                                    {answer.upvoteCount}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}

                {answers.length === 0 && (
                    <View className="bg-white rounded-2xl p-8 items-center">
                        <MaterialCommunityIcons name="message-reply-outline" size={48} color="#D1D5DB" />
                        <Text className="text-gray-500 text-base mt-3 text-center">
                            No answers yet. Be the first to help!
                        </Text>
                    </View>
                )}

                <View className="h-32" />
            </ScrollView>

            {/* Answer Input */}
            <SafeAreaView edges={['bottom']} className="bg-white border-t border-gray-200">
                <View className="px-4 py-3">
                    <View className="flex-row items-end">
                        <TextInput
                            className="flex-1 bg-gray-100 rounded-2xl px-4 py-3 text-base max-h-24"
                            placeholder="Write your answer..."
                            value={newAnswer}
                            onChangeText={setNewAnswer}
                            multiline
                        />
                        <TouchableOpacity 
                            className={`ml-2 w-12 h-12 rounded-full items-center justify-center ${
                                newAnswer.trim() ? 'bg-purple-600' : 'bg-gray-200'
                            }`}
                            onPress={handleSubmitAnswer}
                            disabled={!newAnswer.trim()}
                        >
                            <MaterialCommunityIcons 
                                name="send" 
                                size={20} 
                                color={newAnswer.trim() ? '#fff' : '#9CA3AF'} 
                            />
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>
        </KeyboardAvoidingView>
    );
}
