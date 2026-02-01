import { View, Text, ScrollView, TouchableOpacity, TextInput, RefreshControl, Modal } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCommunityStore } from '../../../store/communityStore';
import { QuestionCard } from '../../../components/community/QuestionCard';import { useThemeContext } from '../../../providers/ThemeProvider';
const POPULAR_TAGS = ['sprints', 'planning', 'velocity', 'focus', 'challenges', 'habits', 'life-wheel'];

export default function QuestionsScreen() {
    const router = useRouter();
    const { colors, isDark } = useThemeContext();
    const [refreshing, setRefreshing] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState<string>('all');
    const [selectedTag, setSelectedTag] = useState<string | null>(null);
    const [showAskModal, setShowAskModal] = useState(false);
    const [newQuestion, setNewQuestion] = useState({ title: '', body: '', tags: [] as string[] });
    
    const { questions, fetchQuestions, postQuestion, upvoteQuestion, loading } = useCommunityStore();

    useEffect(() => {
        fetchQuestions(
            selectedStatus === 'all' ? undefined : selectedStatus,
            selectedTag || undefined
        );
    }, [selectedStatus, selectedTag]);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchQuestions(
            selectedStatus === 'all' ? undefined : selectedStatus,
            selectedTag || undefined
        );
        setRefreshing(false);
    };

    const handleSubmitQuestion = async () => {
        if (newQuestion.title.trim() && newQuestion.body.trim()) {
            await postQuestion(newQuestion.title, newQuestion.body, newQuestion.tags);
            setNewQuestion({ title: '', body: '', tags: [] });
            setShowAskModal(false);
        }
    };

    const toggleTag = (tag: string) => {
        if (newQuestion.tags.includes(tag)) {
            setNewQuestion({ ...newQuestion, tags: newQuestion.tags.filter(t => t !== tag) });
        } else if (newQuestion.tags.length < 3) {
            setNewQuestion({ ...newQuestion, tags: [...newQuestion.tags, tag] });
        }
    };

    return (
        <View className="flex-1 bg-gray-50">
            {/* Header */}
            <SafeAreaView edges={['top']} className="bg-white border-b border-gray-200">
                <View className="px-4 py-3">
                    <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center">
                            <TouchableOpacity onPress={() => router.back()} className="mr-3">
                                <MaterialCommunityIcons name="arrow-left" size={24} color="#374151" />
                            </TouchableOpacity>
                            <View>
                                <Text className="text-xl font-bold text-gray-900">Q&A Forum</Text>
                                <Text className="text-xs text-gray-500">Ask questions, share knowledge</Text>
                            </View>
                        </View>
                        <TouchableOpacity 
                            className="bg-purple-600 px-4 py-2 rounded-full flex-row items-center"
                            onPress={() => setShowAskModal(true)}
                        >
                            <MaterialCommunityIcons name="plus" size={18} color="#fff" />
                            <Text className="text-white text-sm font-semibold ml-1">Ask</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>

            {/* Status Filter */}
            <View className="bg-white border-b border-gray-100 px-4 py-3">
                <View className="flex-row">
                    {[
                        { key: 'all', label: 'All Questions' },
                        { key: 'open', label: 'Unanswered' },
                        { key: 'answered', label: 'Answered' },
                    ].map((status) => (
                        <TouchableOpacity
                            key={status.key}
                            className={`px-4 py-2 rounded-full mr-2 ${
                                selectedStatus === status.key 
                                    ? 'bg-purple-100' 
                                    : 'bg-gray-100'
                            }`}
                            onPress={() => setSelectedStatus(status.key)}
                        >
                            <Text 
                                className={`text-sm font-medium ${
                                    selectedStatus === status.key 
                                        ? 'text-purple-700' 
                                        : 'text-gray-600'
                                }`}
                            >
                                {status.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Tags */}
            <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={{ backgroundColor: colors.backgroundSecondary, flexGrow: 0 }}
                contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12, alignItems: 'center' }}
            >
                {POPULAR_TAGS.map((tag) => (
                    <TouchableOpacity
                        key={tag}
                        className="px-3 py-1.5 rounded-lg mr-2"
                        style={{
                            borderWidth: 1,
                            borderColor: selectedTag === tag 
                                ? (isDark ? 'rgba(147, 51, 234, 0.5)' : '#D8B4FE')
                                : colors.border,
                            backgroundColor: selectedTag === tag 
                                ? (isDark ? 'rgba(147, 51, 234, 0.15)' : '#FAF5FF')
                                : colors.card
                        }}
                        onPress={() => setSelectedTag(selectedTag === tag ? null : tag)}
                    >
                        <Text 
                            className="text-sm"
                            style={{
                                color: selectedTag === tag 
                                    ? (isDark ? '#C4B5FD' : '#9333EA')
                                    : colors.textSecondary
                            }}
                        >
                            #{tag}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Questions List */}
            <ScrollView 
                className="flex-1"
                contentContainerStyle={{ padding: 16 }}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {questions.length === 0 ? (
                    <View className="items-center justify-center py-12">
                        <MaterialCommunityIcons name="help-circle-outline" size={48} color={colors.textTertiary} />
                        <Text className="text-base mt-3" style={{ color: colors.textTertiary }}>No questions found</Text>
                        <TouchableOpacity 
                            className="mt-4 bg-purple-600 px-6 py-2 rounded-full"
                            onPress={() => setShowAskModal(true)}
                        >
                            <Text className="text-white font-semibold">Ask the first question</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    questions.map((question) => (
                        <QuestionCard 
                            key={question.id}
                            question={question}
                            onPress={() => router.push({
                                pathname: '/community/question-detail',
                                params: { id: question.id }
                            } as any)}
                            onUpvote={() => upvoteQuestion(question.id)}
                        />
                    ))
                )}
            </ScrollView>

            {/* Ask Question Modal */}
            <Modal
                visible={showAskModal}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setShowAskModal(false)}
            >
                <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
                    {/* Modal Header */}
                    <View 
                        className="flex-row items-center justify-between px-4 py-3"
                        style={{ borderBottomWidth: 1, borderBottomColor: colors.border }}
                    >
                        <TouchableOpacity onPress={() => setShowAskModal(false)}>
                            <Text className="text-base" style={{ color: colors.textSecondary }}>Cancel</Text>
                        </TouchableOpacity>
                        <Text className="text-lg font-bold" style={{ color: colors.text }}>Ask a Question</Text>
                        <TouchableOpacity 
                            onPress={handleSubmitQuestion}
                            disabled={!newQuestion.title.trim() || !newQuestion.body.trim()}
                        >
                            <Text 
                                className="text-base font-semibold"
                                style={{ 
                                    color: newQuestion.title.trim() && newQuestion.body.trim()
                                        ? '#9333EA'
                                        : colors.textTertiary
                                }}
                            >
                                Post
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView className="flex-1 px-4 py-4">
                        {/* Title Input */}
                        <Text className="text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>Question Title</Text>
                        <TextInput
                            className="rounded-xl px-4 py-3 text-base mb-4"
                            style={{ 
                                backgroundColor: colors.inputBackground,
                                borderWidth: 1,
                                borderColor: colors.border,
                                color: colors.text
                            }}
                            placeholder="What's your question?"
                            placeholderTextColor={colors.placeholder}
                            value={newQuestion.title}
                            onChangeText={(text) => setNewQuestion({ ...newQuestion, title: text })}
                            multiline
                        />

                        {/* Body Input */}
                        <Text className="text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>Details</Text>
                        <TextInput
                            className="rounded-xl px-4 py-3 text-base mb-4 min-h-[120px]"
                            style={{ 
                                backgroundColor: colors.inputBackground,
                                borderWidth: 1,
                                borderColor: colors.border,
                                color: colors.text
                            }}
                            placeholder="Provide more context about your question..."
                            placeholderTextColor={colors.placeholder}
                            value={newQuestion.body}
                            onChangeText={(text) => setNewQuestion({ ...newQuestion, body: text })}
                            multiline
                            textAlignVertical="top"
                        />

                        {/* Tags */}
                        <Text className="text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                            Tags (select up to 3)
                        </Text>
                        <View className="flex-row flex-wrap">
                            {POPULAR_TAGS.map((tag) => (
                                <TouchableOpacity
                                    key={tag}
                                    className="px-3 py-1.5 rounded-lg mr-2 mb-2"
                                    style={{
                                        borderWidth: 1,
                                        borderColor: newQuestion.tags.includes(tag) 
                                            ? (isDark ? 'rgba(147, 51, 234, 0.5)' : '#D8B4FE')
                                            : colors.border,
                                        backgroundColor: newQuestion.tags.includes(tag) 
                                            ? (isDark ? 'rgba(147, 51, 234, 0.15)' : '#FAF5FF')
                                            : colors.backgroundSecondary
                                    }}
                                    onPress={() => toggleTag(tag)}
                                >
                                    <Text 
                                        className="text-sm"
                                        style={{
                                            color: newQuestion.tags.includes(tag) 
                                                ? (isDark ? '#C4B5FD' : '#9333EA')
                                                : colors.textSecondary
                                        }}
                                    >
                                        #{tag}
                                    </Text>
                                </TouchableOpacity>
                            ))}  
                        </View>

                        {/* Tips */}
                        <View 
                            className="rounded-xl p-4 mt-6"
                            style={{ backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : '#EFF6FF' }}
                        >
                            <View className="flex-row items-center mb-2">
                                <MaterialCommunityIcons name="lightbulb" size={18} color="#3B82F6" />
                                <Text className="font-semibold ml-2" style={{ color: isDark ? '#93C5FD' : '#1D4ED8' }}>Tips for a great question</Text>
                            </View>
                            <Text className="text-sm leading-5" style={{ color: isDark ? '#60A5FA' : '#2563EB' }}>
                                • Be specific about what you're trying to achieve{`\n`}
                                • Include what you've already tried{`\n`}
                                • Add relevant tags to help others find your question
                            </Text>
                        </View>
                    </ScrollView>
                </SafeAreaView>
            </Modal>
        </View>
    );
}
