import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Container } from '../../../components/layout/Container';
import { Card } from '../../../components/ui/Card';
import { useEssentiaStore } from '../../../store/essentiaStore';
import { toLocaleDateStringLocalized } from '../../../utils/localizedDate';

export default function EssentiaHighlightsScreen() {
    const router = useRouter();
    const { highlights, allBooks, removeHighlight, generateFlashcard } = useEssentiaStore();
    
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<'recent' | 'book'>('recent');

    const filteredHighlights = highlights.filter(h => 
        h.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.note?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const sortedHighlights = [...filteredHighlights].sort((a, b) => {
        if (sortBy === 'recent') {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        return a.bookId.localeCompare(b.bookId);
    });

    const getBookTitle = (bookId: string) => {
        const book = allBooks.find(b => b.id === bookId);
        return book?.title || 'Unknown Book';
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return toLocaleDateStringLocalized(date, { month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (
        <Container>
            <View className="flex-1">
                {/* Header */}
                <View className="p-4 pb-2">
                    <View className="flex-row items-center justify-between mb-4">
                        <TouchableOpacity 
                            onPress={() => router.back()}
                            className="w-10 h-10 items-center justify-center"
                        >
                            <MaterialCommunityIcons name="arrow-left" size={24} color="#374151" />
                        </TouchableOpacity>
                        <Text className="text-xl font-bold text-gray-900">My Highlights</Text>
                        <View className="w-10" />
                    </View>

                    {/* Search Bar */}
                    <View className="bg-gray-100 rounded-xl px-4 py-3 flex-row items-center mb-4">
                        <MaterialCommunityIcons name="magnify" size={20} color="#9CA3AF" />
                        <TextInput
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            placeholder="Search highlights..."
                            placeholderTextColor="#9CA3AF"
                            className="flex-1 ml-2 text-gray-900"
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery('')}>
                                <MaterialCommunityIcons name="close-circle" size={20} color="#9CA3AF" />
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Sort Options */}
                    <View className="flex-row gap-2 mb-4">
                        <TouchableOpacity
                            onPress={() => setSortBy('recent')}
                            className={`flex-row items-center px-4 py-2 rounded-full ${sortBy === 'recent' ? 'bg-purple-600' : 'bg-gray-100'}`}
                        >
                            <MaterialCommunityIcons 
                                name="clock-outline" 
                                size={16} 
                                color={sortBy === 'recent' ? 'white' : '#6B7280'} 
                            />
                            <Text className={`ml-1.5 text-sm font-medium ${sortBy === 'recent' ? 'text-white' : 'text-gray-700'}`}>
                                Recent
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => setSortBy('book')}
                            className={`flex-row items-center px-4 py-2 rounded-full ${sortBy === 'book' ? 'bg-purple-600' : 'bg-gray-100'}`}
                        >
                            <MaterialCommunityIcons 
                                name="book-outline" 
                                size={16} 
                                color={sortBy === 'book' ? 'white' : '#6B7280'} 
                            />
                            <Text className={`ml-1.5 text-sm font-medium ${sortBy === 'book' ? 'text-white' : 'text-gray-700'}`}>
                                By Book
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Stats */}
                    <View className="flex-row gap-3 mb-4">
                        <Card className="flex-1 p-4 items-center">
                            <Text className="text-2xl font-bold text-purple-600">{highlights.length}</Text>
                            <Text className="text-xs text-gray-600">Total Highlights</Text>
                        </Card>
                        <Card className="flex-1 p-4 items-center">
                            <Text className="text-2xl font-bold text-blue-600">
                                {new Set(highlights.map(h => h.bookId)).size}
                            </Text>
                            <Text className="text-xs text-gray-600">Books</Text>
                        </Card>
                    </View>
                </View>

                <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
                    {sortedHighlights.length === 0 ? (
                        <View className="items-center py-12">
                            <View className="w-20 h-20 bg-purple-100 rounded-full items-center justify-center mb-4">
                                <MaterialCommunityIcons name="marker" size={40} color="#8B5CF6" />
                            </View>
                            <Text className="text-lg font-semibold text-gray-900 mb-2">No highlights yet</Text>
                            <Text className="text-gray-600 text-center px-8">
                                Start reading and highlight key passages to save them here
                            </Text>
                        </View>
                    ) : (
                        sortedHighlights.map(highlight => (
                            <Card key={highlight.id} className="p-4 mb-3">
                                <View className="flex-row items-start justify-between mb-2">
                                    <View className="flex-row items-center flex-1">
                                        <View className="w-1 h-full bg-purple-500 rounded-full mr-3" />
                                        <View className="flex-1">
                                            <Text className="text-sm font-medium text-purple-600 mb-1">
                                                {getBookTitle(highlight.bookId)}
                                            </Text>
                                            <Text className="text-xs text-gray-500">
                                                {formatDate(highlight.createdAt)}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                                
                                <Text className="text-gray-900 text-base leading-6 mb-3 italic">
                                    "{highlight.text}"
                                </Text>
                                
                                {highlight.note && (
                                    <View className="bg-gray-50 rounded-lg p-3 mb-3">
                                        <Text className="text-sm text-gray-600">
                                            <Text className="font-medium">Note: </Text>
                                            {highlight.note}
                                        </Text>
                                    </View>
                                )}
                                
                                <View className="flex-row justify-end gap-2">
                                    <TouchableOpacity 
                                        onPress={() => generateFlashcard(highlight.id)}
                                        className="flex-row items-center px-3 py-2 bg-blue-50 rounded-lg"
                                    >
                                        <MaterialCommunityIcons name="cards-outline" size={16} color="#3B82F6" />
                                        <Text className="text-sm font-medium text-blue-600 ml-1.5">Flashcard</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity 
                                        onPress={() => removeHighlight(highlight.id)}
                                        className="flex-row items-center px-3 py-2 bg-red-50 rounded-lg"
                                    >
                                        <MaterialCommunityIcons name="delete-outline" size={16} color="#EF4444" />
                                        <Text className="text-sm font-medium text-red-600 ml-1.5">Remove</Text>
                                    </TouchableOpacity>
                                </View>
                            </Card>
                        ))
                    )}
                    <View className="h-24" />
                </ScrollView>
            </View>
        </Container>
    );
}
