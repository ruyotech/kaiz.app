import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Container } from '../../../components/layout/Container';
import { Card } from '../../../components/ui/Card';
import { useEssentiaStore } from '../../../store/essentiaStore';

export default function EssentiaLibraryScreen() {
    const router = useRouter();
    const { allBooks, savedBookIds, history, getInProgressBooks, getCompletedBooks } = useEssentiaStore();
    
    const [activeTab, setActiveTab] = useState<'saved' | 'history' | 'in-progress'>('saved');

    const savedBooks = allBooks.filter(book => savedBookIds.includes(book.id));
    const historyBooks = history.map(id => allBooks.find(b => b.id === id)).filter(Boolean);
    const inProgressBooks = getInProgressBooks();
    const completedBookIds = getCompletedBooks();

    const renderBookCard = (bookOrProgress: any, showProgress = false) => {
        const book = showProgress ? allBooks.find(b => b.id === bookOrProgress.bookId) : bookOrProgress;
        if (!book) return null;
        
        const progress = showProgress ? bookOrProgress : null;
        
        return (
            <TouchableOpacity
                key={book.id}
                onPress={() => router.push(`/essentia/reader/${book.id}` as any)}
                className="mb-3"
            >
                <Card className="p-4">
                    <View className="flex-row items-center">
                        <View className="w-12 h-16 bg-purple-200 rounded items-center justify-center mr-3">
                            <MaterialCommunityIcons name="book-open-page-variant" size={24} color="#8B5CF6" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-base font-semibold text-gray-900 mb-1">{book.title}</Text>
                            <Text className="text-sm text-gray-600 mb-2">{book.author}</Text>
                            {progress && (
                                <>
                                    <View className="h-2 bg-gray-200 rounded-full overflow-hidden mb-1">
                                        <View className="h-full bg-blue-600 rounded-full" style={{ width: `${progress.percentComplete}%` }} />
                                    </View>
                                    <Text className="text-xs text-gray-500">{progress.percentComplete}% complete</Text>
                                </>
                            )}
                        </View>
                    </View>
                </Card>
            </TouchableOpacity>
        );
    };

    return (
        <Container>
            <View className="flex-1">
                <View className="p-4 pb-2">
                    <Text className="text-3xl font-bold text-gray-900 mb-4">Library</Text>
                </View>

                {/* Tabs */}
                <View className="flex-row px-4 mb-4 gap-2">
                    <TouchableOpacity
                        onPress={() => setActiveTab('saved')}
                        className={`flex-1 py-2 rounded-lg ${activeTab === 'saved' ? 'bg-blue-600' : 'bg-gray-100'}`}
                    >
                        <Text className={`text-center font-medium ${activeTab === 'saved' ? 'text-white' : 'text-gray-700'}`}>
                            Saved ({savedBooks.length})
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setActiveTab('in-progress')}
                        className={`flex-1 py-2 rounded-lg ${activeTab === 'in-progress' ? 'bg-blue-600' : 'bg-gray-100'}`}
                    >
                        <Text className={`text-center font-medium ${activeTab === 'in-progress' ? 'text-white' : 'text-gray-700'}`}>
                            Reading ({inProgressBooks.length})
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setActiveTab('history')}
                        className={`flex-1 py-2 rounded-lg ${activeTab === 'history' ? 'bg-blue-600' : 'bg-gray-100'}`}
                    >
                        <Text className={`text-center font-medium ${activeTab === 'history' ? 'text-white' : 'text-gray-700'}`}>
                            History
                        </Text>
                    </TouchableOpacity>
                </View>

                <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
                    {activeTab === 'saved' && (
                        savedBooks.length === 0 ? (
                            <View className="flex-1 items-center justify-center py-20">
                                <MaterialCommunityIcons name="bookmark-outline" size={64} color="#D1D5DB" />
                                <Text className="text-gray-500 text-center mt-4">No saved books yet</Text>
                                <TouchableOpacity
                                    onPress={() => router.push('/essentia/explore' as any)}
                                    className="mt-4 bg-blue-600 px-6 py-2 rounded-lg"
                                >
                                    <Text className="text-white font-medium">Explore Books</Text>
                                </TouchableOpacity>
                            </View>
                        ) : savedBooks.map(book => renderBookCard(book))
                    )}
                    {activeTab === 'in-progress' && (
                        inProgressBooks.length === 0 ? (
                            <View className="flex-1 items-center justify-center py-20">
                                <MaterialCommunityIcons name="book-open-outline" size={64} color="#D1D5DB" />
                                <Text className="text-gray-500 text-center mt-4">No books in progress</Text>
                            </View>
                        ) : inProgressBooks.map(progress => renderBookCard(progress, true))
                    )}
                    {activeTab === 'history' && (
                        historyBooks.length === 0 ? (
                            <View className="flex-1 items-center justify-center py-20">
                                <MaterialCommunityIcons name="history" size={64} color="#D1D5DB" />
                                <Text className="text-gray-500 text-center mt-4">No reading history</Text>
                            </View>
                        ) : historyBooks.map(book => renderBookCard(book))
                    )}
                </ScrollView>
            </View>
        </Container>
    );
}
