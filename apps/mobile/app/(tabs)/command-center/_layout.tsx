import { Stack } from 'expo-router';

export default function CommandCenterLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="chat" />
        </Stack>
    );
}
