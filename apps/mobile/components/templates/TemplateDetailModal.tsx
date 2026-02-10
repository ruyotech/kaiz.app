import { logger } from '../../utils/logger';
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    Modal,
    ScrollView,
    TouchableOpacity,
    Pressable,
    TextInput,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TaskTemplate } from '../../types/models';
import { LIFE_WHEEL_CONFIG } from './TemplateCard';
import { Badge } from '../ui/Badge';
import {
    useToggleTemplateFavorite,
    useRateTemplate,
    useAddTemplateTag,
    useRemoveTemplateTag,
} from '../../hooks/queries';
import { useThemeContext } from '../../providers/ThemeProvider';

interface TemplateDetailModalProps {
    visible: boolean;
    template: TaskTemplate | null;
    onClose: () => void;
    onUseTemplate: (template: TaskTemplate) => void;
    onCloneTemplate?: (template: TaskTemplate) => void;
}

const renderStars = (rating: number, size: number = 20, interactive?: boolean, onRate?: (r: number) => void) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
        const starComponent = (
            <Pressable
                key={i}
                onPress={interactive ? () => onRate?.(i + 1) : undefined}
                disabled={!interactive}
            >
                <Ionicons
                    name={i < fullStars ? 'star' : (i === fullStars && hasHalfStar ? 'star-half' : 'star-outline')}
                    size={size}
                    color={i < fullStars || (i === fullStars && hasHalfStar) ? '#fbbf24' : '#d1d5db'}
                />
            </Pressable>
        );
        stars.push(starComponent);
    }
    return stars;
};

export function TemplateDetailModal({
    visible,
    template,
    onClose,
    onUseTemplate,
    onCloneTemplate,
}: TemplateDetailModalProps) {
    const toggleFavoriteMutation = useToggleTemplateFavorite();
    const rateMutation = useRateTemplate();
    const addTagMutation = useAddTemplateTag();
    const removeTagMutation = useRemoveTemplateTag();
    const { colors, isDark } = useThemeContext();
    const [userRating, setUserRating] = useState<number>(template?.userRating || 0);
    const [isRating, setIsRating] = useState(false);
    const [isFavorite, setIsFavorite] = useState<boolean>(template?.isFavorite || false);
    const [userTags, setUserTags] = useState<string[]>(template?.userTags || []);
    const [newTag, setNewTag] = useState('');
    const [showTagInput, setShowTagInput] = useState(false);
    const [isAddingTag, setIsAddingTag] = useState(false);
    const [removingTagId, setRemovingTagId] = useState<string | null>(null);

    // Update local state when template changes
    useEffect(() => {
        if (template) {
            setUserTags(template.userTags || []);
            setUserRating(template.userRating || 0);
            setIsFavorite(template.isFavorite || false);
        }
    }, [template]);

    if (!template) return null;

    const defaultWheelConfig = { color: '#6b7280', name: 'General', emoji: 'clipboard-text-outline' };
    const wheelConfig = template.defaultLifeWheelAreaId
        ? LIFE_WHEEL_CONFIG[template.defaultLifeWheelAreaId] || defaultWheelConfig
        : defaultWheelConfig;

    const handleRate = async (rating: number) => {
        // If clicking the same rating, unrate (set to 0)
        const newRating = rating === userRating ? 0 : rating;
        setUserRating(newRating);
        setIsRating(true);
        try {
            await rateMutation.mutateAsync({ id: template.id, rating: newRating });
        } catch (error) {
            logger.error('Failed to rate template:', error);
            // Revert on error
            setUserRating(userRating);
        } finally {
            setIsRating(false);
        }
    };

    const handleFavorite = async () => {
        // Optimistically update UI
        setIsFavorite(!isFavorite);
        try {
            const result = await toggleFavoriteMutation.mutateAsync(template.id);
            setIsFavorite((result as any)?.isFavorite ?? !isFavorite);
        } catch (error) {
            logger.error('Failed to toggle favorite:', error);
            // Revert on error
            setIsFavorite(isFavorite);
        }
    };

    const handleAddTag = async () => {
        const trimmedTag = newTag.trim().toLowerCase();
        if (!trimmedTag || userTags.includes(trimmedTag)) {
            setNewTag('');
            setShowTagInput(false);
            return;
        }

        setIsAddingTag(true);
        try {
            const result = await addTagMutation.mutateAsync({ id: template.id, tag: trimmedTag });
            setUserTags((result as any)?.tags ?? [...userTags, trimmedTag]);
            setNewTag('');
            setShowTagInput(false);
        } catch (error) {
            logger.error('Failed to add tag:', error);
        } finally {
            setIsAddingTag(false);
        }
    };

    const handleRemoveTag = async (tag: string) => {
        setRemovingTagId(tag);
        try {
            const result = await removeTagMutation.mutateAsync({ id: template.id, tag });
            setUserTags((result as any)?.tags ?? userTags.filter(t => t !== tag));
        } catch (error) {
            logger.error('Failed to remove tag:', error);
        } finally {
            setRemovingTagId(null);
        }
    };

    const getRecurrenceText = () => {
        if (!template.recurrencePattern) return null;
        const { frequency, interval } = template.recurrencePattern;
        
        if (interval === 1) {
            switch (frequency) {
                case 'daily': return 'Every day';
                case 'weekly': return 'Every week';
                case 'monthly': return 'Every month';
                case 'yearly': return 'Every year';
                default: return frequency;
            }
        }
        return `Every ${interval} ${frequency.replace('ly', 's')}`;
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <View className="flex-1" style={{ backgroundColor: colors.background }}>
                {/* Header */}
                <View className="flex-row items-center justify-between px-4 py-4" style={{ borderBottomWidth: 1, borderBottomColor: colors.border }}>
                    <TouchableOpacity onPress={onClose} className="p-2 -ml-2">
                        <Ionicons name="close" size={28} color={colors.text} />
                    </TouchableOpacity>
                    <Text className="text-lg font-semibold" style={{ color: colors.text }}>Template Details</Text>
                    <TouchableOpacity onPress={handleFavorite} className="p-2 -mr-2">
                        <Ionicons
                            name={isFavorite ? 'heart' : 'heart-outline'}
                            size={28}
                            color={isFavorite ? '#ef4444' : colors.textSecondary}
                        />
                    </TouchableOpacity>
                </View>

                <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                    {/* Hero Section with Wheel of Life */}
                    <View
                        className="p-6"
                        style={{ backgroundColor: wheelConfig.color + '08' }}
                    >
                        {/* Wheel of Life Banner */}
                        <View 
                            className="flex-row items-center justify-center mb-4 py-2 px-4 rounded-full self-center"
                            style={{ backgroundColor: wheelConfig.color + '20' }}
                        >
                            <Text className="text-xl mr-2">{wheelConfig.emoji}</Text>
                            <Text className="font-bold text-base" style={{ color: wheelConfig.color }}>
                                {wheelConfig.name}
                            </Text>
                            <Text className="text-sm ml-2" style={{ color: wheelConfig.color + 'aa' }}>
                                Wheel of Life
                            </Text>
                        </View>

                        {/* Icon & Title */}
                        <View className="items-center">
                            <View
                                className="w-20 h-20 rounded-2xl items-center justify-center mb-4"
                                style={{ backgroundColor: wheelConfig.color + '20' }}
                            >
                                <Text className="text-4xl">{template.icon || wheelConfig.emoji}</Text>
                            </View>
                            <Text className="text-2xl font-bold text-center mb-2" style={{ color: colors.text }}>
                                {template.name}
                            </Text>
                            
                            {/* Type & Creator Badges */}
                            <View className="flex-row items-center gap-2 mt-2">
                                <Badge variant={template.type === 'event' ? 'info' : 'default'}>
                                    {template.type === 'event' ? 'Event' : 'Task'}
                                </Badge>
                                {template.creatorType === 'system' && (
                                    <Badge variant="warning">Global</Badge>
                                )}
                            </View>
                        </View>
                    </View>

                    <View className="px-4 py-6">
                        {/* Description */}
                        {template.description && (
                            <View className="mb-6">
                                <Text className="text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>Description</Text>
                                <Text className="leading-6" style={{ color: colors.text }}>{template.description}</Text>
                            </View>
                        )}

                        {/* Stats Grid */}
                        <View className="flex-row mb-6">
                            <View className="flex-1 rounded-xl p-4 mr-2 items-center" style={{ backgroundColor: colors.backgroundTertiary }}>
                                <View className="flex-row mb-1">
                                    {renderStars(template.rating, 16)}
                                </View>
                                <Text className="text-lg font-bold" style={{ color: colors.text }}>{template.rating.toFixed(1)}</Text>
                                <Text className="text-xs" style={{ color: colors.textSecondary }}>{template.ratingCount} ratings</Text>
                            </View>
                            <View className="flex-1 rounded-xl p-4 ml-2 items-center" style={{ backgroundColor: colors.backgroundTertiary }}>
                                <Ionicons name="people" size={24} color={colors.textSecondary} />
                                <Text className="text-lg font-bold" style={{ color: colors.text }}>{template.usageCount.toLocaleString()}</Text>
                                <Text className="text-xs" style={{ color: colors.textSecondary }}>uses</Text>
                            </View>
                        </View>

                        {/* Rate this template */}
                        <View className="mb-6 p-4 rounded-xl border-2" style={{ backgroundColor: isDark ? colors.primaryLight : '#eff6ff', borderColor: isDark ? colors.border : '#bfdbfe' }}>
                            <View className="flex-row items-center justify-center mb-3">
                                <Ionicons name="star" size={18} color={colors.primary} />
                                <Text className="text-base font-semibold ml-2" style={{ color: colors.primary }}>
                                    Rate this template
                                </Text>
                            </View>
                            <View className="flex-row justify-center gap-3">
                                {renderStars(userRating || template.userRating || 0, 36, true, handleRate)}
                            </View>
                            {isRating ? (
                                <Text className="text-xs text-blue-500 text-center mt-3">
                                    Saving your rating...
                                </Text>
                            ) : userRating > 0 ? (
                                <View className="items-center mt-3">
                                    <View className="flex-row items-center">
                                        <Ionicons name="checkmark-circle" size={14} color="#10b981" />
                                        <Text className="text-xs text-green-600 ml-1">
                                            You rated this {userRating}/5
                                        </Text>
                                    </View>
                                    <Text className="text-xs text-blue-400 mt-1">
                                        Tap the same star to remove rating
                                    </Text>
                                </View>
                            ) : (
                                <Text className="text-xs text-blue-400 text-center mt-3">
                                    Tap a star to rate
                                </Text>
                            )}
                        </View>

                        {/* Details Section */}
                        <View className="mb-6">
                            <Text className="text-sm font-medium mb-3" style={{ color: colors.textSecondary }}>Default Settings</Text>
                            
                            <View className="rounded-xl p-4 space-y-3" style={{ backgroundColor: colors.backgroundTertiary }}>
                                {/* Duration */}
                                {template.defaultDuration && (
                                    <View className="flex-row items-center">
                                        <Ionicons name="time-outline" size={20} color={colors.textSecondary} />
                                        <Text className="ml-3 flex-1" style={{ color: colors.text }}>Duration</Text>
                                        <Text className="font-medium" style={{ color: colors.text }}>
                                            {template.defaultDuration} minutes
                                        </Text>
                                    </View>
                                )}

                                {/* Story Points */}
                                {template.defaultStoryPoints && (
                                    <View className="flex-row items-center mt-3">
                                        <Ionicons name="star-outline" size={20} color={colors.textSecondary} />
                                        <Text className="ml-3 flex-1" style={{ color: colors.text }}>Story Points</Text>
                                        <Text className="font-medium" style={{ color: colors.text }}>
                                            {template.defaultStoryPoints} pts
                                        </Text>
                                    </View>
                                )}

                                {/* Recurrence */}
                                {template.recurrencePattern && (
                                    <View className="flex-row items-center mt-3">
                                        <Ionicons name="repeat" size={20} color={colors.textSecondary} />
                                        <Text className="ml-3 flex-1" style={{ color: colors.text }}>Recurrence</Text>
                                        <Text className="font-medium" style={{ color: colors.text }}>
                                            {getRecurrenceText()}
                                        </Text>
                                    </View>
                                )}

                                {/* Sprint Suggestion */}
                                {template.suggestedSprint && (
                                    <View className="flex-row items-center mt-3">
                                        <Ionicons name="calendar-outline" size={20} color={colors.textSecondary} />
                                        <Text className="ml-3 flex-1" style={{ color: colors.text }}>Suggested Sprint</Text>
                                        <Text className="font-medium capitalize" style={{ color: colors.text }}>
                                            {template.suggestedSprint.toLowerCase().replace('_', ' ')}
                                        </Text>
                                    </View>
                                )}

                                {/* Event-specific fields */}
                                {template.type === 'event' && (
                                    <>
                                        {template.defaultLocation && (
                                            <View className="flex-row items-center mt-3">
                                                <Ionicons name="location-outline" size={20} color={colors.textSecondary} />
                                                <Text className="ml-3 flex-1" style={{ color: colors.text }}>Location</Text>
                                                <Text className="font-medium" style={{ color: colors.text }}>
                                                    {template.defaultLocation}
                                                </Text>
                                            </View>
                                        )}
                                        {template.isAllDay !== undefined && (
                                            <View className="flex-row items-center mt-3">
                                                <Ionicons name="sunny-outline" size={20} color={colors.textSecondary} />
                                                <Text className="ml-3 flex-1" style={{ color: colors.text }}>All Day</Text>
                                                <Text className="font-medium" style={{ color: colors.text }}>
                                                    {template.isAllDay ? 'Yes' : 'No'}
                                                </Text>
                                            </View>
                                        )}
                                    </>
                                )}
                            </View>
                        </View>

                        {/* Tags Section - Combined view */}
                        <View className="mb-6">
                            <View className="flex-row items-center justify-between mb-3">
                                <Text className="text-sm font-medium" style={{ color: colors.textSecondary }}>Tags</Text>
                                <TouchableOpacity 
                                    onPress={() => setShowTagInput(!showTagInput)}
                                    className="flex-row items-center"
                                >
                                    <Ionicons 
                                        name={showTagInput ? "close-circle" : "add-circle"} 
                                        size={20} 
                                        color={colors.primary} 
                                    />
                                    <Text className="text-sm ml-1" style={{ color: colors.primary }}>
                                        {showTagInput ? 'Cancel' : 'Add Tag'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                            
                            {/* Tag Input - Always at top when visible */}
                            {showTagInput && (
                                <View className="flex-row items-center mb-3 rounded-xl p-2" style={{ backgroundColor: isDark ? colors.primaryLight : '#eff6ff' }}>
                                    <TextInput
                                        value={newTag}
                                        onChangeText={setNewTag}
                                        placeholder="Enter tag name..."
                                        placeholderTextColor={colors.placeholder}
                                        className="flex-1 px-3 py-2"
                                        style={{ color: colors.text }}
                                        autoFocus
                                        autoCapitalize="none"
                                        onSubmitEditing={handleAddTag}
                                    />
                                    <TouchableOpacity
                                        onPress={handleAddTag}
                                        disabled={!newTag.trim() || isAddingTag}
                                        className={`px-4 py-2 rounded-lg`}
                                        style={{ backgroundColor: newTag.trim() ? colors.primary : colors.border }}
                                    >
                                        {isAddingTag ? (
                                            <ActivityIndicator size="small" color="white" />
                                        ) : (
                                            <Text className="text-white font-medium">Add</Text>
                                        )}
                                    </TouchableOpacity>
                                </View>
                            )}

                            {/* Combined Tags Display */}
                            <View className="flex-row flex-wrap gap-2">
                                {/* User's personal tags (editable, shown first with blue styling) */}
                                {userTags.map((tag, index) => (
                                    <View
                                        key={`user-${index}`}
                                        className="px-3 py-1.5 rounded-full flex-row items-center"
                                        style={{ backgroundColor: isDark ? colors.primaryLight : '#dbeafe' }}
                                    >
                                        <Text style={{ color: colors.primary }}>#{tag}</Text>
                                        <TouchableOpacity
                                            onPress={() => handleRemoveTag(tag)}
                                            disabled={removingTagId === tag}
                                            className="ml-2"
                                        >
                                            {removingTagId === tag ? (
                                                <ActivityIndicator size="small" color="#3b82f6" />
                                            ) : (
                                                <Ionicons name="close-circle" size={16} color="#60a5fa" />
                                            )}
                                        </TouchableOpacity>
                                    </View>
                                ))}
                                
                                {/* Template's global tags (read-only, shown with gray styling) */}
                                {template.tags && template.tags.map((tag, index) => (
                                    <View
                                        key={`global-${index}`}
                                        className="px-3 py-1.5 rounded-full flex-row items-center"
                                        style={{ backgroundColor: colors.backgroundTertiary }}
                                    >
                                        <Text style={{ color: colors.textSecondary }}>#{tag}</Text>
                                        <Ionicons name="globe-outline" size={12} color={colors.textTertiary} className="ml-1" />
                                    </View>
                                ))}
                                
                                {/* Empty state */}
                                {userTags.length === 0 && (!template.tags || template.tags.length === 0) && (
                                    <Text className="text-sm italic" style={{ color: colors.textTertiary }}>
                                        No tags yet. Add your personal tags to organize this template.
                                    </Text>
                                )}
                            </View>
                            
                            {/* Legend for tag types */}
                            {(userTags.length > 0 || (template.tags && template.tags.length > 0)) && (
                                <View className="flex-row items-center mt-3 gap-4">
                                    <View className="flex-row items-center">
                                        <View className="w-3 h-3 rounded-full mr-1" style={{ backgroundColor: isDark ? colors.primaryLight : '#dbeafe' }} />
                                        <Text className="text-xs" style={{ color: colors.textSecondary }}>My tags</Text>
                                    </View>
                                    {template.tags && template.tags.length > 0 && (
                                        <View className="flex-row items-center">
                                            <View className="w-3 h-3 rounded-full mr-1" style={{ backgroundColor: colors.backgroundTertiary }} />
                                            <Text className="text-xs" style={{ color: colors.textSecondary }}>Template tags</Text>
                                        </View>
                                    )}
                                </View>
                            )}
                        </View>

                        {/* Clone option for global templates */}
                        {template.creatorType === 'system' && onCloneTemplate && (
                            <TouchableOpacity
                                onPress={() => onCloneTemplate(template)}
                                className="mb-4 border rounded-xl py-3 items-center flex-row justify-center"
                                style={{ borderColor: colors.border }}
                            >
                                <Ionicons name="copy-outline" size={20} color={colors.textSecondary} />
                                <Text className="font-medium ml-2" style={{ color: colors.text }}>
                                    Clone to My Templates
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </ScrollView>

                {/* Action Button */}
                <View className="px-4 py-4 border-t" style={{ borderTopColor: colors.border, backgroundColor: colors.background }}>
                    <TouchableOpacity
                        onPress={() => onUseTemplate(template)}
                        className="rounded-xl py-4 items-center flex-row justify-center"
                        style={{ backgroundColor: colors.primary }}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="add-circle" size={24} color="white" />
                        <Text className="text-white font-bold text-lg ml-2">
                            Create {template.type === 'event' ? 'Event' : 'Task'} from Template
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

export default TemplateDetailModal;
