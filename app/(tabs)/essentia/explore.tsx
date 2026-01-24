import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Container } from '../../../components/layout/Container';
import { Card } from '../../../components/ui/Card';
import { useEssentiaStore } from '../../../store/essentiaStore';
import { LifeWheelDimensionTag } from '../../../types/models';
import lifeWheelData from '../../../data/mock/lifeWheelAreas.json';

const CATEGORIES = [
    { id: 'all' as const, name: 'All', icon: '📚' },
    ...lifeWheelData.map(lw => ({
        id: lw.id as LifeWheelDimensionTag,
        name: lw.name.split(' & ')[0], // Shorten names
        icon: lw.icon,
    })),
];

export default function EssentiaExploreScreen() {
    const router = useRouter();
    const { allBooks, isBookSaved, toggleSaveBook } = useEssentiaStore();
    
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<'all' | LifeWheelDimensionTag>('all');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    const filteredBooks = allBooks.filter(book => {
        const matchesCategory = selectedCategory === 'all' || book.lifeWheelAreaId === selectedCategory;
        const matchesSearch = searchQuery === '' || 
            book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
            book.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
        
        return matchesCategory && matchesSearch;
    });

    return (
        <Container>
            <View className="flex-1">
                {/* Header */}
                <View className="p-4 pb-2">
                    <Text className="text-3xl font-bold text-gray-900 mb-4">
                        Explore
                    </Text>
                    
                    {/* Search Bar */}
                    <View className="bg-gray-100 rounded-xl px-4 py-3 flex-row items-center mb-4">
                        <MaterialCommunityIcons name="magnify" size={20} color="#9CA3AF" />
                        <TextInput
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            placeholder="Search books, authors, topics..."
                            placeholderTextColor="#9CA3AF"
                            className="flex-1 ml-2 text-gray-900"
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery('')}>
                                <MaterialCommunityIcons name="close-circle" size={20} color="#9CA3AF" />
                            </TouchableOpacity>
                        )}
                    </View>
                    
                    {/* View Mode Toggle */}
                    <View className="flex-row justify-between items-center mb-3">
                        <Text className="text-sm text-gray-600">
                            {filteredBooks.length} books
                        </Text>
                        <View className="flex-row gap-2">
                            <TouchableOpacity
                                onPress={() => setViewMode('grid')}
                                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-100' : 'bg-gray-100'}`}
                            >
                                <MaterialCommunityIcons 
                                    name="view-grid" 
                                    size={20} 
                                    color={viewMode === 'grid' ? '#3B82F6' : '#6B7280'} 
                                />
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => setViewMode('list')}
                                className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-100' : 'bg-gray-100'}`}
                            >
                                <MaterialCommunityIcons 
                                    name="view-list" 
                                    size={20} 
                                    color={viewMode === 'list' ? '#3B82F6' : '#6B7280'} 
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Categories */}
                <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    className="mb-4"
                    contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
                >
                    {CATEGORIES.map(category => (
                        <TouchableOpacity
                            key={category.id}
                            onPress={() => setSelectedCategory(category.id)}
                            className={`px-4 py-2 rounded-full flex-row items-center ${
                                selectedCategory === category.id 
                                    ? 'bg-blue-600' 
                                    : 'bg-gray-100'
                            }`}
                        >
                            <Text className="mr-1">{category.icon}</Text>
                            <Text 
                                className={`font-medium ${
                                    selectedCategory === category.id 
                                        ? 'text-white' 
                                        : 'text-gray-700'
                                }`}
                            >
                                {category.name}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Books Display */}
                <ScrollView 
                    className="flex-1 px-4"
                    showsVerticalScrollIndicator={false}
                >
                    {viewMode === 'grid' ? (
                        <View className="flex-row flex-wrap gap-3 pb-6">
                            {filteredBooks.map(book => (
                                <TouchableOpacity
                                    key={book.id}
                                    onPress={() => router.push(`/essentia/book-detail/${book.id}` as any)}
                                    className="w-[48%]"
                                >
                                    <Card className="p-0 overflow-hidden">
                                        <View className="h-40 bg-purple-200 items-center justify-center">
                                            <MaterialCommunityIcons 
                                                name="book-open-page-variant" 
                                                size={48} 
                                                color="#8B5CF6" 
                                            />
                                        </View>
                                        <View className="p-3">
                                            <Text className="text-sm font-bold text-gray-900 mb-1" numberOfLines={2}>
                                                {book.title}
                                            </Text>
                                            <Text className="text-xs text-gray-600 mb-2" numberOfLines={1}>
                                                {book.author}
                                            </Text>
                                            <View className="flex-row items-center justify-between">
                                                <Text className="text-xs text-gray-500">
                                                    {book.duration} min
                                                </Text>
                                                <TouchableOpacity
                                                    onPress={(e) => {
                                                        e.stopPropagation();
                                                        toggleSaveBook(book.id);
                                                    }}
                                                >
                                                    <MaterialCommunityIcons
                                                        name={isBookSaved(book.id) ? 'bookmark' : 'bookmark-outline'}
                                                        size={20}
                                                        color={isBookSaved(book.id) ? '#3B82F6' : '#6B7280'}
                                                    />
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    </Card>
                                </TouchableOpacity>
                            ))}
                        </View>
                    ) : (
                        <View className="pb-6">
                            {filteredBooks.map(book => (
                                <TouchableOpacity
                                    key={book.id}
                                    onPress={() => router.push(`/essentia/book-detail/${book.id}` as any)}
                                    className="mb-3"
                                >
                                    <Card className="p-4">
                                        <View className="flex-row">
                                            <View className="w-16 h-20 bg-purple-200 rounded items-center justify-center mr-3">
                                                <MaterialCommunityIcons 
                                                    name="book-open-page-variant" 
                                                    size={32} 
                                                    color="#8B5CF6" 
                                                />
                                            </View>
                                            <View className="flex-1">
                                                <Text className="text-base font-bold text-gray-900 mb-1">
                                                    {book.title}
                                                </Text>
                                                <Text className="text-sm text-gray-600 mb-2">
                                                    {book.author}
                                                </Text>
                                                <View className="flex-row items-center">
                                                    <MaterialCommunityIcons name="clock-outline" size={14} color="#6B7280" />
                                                    <Text className="text-xs text-gray-500 ml-1 mr-3">
                                                        {book.duration} min
                                                    </Text>
                                                    <MaterialCommunityIcons name="cards-outline" size={14} color="#6B7280" />
                                                    <Text className="text-xs text-gray-500 ml-1">
                                                        {book.cardCount} cards
                                                    </Text>
                                                </View>
                                            </View>
                                            <TouchableOpacity
                                                onPress={(e) => {
                                                    e.stopPropagation();
                                                    toggleSaveBook(book.id);
                                                }}
                                                className="ml-2"
                                            >
                                                <MaterialCommunityIcons
                                                    name={isBookSaved(book.id) ? 'bookmark' : 'bookmark-outline'}
                                                    size={24}
                                                    color={isBookSaved(book.id) ? '#3B82F6' : '#6B7280'}
                                                />
                                            </TouchableOpacity>
                                        </View>
                                    </Card>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </ScrollView>
            </View>
        </Container>
    );
}
