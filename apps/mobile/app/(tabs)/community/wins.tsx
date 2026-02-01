import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Modal, TextInput } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCommunityStore } from '../../../store/communityStore';
import { StoryCard } from '../../../components/community/StoryCard';
import { WinCategory } from '../../../types/models';
import { useThemeContext } from '../../../providers/ThemeProvider';

const CATEGORIES: { key: WinCategory | 'all'; label: string; icon: string; color: string }[] = [
    { key: 'all', label: 'All Wins', icon: 'star', color: '#9333EA' },
    { key: 'sprint_complete', label: 'Sprint', icon: 'check-circle', color: '#10B981' },
    { key: 'challenge_done', label: 'Challenge', icon: 'trophy', color: '#F59E0B' },
    { key: 'habit_streak', label: 'Streak', icon: 'fire', color: '#EF4444' },
    { key: 'milestone', label: 'Milestone', icon: 'flag-checkered', color: '#3B82F6' },
    { key: 'transformation', label: 'Transform', icon: 'account-convert', color: '#EC4899' },
];

export default function WinsScreen() {
    const router = useRouter();
    const { colors, isDark } = useThemeContext();
    const [refreshing, setRefreshing] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [showShareModal, setShowShareModal] = useState(false);
    const [newStory, setNewStory] = useState({
        title: '',
        story: '',
        category: 'milestone' as WinCategory,
    });
    
    const { stories, fetchStories, postStory, likeStory, celebrateStory, loading } = useCommunityStore();

    useEffect(() => {
        fetchStories();
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchStories();
        setRefreshing(false);
    };

    const filteredStories = selectedCategory === 'all' 
        ? stories 
        : stories.filter(s => s.category === selectedCategory);

    const handleShare = async () => {
        if (newStory.title.trim() && newStory.story.trim()) {
            await postStory(newStory);
            setNewStory({ title: '', story: '', category: 'milestone' });
            setShowShareModal(false);
        }
    };

    return (
        <View className="flex-1" style={{ backgroundColor: colors.background }}>
            {/* Header */}
            <SafeAreaView edges={['top']} style={{ backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                <View className="px-4 py-3">
                    <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center">
                            <TouchableOpacity onPress={() => router.back()} className="mr-3">
                                <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
                            </TouchableOpacity>
                            <View>
                                <Text className="text-xl font-bold" style={{ color: colors.text }}>Wins Board 🎉</Text>
                                <Text className="text-xs" style={{ color: colors.textSecondary }}>Celebrate achievements together</Text>
                            </View>
                        </View>
                        <TouchableOpacity 
                            className="bg-yellow-500 px-4 py-2 rounded-full flex-row items-center"
                            onPress={() => setShowShareModal(true)}
                        >
                            <MaterialCommunityIcons name="trophy" size={18} color="#fff" />
                            <Text className="text-white text-sm font-semibold ml-1">Share</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>

            {/* Category Filter */}
            <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={{ backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border, flexGrow: 0 }}
                contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12, alignItems: 'center' }}
            >
                {CATEGORIES.map((cat) => (
                    <TouchableOpacity
                        key={cat.key}
                        className="flex-row items-center px-4 py-2 rounded-full mr-2"
                        style={{ 
                            backgroundColor: selectedCategory === cat.key 
                                ? '#9333EA' 
                                : colors.backgroundSecondary
                        }}
                        onPress={() => setSelectedCategory(cat.key)}
                    >
                        <MaterialCommunityIcons 
                            name={cat.icon as any} 
                            size={16} 
                            color={selectedCategory === cat.key ? '#fff' : cat.color} 
                        />
                        <Text 
                            className="ml-1 text-sm font-medium"
                            style={{ color: selectedCategory === cat.key ? '#fff' : colors.textSecondary }}
                        >
                            {cat.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Stories List */}
            <ScrollView 
                className="flex-1"
                contentContainerStyle={{ padding: 16 }}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {filteredStories.length === 0 ? (
                    <View className="items-center justify-center py-12">
                        <Text className="text-6xl mb-4">🏆</Text>
                        <Text className="text-base text-center" style={{ color: colors.textSecondary }}>
                            No wins shared yet in this category
                        </Text>
                        <TouchableOpacity 
                            className="mt-4 bg-yellow-500 px-6 py-2 rounded-full"
                            onPress={() => setShowShareModal(true)}
                        >
                            <Text className="text-white font-semibold">Be the first to share!</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    filteredStories.map((story) => (
                        <StoryCard 
                            key={story.id}
                            story={story}
                            onLike={() => likeStory(story.id)}
                            onCelebrate={() => celebrateStory(story.id)}
                        />
                    ))
                )}
            </ScrollView>

            {/* Share Win Modal */}
            <Modal
                visible={showShareModal}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setShowShareModal(false)}
            >
                <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
                    {/* Modal Header */}
                    <View 
                        className="flex-row items-center justify-between px-4 py-3"
                        style={{ borderBottomWidth: 1, borderBottomColor: colors.border }}
                    >
                        <TouchableOpacity onPress={() => setShowShareModal(false)}>
                            <Text className="text-base" style={{ color: colors.textSecondary }}>Cancel</Text>
                        </TouchableOpacity>
                        <Text className="text-lg font-bold" style={{ color: colors.text }}>Share Your Win 🎉</Text>
                        <TouchableOpacity 
                            onPress={handleShare}
                            disabled={!newStory.title.trim() || !newStory.story.trim()}
                        >
                            <Text 
                                className="text-base font-semibold"
                                style={{ color: newStory.title.trim() && newStory.story.trim() ? '#D97706' : colors.textTertiary }}
                            >
                                Share
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView className="flex-1 px-4 py-4">
                        {/* Category Selection */}
                        <Text className="text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>Win Category</Text>
                        <View className="flex-row flex-wrap mb-4">
                            {CATEGORIES.filter(c => c.key !== 'all').map((cat) => (
                                <TouchableOpacity
                                    key={cat.key}
                                    className="flex-row items-center px-3 py-2 rounded-lg mr-2 mb-2"
                                    style={{ 
                                        borderWidth: 1,
                                        borderColor: newStory.category === cat.key 
                                            ? (isDark ? 'rgba(147, 51, 234, 0.5)' : '#D8B4FE')
                                            : colors.border,
                                        backgroundColor: newStory.category === cat.key 
                                            ? (isDark ? 'rgba(147, 51, 234, 0.15)' : '#FAF5FF')
                                            : colors.backgroundSecondary
                                    }}
                                    onPress={() => setNewStory({ ...newStory, category: cat.key as WinCategory })}
                                >
                                    <MaterialCommunityIcons 
                                        name={cat.icon as any} 
                                        size={16} 
                                        color={cat.color} 
                                    />
                                    <Text 
                                        className="ml-1 text-sm"
                                        style={{ 
                                            color: newStory.category === cat.key 
                                                ? (isDark ? '#C4B5FD' : '#7E22CE')
                                                : colors.textSecondary,
                                            fontWeight: newStory.category === cat.key ? '500' : 'normal'
                                        }}
                                    >
                                        {cat.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Title Input */}
                        <Text className="text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>Win Title</Text>
                        <TextInput
                            className="rounded-xl px-4 py-3 text-base mb-4"
                            style={{ 
                                backgroundColor: colors.inputBackground,
                                borderWidth: 1,
                                borderColor: colors.border,
                                color: colors.text
                            }}
                            placeholder="Give your win a catchy title!"
                            placeholderTextColor={colors.placeholder}
                            value={newStory.title}
                            onChangeText={(text) => setNewStory({ ...newStory, title: text })}
                        />

                        {/* Story Input */}
                        <Text className="text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>Your Story</Text>
                        <TextInput
                            className="rounded-xl px-4 py-3 text-base mb-4 min-h-[150px]"
                            style={{ 
                                backgroundColor: colors.inputBackground,
                                borderWidth: 1,
                                borderColor: colors.border,
                                color: colors.text
                            }}
                            placeholder="Share the details of your achievement..."
                            placeholderTextColor={colors.placeholder}
                            value={newStory.story}
                            onChangeText={(text) => setNewStory({ ...newStory, story: text })}
                            multiline
                            textAlignVertical="top"
                        />

                        {/* Inspiration */}
                        <View 
                            className="rounded-xl p-4 mt-2"
                            style={{ backgroundColor: isDark ? 'rgba(245, 158, 11, 0.15)' : '#FFFBEB' }}
                        >
                            <View className="flex-row items-center mb-2">
                                <Text className="text-xl mr-2">💡</Text>
                                <Text className="font-semibold" style={{ color: isDark ? '#FCD34D' : '#B45309' }}>What to share</Text>
                            </View>
                            <Text className="text-sm leading-5" style={{ color: isDark ? '#FBBF24' : '#D97706' }}>
                                • What did you achieve?{`\n`}
                                • How long did it take?{`\n`}
                                • What helped you succeed?{`\n`}
                                • Any tips for others?
                            </Text>
                        </View>
                    </ScrollView>
                </SafeAreaView>
            </Modal>
        </View>
    );
}
