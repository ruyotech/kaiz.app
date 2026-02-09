import { logger } from '../../utils/logger';
import React, { useState, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    ScrollView,
    TextInput,
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Ionicons } from '@expo/vector-icons';
import { TaskTemplate } from '../../types/models';
import { TemplateCard, LIFE_WHEEL_CONFIG } from './TemplateCard';
import { useToggleTemplateFavorite } from '../../hooks/queries';
import { useTranslation } from '../../hooks';
import { useThemeContext } from '../../providers/ThemeProvider';

interface TemplateListProps {
    templates: TaskTemplate[];
    onTemplatePress?: (template: TaskTemplate) => void;
    onTemplateUse?: (template: TaskTemplate) => void;
    onRefresh?: () => Promise<void>;
    loading?: boolean;
    showFilters?: boolean;
    showSearch?: boolean;
    emptyMessage?: string;
    compact?: boolean;
}

type FilterTab = 'all' | 'task' | 'event';

const LIFE_WHEEL_AREAS = [
    { id: 'all', name: 'All', emoji: '🎯' },
    { id: 'life-health', name: 'Health', emoji: '💪' },
    { id: 'life-career', name: 'Career', emoji: '💼' },
    { id: 'life-finance', name: 'Finance', emoji: '💰' },
    { id: 'life-family', name: 'Family', emoji: '👨‍👩‍👧‍👦' },
    { id: 'life-romance', name: 'Romance', emoji: '❤️' },
    { id: 'life-friends', name: 'Friends', emoji: '👥' },
    { id: 'life-growth', name: 'Growth', emoji: '📚' },
    { id: 'life-fun', name: 'Fun', emoji: '🎉' },
    { id: 'life-environment', name: 'Environment', emoji: '🌍' },
];

export function TemplateList({
    templates,
    onTemplatePress,
    onTemplateUse,
    onRefresh,
    loading = false,
    showFilters = true,
    showSearch = true,
    emptyMessage = 'No templates found',
    compact = false,
}: TemplateListProps) {
    const { t } = useTranslation();
    const { colors, isDark } = useThemeContext();
    const toggleFavoriteMutation = useToggleTemplateFavorite();
    
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedType, setSelectedType] = useState<FilterTab>('all');
    const [selectedArea, setSelectedArea] = useState<string>('all');
    const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const handleRefresh = useCallback(async () => {
        if (onRefresh) {
            setRefreshing(true);
            await onRefresh();
            setRefreshing(false);
        }
    }, [onRefresh]);

    const handleFavoritePress = useCallback(async (templateId: string) => {
        try {
            await toggleFavoriteMutation.mutateAsync(templateId);
        } catch (error) {
            logger.error('Failed to toggle favorite:', error);
        }
    }, [toggleFavorite]);

    // Filtered templates
    const filteredTemplates = useMemo(() => {
        let result = [...templates];

        // Search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter(t =>
                t.name.toLowerCase().includes(query) ||
                t.description?.toLowerCase().includes(query) ||
                t.tags?.some(tag => tag.toLowerCase().includes(query)) ||
                t.userTags?.some(tag => tag.toLowerCase().includes(query))
            );
        }

        // Type filter
        if (selectedType !== 'all') {
            result = result.filter(t => t.type === selectedType);
        }

        // Life wheel area filter
        if (selectedArea !== 'all') {
            result = result.filter(t => t.defaultLifeWheelAreaId === selectedArea);
        }

        // Favorites filter
        if (showFavoritesOnly) {
            result = result.filter(t => t.isFavorite);
        }

        return result;
    }, [templates, searchQuery, selectedType, selectedArea, showFavoritesOnly]);

    const renderFilterPills = () => (
        <View className="mb-4">
            {/* Type Tabs */}
            <View 
                className="flex-row mb-3 rounded-xl p-1"
                style={{ backgroundColor: colors.backgroundSecondary }}
            >
                {[
                    { key: 'all', label: 'All' },
                    { key: 'task', label: '✅ Tasks' },
                    { key: 'event', label: '📅 Events' },
                ].map((tab) => (
                    <TouchableOpacity
                        key={tab.key}
                        onPress={() => setSelectedType(tab.key as FilterTab)}
                        className="flex-1 py-2 rounded-lg items-center"
                        style={{
                            backgroundColor: selectedType === tab.key ? colors.card : 'transparent',
                            ...(selectedType === tab.key ? { shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 2 } : {})
                        }}
                    >
                        <Text
                            className="font-medium"
                            style={{ color: selectedType === tab.key ? colors.primary : colors.textSecondary }}
                        >
                            {tab.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Life Wheel Area Pills */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="mb-3"
            >
                {LIFE_WHEEL_AREAS.map((area) => {
                    const isSelected = selectedArea === area.id;
                    const config = area.id !== 'all' ? LIFE_WHEEL_CONFIG[area.id] : null;
                    
                    return (
                        <TouchableOpacity
                            key={area.id}
                            onPress={() => setSelectedArea(area.id)}
                            className="mr-2 px-3 py-2 rounded-full flex-row items-center"
                            style={{ 
                                backgroundColor: isSelected 
                                    ? (config?.color || colors.primary) 
                                    : colors.backgroundSecondary
                            }}
                        >
                            <Text className={isSelected ? '' : 'mr-1'}>{area.emoji}</Text>
                            <Text
                                className="ml-1 font-medium"
                                style={{ color: isSelected ? '#FFFFFF' : colors.textSecondary }}
                            >
                                {area.name}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );

    const renderSearchBar = () => (
        <View className="mb-4">
            <View 
                className="flex-row items-center rounded-xl px-4 py-3"
                style={{ backgroundColor: colors.inputBackground }}
            >
                <Ionicons name="search" size={20} color={colors.placeholder} />
                <TextInput
                    className="flex-1 ml-3"
                    style={{ color: colors.text }}
                    placeholder="Search templates..."
                    placeholderTextColor={colors.placeholder}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                        <Ionicons name="close-circle" size={20} color={colors.placeholder} />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );

    const renderEmpty = () => (
        <View className="items-center justify-center py-12">
            <Ionicons name="document-outline" size={64} color={colors.textTertiary} />
            <Text className="text-lg mt-4" style={{ color: colors.textSecondary }}>{emptyMessage}</Text>
            {searchQuery && (
                <TouchableOpacity
                    onPress={() => {
                        setSearchQuery('');
                        setSelectedArea('all');
                        setSelectedType('all');
                        setShowFavoritesOnly(false);
                    }}
                    className="mt-4 px-4 py-2 rounded-lg"
                    style={{ backgroundColor: isDark ? 'rgba(59, 130, 246, 0.2)' : '#DBEAFE' }}
                >
                    <Text className="font-medium" style={{ color: colors.primary }}>Clear Filters</Text>
                </TouchableOpacity>
            )}
        </View>
    );

    const renderTemplateItem = useCallback(
        ({ item }: { item: TaskTemplate }) => (
            <TemplateCard
                template={item}
                onPress={() => onTemplatePress?.(item)}
                onFavoritePress={() => handleFavoritePress(item.id)}
                onUsePress={() => onTemplateUse?.(item)}
                showActions={true}
                compact={compact}
            />
        ),
        [onTemplatePress, onTemplateUse, handleFavoritePress, compact]
    );

    if (loading && templates.length === 0) {
        return (
            <View className="flex-1 items-center justify-center py-12">
                <ActivityIndicator size="large" color={colors.primary} />
                <Text className="mt-4" style={{ color: colors.textSecondary }}>Loading templates...</Text>
            </View>
        );
    }

    return (
        <View className="flex-1">
            {showSearch && renderSearchBar()}
            {showFilters && renderFilterPills()}

            {/* Results Count */}
            <View className="flex-row justify-between items-center mb-3 px-1">
                <Text className="text-sm" style={{ color: colors.textSecondary }}>
                    {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''} found
                </Text>
            </View>

            <FlashList
                data={filteredTemplates}
                renderItem={renderTemplateItem}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
                ListEmptyComponent={renderEmpty}
                refreshControl={
                    onRefresh ? (
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={handleRefresh}
                            colors={['#3b82f6']}
                        />
                    ) : undefined
                }
            />
        </View>
    );
}

export default TemplateList;
