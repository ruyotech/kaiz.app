import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

// Mock article content
const MOCK_ARTICLE = {
    id: 'featured-1',
    title: 'Master Your Sprint Planning: 10 Strategies That Work',
    content: `Sprint planning is the foundation of a productive week. Here's how to make it work for you.

## 1. Start with a Review

Before planning your next sprint, review the previous one. What got done? What didn't? Why?

## 2. Know Your Velocity

Your velocity is your average completed story points per sprint. Don't plan beyond what you've historically achieved.

## 3. Use the Eisenhower Matrix

Prioritize ruthlessly. Not everything that feels urgent is important.

**Q1 (Urgent + Important):** Crisis tasks that need immediate attention
**Q2 (Not Urgent + Important):** Growth tasks - where your future is built
**Q3 (Urgent + Not Important):** Interruptions and some meetings
**Q4 (Not Urgent + Not Important):** Time wasters to eliminate

## 4. Break Down Large Tasks

If a task feels too big, it probably is. Break it into smaller, actionable pieces.

## 5. Account for Reality

Check your calendar. Account for meetings, appointments, and commitments. Don't plan in a vacuum.

## 6. Include Buffer Time

Unexpected things happen. Build in 20% buffer for the inevitable surprises.

## 7. Balance Your Life Wheel

Don't just plan work tasks. Include health, relationships, personal growth, and other life dimensions.

## 8. Set Clear "Definition of Done"

Know what "complete" looks like for each task before you start.

## 9. Time-box Your Planning

Limit planning to 30 minutes. Analysis paralysis kills momentum.

## 10. Start Small, Iterate

If you're new to sprint planning, start with fewer tasks. Add more as you build your planning muscle.

---

Remember: The goal isn't to do more. It's to do what matters, consistently.`,
    coverImageUrl: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800',
    authorName: 'Kaiz Team',
    publishedAt: '2026-01-20T10:00:00Z',
    readTimeMinutes: 8,
    viewCount: 1250,
    likeCount: 342,
    category: 'strategy',
    tags: ['productivity', 'planning', 'sprint'],
};

export default function ArticleDetailScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams();

    // In a real app, fetch article by ID
    const article = MOCK_ARTICLE;

    const getTimeAgo = (timestamp: string) => {
        const date = new Date(timestamp);
        return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    };

    return (
        <View className="flex-1 bg-white">
            {/* Header */}
            <SafeAreaView edges={['top']} className="absolute top-0 left-0 right-0 z-10">
                <View className="px-4 py-3 flex-row items-center justify-between">
                    <TouchableOpacity 
                        className="w-10 h-10 bg-black/30 rounded-full items-center justify-center"
                        onPress={() => router.back()}
                    >
                        <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
                    </TouchableOpacity>
                    <View className="flex-row">
                        <TouchableOpacity className="w-10 h-10 bg-black/30 rounded-full items-center justify-center mr-2">
                            <MaterialCommunityIcons name="bookmark-outline" size={22} color="#fff" />
                        </TouchableOpacity>
                        <TouchableOpacity className="w-10 h-10 bg-black/30 rounded-full items-center justify-center">
                            <MaterialCommunityIcons name="share-variant" size={22} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* Cover Image */}
                {article.coverImageUrl && (
                    <Image 
                        source={{ uri: article.coverImageUrl }}
                        className="w-full h-64"
                        resizeMode="cover"
                    />
                )}

                {/* Content */}
                <View className="px-5 py-6">
                    {/* Category Badge */}
                    <View className="flex-row items-center mb-3">
                        <View className="bg-blue-100 px-3 py-1 rounded-full">
                            <Text className="text-blue-700 text-sm font-medium">
                                {article.category.charAt(0).toUpperCase() + article.category.slice(1)}
                            </Text>
                        </View>
                        <Text className="text-gray-400 text-sm ml-3">
                            {article.readTimeMinutes} min read
                        </Text>
                    </View>

                    {/* Title */}
                    <Text className="text-2xl font-bold text-gray-900 leading-tight mb-4">
                        {article.title}
                    </Text>

                    {/* Author & Date */}
                    <View className="flex-row items-center mb-6 pb-6 border-b border-gray-100">
                        <View className="w-10 h-10 bg-purple-100 rounded-full items-center justify-center">
                            <MaterialCommunityIcons name="account" size={24} color="#9333EA" />
                        </View>
                        <View className="ml-3">
                            <Text className="text-base font-medium text-gray-900">
                                {article.authorName}
                            </Text>
                            <Text className="text-sm text-gray-500">
                                {getTimeAgo(article.publishedAt)}
                            </Text>
                        </View>
                    </View>

                    {/* Article Content */}
                    <View>
                        {article.content.split('\n\n').map((paragraph, index) => {
                            // Handle headings
                            if (paragraph.startsWith('## ')) {
                                return (
                                    <Text 
                                        key={index}
                                        className="text-xl font-bold text-gray-900 mt-6 mb-3"
                                    >
                                        {paragraph.replace('## ', '')}
                                    </Text>
                                );
                            }
                            
                            // Handle bold text and Q1-Q4 items
                            if (paragraph.startsWith('**')) {
                                const match = paragraph.match(/\*\*(.+?):\*\*\s*(.+)/);
                                if (match) {
                                    return (
                                        <View key={index} className="flex-row mb-2 pl-4">
                                            <Text className="text-gray-900 font-bold">{match[1]}:</Text>
                                            <Text className="text-gray-600 ml-1 flex-1">{match[2]}</Text>
                                        </View>
                                    );
                                }
                            }

                            // Handle horizontal rule
                            if (paragraph === '---') {
                                return (
                                    <View key={index} className="h-px bg-gray-200 my-6" />
                                );
                            }

                            // Regular paragraph
                            return (
                                <Text 
                                    key={index}
                                    className="text-base text-gray-700 leading-7 mb-4"
                                >
                                    {paragraph}
                                </Text>
                            );
                        })}
                    </View>

                    {/* Tags */}
                    <View className="flex-row flex-wrap mt-6 pt-6 border-t border-gray-100">
                        {article.tags.map((tag, index) => (
                            <View 
                                key={index}
                                className="bg-gray-100 rounded-full px-3 py-1.5 mr-2 mb-2"
                            >
                                <Text className="text-sm text-gray-600">#{tag}</Text>
                            </View>
                        ))}
                    </View>

                    {/* Engagement */}
                    <View className="flex-row items-center justify-center mt-8 mb-4">
                        <TouchableOpacity className="flex-row items-center bg-red-50 px-6 py-3 rounded-full mr-3">
                            <MaterialCommunityIcons name="heart-outline" size={22} color="#EF4444" />
                            <Text className="text-red-500 font-semibold ml-2">{article.likeCount}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity className="flex-row items-center bg-gray-100 px-6 py-3 rounded-full">
                            <MaterialCommunityIcons name="share-variant" size={22} color="#6B7280" />
                            <Text className="text-gray-600 font-semibold ml-2">Share</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}
