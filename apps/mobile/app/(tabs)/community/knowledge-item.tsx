import { logger } from '../../../utils/logger';
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
            setItem(data as KnowledgeItem);
            // Record view using the item's ID
            if ((data as any)?.id) {
                await communityApi.recordKnowledgeItemView((data as any).id);
            }
        } catch (error) {
            logger.error('Failed to load knowledge item:', error);
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
            logger.error('Failed to mark as helpful:', error);
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

    // Comprehensive markdown renderer for mobile
    const renderContent = (content: string) => {
        if (!content) return null;
        
        const elements: React.ReactNode[] = [];
        let key = 0;
        
        // Split content into lines for processing
        const lines = content.split('\n');
        let i = 0;
        
        while (i < lines.length) {
            const line = lines[i];
            const trimmed = line.trim();
            
            // Skip empty lines
            if (!trimmed) {
                i++;
                continue;
            }
            
            // Code blocks (```)
            if (trimmed.startsWith('```')) {
                const codeLines: string[] = [];
                i++; // Skip opening ```
                while (i < lines.length && !lines[i].trim().startsWith('```')) {
                    codeLines.push(lines[i]);
                    i++;
                }
                i++; // Skip closing ```
                
                if (codeLines.length > 0) {
                    elements.push(
                        <ScrollView
                            key={key++}
                            horizontal
                            style={{
                                backgroundColor: '#18181b',
                                borderRadius: 8,
                                marginVertical: 10,
                                borderWidth: 1,
                                borderColor: '#333',
                            }}
                            contentContainerStyle={{ padding: 14, minWidth: '100%' }}
                            showsHorizontalScrollIndicator={true}
                        >
                            <Text
                                style={{
                                    color: '#e5e7eb',
                                    fontFamily: 'monospace',
                                    fontSize: 14,
                                    lineHeight: 20,
                                }}
                                selectable
                            >
                                {codeLines.map((codeLine, idx) => (
                                    <Text key={idx}>
                                        {codeLine.replace(/^\s+/, (s) => '\u00A0'.repeat(s.length))}
                                        {idx < codeLines.length - 1 ? '\n' : ''}
                                    </Text>
                                ))}
                            </Text>
                        </ScrollView>
                    );
                }
                continue;
            }
            
            // Tables (lines starting with |)
            if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
                const tableRows: string[][] = [];
                let hasHeader = false;
                
                while (i < lines.length && lines[i].trim().startsWith('|')) {
                    const row = lines[i].trim();
                    // Skip separator row (|---|---|)
                    if (row.match(/^\|[\s-:|]+\|$/)) {
                        hasHeader = tableRows.length > 0;
                        i++;
                        continue;
                    }
                    const cells = row.split('|').filter(c => c.trim() !== '').map(c => c.trim());
                    tableRows.push(cells);
                    i++;
                }
                
                if (tableRows.length > 0) {
                    elements.push(
                        <View 
                            key={key++} 
                            className="my-4 rounded-xl overflow-hidden"
                            style={{ backgroundColor: isDark ? '#1E293B' : '#F8FAFC', borderWidth: 1, borderColor: colors.border }}
                        >
                            {tableRows.map((row, rowIdx) => (
                                <View 
                                    key={rowIdx} 
                                    className="flex-row"
                                    style={{ 
                                        backgroundColor: rowIdx === 0 && hasHeader 
                                            ? (isDark ? '#334155' : '#E2E8F0') 
                                            : 'transparent',
                                        borderBottomWidth: rowIdx < tableRows.length - 1 ? 1 : 0,
                                        borderBottomColor: colors.border,
                                    }}
                                >
                                    {row.map((cell, cellIdx) => (
                                        <View 
                                            key={cellIdx} 
                                            className="flex-1 px-3 py-2"
                                            style={{ 
                                                borderRightWidth: cellIdx < row.length - 1 ? 1 : 0,
                                                borderRightColor: colors.border,
                                            }}
                                        >
                                            <Text 
                                                className={`text-sm ${rowIdx === 0 && hasHeader ? 'font-semibold' : ''}`}
                                                style={{ color: colors.text }}
                                            >
                                                {renderInlineText(cell)}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            ))}
                        </View>
                    );
                }
                continue;
            }
            
            // Blockquotes (>)
            if (trimmed.startsWith('>')) {
                const quoteLines: string[] = [];
                while (i < lines.length && lines[i].trim().startsWith('>')) {
                    quoteLines.push(lines[i].trim().replace(/^>\s*/, ''));
                    i++;
                }
                elements.push(
                    <View 
                        key={key++} 
                        className="my-3 pl-4 py-2"
                        style={{ 
                            borderLeftWidth: 4, 
                            borderLeftColor: '#9333EA',
                            backgroundColor: isDark ? 'rgba(147, 51, 234, 0.1)' : '#FAF5FF',
                        }}
                    >
                        <Text className="text-base italic" style={{ color: colors.textSecondary }}>
                            {quoteLines.map(l => renderInlineText(l)).join(' ')}
                        </Text>
                    </View>
                );
                continue;
            }
            
            // H1 (#)
            if (trimmed.startsWith('# ') && !trimmed.startsWith('## ')) {
                elements.push(
                    <Text key={key++} className="text-2xl font-bold mt-4 mb-3" style={{ color: colors.text }}>
                        {trimmed.replace('# ', '')}
                    </Text>
                );
                i++;
                continue;
            }
            
            // H2 (##)
            if (trimmed.startsWith('## ')) {
                elements.push(
                    <Text key={key++} className="text-xl font-bold mt-5 mb-3" style={{ color: colors.text }}>
                        {renderInlineText(trimmed.replace('## ', ''))}
                    </Text>
                );
                i++;
                continue;
            }
            
            // H3 (###)
            if (trimmed.startsWith('### ')) {
                elements.push(
                    <Text key={key++} className="text-lg font-semibold mt-4 mb-2" style={{ color: colors.text }}>
                        {renderInlineText(trimmed.replace('### ', ''))}
                    </Text>
                );
                i++;
                continue;
            }
            
            // Unordered lists (- or *)
            if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                const listItems: string[] = [];
                while (i < lines.length && (lines[i].trim().startsWith('- ') || lines[i].trim().startsWith('* '))) {
                    listItems.push(lines[i].trim().replace(/^[-*]\s*/, ''));
                    i++;
                }
                elements.push(
                    <View key={key++} className="my-2 ml-2">
                        {listItems.map((item, idx) => (
                            <View key={idx} className="flex-row mb-2">
                                <Text style={{ color: '#9333EA' }} className="mr-3 text-base">•</Text>
                                <Text style={{ color: colors.textSecondary, flex: 1 }} className="text-base leading-6">
                                    {renderInlineText(item)}
                                </Text>
                            </View>
                        ))}
                    </View>
                );
                continue;
            }
            
            // Ordered lists (1. 2. 3.)
            if (/^\d+\.\s/.test(trimmed)) {
                const listItems: { num: string; text: string }[] = [];
                while (i < lines.length && /^\d+\.\s/.test(lines[i].trim())) {
                    const match = lines[i].trim().match(/^(\d+)\.\s*(.*)/);
                    if (match) {
                        listItems.push({ num: match[1], text: match[2] });
                    }
                    i++;
                }
                elements.push(
                    <View key={key++} className="my-2 ml-2">
                        {listItems.map((item, idx) => (
                            <View key={idx} className="flex-row mb-2">
                                <Text style={{ color: '#9333EA' }} className="mr-3 text-base font-medium w-6">{item.num}.</Text>
                                <Text style={{ color: colors.textSecondary, flex: 1 }} className="text-base leading-6">
                                    {renderInlineText(item.text)}
                                </Text>
                            </View>
                        ))}
                    </View>
                );
                continue;
            }
            
            // Horizontal rule (---)
            if (trimmed.match(/^[-_*]{3,}$/)) {
                elements.push(
                    <View key={key++} className="my-4" style={{ height: 1, backgroundColor: colors.border }} />
                );
                i++;
                continue;
            }
            
            // Regular paragraph
            elements.push(
                <Text key={key++} className="text-base mb-3 leading-7" style={{ color: colors.textSecondary }}>
                    {renderInlineText(trimmed)}
                </Text>
            );
            i++;
        }
        
        return elements;
    };
    
    // Helper to render inline formatting (bold, italic, code, links)
    const renderInlineText = (text: string): string => {
        return text
            .replace(/\*\*(.*?)\*\*/g, '$1')  // Bold → plain (React Native doesn't support nested Text styling easily)
            .replace(/\*(.*?)\*/g, '$1')      // Italic → plain
            .replace(/`([^`]+)`/g, '$1')      // Inline code → plain
            .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1'); // Links → just text
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
                {item.tags && (
                    <View className="flex-row flex-wrap gap-2 mb-4">
                        {(typeof item.tags === 'string' ? JSON.parse(item.tags || '[]') : item.tags).filter((t: string) => t).map((tag: string, index: number) => (
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
