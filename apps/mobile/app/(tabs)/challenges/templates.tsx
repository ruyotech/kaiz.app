import { logger } from '../../../utils/logger';
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Container } from '../../../components/layout/Container';
import { ScreenHeader } from '../../../components/layout/ScreenHeader';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { EmptyState } from '../../../components/ui/EmptyState';
import { useChallengeStore } from '../../../store/challengeStore';
import { ChallengeTemplate } from '../../../types/models';
import { useThemeContext } from '../../../providers/ThemeProvider';

const LIFE_WHEEL_FILTERS = [
    { id: 'all', name: 'All', color: '#6b7280' },
    { id: 'life-health', name: 'Health', color: '#10b981' },
    { id: 'life-career', name: 'Career', color: '#3b82f6' },
    { id: 'life-finance', name: 'Finance', color: '#f59e0b' },
    { id: 'life-family', name: 'Family', color: '#ec4899' },
    { id: 'life-romance', name: 'Romance', color: '#ef4444' },
    { id: 'life-friends', name: 'Friends', color: '#8b5cf6' },
    { id: 'life-growth', name: 'Growth', color: '#06b6d4' },
    { id: 'life-fun', name: 'Fun', color: '#f97316' },
    { id: 'life-environment', name: 'Environment', color: '#84cc16' },
];

export default function TemplatesScreen() {
    const router = useRouter();
    const { colors, isDark } = useThemeContext();
    const { templates, fetchTemplates, createChallengeFromTemplate, loading } = useChallengeStore();
    const [selectedFilter, setSelectedFilter] = useState('all');
    const [refreshing, setRefreshing] = useState(false);
    
    useEffect(() => {
        fetchTemplates();
    }, []);
    
    const onRefresh = async () => {
        setRefreshing(true);
        await fetchTemplates();
        setRefreshing(false);
    };
    
    const safeTemplates = templates || [];
    const filteredTemplates = selectedFilter === 'all'
        ? safeTemplates
        : safeTemplates.filter(t => t.lifeWheelAreaId === selectedFilter);
    
    const sortedTemplates = [...filteredTemplates].sort((a, b) => (b.popularityScore ?? 0) - (a.popularityScore ?? 0));
    
    const handleStartChallenge = async (template: ChallengeTemplate) => {
        try {
            const newChallenge = await createChallengeFromTemplate(template.id);
            router.push(`/(tabs)/challenges/challenge/${newChallenge.id}`);
        } catch (error) {
            logger.error('Failed to start challenge:', error);
        }
    };
    
    const getDifficultyStyle = (difficulty: string) => {
        switch (difficulty) {
            case 'easy': return { 
                bg: isDark ? 'rgba(16, 185, 129, 0.2)' : '#D1FAE5', 
                text: isDark ? '#6EE7B7' : '#047857' 
            };
            case 'moderate': return { 
                bg: isDark ? 'rgba(245, 158, 11, 0.2)' : '#FEF3C7', 
                text: isDark ? '#FCD34D' : '#B45309' 
            };
            case 'hard': return { 
                bg: isDark ? 'rgba(239, 68, 68, 0.2)' : '#FEE2E2', 
                text: isDark ? '#FCA5A5' : '#B91C1C' 
            };
            default: return { 
                bg: colors.backgroundSecondary, 
                text: colors.textSecondary 
            };
        }
    };
    
    return (
        <Container safeArea={false}>
            <ScreenHeader
                title="Challenge Templates"
                subtitle="Start with proven challenges"
                useSafeArea={false}
            />
            
            {/* Life Wheel Filters */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="px-4 py-3 mb-2"
            >
                <View className="flex-row gap-2">
                    {LIFE_WHEEL_FILTERS.map(filter => (
                        <TouchableOpacity
                            key={filter.id}
                            onPress={() => setSelectedFilter(filter.id)}
                            className="px-3 py-1.5 rounded-full"
                            style={{
                                borderWidth: selectedFilter === filter.id ? 2 : 1,
                                borderColor: selectedFilter === filter.id ? filter.color : colors.border,
                                backgroundColor: selectedFilter === filter.id ? `${filter.color}20` : colors.backgroundSecondary,
                            }}
                        >
                            <Text
                                className="font-medium text-sm"
                                style={{
                                    color: selectedFilter === filter.id ? filter.color : colors.textSecondary,
                                }}
                            >
                                {filter.name}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
            
            <ScrollView
                className="flex-1 px-4"
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {sortedTemplates.length === 0 ? (
                    <EmptyState
                        icon="🎯"
                        title="No Templates Found"
                        message="Try selecting a different category"
                    />
                ) : (
                    sortedTemplates.map(template => (
                        <Card key={template.id} className="mb-4">
                            {/* Header */}
                            <View className="flex-row items-start mb-3">
                                <Text className="text-3xl mr-3">{template.icon}</Text>
                                <View className="flex-1">
                                    <Text className="text-lg font-bold mb-1" style={{ color: colors.text }}>{template.name}</Text>
                                    <Text className="text-sm mb-2" style={{ color: colors.textSecondary }}>
                                        {template.description}
                                    </Text>
                                    
                                    {/* Badges */}
                                    <View className="flex-row flex-wrap gap-2">
                                        <View 
                                            className="px-2 py-1 rounded-full"
                                            style={{ backgroundColor: getDifficultyStyle(template.difficulty).bg }}
                                        >
                                            <Text className="text-xs font-semibold" style={{ color: getDifficultyStyle(template.difficulty).text }}>
                                                {template.difficulty}
                                            </Text>
                                        </View>
                                        <Badge variant="default">
                                            {template.suggestedDuration} days
                                        </Badge>
                                        <Badge variant="info">
                                            ⭐ {template.popularityScore}
                                        </Badge>
                                    </View>
                                </View>
                            </View>
                            
                            {/* Details */}
                            <View 
                                className="rounded-lg p-3 mb-3"
                                style={{ backgroundColor: colors.backgroundSecondary }}
                            >
                                <View className="flex-row items-center mb-1">
                                    <Text className="text-sm" style={{ color: colors.textSecondary }}>
                                        📊 {template.metricType === 'count' && `${template.targetValue} ${template.unit}`}
                                        {template.metricType === 'time' && `${template.targetValue} ${template.unit}`}
                                        {template.metricType === 'yesno' && 'Yes/No tracking'}
                                        {template.metricType === 'streak' && 'Streak tracking'}
                                        {template.metricType === 'completion' && 'Completion milestones'}
                                    </Text>
                                </View>
                                <Text className="text-sm" style={{ color: colors.textSecondary }}>
                                    🔁 {template.recurrence.charAt(0).toUpperCase() + template.recurrence.slice(1)}
                                </Text>
                            </View>
                            
                            {/* Tags */}
                            {template.tags.length > 0 && (
                                <View className="flex-row flex-wrap gap-2 mb-3">
                                    {template.tags.map((tag, index) => (
                                        <Text key={index} className="text-xs" style={{ color: colors.textTertiary }}>
                                            #{tag}
                                        </Text>
                                    ))}
                                </View>
                            )}
                            
                            {/* Actions */}
                            <View className="flex-row gap-2">
                                <TouchableOpacity
                                    onPress={() => handleStartChallenge(template)}
                                    className="flex-1 rounded-lg py-3"
                                    style={{ backgroundColor: colors.primary }}
                                    disabled={loading}
                                >
                                    <Text className="text-white text-center font-semibold">
                                        {loading ? 'Starting...' : 'Start Challenge'}
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => router.push({
                                        pathname: '/(tabs)/challenges/create',
                                        params: { templateId: template.id }
                                    })}
                                    className="rounded-lg py-3 px-4"
                                    style={{ backgroundColor: colors.backgroundSecondary }}
                                >
                                    <Text className="text-center font-semibold" style={{ color: colors.textSecondary }}>
                                        Customize
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </Card>
                    ))
                )}
            </ScrollView>
        </Container>
    );
}
