import { View, Text, ScrollView, TouchableOpacity, Image, RefreshControl } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCommunityStore } from '../../../store/communityStore';
import { ArticleCategory } from '../../../types/models';
import { toLocaleDateStringLocalized } from '../../../utils/localizedDate';
import { useTranslation } from '../../../hooks/useTranslation';

const CATEGORIES: { key: ArticleCategory | 'all'; label: string; icon: string }[] = [
    { key: 'all', label: 'All', icon: 'view-grid' },
    { key: 'feature', label: 'Features', icon: 'star' },
    { key: 'strategy', label: 'Strategy', icon: 'chess-knight' },
    { key: 'productivity', label: 'Productivity', icon: 'lightning-bolt' },
    { key: 'wellness', label: 'Wellness', icon: 'heart' },
    { key: 'announcement', label: 'News', icon: 'newspaper' },
];

export default function KnowledgeHubScreen() {
    const router = useRouter();
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState<'articles' | 'wiki' | 'releases'>('articles');
    
    const { articles, fetchArticles, loading } = useCommunityStore();

    useEffect(() => {
        fetchArticles(selectedCategory === 'all' ? undefined : selectedCategory);
    }, [selectedCategory]);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchArticles(selectedCategory === 'all' ? undefined : selectedCategory);
        setRefreshing(false);
    };

    const getTimeAgo = (timestamp: string) => {
        const now = new Date();
        const then = new Date(timestamp);
        const diffDays = Math.floor((now.getTime() - then.getTime()) / 86400000);
        
        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays}d ago`;
        return toLocaleDateStringLocalized(timestamp, { month: 'short', day: 'numeric' });
    };

    const getCategoryStyle = (category: string) => {
        const styles: Record<string, { bg: string; text: string }> = {
            feature: { bg: 'bg-purple-100', text: 'text-purple-700' },
            strategy: { bg: 'bg-blue-100', text: 'text-blue-700' },
            productivity: { bg: 'bg-amber-100', text: 'text-amber-700' },
            wellness: { bg: 'bg-green-100', text: 'text-green-700' },
            announcement: { bg: 'bg-red-100', text: 'text-red-700' },
            finance: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
        };
        return styles[category] || { bg: 'bg-gray-100', text: 'text-gray-700' };
    };

    // Mock wiki entries
    const wikiEntries = [
        { term: 'Sprint', definition: 'A one-week cycle for planning and executing tasks', category: 'glossary' },
        { term: 'Velocity', definition: 'Your average completed story points per sprint', category: 'glossary' },
        { term: 'Eisenhower Matrix', definition: 'A prioritization framework with 4 quadrants', category: 'glossary' },
        { term: 'Life Wheel', definition: 'The 9 dimensions that make up a balanced life', category: 'glossary' },
        { term: 'Epic', definition: 'A large goal broken into multiple sprint tasks', category: 'glossary' },
    ];

    // Mock release notes
    const releaseNotes = [
        { 
            version: '2.5.0', 
            title: 'Community Features Launch', 
            date: '2026-01-20',
            changes: [
                { type: 'feature', text: 'Community hub with Q&A forum' },
                { type: 'feature', text: 'Accountability partners' },
                { type: 'improvement', text: 'Faster sprint loading' },
            ]
        },
        { 
            version: '2.4.2', 
            title: 'Bug Fixes & Performance', 
            date: '2026-01-10',
            changes: [
                { type: 'fix', text: 'Fixed calendar sync issues' },
                { type: 'fix', text: 'Resolved notification delays' },
                { type: 'improvement', text: 'Memory optimization' },
            ]
        },
    ];

    return (
        <View className="flex-1 bg-gray-50">
            {/* Header */}
            <SafeAreaView edges={['top']} className="bg-white border-b border-gray-200">
                <View className="px-4 py-3">
                    <View className="flex-row items-center">
                        <TouchableOpacity onPress={() => router.back()} className="mr-3">
                            <MaterialCommunityIcons name="arrow-left" size={24} color="#374151" />
                        </TouchableOpacity>
                        <View className="flex-1">
                            <Text className="text-xl font-bold text-gray-900">Knowledge Hub</Text>
                            <Text className="text-xs text-gray-500">Learn, explore, grow</Text>
                        </View>
                        <TouchableOpacity className="bg-gray-100 p-2 rounded-full">
                            <MaterialCommunityIcons name="magnify" size={22} color="#6B7280" />
                        </TouchableOpacity>
                    </View>
                    
                    {/* Tab Switcher */}
                    <View className="flex-row mt-4 bg-gray-100 rounded-xl p-1">
                        {[
                            { key: 'articles', label: 'Articles', icon: 'newspaper' },
                            { key: 'wiki', label: 'Wiki', icon: 'book-open-variant' },
                            { key: 'releases', label: 'Releases', icon: 'tag' },
                        ].map((tab) => (
                            <TouchableOpacity
                                key={tab.key}
                                className={`flex-1 flex-row items-center justify-center py-2 rounded-lg ${
                                    activeTab === tab.key ? 'bg-white shadow-sm' : ''
                                }`}
                                onPress={() => setActiveTab(tab.key as any)}
                            >
                                <MaterialCommunityIcons 
                                    name={tab.icon as any} 
                                    size={16} 
                                    color={activeTab === tab.key ? '#9333EA' : '#6B7280'} 
                                />
                                <Text 
                                    className={`ml-1 text-sm font-medium ${
                                        activeTab === tab.key ? 'text-purple-600' : 'text-gray-500'
                                    }`}
                                >
                                    {tab.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </SafeAreaView>

            {activeTab === 'articles' && (
                <>
                    {/* Category Filter */}
                    <ScrollView 
                        horizontal 
                        showsHorizontalScrollIndicator={false}
                        className="bg-white border-b border-gray-100"
                        style={{ flexGrow: 0 }}
                        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12, alignItems: 'center' }}
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
                                    color={selectedCategory === cat.key ? '#fff' : '#6B7280'} 
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

                    {/* Articles List */}
                    <ScrollView 
                        className="flex-1"
                        contentContainerStyle={{ padding: 16 }}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                        }
                    >
                        {articles.map((article) => {
                            const catStyle = getCategoryStyle(article.category);
                            return (
                                <TouchableOpacity 
                                    key={article.id}
                                    className="bg-white rounded-2xl mb-4 overflow-hidden shadow-sm border border-gray-100"
                                    onPress={() => router.push({
                                        pathname: '/community/article',
                                        params: { id: article.id }
                                    } as any)}
                                >
                                    {article.coverImageUrl && (
                                        <Image 
                                            source={{ uri: article.coverImageUrl }}
                                            className="w-full h-40"
                                            resizeMode="cover"
                                        />
                                    )}
                                    <View className="p-4">
                                        <View className="flex-row items-center mb-2">
                                            <View className={`${catStyle.bg} px-2 py-0.5 rounded-full`}>
                                                <Text className={`text-xs font-medium ${catStyle.text}`}>
                                                    {article.category.charAt(0).toUpperCase() + article.category.slice(1)}
                                                </Text>
                                            </View>
                                            <Text className="text-xs text-gray-400 ml-2">
                                                {getTimeAgo(article.publishedAt)}
                                            </Text>
                                        </View>
                                        
                                        <Text className="text-lg font-bold text-gray-900 mb-2">
                                            {article.title}
                                        </Text>
                                        
                                        <Text className="text-sm text-gray-500 mb-3" numberOfLines={2}>
                                            {article.excerpt}
                                        </Text>
                                        
                                        <View className="flex-row items-center">
                                            <Text className="text-xs text-gray-400">
                                                {article.readTimeMinutes} min read
                                            </Text>
                                            <View className="flex-1" />
                                            <View className="flex-row items-center mr-3">
                                                <MaterialCommunityIcons name="eye-outline" size={14} color="#9CA3AF" />
                                                <Text className="text-xs text-gray-400 ml-1">
                                                    {article.viewCount}
                                                </Text>
                                            </View>
                                            <View className="flex-row items-center">
                                                <MaterialCommunityIcons name="heart" size={14} color="#EF4444" />
                                                <Text className="text-xs text-gray-400 ml-1">
                                                    {article.likeCount}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </>
            )}

            {activeTab === 'wiki' && (
                <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
                    <Text className="text-sm text-gray-500 mb-4">
                        Quick reference for Kaiz concepts and terminology
                    </Text>
                    
                    {wikiEntries.map((entry, index) => (
                        <TouchableOpacity 
                            key={index}
                            className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100"
                        >
                            <View className="flex-row items-start">
                                <View className="w-10 h-10 bg-purple-100 rounded-xl items-center justify-center mr-3">
                                    <MaterialCommunityIcons name="book-open-page-variant" size={20} color="#9333EA" />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-base font-semibold text-gray-900 mb-1">
                                        {entry.term}
                                    </Text>
                                    <Text className="text-sm text-gray-600">
                                        {entry.definition}
                                    </Text>
                                </View>
                                <MaterialCommunityIcons name="chevron-right" size={20} color="#9CA3AF" />
                            </View>
                        </TouchableOpacity>
                    ))}
                    
                    <TouchableOpacity className="flex-row items-center justify-center py-4">
                        <MaterialCommunityIcons name="plus-circle" size={20} color="#9333EA" />
                        <Text className="text-purple-600 font-medium ml-2">View All Terms</Text>
                    </TouchableOpacity>
                </ScrollView>
            )}

            {activeTab === 'releases' && (
                <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
                    {releaseNotes.map((release, index) => (
                        <View 
                            key={index}
                            className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-gray-100"
                        >
                            <View className="flex-row items-center mb-3">
                                <View className="bg-purple-600 px-3 py-1 rounded-full">
                                    <Text className="text-white text-sm font-bold">v{release.version}</Text>
                                </View>
                                <Text className="text-gray-400 text-sm ml-3">{release.date}</Text>
                            </View>
                            
                            <Text className="text-lg font-bold text-gray-900 mb-3">
                                {release.title}
                            </Text>
                            
                            {release.changes.map((change, idx) => (
                                <View key={idx} className="flex-row items-start mb-2">
                                    <View 
                                        className={`px-2 py-0.5 rounded mr-2 ${
                                            change.type === 'feature' ? 'bg-green-100' :
                                            change.type === 'improvement' ? 'bg-blue-100' :
                                            'bg-amber-100'
                                        }`}
                                    >
                                        <Text 
                                            className={`text-xs font-medium ${
                                                change.type === 'feature' ? 'text-green-700' :
                                                change.type === 'improvement' ? 'text-blue-700' :
                                                'text-amber-700'
                                            }`}
                                        >
                                            {change.type.charAt(0).toUpperCase() + change.type.slice(1)}
                                        </Text>
                                    </View>
                                    <Text className="text-sm text-gray-600 flex-1">{change.text}</Text>
                                </View>
                            ))}
                        </View>
                    ))}
                </ScrollView>
            )}
        </View>
    );
}
