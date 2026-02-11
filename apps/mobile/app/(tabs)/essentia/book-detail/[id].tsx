import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { Container } from '../../../../components/layout/Container';
import { Card } from '../../../../components/ui/Card';
import { useBook, useToggleBookFavorite, useStartBook } from '../../../../hooks/queries';
import { useTranslation } from '../../../../hooks/useTranslation';

const { width } = Dimensions.get('window');

const LIFE_WHEEL_COLORS: Record<string, string> = {
    'lw-1': '#EF4444', // Health — red
    'lw-2': '#3B82F6', // Career — blue
    'lw-3': '#10B981', // Finance — emerald
    'lw-4': '#8B5CF6', // Personal Growth — violet
    'lw-5': '#EC4899', // Relationships — pink
    'lw-6': '#F59E0B', // Social — amber
    'lw-7': '#06B6D4', // Fun — cyan
    'lw-8': '#84CC16', // Environment — lime
};

const LIFE_WHEEL_LABELS: Record<string, string> = {
    'lw-1': 'Health & Fitness',
    'lw-2': 'Career & Work',
    'lw-3': 'Finance & Money',
    'lw-4': 'Personal Growth',
    'lw-5': 'Relationships',
    'lw-6': 'Social Life',
    'lw-7': 'Fun & Recreation',
    'lw-8': 'Environment & Home',
};

type TabId = 'overview' | 'summary' | 'methodology';

export default function BookDetailScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const { t } = useTranslation();
    const { data: book, isLoading } = useBook(id!);
    const toggleFavorite = useToggleBookFavorite();
    const startBook = useStartBook();
    const [activeTab, setActiveTab] = useState<TabId>('overview');

    if (isLoading || !book) {
        return (
            <Container>
                <View className="flex-1 items-center justify-center">
                    <Text className="text-gray-500">{isLoading ? 'Loading...' : 'Book not found'}</Text>
                </View>
            </Container>
        );
    }

    const accentColor = LIFE_WHEEL_COLORS[book.lifeWheelAreaId] || '#8B5CF6';
    const areaLabel = LIFE_WHEEL_LABELS[book.lifeWheelAreaId] || book.category;

    const handleStartReading = () => {
        startBook.mutate(book.id);
        router.push(`/essentia/reader/${book.id}` as never);
    };

    const tabs: { id: TabId; label: string; icon: string }[] = [
        { id: 'overview', label: 'Overview', icon: 'book-open-page-variant' },
        { id: 'summary', label: 'Summary', icon: 'text-box-outline' },
        { id: 'methodology', label: 'Method', icon: 'lightbulb-outline' },
    ];

    return (
        <Container>
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View className="p-4 flex-row items-center justify-between">
                    <TouchableOpacity onPress={() => router.back()} className="p-2">
                        <MaterialCommunityIcons name="arrow-left" size={24} color="#111827" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => toggleFavorite.mutate(book.id)}
                        className="p-2"
                    >
                        <MaterialCommunityIcons
                            name="bookmark-outline"
                            size={24}
                            color="#6B7280"
                        />
                    </TouchableOpacity>
                </View>

                {/* Hero Cover */}
                <Animated.View entering={FadeIn.duration(400)} className="items-center mb-6">
                    <View
                        className="w-48 h-64 rounded-2xl items-center justify-center shadow-lg"
                        style={{ backgroundColor: `${accentColor}20` }}
                    >
                        <MaterialCommunityIcons
                            name="book-open-page-variant"
                            size={80}
                            color={accentColor}
                        />
                    </View>
                    {book.isFeatured && (
                        <View className="absolute top-2 right-2 bg-amber-400 px-3 py-1 rounded-full flex-row items-center">
                            <MaterialCommunityIcons name="star" size={14} color="#fff" />
                            <Text className="text-xs font-bold text-white ml-1">Featured</Text>
                        </View>
                    )}
                </Animated.View>

                {/* Title & Author */}
                <Animated.View entering={FadeInDown.delay(100).duration(400)} className="px-4">
                    <Text className="text-3xl font-bold text-gray-900 text-center mb-1">
                        {book.title}
                    </Text>
                    <Text className="text-lg text-gray-500 text-center mb-4">
                        by {book.author}
                    </Text>

                    {/* Life Wheel Badge + Meta Row */}
                    <View className="flex-row items-center justify-center mb-4 gap-3">
                        <View
                            className="px-3 py-1.5 rounded-full flex-row items-center"
                            style={{ backgroundColor: `${accentColor}15` }}
                        >
                            <View className="w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: accentColor }} />
                            <Text className="text-xs font-semibold" style={{ color: accentColor }}>
                                {areaLabel}
                            </Text>
                        </View>
                        {book.rating != null && book.rating > 0 && (
                            <View className="flex-row items-center">
                                <MaterialCommunityIcons name="star" size={16} color="#F59E0B" />
                                <Text className="text-sm font-semibold text-gray-700 ml-0.5">
                                    {Number(book.rating).toFixed(1)}
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* Quick Stats */}
                    <View className="flex-row justify-center mb-6 gap-6">
                        <View className="items-center">
                            <MaterialCommunityIcons name="clock-outline" size={22} color="#6B7280" />
                            <Text className="text-sm font-medium text-gray-700 mt-1">{book.duration} min</Text>
                        </View>
                        <View className="items-center">
                            <MaterialCommunityIcons name="cards-outline" size={22} color="#6B7280" />
                            <Text className="text-sm font-medium text-gray-700 mt-1">{book.cardCount} cards</Text>
                        </View>
                        <View className="items-center">
                            <MaterialCommunityIcons name="signal-cellular-3" size={22} color="#6B7280" />
                            <Text className="text-sm font-medium text-gray-700 mt-1 capitalize">{book.difficulty}</Text>
                        </View>
                        {book.publicationYear && (
                            <View className="items-center">
                                <MaterialCommunityIcons name="calendar-blank" size={22} color="#6B7280" />
                                <Text className="text-sm font-medium text-gray-700 mt-1">{book.publicationYear}</Text>
                            </View>
                        )}
                    </View>
                </Animated.View>

                {/* Tab Switcher */}
                <Animated.View entering={FadeInDown.delay(200).duration(400)} className="px-4 mb-4">
                    <View className="flex-row bg-gray-100 rounded-xl p-1">
                        {tabs.map((tab) => (
                            <TouchableOpacity
                                key={tab.id}
                                onPress={() => setActiveTab(tab.id)}
                                className={`flex-1 py-2.5 rounded-lg flex-row items-center justify-center ${
                                    activeTab === tab.id ? 'bg-white shadow-sm' : ''
                                }`}
                            >
                                <MaterialCommunityIcons
                                    name={tab.icon as never}
                                    size={16}
                                    color={activeTab === tab.id ? accentColor : '#9CA3AF'}
                                />
                                <Text
                                    className={`text-sm font-medium ml-1.5 ${
                                        activeTab === tab.id ? 'text-gray-900' : 'text-gray-500'
                                    }`}
                                >
                                    {tab.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </Animated.View>

                {/* Tab Content */}
                <Animated.View entering={FadeInDown.delay(300).duration(400)} className="px-4">
                    {activeTab === 'overview' && (
                        <View>
                            {/* Description */}
                            <Text className="text-base text-gray-700 leading-relaxed mb-6">
                                {book.description}
                            </Text>

                            {/* Key Takeaways */}
                            {book.keyTakeaways && book.keyTakeaways.length > 0 && (
                                <View className="mb-6">
                                    <Text className="text-xl font-bold text-gray-900 mb-3">
                                        🎯 What You&apos;ll Learn
                                    </Text>
                                    {book.keyTakeaways.map((takeaway, index) => (
                                        <View key={index} className="flex-row mb-3">
                                            <View
                                                className="w-6 h-6 rounded-full items-center justify-center mt-0.5 mr-3"
                                                style={{ backgroundColor: `${accentColor}20` }}
                                            >
                                                <Text
                                                    className="text-xs font-bold"
                                                    style={{ color: accentColor }}
                                                >
                                                    {index + 1}
                                                </Text>
                                            </View>
                                            <Text className="flex-1 text-gray-700 leading-relaxed">
                                                {takeaway}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            )}

                            {/* Tags */}
                            {book.tags && book.tags.length > 0 && (
                                <View className="flex-row flex-wrap gap-2 mb-6">
                                    {book.tags.map((tag) => (
                                        <View
                                            key={tag}
                                            className="px-3 py-1.5 rounded-full"
                                            style={{ backgroundColor: `${accentColor}10` }}
                                        >
                                            <Text
                                                className="text-xs font-medium"
                                                style={{ color: accentColor }}
                                            >
                                                {tag}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            )}
                        </View>
                    )}

                    {activeTab === 'summary' && (
                        <View>
                            {book.summaryText ? (
                                <View className="mb-6">
                                    <Text className="text-xl font-bold text-gray-900 mb-3">
                                        📖 Book Summary
                                    </Text>
                                    <Card className="p-4 border-l-4" style={{ borderLeftColor: accentColor }}>
                                        <Text className="text-base text-gray-700 leading-relaxed">
                                            {book.summaryText}
                                        </Text>
                                    </Card>
                                </View>
                            ) : (
                                <View className="items-center py-8">
                                    <MaterialCommunityIcons name="text-box-outline" size={48} color="#D1D5DB" />
                                    <Text className="text-gray-400 mt-2">Summary coming soon</Text>
                                </View>
                            )}

                            {/* App Application */}
                            {book.appApplication && (
                                <View className="mb-6">
                                    <Text className="text-xl font-bold text-gray-900 mb-3">
                                        🚀 Apply in KAIZ LifeOS
                                    </Text>
                                    <Card className="p-4 bg-violet-50">
                                        <Text className="text-base text-gray-700 leading-relaxed">
                                            {book.appApplication}
                                        </Text>
                                    </Card>
                                </View>
                            )}
                        </View>
                    )}

                    {activeTab === 'methodology' && (
                        <View>
                            {book.coreMethodology ? (
                                <View className="mb-6">
                                    <Text className="text-xl font-bold text-gray-900 mb-3">
                                        💡 Core Methodology
                                    </Text>
                                    <Card className="p-4">
                                        <View
                                            className="w-12 h-12 rounded-xl items-center justify-center mb-3"
                                            style={{ backgroundColor: `${accentColor}15` }}
                                        >
                                            <MaterialCommunityIcons
                                                name="lightbulb-on-outline"
                                                size={28}
                                                color={accentColor}
                                            />
                                        </View>
                                        <Text className="text-base text-gray-700 leading-relaxed">
                                            {book.coreMethodology}
                                        </Text>
                                    </Card>
                                </View>
                            ) : (
                                <View className="items-center py-8">
                                    <MaterialCommunityIcons name="lightbulb-outline" size={48} color="#D1D5DB" />
                                    <Text className="text-gray-400 mt-2">Methodology details coming soon</Text>
                                </View>
                            )}

                            {/* Card Preview */}
                            {book.cards && book.cards.length > 0 && (
                                <View className="mb-6">
                                    <Text className="text-xl font-bold text-gray-900 mb-3">
                                        📚 Card Preview
                                    </Text>
                                    {book.cards.slice(0, 3).map((card, index) => (
                                        <Card key={card.id || index} className="p-3 mb-2 flex-row items-center">
                                            <View
                                                className="w-8 h-8 rounded-lg items-center justify-center mr-3"
                                                style={{ backgroundColor: `${accentColor}15` }}
                                            >
                                                <Text
                                                    className="text-xs font-bold"
                                                    style={{ color: accentColor }}
                                                >
                                                    {index + 1}
                                                </Text>
                                            </View>
                                            <View className="flex-1">
                                                <Text className="text-sm font-semibold text-gray-900">
                                                    {card.title}
                                                </Text>
                                                <Text className="text-xs text-gray-500 capitalize">
                                                    {card.type}
                                                </Text>
                                            </View>
                                        </Card>
                                    ))}
                                    {book.cards.length > 3 && (
                                        <Text className="text-sm text-gray-400 text-center mt-1">
                                            +{book.cards.length - 3} more cards
                                        </Text>
                                    )}
                                </View>
                            )}
                        </View>
                    )}
                </Animated.View>

                {/* CTA Button */}
                <Animated.View entering={FadeInDown.delay(400).duration(400)} className="px-4 pb-8">
                    <TouchableOpacity
                        onPress={handleStartReading}
                        className="rounded-2xl py-4 items-center flex-row justify-center"
                        style={{ backgroundColor: accentColor }}
                    >
                        <MaterialCommunityIcons name="book-open-page-variant" size={20} color="#fff" />
                        <Text className="text-white text-lg font-bold ml-2">Start Reading</Text>
                    </TouchableOpacity>
                </Animated.View>
            </ScrollView>
        </Container>
    );
}
