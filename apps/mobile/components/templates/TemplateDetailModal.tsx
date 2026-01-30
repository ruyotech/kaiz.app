import React, { useState } from 'react';
import {
    View,
    Text,
    Modal,
    ScrollView,
    TouchableOpacity,
    Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TaskTemplate } from '../../types/models';
import { LIFE_WHEEL_CONFIG } from './TemplateCard';
import { Badge } from '../ui/Badge';
import { useTemplateStore } from '../../store/templateStore';

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
    const { toggleFavorite, rateTemplate } = useTemplateStore();
    const [userRating, setUserRating] = useState<number>(template?.userRating || 0);
    const [isRating, setIsRating] = useState(false);

    if (!template) return null;

    const defaultWheelConfig = { color: '#6b7280', name: 'General', emoji: '📋' };
    const wheelConfig = template.defaultLifeWheelAreaId
        ? LIFE_WHEEL_CONFIG[template.defaultLifeWheelAreaId] || defaultWheelConfig
        : defaultWheelConfig;

    const handleRate = async (rating: number) => {
        setUserRating(rating);
        setIsRating(true);
        try {
            await rateTemplate(template.id, rating);
        } catch (error) {
            console.error('Failed to rate template:', error);
        } finally {
            setIsRating(false);
        }
    };

    const handleFavorite = async () => {
        try {
            await toggleFavorite(template.id);
        } catch (error) {
            console.error('Failed to toggle favorite:', error);
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
            <View className="flex-1 bg-white">
                {/* Header */}
                <View className="flex-row items-center justify-between px-4 py-4 border-b border-gray-100">
                    <TouchableOpacity onPress={onClose} className="p-2 -ml-2">
                        <Ionicons name="close" size={28} color="#374151" />
                    </TouchableOpacity>
                    <Text className="text-lg font-semibold">Template Details</Text>
                    <TouchableOpacity onPress={handleFavorite} className="p-2 -mr-2">
                        <Ionicons
                            name={template.isFavorite ? 'heart' : 'heart-outline'}
                            size={28}
                            color={template.isFavorite ? '#ef4444' : '#374151'}
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
                            <Text className="text-2xl font-bold text-gray-900 text-center mb-2">
                                {template.name}
                            </Text>
                            
                            {/* Type & Creator Badges */}
                            <View className="flex-row items-center gap-2 mt-2">
                                <Badge variant={template.type === 'event' ? 'info' : 'default'}>
                                    {template.type === 'event' ? '📅 Event' : '✅ Task'}
                                </Badge>
                                {template.creatorType === 'system' && (
                                    <Badge variant="warning">⭐ Global</Badge>
                                )}
                            </View>
                        </View>
                    </View>

                    <View className="px-4 py-6">
                        {/* Description */}
                        {template.description && (
                            <View className="mb-6">
                                <Text className="text-sm font-medium text-gray-500 mb-2">Description</Text>
                                <Text className="text-gray-700 leading-6">{template.description}</Text>
                            </View>
                        )}

                        {/* Stats Grid */}
                        <View className="flex-row mb-6">
                            <View className="flex-1 bg-gray-50 rounded-xl p-4 mr-2 items-center">
                                <View className="flex-row mb-1">
                                    {renderStars(template.rating, 16)}
                                </View>
                                <Text className="text-lg font-bold text-gray-900">{template.rating.toFixed(1)}</Text>
                                <Text className="text-xs text-gray-500">{template.ratingCount} ratings</Text>
                            </View>
                            <View className="flex-1 bg-gray-50 rounded-xl p-4 ml-2 items-center">
                                <Ionicons name="people" size={24} color="#6b7280" />
                                <Text className="text-lg font-bold text-gray-900">{template.usageCount.toLocaleString()}</Text>
                                <Text className="text-xs text-gray-500">uses</Text>
                            </View>
                        </View>

                        {/* Rate this template */}
                        <View className="mb-6 p-4 rounded-xl border-2 border-blue-200" style={{ backgroundColor: '#eff6ff' }}>
                            <View className="flex-row items-center justify-center mb-3">
                                <Ionicons name="star" size={18} color="#3b82f6" />
                                <Text className="text-base font-semibold text-blue-700 ml-2">
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
                                <View className="flex-row items-center justify-center mt-3">
                                    <Ionicons name="checkmark-circle" size={14} color="#10b981" />
                                    <Text className="text-xs text-green-600 ml-1">
                                        You rated this {userRating}/5 ⭐
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
                            <Text className="text-sm font-medium text-gray-500 mb-3">Default Settings</Text>
                            
                            <View className="bg-gray-50 rounded-xl p-4 space-y-3">
                                {/* Duration */}
                                {template.defaultDuration && (
                                    <View className="flex-row items-center">
                                        <Ionicons name="time-outline" size={20} color="#6b7280" />
                                        <Text className="text-gray-700 ml-3 flex-1">Duration</Text>
                                        <Text className="font-medium text-gray-900">
                                            {template.defaultDuration} minutes
                                        </Text>
                                    </View>
                                )}

                                {/* Story Points */}
                                {template.defaultStoryPoints && (
                                    <View className="flex-row items-center mt-3">
                                        <Ionicons name="star-outline" size={20} color="#6b7280" />
                                        <Text className="text-gray-700 ml-3 flex-1">Story Points</Text>
                                        <Text className="font-medium text-gray-900">
                                            {template.defaultStoryPoints} pts
                                        </Text>
                                    </View>
                                )}

                                {/* Recurrence */}
                                {template.recurrencePattern && (
                                    <View className="flex-row items-center mt-3">
                                        <Ionicons name="repeat" size={20} color="#6b7280" />
                                        <Text className="text-gray-700 ml-3 flex-1">Recurrence</Text>
                                        <Text className="font-medium text-gray-900">
                                            {getRecurrenceText()}
                                        </Text>
                                    </View>
                                )}

                                {/* Sprint Suggestion */}
                                {template.suggestedSprint && (
                                    <View className="flex-row items-center mt-3">
                                        <Ionicons name="calendar-outline" size={20} color="#6b7280" />
                                        <Text className="text-gray-700 ml-3 flex-1">Suggested Sprint</Text>
                                        <Text className="font-medium text-gray-900 capitalize">
                                            {template.suggestedSprint.toLowerCase().replace('_', ' ')}
                                        </Text>
                                    </View>
                                )}

                                {/* Event-specific fields */}
                                {template.type === 'event' && (
                                    <>
                                        {template.defaultLocation && (
                                            <View className="flex-row items-center mt-3">
                                                <Ionicons name="location-outline" size={20} color="#6b7280" />
                                                <Text className="text-gray-700 ml-3 flex-1">Location</Text>
                                                <Text className="font-medium text-gray-900">
                                                    {template.defaultLocation}
                                                </Text>
                                            </View>
                                        )}
                                        {template.isAllDay !== undefined && (
                                            <View className="flex-row items-center mt-3">
                                                <Ionicons name="sunny-outline" size={20} color="#6b7280" />
                                                <Text className="text-gray-700 ml-3 flex-1">All Day</Text>
                                                <Text className="font-medium text-gray-900">
                                                    {template.isAllDay ? 'Yes' : 'No'}
                                                </Text>
                                            </View>
                                        )}
                                    </>
                                )}
                            </View>
                        </View>

                        {/* Tags */}
                        {template.tags && template.tags.length > 0 && (
                            <View className="mb-6">
                                <Text className="text-sm font-medium text-gray-500 mb-3">Tags</Text>
                                <View className="flex-row flex-wrap gap-2">
                                    {template.tags.map((tag, index) => (
                                        <View
                                            key={index}
                                            className="px-3 py-1.5 bg-gray-100 rounded-full"
                                        >
                                            <Text className="text-gray-700">#{tag}</Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        )}

                        {/* Clone option for global templates */}
                        {template.creatorType === 'system' && onCloneTemplate && (
                            <TouchableOpacity
                                onPress={() => onCloneTemplate(template)}
                                className="mb-4 border border-gray-200 rounded-xl py-3 items-center flex-row justify-center"
                            >
                                <Ionicons name="copy-outline" size={20} color="#6b7280" />
                                <Text className="text-gray-700 font-medium ml-2">
                                    Clone to My Templates
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </ScrollView>

                {/* Action Button */}
                <View className="px-4 py-4 border-t border-gray-100">
                    <TouchableOpacity
                        onPress={() => onUseTemplate(template)}
                        className="bg-blue-600 rounded-xl py-4 items-center flex-row justify-center"
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
