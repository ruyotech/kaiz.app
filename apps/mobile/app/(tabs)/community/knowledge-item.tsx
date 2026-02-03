import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeContext } from '../../../providers/ThemeProvider';
import { communityApi } from '../../../services/api';

interface KnowledgeItem {
    id: string;
    title: string;
    summary: string;
    content: string;
    icon: string;
    difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
    readTimeMinutes: number;
    viewCount: number;
    helpfulCount: number;
    featured: boolean;
    categoryName?: string;
    tags?: string[];
}

export default function KnowledgeItemScreen() {
    const router = useRouter();
    const { slug } = useLocalSearchParams<{ slug: string }>();
    const { colors, isDark } = useThemeContext();
    const [item, setItem] = useState<KnowledgeItem | null>(null);
    const [loading, setLoading] = useState(true);
    const [markedHelpful, setMarkedHelpful] = useState(false);

    useEffect(() => {
        loadItem();
    }, [slug]);

    const loadItem = async () => {
        if (!slug) return;
        setLoading(true);
        try {
            const data = await communityApi.getKnowledgeItemBySlug(slug);
            setItem(data);
            // Record view using the item's ID
            if (data?.id) {
                await communityApi.recordKnowledgeItemView(data.id);
            }
        } catch (error) {
            console.error('Failed to load knowledge item:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkHelpful = async () => {
        if (!item?.id || markedHelpful) return;
        try {
            await communityApi.markKnowledgeItemHelpful(item.id);
            setMarkedHelpful(true);
            setItem({ ...item, helpfulCount: item.helpfulCount + 1 });
        } catch (error) {
            console.error('Failed to mark as helpful:', error);
        }
    };

    const getDifficultyStyle = (difficulty: string) => {
        const styles: Record<string, { bg: string; text: string; icon: string }> = {
            BEGINNER: { bg: '#DCFCE7', text: '#15803D', icon: '🌱' },
            INTERMEDIATE: { bg: '#FEF3C7', text: '#B45309', icon: '⚡' },
            ADVANCED: { bg: '#FEE2E2', text: '#B91C1C', icon: '🔥' },
        };
        return styles[difficulty] || styles.BEGINNER;
    };

    // Simple markdown-like text renderer
    const renderContent = (content: string) => {
        if (!content) return null;
        
        // Split by paragraphs (double newlines)
        const paragraphs = content.split(/\n\n+/);
        
        return paragraphs.map((paragraph, index) => {
            const trimmed = paragraph.trim();
            if (!trimmed) return null;
            
            // Check if it's a heading
            if (trimmed.startsWith('## ')) {
                return (
                    <Text 
                        key={index} 
                        className="text-lg font-bold mt-4 mb-2"
                        style={{ color: colors.text }}
                    >
                        {trimmed.replace('## ', '')}
                    </Text>
                );
            }
            
            if (trimmed.startsWith('### ')) {
                return (
                    <Text 
                        key={index} 
                        className="text-base font-semibold mt-3 mb-2"
                        style={{ color: colors.text }}
                    >
                        {trimmed.replace('### ', '')}
                    </Text>
                );
            }
            
            // Check if it's a list item
            if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                const items = trimmed.split('\n').filter(line => line.trim());
                return (
                    <View key={index} className="mb-3">
                        {items.map((item, idx) => (
                            <View key={idx} className="flex-row mb-1">
                                <Text style={{ color: '#9333EA' }} className="mr-2">•</Text>
                                <Text style={{ color: colors.textSecondary, flex: 1 }}>
                                    {item.replace(/^[-*]\s*/, '').replace(/\*\*(.*?)\*\*/g, '$1')}
                                </Text>
                            </View>
                        ))}
                    </View>
                );
            }
            
            // Regular paragraph - remove markdown bold markers for display
            const cleanText = trimmed
                .replace(/\*\*(.*?)\*\*/g, '$1')  // Remove bold markers
                .replace(/\*(.*?)\*/g, '$1');      // Remove italic markers
            
            return (
                <Text 
                    key={index} 
                    className="text-base mb-3 leading-6"
                    style={{ color: colors.textSecondary }}
                >
                    {cleanText}
                </Text>
            );
        });
    };

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center" style={{ backgroundColor: colors.background }}>
                <ActivityIndicator size="large" color="#9333EA" />
            </View>
        );
    }

    if (!item) {
        return (
            <View className="flex-1 items-center justify-center" style={{ backgroundColor: colors.background }}>
                <MaterialCommunityIcons name="alert-circle-outline" size={48} color={colors.textTertiary} />
                <Text className="mt-4 text-base" style={{ color: colors.textSecondary }}>
                    Item not found
                </Text>
                <TouchableOpacity 
                    className="mt-4 px-6 py-2 rounded-full"
                    style={{ backgroundColor: '#9333EA' }}
                    onPress={() => router.back()}
                >
                    <Text className="text-white font-medium">Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const diffStyle = getDifficultyStyle(item.difficulty);

    return (
        <View className="flex-1" style={{ backgroundColor: colors.background }}>
            {/* Header */}
            <SafeAreaView edges={['top']} style={{ backgroundColor: colors.card }}>
                <View className="px-4 py-3 flex-row items-center border-b" style={{ borderColor: colors.border }}>
                    <TouchableOpacity onPress={() => router.back()} className="mr-3">
                        <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <View className="flex-1">
                        <Text className="text-lg font-bold" style={{ color: colors.text }} numberOfLines={1}>
                            {item.title}
                        </Text>
                        {item.categoryName && (
                            <Text className="text-xs" style={{ color: colors.textSecondary }}>
                                {item.categoryName}
                            </Text>
                        )}
                    </View>
                </View>
            </SafeAreaView>

            <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
                {/* Icon & Title Card */}
                <View 
                    className="rounded-2xl p-5 mb-4"
                    style={{ 
                        backgroundColor: isDark ? 'rgba(147, 51, 234, 0.15)' : '#F3E8FF',
                        borderWidth: 1,
                        borderColor: isDark ? 'rgba(147, 51, 234, 0.3)' : '#E9D5FF',
                    }}
                >
                    <View className="flex-row items-center mb-3">
                        <Text className="text-4xl mr-3">{item.icon || '📚'}</Text>
                        <View className="flex-1">
                            <Text className="text-xl font-bold" style={{ color: colors.text }}>
                                {item.title}
                            </Text>
                        </View>
                    </View>
                    
                    <Text className="text-base mb-4" style={{ color: colors.textSecondary }}>
                        {item.summary}
                    </Text>
                    
                    {/* Metadata Row */}
                    <View className="flex-row flex-wrap gap-2">
                        <View style={{ backgroundColor: diffStyle.bg }} className="flex-row items-center px-3 py-1 rounded-full">
                            <Text className="mr-1">{diffStyle.icon}</Text>
                            <Text className="text-xs font-medium" style={{ color: diffStyle.text }}>
                                {item.difficulty}
                            </Text>
                        </View>
                        <View className="flex-row items-center px-3 py-1 rounded-full" style={{ backgroundColor: colors.backgroundSecondary }}>
                            <MaterialCommunityIcons name="clock-outline" size={14} color={colors.textSecondary} />
                            <Text className="text-xs ml-1" style={{ color: colors.textSecondary }}>
                                {item.readTimeMinutes} min read
                            </Text>
                        </View>
                        <View className="flex-row items-center px-3 py-1 rounded-full" style={{ backgroundColor: colors.backgroundSecondary }}>
                            <MaterialCommunityIcons name="eye-outline" size={14} color={colors.textSecondary} />
                            <Text className="text-xs ml-1" style={{ color: colors.textSecondary }}>
                                {item.viewCount} views
                            </Text>
                        </View>
                        {item.featured && (
                            <View className="flex-row items-center px-3 py-1 rounded-full bg-yellow-100">
                                <Text className="text-xs font-medium text-yellow-700">⭐ Featured</Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Tags */}
                {item.tags && item.tags.length > 0 && (
                    <View className="flex-row flex-wrap gap-2 mb-4">
                        {item.tags.map((tag: string, index: number) => (
                            <View 
                                key={index}
                                className="px-3 py-1 rounded-full"
                                style={{ backgroundColor: colors.backgroundSecondary }}
                            >
                                <Text className="text-xs" style={{ color: colors.textSecondary }}>
                                    #{tag}
                                </Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* Content */}
                <View className="rounded-xl p-4" style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }}>
                    {renderContent(item.content || 'No content available.')}
                </View>

                {/* Helpful Section */}
                <View 
                    className="rounded-xl p-4 mt-4 mb-8"
                    style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }}
                >
                    <Text className="text-center text-base mb-3" style={{ color: colors.text }}>
                        Was this helpful?
                    </Text>
                    <View className="flex-row justify-center gap-3">
                        <TouchableOpacity 
                            className="flex-row items-center px-6 py-3 rounded-xl"
                            style={{ 
                                backgroundColor: markedHelpful ? '#DCFCE7' : colors.backgroundSecondary,
                                borderWidth: 1,
                                borderColor: markedHelpful ? '#86EFAC' : colors.border,
                            }}
                            onPress={handleMarkHelpful}
                            disabled={markedHelpful}
                        >
                            <MaterialCommunityIcons 
                                name={markedHelpful ? 'thumb-up' : 'thumb-up-outline'} 
                                size={20} 
                                color={markedHelpful ? '#15803D' : colors.textSecondary} 
                            />
                            <Text 
                                className="ml-2 font-medium"
                                style={{ color: markedHelpful ? '#15803D' : colors.textSecondary }}
                            >
                                {markedHelpful ? 'Thanks!' : 'Yes, helpful'} ({item.helpfulCount})
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}
