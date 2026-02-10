import { logger } from '../../../utils/logger';
import React, { useState, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StatusBar,
    TextInput,
    RefreshControl,
    ActivityIndicator,
    ScrollView,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { TaskTemplate } from '../../../types/models';
import {
    useGlobalTemplates,
    useUserTemplates,
    useFavoriteTemplates,
    useToggleTemplateFavorite,
    useCloneTemplate,
} from '../../../hooks/queries';
import { useQueryClient } from '@tanstack/react-query';
import { templateKeys } from '../../../hooks/queries/keys';
import {
    TemplateDetailModal,
    CreateFromTemplateSheet,
} from '../../../components/templates';
import { LIFE_WHEEL_CONFIG } from '../../../components/templates/TemplateCard';
import { useTranslation } from '../../../hooks';
import { useThemeContext } from '../../../providers/ThemeProvider';

type SourceTab = 'global' | 'my' | 'favorites' | 'rated';

const LIFE_WHEEL_AREAS = [
    { id: 'all', name: 'All', icon: 'target', color: '#6b7280' },
    { id: 'lw-1', name: 'Health', icon: 'arm-flex-outline', color: '#10b981' },
    { id: 'lw-2', name: 'Career', icon: 'briefcase-outline', color: '#3b82f6' },
    { id: 'lw-3', name: 'Finance', icon: 'cash-multiple', color: '#f59e0b' },
    { id: 'lw-4', name: 'Growth', icon: 'book-open-variant', color: '#8b5cf6' },
    { id: 'lw-5', name: 'Family & Romance', icon: 'heart-outline', color: '#ef4444' },
    { id: 'lw-6', name: 'Friends', icon: 'account-group-outline', color: '#ec4899' },
    { id: 'lw-7', name: 'Fun', icon: 'party-popper', color: '#14b8a6' },
    { id: 'lw-8', name: 'Environment', icon: 'earth', color: '#84cc16' },
];

export default function TemplatesScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { t } = useTranslation();
    const { colors, isDark } = useThemeContext();
    const queryClient = useQueryClient();

    // React Query hooks — server state
    const { data: globalTemplates = [], isLoading: globalLoading } = useGlobalTemplates();
    const { data: userTemplates = [], isLoading: userLoading } = useUserTemplates();
    const { data: favoriteTemplates = [], isLoading: favLoading } = useFavoriteTemplates();
    const toggleFavoriteMutation = useToggleTemplateFavorite();
    const cloneMutation = useCloneTemplate();

    const loading = globalLoading || userLoading || favLoading;
    const error: string | null = null; // Errors handled via RQ's built-in error state

    // Local UI state
    const [sourceTab, setSourceTab] = useState<SourceTab>('global');
    const [selectedArea, setSelectedArea] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [refreshing, setRefreshing] = useState(false);

    const [selectedTemplate, setSelectedTemplate] = useState<TaskTemplate | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showCreateSheet, setShowCreateSheet] = useState(false);
    const [templateForCreation, setTemplateForCreation] = useState<TaskTemplate | null>(null);

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
        const key = sourceTab === 'global'
            ? templateKeys.global()
            : sourceTab === 'my'
                ? templateKeys.user()
                : sourceTab === 'favorites'
                    ? templateKeys.favorites()
                    : templateKeys.lists();
        await queryClient.invalidateQueries({ queryKey: key });
        setRefreshing(false);
    }, [sourceTab, queryClient]);

    const handleFavoritePress = useCallback(async (templateId: string) => {
        try {
            await toggleFavoriteMutation.mutateAsync(templateId);
        } catch (err: unknown) {
            logger.error('Templates', 'Failed to toggle favorite', err instanceof Error ? err : undefined);
        }
    }, [toggleFavoriteMutation]);

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
            await cloneMutation.mutateAsync(template.id);
            setShowDetailModal(false);
            setSourceTab('my');
        } catch (err: unknown) {
            logger.error('Templates', 'Failed to clone template', err instanceof Error ? err : undefined);
        }
    };

    const handleTaskCreated = (taskId: string) => {
        setShowCreateSheet(false);
        setTemplateForCreation(null);
        router.push(`/(tabs)/sprints/task/${taskId}` as any);
    };

    const getEmptyMessage = () => {
        if (searchQuery) return 'No templates match your search';
        switch (sourceTab) {
            case 'global': return 'No global templates available';
            case 'my': return 'You haven\'t created any templates yet';
            case 'favorites': return 'Tap the heart on templates to add them here!';
            case 'rated': return 'Rate templates to see them here!';
            default: return 'No templates found';
        }
    };

    const getWheelConfig = (areaId: string) => {
        return LIFE_WHEEL_CONFIG[areaId] || { color: '#6b7280', name: 'General', emoji: 'clipboard-text-outline' };
    };

    // Render minimal template item
    const renderTemplateItem = ({ item, index }: { item: TaskTemplate; index: number }) => {
        const wheelConfig = getWheelConfig(item.defaultLifeWheelAreaId || '');

        return (
            <TouchableOpacity
                onPress={() => handleTemplatePress(item)}
                activeOpacity={0.7}
                className="mx-2 my-1.5 rounded-xl overflow-hidden"
                style={{ 
                    backgroundColor: index % 2 === 0 ? colors.backgroundTertiary : colors.card,
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
                            <Text className="font-bold text-base flex-1 mr-2" style={{ color: colors.text }} numberOfLines={1}>
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
                                <Text className="text-xs ml-1 font-medium" style={{ color: colors.textSecondary }}>
                                    {item.rating.toFixed(1)}
                                </Text>
                            </View>
                            
                            <Text className="text-xs" style={{ color: colors.textTertiary }}>
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
                                            style={{ borderRightColor: isDark ? colors.primaryLight : '#dbeafe' }}
                                        />
                                        <View className="flex-row items-center px-2 py-1 rounded-r-md" style={{ backgroundColor: isDark ? colors.primaryLight : '#dbeafe' }}>
                                            <Text className="text-[11px] font-medium" style={{ color: colors.primary }}>
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
                                            style={{ borderRightColor: colors.backgroundTertiary }}
                                        />
                                        <View className="flex-row items-center px-2 py-1 rounded-r-md" style={{ backgroundColor: colors.backgroundTertiary }}>
                                            <Text className="text-[11px] font-medium" style={{ color: colors.textSecondary }}>
                                                {tag}
                                            </Text>
                                        </View>
                                    </View>
                                ))}
                                {/* Show count of remaining tags */}
                                {((item.userTags?.length || 0) + (item.tags?.length || 0)) > 3 && (
                                    <Text className="text-[11px] self-center" style={{ color: colors.textTertiary }}>
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
            <View className="w-20 h-20 rounded-full items-center justify-center mb-4" style={{ backgroundColor: colors.backgroundTertiary }}>
                <Ionicons name="document-text-outline" size={40} color={colors.textTertiary} />
            </View>
            <Text className="text-base text-center" style={{ color: colors.textSecondary }}>{getEmptyMessage()}</Text>
            {(searchQuery || selectedArea !== 'all') && (
                <TouchableOpacity
                    onPress={() => {
                        setSearchQuery('');
                        setSelectedArea('all');
                    }}
                    className="mt-4 px-4 py-2 rounded-full"
                    style={{ backgroundColor: isDark ? colors.primaryLight : '#EFF6FF' }}
                >
                    <Text className="font-medium" style={{ color: colors.primary }}>Clear Filters</Text>
                </TouchableOpacity>
            )}
        </View>
    );

    return (
        <View className="flex-1" style={{ backgroundColor: colors.background }}>
            <StatusBar barStyle="light-content" />

            {/* Header - extends into unsafe area */}
            <View 
                style={{ paddingTop: insets.top, backgroundColor: isDark ? colors.backgroundSecondary : '#2563EB' }}
            >
                {/* Title row - in safe area */}
                <View className="px-4 py-3 flex-row items-center justify-between">
                    <Text className="text-lg font-bold" style={{ color: isDark ? colors.text : '#FFFFFF' }}>Templates</Text>
                    <TouchableOpacity
                        onPress={() => router.push('/(tabs)/sprints/create-template' as any)}
                        className="p-1 -mr-1"
                    >
                        <Ionicons name="add" size={26} color={isDark ? colors.primary : 'white'} />
                    </TouchableOpacity>
                </View>

                {/* Combined Filter Row: Source + Type */}
                <View className="px-4 pb-3">
                    <View
                        className="flex-row rounded-xl p-1"
                        style={{ backgroundColor: isDark ? colors.backgroundTertiary : 'rgba(255,255,255,0.2)' }}
                    >
                        {/* Source Tabs */}
                        {[
                            { key: 'global', label: 'Global', icon: 'earth' },
                            { key: 'my', label: 'Mine', icon: 'account-outline' },
                            { key: 'favorites', label: 'Favs', icon: 'heart-outline' },
                            { key: 'rated', label: 'Rated', icon: 'star-outline' },
                        ].map((tab, idx) => (
                            <React.Fragment key={tab.key}>
                                <TouchableOpacity
                                    onPress={() => setSourceTab(tab.key as SourceTab)}
                                    className={`flex-1 py-2 rounded-lg items-center`}
                                    style={sourceTab === tab.key ? { backgroundColor: isDark ? colors.card : '#FFFFFF' } : {}}
                                >
                                    <Text className="text-xs font-semibold" style={{
                                        color: sourceTab === tab.key
                                            ? (isDark ? colors.primary : '#2563EB')
                                            : (isDark ? colors.textSecondary : '#FFFFFF')
                                    }}>
                                        {tab.label}
                                    </Text>
                                </TouchableOpacity>
                                {idx < 3 && (
                                    <View className="w-px h-6 my-auto" style={{ backgroundColor: isDark ? colors.border : 'rgba(255,255,255,0.3)' }} />
                                )}
                            </React.Fragment>
                        ))}
                    </View>
                </View>
            </View>

            {/* Filter Bar */}
            <View style={{ backgroundColor: colors.backgroundSecondary, borderBottomWidth: 1, borderBottomColor: colors.borderSecondary }}>
                {/* Search + Type Filter Row */}
                <View className="px-4 py-2 flex-row items-center gap-2">
                    {/* Search */}
                    <View
                        className="flex-1 flex-row items-center rounded-lg px-3 py-2"
                        style={{ backgroundColor: colors.inputBackground, borderWidth: 1, borderColor: colors.border }}
                    >
                        <Ionicons name="search" size={16} color={colors.placeholder} />
                        <TextInput
                            className="flex-1 ml-2 text-sm"
                            style={{ color: colors.text }}
                            placeholder="Search templates..."
                            placeholderTextColor={colors.placeholder}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery('')}>
                                <Ionicons name="close-circle" size={16} color={colors.placeholder} />
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
                                className={`px-3 py-1.5 rounded-full flex-row items-center`}
                                style={isSelected
                                    ? { backgroundColor: area.color }
                                    : { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }
                                }
                            >
                                <MaterialCommunityIcons name={area.icon as any} size={14} color={isSelected ? '#FFFFFF' : colors.textSecondary} />
                                <Text className={`text-xs font-medium ml-1`} style={{
                                    color: isSelected ? '#FFFFFF' : colors.textSecondary
                                }}>
                                    {area.name}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>

            {/* Error Banner — errors are now handled by React Query */}

            {/* Results Count */}
            <View className="px-4 py-2 flex-row justify-between items-center" style={{ backgroundColor: colors.background, borderBottomWidth: 1, borderBottomColor: colors.borderSecondary }}>
                <Text className="text-xs" style={{ color: colors.textTertiary }}>
                    {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''}
                </Text>
            </View>

            {/* Template List */}
            {loading && filteredTemplates.length === 0 ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text className="mt-3 text-sm" style={{ color: colors.textSecondary }}>Loading templates...</Text>
                </View>
            ) : (
                <FlashList
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
                            colors={[colors.primary]}
                            tintColor={colors.primary}
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
