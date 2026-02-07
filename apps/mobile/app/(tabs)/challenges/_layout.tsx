import { Stack } from 'expo-router';

export default function ChallengesLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="challenge/[id]" />
            <Stack.Screen name="create" />
            <Stack.Screen name="templates" />
            <Stack.Screen name="completed" />
            <Stack.Screen name="community" />
            <Stack.Screen name="leaderboard" />
        </Stack>
    );
}
