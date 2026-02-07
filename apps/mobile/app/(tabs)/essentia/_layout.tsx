import { Stack } from 'expo-router';
import { View } from 'react-native';

export default function EssentiaLayout() {
    return (
        <View className="flex-1">
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="explore" />
                <Stack.Screen name="library" />
                <Stack.Screen name="growth" />
                <Stack.Screen name="highlights" />
                <Stack.Screen name="flashcards" />
                <Stack.Screen name="goals" />
                <Stack.Screen name="collections" />
                <Stack.Screen name="reader/[id]" />
                <Stack.Screen name="book-detail/[id]" />
            </Stack>
        </View>
    );
}
