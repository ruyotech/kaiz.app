import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StatusBar,
    FlatList,
    TextInput,
    RefreshControl,
    ActivityIndicator,
    ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { TaskTemplate } from '../../../types/models';
import { useTemplateStore } from '../../../store/templateStore';
import {
    TemplateDetailModal,
    CreateFromTemplateSheet,
} from '../../../components/templates';
import { LIFE_WHEEL_CONFIG } from '../../../components/templates/TemplateCard';
import { useTranslation } from '../../../hooks';

type SourceTab = 'global' | 'my' | 'favorites' | 'rated';

const LIFE_WHEEL_AREAS = [
    { id: 'all', name: 'All', emoji: '🎯', color: '#6b7280' },
    { id: 'lw-1', name: 'Health', emoji: '💪', color: '#10b981' },
    { id: 'lw-2', name: 'Career', emoji: '💼', color: '#3b82f6' },
    { id: 'lw-3', name: 'Finance', emoji: '💰', color: '#f59e0b' },
    { id: 'lw-4', name: 'Growth', emoji: '📚', color: '#8b5cf6' },
    { id: 'lw-5', name: 'Family & Romance', emoji: '❤️', color: '#ef4444' },
    { id: 'lw-6', name: 'Friends', emoji: '👥', color: '#ec4899' },
    { id: 'lw-7', name: 'Fun', emoji: '🎉', color: '#14b8a6' },
    { id: 'lw-8', name: 'Environment', emoji: '🌍', color: '#84cc16' },
];

export default function TemplatesScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { t } = useTranslation();
    const {
        globalTemplates,
        userTemplates,
        favoriteTemplates,
        loading,
        error,
        fetchAllTemplates,
        fetchGlobalTemplates,
        fetchUserTemplates,
        fetchFavoriteTemplates,
        toggleFavorite,
        cloneTemplate,
        clearError,
    } = useTemplateStore();

    // Combined filter state
    const [sourceTab, setSourceTab] = useState<SourceTab>('global');
    const [selectedArea, setSelectedArea] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [refreshing, setRefreshing] = useState(false);

    const [selectedTemplate, setSelectedTemplate] = useState<TaskTemplate | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showCreateSheet, setShowCreateSheet] = useState(false);
    const [templateForCreation, setTemplateForCreation] = useState<TaskTemplate | null>(null);

    useEffect(() => {
        fetchAllTemplates();
    }, []);

    // Get base templates based on source
    const baseTemplates = useMemo(() => {
        switch (sourceTab) {
            case 'global': return globalTemplates;
            case 'my': return userTemplates;
            case 'favorites': return favoriteTemplates;
            case 'rated': 
                // Combine all templates and filter by user rating
                const allTemplates = [...globalTemplates, ...userTemplates];
                const uniqueTemplates = allTemplates.filter((t, idx, arr) => 
                    arr.findIndex(x => x.id === t.id) === idx
                );
                return uniqueTemplates.filter(t => t.userRating && t.userRating > 0);
            default: return globalTemplates;
        }
    }, [sourceTab, globalTemplates, userTemplates, favoriteTemplates]);

    // Apply all filters
    const filteredTemplates = useMemo(() => {
        let result = [...baseTemplates];

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

        // Life wheel area filter
        if (selectedArea !== 'all') {
            result = result.filter(t => t.defaultLifeWheelAreaId === selectedArea);
        }

        return result;
    }, [baseTemplates, searchQuery, selectedArea]);

    const handleRefresh = useCallback(async () => {
        setRefreshing(true);
        switch (sourceTab) {
            case 'global':
                await fetchGlobalTemplates();
                break;
            case 'my':
                await fetchUserTemplates();
                break;
            case 'favorites':
                await fetchFavoriteTemplates();
                break;
        }
        setRefreshing(false);
    }, [sourceTab, fetchGlobalTemplates, fetchUserTemplates, fetchFavoriteTemplates]);

    const handleFavoritePress = useCallback(async (templateId: string) => {
        try {
            await toggleFavorite(templateId);
        } catch (error) {
            console.error('Failed to toggle favorite:', error);
        }
    }, [toggleFavorite]);

    const handleTemplatePress = (template: TaskTemplate) => {
        setSelectedTemplate(template);
        setShowDetailModal(true);
    };

    const handleTemplateUse = (template: TaskTemplate) => {
        setTemplateForCreation(template);
        setShowDetailModal(false);
        setShowCreateSheet(true);
    };

    const handleCloneTemplate = async (template: TaskTemplate) => {
        try {
            await cloneTemplate(template.id);
            setShowDetailModal(false);
            setSourceTab('my');
        } catch (error) {
            console.error('Failed to clone template:', error);
        }
    };

    const handleTaskCreated = (taskId: string) => {
        setShowCreateSheet(false);
        setTemplateForCreation(null);
        router.push(`/(tabs)/sdlc/task/${taskId}`);
    };

    const getEmptyMessage = () => {
        if (searchQuery) return 'No templates match your search';
        switch (sourceTab) {
            case 'global': return 'No global templates available';
            case 'my': return 'You haven\'t created any templates yet';
            case 'favorites': return 'Tap ❤️ on templates to add them here!';
            case 'rated': return 'Rate templates with ⭐ to see them here!';
            default: return 'No templates found';
        }
    };

    const getWheelConfig = (areaId: string) => {
        return LIFE_WHEEL_CONFIG[areaId] || { color: '#6b7280', name: 'General', emoji: '📋' };
    };

    // Render minimal template item
    const renderTemplateItem = ({ item, index }: { item: TaskTemplate; index: number }) => {
        const wheelConfig = getWheelConfig(item.defaultLifeWheelAreaId || '');

        return (
            <TouchableOpacity
                onPress={() => handleTemplatePress(item)}
                activeOpacity={0.7}
                className="mx-4 my-1.5 rounded-xl overflow-hidden"
                style={{ 
                    backgroundColor: index % 2 === 0 ? '#fafafa' : '#ffffff',
                }}
            >
                {/* Left accent + content */}
                <View className="flex-row">
                    {/* Left color accent bar */}
                    <View 
                        className="w-1 rounded-l-xl"
                        style={{ backgroundColor: wheelConfig.color }}
                    />
                    
                    {/* Main content with padding */}
                    <View className="flex-1 flex-row items-start p-3">
                        {/* Icon with gradient-like effect */}
                        <View className="relative mr-3">
                            <View
                                className="w-12 h-12 rounded-xl items-center justify-center"
                                style={{ backgroundColor: wheelConfig.color + '18' }}
                            >
                                <Text className="text-xl">{item.icon || wheelConfig.emoji}</Text>
                            </View>
                        </View>

                        {/* Content */}
                        <View className="flex-1">
                        {/* Title Row with Life Wheel */}
                        <View className="flex-row items-center justify-between">
                            <Text className="font-bold text-gray-900 text-base flex-1 mr-2" numberOfLines={1}>
                                {item.name}
                            </Text>
                            <View 
                                className="flex-row items-center px-2 py-0.5 rounded-full"
                                style={{ backgroundColor: wheelConfig.color + '20' }}
                            >
                                <Text className="text-xs mr-1">{wheelConfig.emoji}</Text>
                                <Text className="text-[11px] font-semibold" style={{ color: wheelConfig.color }}>
                                    {wheelConfig.name}
                                </Text>
                            </View>
                        </View>

                        {/* Stats row */}
                        <View className="flex-row items-center mt-1.5 gap-3">
                            <View className="flex-row items-center">
                                <Ionicons name="star" size={12} color="#f59e0b" />
                                <Text className="text-xs text-gray-600 ml-1 font-medium">
                                    {item.rating.toFixed(1)}
                                </Text>
                            </View>
                            
                            <Text className="text-xs text-gray-400">
                                {item.usageCount.toLocaleString()} uses
                            </Text>

                            {item.recurrencePattern && (
                                <View className="flex-row items-center">
                                    <Ionicons name="repeat" size={11} color="#9333ea" />
                                    <Text className="text-[11px] text-purple-600 ml-1 font-medium">
                                        {item.recurrencePattern.frequency}
                                    </Text>
                                </View>
                            )}
                        </View>

                        {/* Tags - show both user tags and global tags */}
                        {((item.userTags && item.userTags.length > 0) || (item.tags && item.tags.length > 0)) && (
                            <View className="flex-row flex-wrap mt-2.5 gap-2">
                                {/* User's personal tags (shown first with blue styling) */}
                                {item.userTags?.slice(0, 2).map((tag, index) => (
                                    <View
                                        key={`user-${index}`}
                                        className="flex-row items-center"
                                    >
                                        <View 
                                            className="w-0 h-0 border-t-[10px] border-b-[10px] border-r-[6px] border-t-transparent border-b-transparent"
                                            style={{ borderRightColor: '#dbeafe' }}
                                        />
                                        <View className="flex-row items-center bg-blue-100 px-2 py-1 rounded-r-md">
                                            <Text className="text-[11px] text-blue-600 font-medium">
                                                {tag}
                                            </Text>
                                        </View>
                                    </View>
                                ))}
                                {/* Global template tags */}
                                {item.tags?.slice(0, item.userTags?.length ? 1 : 3).map((tag, index) => (
                                    <View
                                        key={`global-${index}`}
                                        className="flex-row items-center"
                                    >
                                        <View 
                                            className="w-0 h-0 border-t-[10px] border-b-[10px] border-r-[6px] border-t-transparent border-b-transparent"
                                            style={{ borderRightColor: '#f3f4f6' }}
                                        />
                                        <View className="flex-row items-center bg-gray-100 px-2 py-1 rounded-r-md">
                                            <Text className="text-[11px] text-gray-600 font-medium">
                                                {tag}
                                            </Text>
                                        </View>
                                    </View>
                                ))}
                                {/* Show count of remaining tags */}
                                {((item.userTags?.length || 0) + (item.tags?.length || 0)) > 3 && (
                                    <Text className="text-[11px] text-gray-400 self-center">
                                        +{((item.userTags?.length || 0) + (item.tags?.length || 0)) - 3}
                                    </Text>
                                )}
                            </View>
                        )}
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    const renderEmpty = () => (
        <View className="items-center justify-center py-16">
            <View className="w-20 h-20 rounded-full bg-gray-100 items-center justify-center mb-4">
                <Ionicons name="document-text-outline" size={40} color="#d1d5db" />
            </View>
            <Text className="text-gray-500 text-base text-center">{getEmptyMessage()}</Text>
            {(searchQuery || selectedArea !== 'all') && (
                <TouchableOpacity
                    onPress={() => {
                        setSearchQuery('');
                        setSelectedArea('all');
                    }}
                    className="mt-4 px-4 py-2 bg-blue-50 rounded-full"
                >
                    <Text className="text-blue-600 font-medium">Clear Filters</Text>
                </TouchableOpacity>
            )}
        </View>
    );

    return (
        <View className="flex-1 bg-white">
            <StatusBar barStyle="light-content" />

            {/* Header - extends into unsafe area */}
            <View 
                className="bg-blue-600"
                style={{ paddingTop: insets.top }}
            >
                {/* Title row - in safe area */}
                <View className="px-4 py-3 flex-row items-center justify-between">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="p-1 -ml-1"
                    >
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <Text className="text-lg font-bold text-white">Templates</Text>
                    <TouchableOpacity
                        onPress={() => router.push('/(tabs)/sdlc/create-template' as any)}
                        className="p-1 -mr-1"
                    >
                        <Ionicons name="add" size={26} color="white" />
                    </TouchableOpacity>
                </View>

                {/* Combined Filter Row: Source + Type */}
                <View className="px-4 pb-3">
                    <View className="flex-row bg-white/20 rounded-xl p-1">
                        {/* Source Tabs */}
                        {[
                            { key: 'global', label: '🌐', fullLabel: 'Global' },
                            { key: 'my', label: '👤', fullLabel: 'Mine' },
                            { key: 'favorites', label: '❤️', fullLabel: 'Favs' },
                            { key: 'rated', label: '⭐', fullLabel: 'Rated' },
                        ].map((tab, idx) => (
                            <React.Fragment key={tab.key}>
                                <TouchableOpacity
                                    onPress={() => setSourceTab(tab.key as SourceTab)}
                                    className={`flex-1 py-2 rounded-lg items-center ${
                                        sourceTab === tab.key ? 'bg-white' : ''
                                    }`}
                                >
                                    <Text className={`text-xs font-semibold ${
                                        sourceTab === tab.key ? 'text-blue-600' : 'text-white'
                                    }`}>
                                        {tab.label} {tab.fullLabel}
                                    </Text>
                                </TouchableOpacity>
                                {idx < 3 && (
                                    <View className="w-px h-6 bg-white/30 my-auto" />
                                )}
                            </React.Fragment>
                        ))}
                    </View>
                </View>
            </View>

            {/* Filter Bar */}
            <View className="bg-gray-50 border-b border-gray-100">
                {/* Search + Type Filter Row */}
                <View className="px-4 py-2 flex-row items-center gap-2">
                    {/* Search */}
                    <View className="flex-1 flex-row items-center bg-white rounded-lg px-3 py-2 border border-gray-200">
                        <Ionicons name="search" size={16} color="#9ca3af" />
                        <TextInput
                            className="flex-1 ml-2 text-sm text-gray-900"
                            placeholder="Search templates..."
                            placeholderTextColor="#9ca3af"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery('')}>
                                <Ionicons name="close-circle" size={16} color="#9ca3af" />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Life Wheel Area Pills */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    className="px-4 pb-2"
                    contentContainerStyle={{ gap: 6 }}
                >
                    {LIFE_WHEEL_AREAS.map((area) => {
                        const isSelected = selectedArea === area.id;
                        return (
                            <TouchableOpacity
                                key={area.id}
                                onPress={() => setSelectedArea(area.id)}
                                className={`px-3 py-1.5 rounded-full flex-row items-center ${
                                    isSelected ? '' : 'bg-white border border-gray-200'
                                }`}
                                style={isSelected ? { backgroundColor: area.color } : {}}
                            >
                                <Text className="text-xs">{area.emoji}</Text>
                                <Text className={`text-xs font-medium ml-1 ${
                                    isSelected ? 'text-white' : 'text-gray-600'
                                }`}>
                                    {area.name}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>

            {/* Error Banner */}
            {error && (
                <View className="bg-red-50 px-4 py-2 flex-row items-center justify-between">
                    <Text className="text-red-700 text-sm flex-1">{error}</Text>
                    <TouchableOpacity onPress={clearError}>
                        <Ionicons name="close" size={18} color="#b91c1c" />
                    </TouchableOpacity>
                </View>
            )}

            {/* Results Count */}
            <View className="px-4 py-2 flex-row justify-between items-center bg-white border-b border-gray-50">
                <Text className="text-xs text-gray-400">
                    {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''}
                </Text>
            </View>

            {/* Template List */}
            {loading && filteredTemplates.length === 0 ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#3b82f6" />
                    <Text className="text-gray-500 mt-3 text-sm">Loading templates...</Text>
                </View>
            ) : (
                <FlatList
                    data={filteredTemplates}
                    renderItem={renderTemplateItem}
                    keyExtractor={(item) => item.id}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
                    ListEmptyComponent={renderEmpty}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={handleRefresh}
                            colors={['#3b82f6']}
                            tintColor="#3b82f6"
                        />
                    }
                />
            )}

            {/* Detail Modal */}
            <TemplateDetailModal
                visible={showDetailModal}
                template={selectedTemplate}
                onClose={() => {
                    setShowDetailModal(false);
                    setSelectedTemplate(null);
                }}
                onUseTemplate={handleTemplateUse}
                onCloneTemplate={handleCloneTemplate}
            />

            {/* Create from Template Sheet */}
            <CreateFromTemplateSheet
                visible={showCreateSheet}
                template={templateForCreation}
                onClose={() => {
                    setShowCreateSheet(false);
                    setTemplateForCreation(null);
                }}
                onSuccess={handleTaskCreated}
            />
        </View>
    );
}
