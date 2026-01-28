import React, { useState, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    ScrollView,
    TextInput,
    TouchableOpacity,
    FlatList,
    RefreshControl,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TaskTemplate } from '../../types/models';
import { TemplateCard, LIFE_WHEEL_CONFIG } from './TemplateCard';
import { useTemplateStore } from '../../store/templateStore';
import { useTranslation } from '../../hooks';

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
    const { toggleFavorite } = useTemplateStore();
    
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
            await toggleFavorite(templateId);
        } catch (error) {
            console.error('Failed to toggle favorite:', error);
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
                t.tags?.some(tag => tag.toLowerCase().includes(query))
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
            <View className="flex-row mb-3 bg-gray-100 rounded-xl p-1">
                {[
                    { key: 'all', label: 'All' },
                    { key: 'task', label: '✅ Tasks' },
                    { key: 'event', label: '📅 Events' },
                ].map((tab) => (
                    <TouchableOpacity
                        key={tab.key}
                        onPress={() => setSelectedType(tab.key as FilterTab)}
                        className={`flex-1 py-2 rounded-lg items-center ${
                            selectedType === tab.key ? 'bg-white shadow-sm' : ''
                        }`}
                    >
                        <Text
                            className={`font-medium ${
                                selectedType === tab.key ? 'text-blue-600' : 'text-gray-600'
                            }`}
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
                            className={`mr-2 px-3 py-2 rounded-full flex-row items-center ${
                                isSelected ? '' : 'bg-gray-100'
                            }`}
                            style={isSelected ? { backgroundColor: config?.color || '#3b82f6' } : {}}
                        >
                            <Text className={isSelected ? '' : 'mr-1'}>{area.emoji}</Text>
                            <Text
                                className={`ml-1 font-medium ${
                                    isSelected ? 'text-white' : 'text-gray-700'
                                }`}
                            >
                                {area.name}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>

            {/* Favorites Toggle */}
            <TouchableOpacity
                onPress={() => setShowFavoritesOnly(!showFavoritesOnly)}
                className={`flex-row items-center self-start px-3 py-2 rounded-full ${
                    showFavoritesOnly ? 'bg-red-100' : 'bg-gray-100'
                }`}
            >
                <Ionicons
                    name={showFavoritesOnly ? 'heart' : 'heart-outline'}
                    size={18}
                    color={showFavoritesOnly ? '#ef4444' : '#6b7280'}
                />
                <Text
                    className={`ml-1 font-medium ${
                        showFavoritesOnly ? 'text-red-600' : 'text-gray-600'
                    }`}
                >
                    Favorites Only
                </Text>
            </TouchableOpacity>
        </View>
    );

    const renderSearchBar = () => (
        <View className="mb-4">
            <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-3">
                <Ionicons name="search" size={20} color="#6b7280" />
                <TextInput
                    className="flex-1 ml-3 text-gray-900"
                    placeholder="Search templates..."
                    placeholderTextColor="#9ca3af"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                        <Ionicons name="close-circle" size={20} color="#9ca3af" />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );

    const renderEmpty = () => (
        <View className="items-center justify-center py-12">
            <Ionicons name="document-outline" size={64} color="#d1d5db" />
            <Text className="text-gray-500 text-lg mt-4">{emptyMessage}</Text>
            {searchQuery && (
                <TouchableOpacity
                    onPress={() => {
                        setSearchQuery('');
                        setSelectedArea('all');
                        setSelectedType('all');
                        setShowFavoritesOnly(false);
                    }}
                    className="mt-4 px-4 py-2 bg-blue-100 rounded-lg"
                >
                    <Text className="text-blue-600 font-medium">Clear Filters</Text>
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
                <ActivityIndicator size="large" color="#3b82f6" />
                <Text className="text-gray-500 mt-4">Loading templates...</Text>
            </View>
        );
    }

    return (
        <View className="flex-1">
            {showSearch && renderSearchBar()}
            {showFilters && renderFilterPills()}

            {/* Results Count */}
            <View className="flex-row justify-between items-center mb-3 px-1">
                <Text className="text-gray-500 text-sm">
                    {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''} found
                </Text>
            </View>

            <FlatList
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
