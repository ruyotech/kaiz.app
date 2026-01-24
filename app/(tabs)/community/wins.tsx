import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Modal, TextInput } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCommunityStore } from '../../../store/communityStore';
import { StoryCard } from '../../../components/community/StoryCard';
import { WinCategory } from '../../../types/models';

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
                                <Text className="text-xl font-bold text-gray-900">Wins Board 🎉</Text>
                                <Text className="text-xs text-gray-500">Celebrate achievements together</Text>
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
                className="bg-white border-b border-gray-100"
                contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12 }}
            >
                {CATEGORIES.map((cat) => (
                    <TouchableOpacity
                        key={cat.key}
                        className={`flex-row items-center px-4 py-2 rounded-full mr-2 ${
                            selectedCategory === cat.key 
                                ? 'bg-purple-600' 
                                : 'bg-gray-100'
                        }`}
                        onPress={() => setSelectedCategory(cat.key)}
                    >
                        <MaterialCommunityIcons 
                            name={cat.icon as any} 
                            size={16} 
                            color={selectedCategory === cat.key ? '#fff' : cat.color} 
                        />
                        <Text 
                            className={`ml-1 text-sm font-medium ${
                                selectedCategory === cat.key ? 'text-white' : 'text-gray-600'
                            }`}
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
                        <Text className="text-gray-500 text-base text-center">
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
                <SafeAreaView className="flex-1 bg-white">
                    {/* Modal Header */}
                    <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200">
                        <TouchableOpacity onPress={() => setShowShareModal(false)}>
                            <Text className="text-gray-500 text-base">Cancel</Text>
                        </TouchableOpacity>
                        <Text className="text-lg font-bold">Share Your Win 🎉</Text>
                        <TouchableOpacity 
                            onPress={handleShare}
                            disabled={!newStory.title.trim() || !newStory.story.trim()}
                        >
                            <Text 
                                className={`text-base font-semibold ${
                                    newStory.title.trim() && newStory.story.trim()
                                        ? 'text-yellow-600'
                                        : 'text-gray-300'
                                }`}
                            >
                                Share
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView className="flex-1 px-4 py-4">
                        {/* Category Selection */}
                        <Text className="text-sm font-medium text-gray-700 mb-2">Win Category</Text>
                        <View className="flex-row flex-wrap mb-4">
                            {CATEGORIES.filter(c => c.key !== 'all').map((cat) => (
                                <TouchableOpacity
                                    key={cat.key}
                                    className={`flex-row items-center px-3 py-2 rounded-lg mr-2 mb-2 border ${
                                        newStory.category === cat.key 
                                            ? 'border-purple-300 bg-purple-50' 
                                            : 'border-gray-200 bg-gray-50'
                                    }`}
                                    onPress={() => setNewStory({ ...newStory, category: cat.key as WinCategory })}
                                >
                                    <MaterialCommunityIcons 
                                        name={cat.icon as any} 
                                        size={16} 
                                        color={cat.color} 
                                    />
                                    <Text 
                                        className={`ml-1 text-sm ${
                                            newStory.category === cat.key 
                                                ? 'text-purple-700 font-medium' 
                                                : 'text-gray-600'
                                        }`}
                                    >
                                        {cat.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Title Input */}
                        <Text className="text-sm font-medium text-gray-700 mb-2">Win Title</Text>
                        <TextInput
                            className="bg-gray-50 rounded-xl px-4 py-3 text-base mb-4 border border-gray-200"
                            placeholder="Give your win a catchy title!"
                            value={newStory.title}
                            onChangeText={(text) => setNewStory({ ...newStory, title: text })}
                        />

                        {/* Story Input */}
                        <Text className="text-sm font-medium text-gray-700 mb-2">Your Story</Text>
                        <TextInput
                            className="bg-gray-50 rounded-xl px-4 py-3 text-base mb-4 border border-gray-200 min-h-[150px]"
                            placeholder="Share the details of your achievement..."
                            value={newStory.story}
                            onChangeText={(text) => setNewStory({ ...newStory, story: text })}
                            multiline
                            textAlignVertical="top"
                        />

                        {/* Inspiration */}
                        <View className="bg-yellow-50 rounded-xl p-4 mt-2">
                            <View className="flex-row items-center mb-2">
                                <Text className="text-xl mr-2">💡</Text>
                                <Text className="text-amber-700 font-semibold">What to share</Text>
                            </View>
                            <Text className="text-amber-600 text-sm leading-5">
                                • What did you achieve?{'\n'}
                                • How long did it take?{'\n'}
                                • What helped you succeed?{'\n'}
                                • Any tips for others?
                            </Text>
                        </View>
                    </ScrollView>
                </SafeAreaView>
            </Modal>
        </View>
    );
}
