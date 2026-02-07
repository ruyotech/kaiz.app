import { Stack } from 'expo-router';

export default function CommunityLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="knowledge" />
            <Stack.Screen name="questions" />
            <Stack.Screen name="wins" />
            <Stack.Screen name="templates" />
            <Stack.Screen name="leaderboard" />
            <Stack.Screen name="support" />
            <Stack.Screen name="profile" />
            <Stack.Screen name="article" />
            <Stack.Screen name="question-detail" />
            <Stack.Screen name="knowledge-item" />
        </Stack>
    );
}
