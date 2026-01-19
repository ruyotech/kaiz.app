import { Stack } from 'expo-router';

export default function SDLCLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="calendar" />
            <Stack.Screen name="reports" />
            <Stack.Screen name="task/[id]" />
            <Stack.Screen name="epic/[id]" />
            <Stack.Screen name="create-task" />
        </Stack>
    );
}
