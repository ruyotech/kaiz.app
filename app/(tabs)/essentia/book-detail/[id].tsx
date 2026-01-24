import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Container } from '../../../../components/layout/Container';
import { Card } from '../../../../components/ui/Card';
import { useEssentiaStore } from '../../../../store/essentiaStore';

export default function BookDetailScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const { getBookById, isBookSaved, toggleSaveBook, startReading } = useEssentiaStore();
    
    const book = getBookById(id!);

    if (!book) {
        return (
            <Container>
                <View className="flex-1 items-center justify-center">
                    <Text className="text-gray-500">Book not found</Text>
                </View>
            </Container>
        );
    }

    const handleStartReading = () => {
        startReading(book.id);
        router.push(`/essentia/reader/${book.id}` as any);
    };

    return (
        <Container>
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* Header with Back Button */}
                <View className="p-4 flex-row items-center justify-between">
                    <TouchableOpacity onPress={() => router.back()} className="p-2">
                        <MaterialCommunityIcons name="arrow-left" size={24} color="#111827" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => toggleSaveBook(book.id)} className="p-2">
                        <MaterialCommunityIcons
                            name={isBookSaved(book.id) ? 'bookmark' : 'bookmark-outline'}
                            size={24}
                            color={isBookSaved(book.id) ? '#3B82F6' : '#6B7280'}
                        />
                    </TouchableOpacity>
                </View>

                {/* Cover */}
                <View className="items-center mb-6">
                    <View className="w-48 h-64 bg-purple-200 rounded-lg items-center justify-center">
                        <MaterialCommunityIcons name="book-open-page-variant" size={80} color="#8B5CF6" />
                    </View>
                </View>

                {/* Book Info */}
                <View className="px-4">
                    <Text className="text-3xl font-bold text-gray-900 mb-2">{book.title}</Text>
                    <Text className="text-lg text-gray-600 mb-4">by {book.author}</Text>
                    
                    {/* Meta Info */}
                    <View className="flex-row items-center mb-6">
                        <View className="flex-row items-center mr-4">
                            <MaterialCommunityIcons name="clock-outline" size={18} color="#6B7280" />
                            <Text className="text-sm text-gray-600 ml-1">{book.duration} min</Text>
                        </View>
                        <View className="flex-row items-center mr-4">
                            <MaterialCommunityIcons name="cards-outline" size={18} color="#6B7280" />
                            <Text className="text-sm text-gray-600 ml-1">{book.cardCount} cards</Text>
                        </View>
                        <View className="px-3 py-1 bg-gray-100 rounded-full">
                            <Text className="text-xs font-medium text-gray-700 capitalize">{book.difficulty}</Text>
                        </View>
                    </View>

                    {/* Description */}
                    <Text className="text-base text-gray-700 mb-6 leading-relaxed">{book.description}</Text>

                    {/* Key Takeaways */}
                    <Text className="text-xl font-bold text-gray-900 mb-3">What You'll Learn</Text>
                    <View className="mb-6">
                        {book.keyTakeaways.map((takeaway, index) => (
                            <View key={index} className="flex-row mb-3">
                                <MaterialCommunityIcons name="check-circle" size={20} color="#10B981" />
                                <Text className="flex-1 text-gray-700 ml-2 leading-relaxed">{takeaway}</Text>
                            </View>
                        ))}
                    </View>

                    {/* Tags */}
                    <View className="flex-row flex-wrap gap-2 mb-6">
                        {book.tags.map(tag => (
                            <View key={tag} className="px-3 py-1 bg-blue-100 rounded-full">
                                <Text className="text-xs font-medium text-blue-700">{tag}</Text>
                            </View>
                        ))}
                    </View>

                    {/* CTA Button */}
                    <TouchableOpacity
                        onPress={handleStartReading}
                        className="bg-blue-600 rounded-xl py-4 items-center mb-6"
                    >
                        <Text className="text-white text-lg font-semibold">Start Reading</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </Container>
    );
}
