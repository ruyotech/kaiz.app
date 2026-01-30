import React from 'react';
import { View, Text, TouchableOpacity, Pressable } from 'react-native';
import { TaskTemplate } from '../../types/models';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Ionicons } from '@expo/vector-icons';

interface TemplateCardProps {
    template: TaskTemplate;
    onPress?: () => void;
    onFavoritePress?: () => void;
    onUsePress?: () => void;
    showActions?: boolean;
    compact?: boolean;
}

export const LIFE_WHEEL_CONFIG: Record<string, { color: string; name: string; emoji: string }> = {
    'lw-1': { color: '#10b981', name: 'Health', emoji: '💪' },
    'lw-2': { color: '#3b82f6', name: 'Career', emoji: '💼' },
    'lw-3': { color: '#f59e0b', name: 'Finance', emoji: '💰' },
    'lw-4': { color: '#8b5cf6', name: 'Growth', emoji: '📚' },
    'lw-5': { color: '#ef4444', name: 'Family & Romance', emoji: '❤️' },
    'lw-6': { color: '#ec4899', name: 'Friends', emoji: '👥' },
    'lw-7': { color: '#14b8a6', name: 'Fun', emoji: '🎉' },
    'lw-8': { color: '#84cc16', name: 'Environment', emoji: '🌍' },
};

const getLifeWheelConfig = (areaId: string) => {
    return LIFE_WHEEL_CONFIG[areaId] || { color: '#6b7280', name: 'General', emoji: '📋' };
};

const renderStars = (rating: number, size: number = 14) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
        if (i < fullStars) {
            stars.push(
                <Ionicons key={i} name="star" size={size} color="#fbbf24" />
            );
        } else if (i === fullStars && hasHalfStar) {
            stars.push(
                <Ionicons key={i} name="star-half" size={size} color="#fbbf24" />
            );
        } else {
            stars.push(
                <Ionicons key={i} name="star-outline" size={size} color="#d1d5db" />
            );
        }
    }
    return stars;
};

export function TemplateCard({
    template,
    onPress,
    onFavoritePress,
    onUsePress,
    showActions = true,
    compact = false,
}: TemplateCardProps) {
    const wheelConfig = getLifeWheelConfig(template.defaultLifeWheelAreaId || '');
    const isEvent = template.type === 'event';

    if (compact) {
        return (
            <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
                <Card
                    className="mb-2"
                    style={{
                        borderLeftWidth: 3,
                        borderLeftColor: wheelConfig.color,
                    }}
                >
                    <View className="flex-row items-center">
                        {/* Icon */}
                        <View
                            className="w-10 h-10 rounded-full items-center justify-center mr-3"
                            style={{ backgroundColor: wheelConfig.color + '20' }}
                        >
                            <Text className="text-lg">{template.icon || wheelConfig.emoji}</Text>
                        </View>

                        {/* Content */}
                        <View className="flex-1">
                            <Text className="font-semibold text-gray-900" numberOfLines={1}>
                                {template.name}
                            </Text>
                            <View className="flex-row items-center mt-1">
                                <View className="flex-row items-center mr-3">
                                    {renderStars(template.rating, 10)}
                                </View>
                                <Text className="text-xs text-gray-500">
                                    {template.usageCount} uses
                                </Text>
                            </View>
                        </View>

                        {/* Favorite */}
                        {showActions && (
                            <Pressable
                                onPress={(e) => {
                                    e.stopPropagation();
                                    onFavoritePress?.();
                                }}
                                className="p-2"
                            >
                                <Ionicons
                                    name={template.isFavorite ? 'heart' : 'heart-outline'}
                                    size={20}
                                    color={template.isFavorite ? '#ef4444' : '#9ca3af'}
                                />
                            </Pressable>
                        )}
                    </View>
                </Card>
            </TouchableOpacity>
        );
    }

    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
            <Card
                className="mb-4"
                style={{
                    borderLeftWidth: 4,
                    borderLeftColor: wheelConfig.color,
                    backgroundColor: template.color || '#ffffff',
                }}
            >
                {/* Header Row */}
                <View className="flex-row items-start justify-between mb-3">
                    {/* Life Wheel Badge */}
                    <View
                        className="px-3 py-1 rounded-full flex-row items-center"
                        style={{ backgroundColor: wheelConfig.color + '20' }}
                    >
                        <Text className="mr-1">{wheelConfig.emoji}</Text>
                        <Text className="text-sm font-semibold" style={{ color: wheelConfig.color }}>
                            {wheelConfig.name}
                        </Text>
                    </View>

                    {/* Type Badge + Favorite */}
                    <View className="flex-row items-center">
                        <Badge variant={isEvent ? 'info' : 'default'} size="sm">
                            {isEvent ? '📅 Event' : '✅ Task'}
                        </Badge>
                        {showActions && (
                            <Pressable
                                onPress={(e) => {
                                    e.stopPropagation();
                                    onFavoritePress?.();
                                }}
                                className="ml-2 p-1"
                            >
                                <Ionicons
                                    name={template.isFavorite ? 'heart' : 'heart-outline'}
                                    size={22}
                                    color={template.isFavorite ? '#ef4444' : '#9ca3af'}
                                />
                            </Pressable>
                        )}
                    </View>
                </View>

                {/* Title & Description */}
                <View className="flex-row items-start mb-3">
                    <View
                        className="w-12 h-12 rounded-xl items-center justify-center mr-3"
                        style={{ backgroundColor: wheelConfig.color + '15' }}
                    >
                        <Text className="text-2xl">{template.icon || wheelConfig.emoji}</Text>
                    </View>
                    <View className="flex-1">
                        <Text className="text-lg font-bold text-gray-900" numberOfLines={2}>
                            {template.name}
                        </Text>
                        {template.description && (
                            <Text className="text-sm text-gray-600 mt-1" numberOfLines={2}>
                                {template.description}
                            </Text>
                        )}
                    </View>
                </View>

                {/* Stats Row */}
                <View className="flex-row items-center justify-between pt-3 border-t border-gray-100">
                    {/* Rating */}
                    <View className="flex-row items-center">
                        <View className="flex-row mr-1">{renderStars(template.rating)}</View>
                        <Text className="text-sm text-gray-600 ml-1">
                            {template.rating.toFixed(1)}
                        </Text>
                        {template.ratingCount > 0 && (
                            <Text className="text-xs text-gray-400 ml-1">
                                ({template.ratingCount})
                            </Text>
                        )}
                    </View>

                    {/* Usage Count */}
                    <View className="flex-row items-center">
                        <Ionicons name="people-outline" size={16} color="#6b7280" />
                        <Text className="text-sm text-gray-600 ml-1">
                            {template.usageCount.toLocaleString()} uses
                        </Text>
                    </View>
                </View>

                {/* Tags */}
                {template.tags && template.tags.length > 0 && (
                    <View className="flex-row flex-wrap mt-3 gap-1">
                        {template.tags.slice(0, 3).map((tag, index) => (
                            <View
                                key={index}
                                className="px-2 py-0.5 rounded-md bg-gray-100"
                            >
                                <Text className="text-xs text-gray-600">#{tag}</Text>
                            </View>
                        ))}
                        {template.tags.length > 3 && (
                            <View className="px-2 py-0.5 rounded-md bg-gray-100">
                                <Text className="text-xs text-gray-500">
                                    +{template.tags.length - 3}
                                </Text>
                            </View>
                        )}
                    </View>
                )}

                {/* Quick Duration/Recurrence Info */}
                <View className="flex-row items-center mt-3 gap-3">
                    {template.defaultDuration && (
                        <View className="flex-row items-center">
                            <Ionicons name="time-outline" size={14} color="#6b7280" />
                            <Text className="text-xs text-gray-500 ml-1">
                                {template.defaultDuration} min
                            </Text>
                        </View>
                    )}
                    {template.recurrencePattern && (
                        <View className="flex-row items-center">
                            <Ionicons name="repeat-outline" size={14} color="#6b7280" />
                            <Text className="text-xs text-gray-500 ml-1">
                                {template.recurrencePattern.frequency}
                            </Text>
                        </View>
                    )}
                    {template.defaultStoryPoints && (
                        <View className="flex-row items-center">
                            <Ionicons name="star-outline" size={14} color="#6b7280" />
                            <Text className="text-xs text-gray-500 ml-1">
                                {template.defaultStoryPoints} pts
                            </Text>
                        </View>
                    )}
                </View>

                {/* Use Template Button */}
                {showActions && onUsePress && (
                    <TouchableOpacity
                        onPress={(e) => {
                            e.stopPropagation();
                            onUsePress();
                        }}
                        className="mt-4 bg-blue-600 rounded-xl py-3 items-center"
                        activeOpacity={0.8}
                    >
                        <View className="flex-row items-center">
                            <Ionicons name="add-circle-outline" size={20} color="white" />
                            <Text className="text-white font-semibold ml-2">
                                Use Template
                            </Text>
                        </View>
                    </TouchableOpacity>
                )}

                {/* Creator Badge */}
                {template.creatorType === 'system' && (
                    <View className="absolute top-3 right-3">
                        <View className="bg-yellow-100 px-2 py-0.5 rounded-full">
                            <Text className="text-xs text-yellow-700 font-medium">⭐ Global</Text>
                        </View>
                    </View>
                )}
            </Card>
        </TouchableOpacity>
    );
}

export default TemplateCard;
