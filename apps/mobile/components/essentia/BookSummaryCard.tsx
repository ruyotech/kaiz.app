import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Card } from '../ui/Card';
import { EssentiaBook } from '../../types/models';

const LIFE_WHEEL_COLORS: Record<string, string> = {
    'lw-1': '#EF4444',
    'lw-2': '#3B82F6',
    'lw-3': '#10B981',
    'lw-4': '#8B5CF6',
    'lw-5': '#EC4899',
    'lw-6': '#F59E0B',
    'lw-7': '#06B6D4',
    'lw-8': '#84CC16',
};

interface BookSummaryCardProps {
    book: EssentiaBook;
    index?: number;
    variant?: 'compact' | 'featured' | 'list';
    onPress: () => void;
    onToggleFavorite?: () => void;
    isFavorite?: boolean;
}

export const BookSummaryCard = React.memo(function BookSummaryCard({
    book,
    index = 0,
    variant = 'compact',
    onPress,
    onToggleFavorite,
    isFavorite,
}: BookSummaryCardProps) {
    const accentColor = LIFE_WHEEL_COLORS[book.lifeWheelAreaId] || '#8B5CF6';

    if (variant === 'featured') {
        return (
            <Animated.View entering={FadeInDown.delay(index * 80).duration(400)}>
                <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
                    <Card className="p-0 overflow-hidden">
                        {/* Cover */}
                        <View
                            className="h-44 items-center justify-center"
                            style={{ backgroundColor: `${accentColor}15` }}
                        >
                            <MaterialCommunityIcons
                                name="book-open-page-variant"
                                size={64}
                                color={accentColor}
                            />
                            {book.isFeatured && (
                                <View className="absolute top-3 left-3 bg-amber-400 px-2.5 py-1 rounded-full flex-row items-center">
                                    <MaterialCommunityIcons name="star" size={12} color="#fff" />
                                    <Text className="text-[10px] font-bold text-white ml-0.5">Featured</Text>
                                </View>
                            )}
                        </View>

                        <View className="p-4">
                            <Text className="text-xl font-bold text-gray-900 mb-1" numberOfLines={2}>
                                {book.title}
                            </Text>
                            <Text className="text-sm text-gray-500 mb-3">by {book.author}</Text>

                            {/* Core Methodology Snippet */}
                            {book.coreMethodology && (
                                <View className="bg-gray-50 rounded-lg p-3 mb-3">
                                    <Text className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                                        Core Method
                                    </Text>
                                    <Text className="text-sm text-gray-700" numberOfLines={2}>
                                        {book.coreMethodology}
                                    </Text>
                                </View>
                            )}

                            {/* Meta */}
                            <View className="flex-row items-center justify-between">
                                <View className="flex-row items-center gap-3">
                                    <View className="flex-row items-center">
                                        <MaterialCommunityIcons name="clock-outline" size={14} color="#6B7280" />
                                        <Text className="text-xs text-gray-500 ml-1">{book.duration} min</Text>
                                    </View>
                                    <View className="flex-row items-center">
                                        <MaterialCommunityIcons name="cards-outline" size={14} color="#6B7280" />
                                        <Text className="text-xs text-gray-500 ml-1">{book.cardCount} cards</Text>
                                    </View>
                                    {book.rating != null && Number(book.rating) > 0 && (
                                        <View className="flex-row items-center">
                                            <MaterialCommunityIcons name="star" size={14} color="#F59E0B" />
                                            <Text className="text-xs text-gray-600 ml-0.5 font-medium">
                                                {Number(book.rating).toFixed(1)}
                                            </Text>
                                        </View>
                                    )}
                                </View>
                                <View
                                    className="px-2.5 py-1 rounded-full"
                                    style={{ backgroundColor: `${accentColor}15` }}
                                >
                                    <Text className="text-[10px] font-semibold" style={{ color: accentColor }}>
                                        {book.difficulty}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </Card>
                </TouchableOpacity>
            </Animated.View>
        );
    }

    if (variant === 'list') {
        return (
            <Animated.View entering={FadeInDown.delay(index * 60).duration(300)}>
                <TouchableOpacity onPress={onPress} className="mb-3">
                    <Card className="p-4">
                        <View className="flex-row">
                            <View
                                className="w-16 h-20 rounded-lg items-center justify-center mr-3"
                                style={{ backgroundColor: `${accentColor}12` }}
                            >
                                <MaterialCommunityIcons
                                    name="book-open-page-variant"
                                    size={32}
                                    color={accentColor}
                                />
                            </View>
                            <View className="flex-1">
                                <Text className="text-base font-bold text-gray-900 mb-0.5" numberOfLines={1}>
                                    {book.title}
                                </Text>
                                <Text className="text-sm text-gray-500 mb-2">{book.author}</Text>
                                <View className="flex-row items-center gap-2">
                                    <View className="flex-row items-center">
                                        <MaterialCommunityIcons name="clock-outline" size={12} color="#9CA3AF" />
                                        <Text className="text-xs text-gray-400 ml-0.5">{book.duration} min</Text>
                                    </View>
                                    <Text className="text-xs text-gray-300">•</Text>
                                    <Text className="text-xs text-gray-400 capitalize">{book.difficulty}</Text>
                                    {book.rating != null && Number(book.rating) > 0 && (
                                        <>
                                            <Text className="text-xs text-gray-300">•</Text>
                                            <View className="flex-row items-center">
                                                <MaterialCommunityIcons name="star" size={12} color="#F59E0B" />
                                                <Text className="text-xs text-gray-500 ml-0.5">
                                                    {Number(book.rating).toFixed(1)}
                                                </Text>
                                            </View>
                                        </>
                                    )}
                                </View>
                            </View>
                            {onToggleFavorite && (
                                <TouchableOpacity onPress={onToggleFavorite} className="ml-2 self-center">
                                    <MaterialCommunityIcons
                                        name={isFavorite ? 'bookmark' : 'bookmark-outline'}
                                        size={22}
                                        color={isFavorite ? accentColor : '#9CA3AF'}
                                    />
                                </TouchableOpacity>
                            )}
                        </View>
                    </Card>
                </TouchableOpacity>
            </Animated.View>
        );
    }

    // compact (default) — grid card
    return (
        <Animated.View entering={FadeInDown.delay(index * 60).duration(300)} className="w-[48%]">
            <TouchableOpacity onPress={onPress}>
                <Card className="p-0 overflow-hidden">
                    <View
                        className="h-36 items-center justify-center"
                        style={{ backgroundColor: `${accentColor}12` }}
                    >
                        <MaterialCommunityIcons
                            name="book-open-page-variant"
                            size={44}
                            color={accentColor}
                        />
                        {book.isFeatured && (
                            <View className="absolute top-2 left-2">
                                <MaterialCommunityIcons name="star-circle" size={20} color="#F59E0B" />
                            </View>
                        )}
                    </View>
                    <View className="p-3">
                        <Text className="text-sm font-bold text-gray-900 mb-0.5" numberOfLines={2}>
                            {book.title}
                        </Text>
                        <Text className="text-xs text-gray-500 mb-2" numberOfLines={1}>
                            {book.author}
                        </Text>
                        <View className="flex-row items-center justify-between">
                            <Text className="text-xs text-gray-400">{book.duration} min</Text>
                            {onToggleFavorite && (
                                <TouchableOpacity onPress={onToggleFavorite}>
                                    <MaterialCommunityIcons
                                        name={isFavorite ? 'bookmark' : 'bookmark-outline'}
                                        size={18}
                                        color={isFavorite ? accentColor : '#9CA3AF'}
                                    />
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                </Card>
            </TouchableOpacity>
        </Animated.View>
    );
});
