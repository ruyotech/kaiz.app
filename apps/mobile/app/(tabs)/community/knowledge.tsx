import { View, Text, ScrollView, TouchableOpacity, Image, RefreshControl } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCommunityStore } from '../../../store/communityStore';
import { ArticleCategory } from '../../../types/models';
import { toLocaleDateStringLocalized } from '../../../utils/localizedDate';
import { useTranslation } from '../../../hooks/useTranslation';
import { useThemeContext } from '../../../providers/ThemeProvider';

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
    const { colors, isDark } = useThemeContext();
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
        const styles: Record<string, { bgLight: string; bgDark: string; textLight: string; textDark: string }> = {
            feature: { bgLight: '#F3E8FF', bgDark: 'rgba(147, 51, 234, 0.2)', textLight: '#7E22CE', textDark: '#C4B5FD' },
            strategy: { bgLight: '#DBEAFE', bgDark: 'rgba(59, 130, 246, 0.2)', textLight: '#1D4ED8', textDark: '#93C5FD' },
            productivity: { bgLight: '#FEF3C7', bgDark: 'rgba(245, 158, 11, 0.2)', textLight: '#B45309', textDark: '#FCD34D' },
            wellness: { bgLight: '#DCFCE7', bgDark: 'rgba(34, 197, 94, 0.2)', textLight: '#15803D', textDark: '#86EFAC' },
            announcement: { bgLight: '#FEE2E2', bgDark: 'rgba(239, 68, 68, 0.2)', textLight: '#B91C1C', textDark: '#FCA5A5' },
            finance: { bgLight: '#D1FAE5', bgDark: 'rgba(16, 185, 129, 0.2)', textLight: '#047857', textDark: '#6EE7B7' },
        };
        const style = styles[category] || { bgLight: '#F3F4F6', bgDark: 'rgba(107, 114, 128, 0.2)', textLight: '#374151', textDark: '#9CA3AF' };
        return { bg: isDark ? style.bgDark : style.bgLight, text: isDark ? style.textDark : style.textLight };
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
        <View className="flex-1" style={{ backgroundColor: colors.background }}>
            {/* Header */}
            <SafeAreaView edges={['top']} style={{ backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                <View className="px-4 py-3">
                    <View className="flex-row items-center">
                        <TouchableOpacity onPress={() => router.back()} className="mr-3">
                            <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
                        </TouchableOpacity>
                        <View className="flex-1">
                            <Text className="text-xl font-bold" style={{ color: colors.text }}>Knowledge Hub</Text>
                            <Text className="text-xs" style={{ color: colors.textSecondary }}>Learn, explore, grow</Text>
                        </View>
                        <TouchableOpacity className="p-2 rounded-full" style={{ backgroundColor: colors.backgroundSecondary }}>
                            <MaterialCommunityIcons name="magnify" size={22} color={colors.textSecondary} />
                        </TouchableOpacity>
                    </View>
                    
                    {/* Tab Switcher */}
                    <View className="flex-row mt-4 rounded-xl p-1" style={{ backgroundColor: colors.backgroundSecondary }}>
                        {[
                            { key: 'articles', label: 'Articles', icon: 'newspaper' },
                            { key: 'wiki', label: 'Wiki', icon: 'book-open-variant' },
                            { key: 'releases', label: 'Releases', icon: 'tag' },
                        ].map((tab) => (
                            <TouchableOpacity
                                key={tab.key}
                                className="flex-1 flex-row items-center justify-center py-2 rounded-lg"
                                style={{
                                    backgroundColor: activeTab === tab.key ? colors.card : 'transparent',
                                    shadowColor: activeTab === tab.key ? '#000' : 'transparent',
                                    shadowOffset: { width: 0, height: 1 },
                                    shadowOpacity: activeTab === tab.key ? 0.1 : 0,
                                    shadowRadius: 2,
                                }}
                                onPress={() => setActiveTab(tab.key as any)}
                            >
                                <MaterialCommunityIcons 
                                    name={tab.icon as any} 
                                    size={16} 
                                    color={activeTab === tab.key ? '#9333EA' : colors.textSecondary} 
                                />
                                <Text 
                                    className="ml-1 text-sm font-medium"
                                    style={{
                                        color: activeTab === tab.key ? '#9333EA' : colors.textSecondary
                                    }}
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
                                    color={selectedCategory === cat.key ? '#fff' : colors.textSecondary} 
                                />
                                <Text 
                                    className="ml-1 text-sm font-medium"
                                    style={{
                                        color: selectedCategory === cat.key ? '#fff' : colors.textSecondary
                                    }}
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
                                    className="rounded-2xl mb-4 overflow-hidden"
                                    style={{ 
                                        backgroundColor: colors.card,
                                        borderWidth: 1,
                                        borderColor: colors.border,
                                        shadowColor: '#000',
                                        shadowOffset: { width: 0, height: 1 },
                                        shadowOpacity: 0.05,
                                        shadowRadius: 2,
                                    }}
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
                                            <View style={{ backgroundColor: catStyle.bg }} className="px-2 py-0.5 rounded-full">
                                                <Text className="text-xs font-medium" style={{ color: catStyle.text }}>
                                                    {article.category.charAt(0).toUpperCase() + article.category.slice(1)}
                                                </Text>
                                            </View>
                                            <Text className="text-xs ml-2" style={{ color: colors.textTertiary }}>
                                                {getTimeAgo(article.publishedAt)}
                                            </Text>
                                        </View>
                                        
                                        <Text className="text-lg font-bold mb-2" style={{ color: colors.text }}>
                                            {article.title}
                                        </Text>
                                        
                                        <Text className="text-sm mb-3" style={{ color: colors.textSecondary }} numberOfLines={2}>
                                            {article.excerpt}
                                        </Text>
                                        
                                        <View className="flex-row items-center">
                                            <Text className="text-xs" style={{ color: colors.textTertiary }}>
                                                {article.readTimeMinutes} min read
                                            </Text>
                                            <View className="flex-1" />
                                            <View className="flex-row items-center mr-3">
                                                <MaterialCommunityIcons name="eye-outline" size={14} color={colors.textTertiary} />
                                                <Text className="text-xs ml-1" style={{ color: colors.textTertiary }}>
                                                    {article.viewCount}
                                                </Text>
                                            </View>
                                            <View className="flex-row items-center">
                                                <MaterialCommunityIcons name="heart" size={14} color="#EF4444" />
                                                <Text className="text-xs ml-1" style={{ color: colors.textTertiary }}>
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
                    <Text className="text-sm mb-4" style={{ color: colors.textSecondary }}>
                        Quick reference for Kaiz concepts and terminology
                    </Text>
                    
                    {wikiEntries.map((entry, index) => (
                        <TouchableOpacity 
                            key={index}
                            className="rounded-xl p-4 mb-3"
                            style={{ 
                                backgroundColor: colors.card,
                                borderWidth: 1,
                                borderColor: colors.border,
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 1 },
                                shadowOpacity: 0.05,
                                shadowRadius: 2,
                            }}
                        >
                            <View className="flex-row items-start">
                                <View 
                                    className="w-10 h-10 rounded-xl items-center justify-center mr-3"
                                    style={{ backgroundColor: isDark ? 'rgba(147, 51, 234, 0.2)' : '#F3E8FF' }}
                                >
                                    <MaterialCommunityIcons name="book-open-page-variant" size={20} color="#9333EA" />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-base font-semibold mb-1" style={{ color: colors.text }}>
                                        {entry.term}
                                    </Text>
                                    <Text className="text-sm" style={{ color: colors.textSecondary }}>
                                        {entry.definition}
                                    </Text>
                                </View>
                                <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textTertiary} />
                            </View>
                        </TouchableOpacity>
                    ))}
                    
                    <TouchableOpacity className="flex-row items-center justify-center py-4">
                        <MaterialCommunityIcons name="plus-circle" size={20} color="#9333EA" />
                        <Text className="font-medium ml-2" style={{ color: '#9333EA' }}>View All Terms</Text>
                    </TouchableOpacity>
                </ScrollView>
            )}

            {activeTab === 'releases' && (
                <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
                    {releaseNotes.map((release, index) => (
                        <View 
                            key={index}
                            className="rounded-2xl p-4 mb-4"
                            style={{ 
                                backgroundColor: colors.card,
                                borderWidth: 1,
                                borderColor: colors.border,
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 1 },
                                shadowOpacity: 0.05,
                                shadowRadius: 2,
                            }}
                        >
                            <View className="flex-row items-center mb-3">
                                <View className="bg-purple-600 px-3 py-1 rounded-full">
                                    <Text className="text-white text-sm font-bold">v{release.version}</Text>
                                </View>
                                <Text className="text-sm ml-3" style={{ color: colors.textTertiary }}>{release.date}</Text>
                            </View>
                            
                            <Text className="text-lg font-bold mb-3" style={{ color: colors.text }}>
                                {release.title}
                            </Text>
                            
                            {release.changes.map((change, idx) => (
                                <View key={idx} className="flex-row items-start mb-2">
                                    <View 
                                        className="px-2 py-0.5 rounded mr-2"
                                        style={{
                                            backgroundColor: change.type === 'feature' 
                                                ? (isDark ? 'rgba(34, 197, 94, 0.2)' : '#DCFCE7')
                                                : change.type === 'improvement' 
                                                ? (isDark ? 'rgba(59, 130, 246, 0.2)' : '#DBEAFE')
                                                : (isDark ? 'rgba(245, 158, 11, 0.2)' : '#FEF3C7')
                                        }}
                                    >
                                        <Text 
                                            className="text-xs font-medium"
                                            style={{
                                                color: change.type === 'feature' 
                                                    ? (isDark ? '#86EFAC' : '#15803D')
                                                    : change.type === 'improvement' 
                                                    ? (isDark ? '#93C5FD' : '#1D4ED8')
                                                    : (isDark ? '#FCD34D' : '#B45309')
                                            }}
                                        >
                                            {change.type.charAt(0).toUpperCase() + change.type.slice(1)}
                                        </Text>
                                    </View>
                                    <Text className="text-sm flex-1" style={{ color: colors.textSecondary }}>{change.text}</Text>
                                </View>
                            ))}
                        </View>
                    ))}
                </ScrollView>
            )}
        </View>
    );
}
