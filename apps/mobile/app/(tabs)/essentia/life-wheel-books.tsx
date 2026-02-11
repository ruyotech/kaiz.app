import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Container } from '../../../components/layout/Container';
import { Card } from '../../../components/ui/Card';
import { BookSummaryCard } from '../../../components/essentia/BookSummaryCard';
import { useAllBooks, useFeaturedBooks } from '../../../hooks/queries';
import { useTranslation } from '../../../hooks/useTranslation';
import { EssentiaBook, LifeWheelDimensionTag } from '../../../types/models';

interface LifeWheelSection {
    id: LifeWheelDimensionTag;
    label: string;
    icon: string;
    color: string;
    emoji: string;
}

const LIFE_WHEEL_SECTIONS: LifeWheelSection[] = [
    { id: 'lw-1', label: 'Health & Fitness', icon: 'heart-pulse', color: '#EF4444', emoji: '💪' },
    { id: 'lw-2', label: 'Career & Work', icon: 'briefcase-outline', color: '#3B82F6', emoji: '💼' },
    { id: 'lw-3', label: 'Finance & Money', icon: 'cash-multiple', color: '#10B981', emoji: '💰' },
    { id: 'lw-4', label: 'Personal Growth', icon: 'head-lightbulb-outline', color: '#8B5CF6', emoji: '🌱' },
    { id: 'lw-5', label: 'Relationships', icon: 'heart-outline', color: '#EC4899', emoji: '❤️' },
    { id: 'lw-6', label: 'Social Life', icon: 'account-group-outline', color: '#F59E0B', emoji: '🤝' },
    { id: 'lw-7', label: 'Fun & Recreation', icon: 'palette-outline', color: '#06B6D4', emoji: '🎨' },
    { id: 'lw-8', label: 'Environment & Home', icon: 'home-outline', color: '#84CC16', emoji: '🏡' },
];

export default function LifeWheelBooksScreen() {
    const router = useRouter();
    const { t } = useTranslation();
    const { data: allBooks = [], isLoading } = useAllBooks();
    const { data: featuredBooks = [] } = useFeaturedBooks();
    const [selectedArea, setSelectedArea] = useState<LifeWheelDimensionTag | 'all'>('all');

    const booksByArea = useMemo(() => {
        const grouped: Record<string, EssentiaBook[]> = {};
        for (const section of LIFE_WHEEL_SECTIONS) {
            grouped[section.id] = allBooks.filter(
                (b) => b.lifeWheelAreaId === section.id
            );
        }
        return grouped;
    }, [allBooks]);

    const displayBooks = useMemo(() => {
        if (selectedArea === 'all') return allBooks;
        return booksByArea[selectedArea] || [];
    }, [selectedArea, allBooks, booksByArea]);

    if (isLoading) {
        return (
            <Container>
                <View className="flex-1 items-center justify-center">
                    <Text className="text-gray-500">Loading books...</Text>
                </View>
            </Container>
        );
    }

    return (
        <Container>
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View className="p-4 pb-2 flex-row items-center">
                    <TouchableOpacity onPress={() => router.back()} className="p-2 mr-2">
                        <MaterialCommunityIcons name="arrow-left" size={24} color="#111827" />
                    </TouchableOpacity>
                    <View className="flex-1">
                        <Text className="text-2xl font-bold text-gray-900">Life Wheel Library</Text>
                        <Text className="text-sm text-gray-500">{allBooks.length} curated books</Text>
                    </View>
                </View>

                {/* Featured Books Carousel */}
                {featuredBooks.length > 0 && selectedArea === 'all' && (
                    <Animated.View entering={FadeInDown.delay(100).duration(400)} className="mb-4">
                        <Text className="text-lg font-bold text-gray-900 px-4 mb-3">
                            ⭐ Featured Reads
                        </Text>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
                        >
                            {featuredBooks.map((book, index) => (
                                <View key={book.id} style={{ width: 280 }}>
                                    <BookSummaryCard
                                        book={book}
                                        index={index}
                                        variant="featured"
                                        onPress={() => router.push(`/essentia/book-detail/${book.id}` as never)}
                                    />
                                </View>
                            ))}
                        </ScrollView>
                    </Animated.View>
                )}

                {/* Life Wheel Area Selector */}
                <Animated.View entering={FadeInDown.delay(200).duration(400)}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        className="mb-4"
                        contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
                    >
                        <TouchableOpacity
                            onPress={() => setSelectedArea('all')}
                            className={`px-4 py-2.5 rounded-xl flex-row items-center ${
                                selectedArea === 'all' ? 'bg-gray-900' : 'bg-gray-100'
                            }`}
                        >
                            <Text className={`font-semibold text-sm ${
                                selectedArea === 'all' ? 'text-white' : 'text-gray-700'
                            }`}>
                                All
                            </Text>
                        </TouchableOpacity>
                        {LIFE_WHEEL_SECTIONS.map((section) => {
                            const count = (booksByArea[section.id] || []).length;
                            const isActive = selectedArea === section.id;
                            return (
                                <TouchableOpacity
                                    key={section.id}
                                    onPress={() => setSelectedArea(section.id)}
                                    className={`px-4 py-2.5 rounded-xl flex-row items-center ${
                                        isActive ? '' : 'bg-gray-100'
                                    }`}
                                    style={isActive ? { backgroundColor: `${section.color}15` } : undefined}
                                >
                                    <Text className="mr-1.5">{section.emoji}</Text>
                                    <Text
                                        className="font-semibold text-sm"
                                        style={isActive ? { color: section.color } : { color: '#374151' }}
                                    >
                                        {section.label.split(' & ')[0]}
                                    </Text>
                                    <View
                                        className="ml-1.5 px-1.5 py-0.5 rounded-full"
                                        style={{ backgroundColor: isActive ? `${section.color}25` : '#E5E7EB' }}
                                    >
                                        <Text
                                            className="text-[10px] font-bold"
                                            style={{ color: isActive ? section.color : '#6B7280' }}
                                        >
                                            {count}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </Animated.View>

                {/* Books Grid/List */}
                {selectedArea === 'all' ? (
                    // Grouped by Life Wheel Area
                    <View className="px-4 pb-6">
                        {LIFE_WHEEL_SECTIONS.map((section) => {
                            const sectionBooks = booksByArea[section.id] || [];
                            if (sectionBooks.length === 0) return null;
                            return (
                                <Animated.View
                                    key={section.id}
                                    entering={FadeInDown.delay(300).duration(400)}
                                    className="mb-6"
                                >
                                    <View className="flex-row items-center justify-between mb-3">
                                        <View className="flex-row items-center">
                                            <View
                                                className="w-8 h-8 rounded-lg items-center justify-center mr-2"
                                                style={{ backgroundColor: `${section.color}15` }}
                                            >
                                                <MaterialCommunityIcons
                                                    name={section.icon as never}
                                                    size={18}
                                                    color={section.color}
                                                />
                                            </View>
                                            <Text className="text-lg font-bold text-gray-900">
                                                {section.label}
                                            </Text>
                                        </View>
                                        <TouchableOpacity onPress={() => setSelectedArea(section.id)}>
                                            <Text className="text-sm font-medium" style={{ color: section.color }}>
                                                See all ({sectionBooks.length})
                                            </Text>
                                        </TouchableOpacity>
                                    </View>

                                    {/* Horizontal scroll of books */}
                                    <ScrollView
                                        horizontal
                                        showsHorizontalScrollIndicator={false}
                                        contentContainerStyle={{ gap: 12 }}
                                    >
                                        {sectionBooks.slice(0, 5).map((book, idx) => (
                                            <View key={book.id} style={{ width: 160 }}>
                                                <BookSummaryCard
                                                    book={book}
                                                    index={idx}
                                                    variant="compact"
                                                    onPress={() => router.push(`/essentia/book-detail/${book.id}` as never)}
                                                />
                                            </View>
                                        ))}
                                    </ScrollView>
                                </Animated.View>
                            );
                        })}
                    </View>
                ) : (
                    // Filtered view — list
                    <View className="px-4 pb-6">
                        <Text className="text-sm text-gray-500 mb-3">
                            {displayBooks.length} books in this category
                        </Text>
                        {displayBooks.map((book, index) => (
                            <BookSummaryCard
                                key={book.id}
                                book={book}
                                index={index}
                                variant="list"
                                onPress={() => router.push(`/essentia/book-detail/${book.id}` as never)}
                            />
                        ))}
                    </View>
                )}
            </ScrollView>
        </Container>
    );
}
