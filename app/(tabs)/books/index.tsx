import { View, Text, ScrollView } from 'react-native';
import { useEffect, useState } from 'react';
import { Container } from '../../../components/layout/Container';
import { ScreenHeader } from '../../../components/layout/ScreenHeader';
import { Card } from '../../../components/ui/Card';
import { mockApi } from '../../../services/mockApi';

export default function BooksScreen() {
    const [books, setBooks] = useState<any[]>([]);

    useEffect(() => {
        mockApi.getBookSummaries().then(setBooks);
    }, []);

    return (
        <Container>
            <ScreenHeader
                title="Book Library"
                subtitle="Summaries & takeaways"
            />

            <ScrollView className="flex-1 p-4">
                {books.map((book) => (
                    <Card key={book.id} className="mb-4">
                        <Text className="text-2xl font-bold mb-1">{book.title}</Text>
                        <Text className="text-gray-600 mb-3">by {book.author}</Text>

                        <Text className="text-gray-700 mb-3">{book.content}</Text>

                        <Text className="text-sm font-semibold text-gray-900 mb-2">
                            Key Takeaways:
                        </Text>
                        {book.keyTakeaways.map((takeaway: string, index: number) => (
                            <View key={index} className="flex-row mb-1">
                                <Text className="text-blue-600 mr-2">•</Text>
                                <Text className="text-sm text-gray-700 flex-1">{takeaway}</Text>
                            </View>
                        ))}
                    </Card>
                ))}
            </ScrollView>
        </Container>
    );
}
