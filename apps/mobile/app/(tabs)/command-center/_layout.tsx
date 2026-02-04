import { Stack } from 'expo-router';

export default function CommandCenterLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="pending" />
            <Stack.Screen name="pending-task" />
            <Stack.Screen 
                name="draft-detail" 
                options={{
                    presentation: 'modal',
                    animation: 'slide_from_bottom',
                }}
            />
            <Stack.Screen 
                name="create-from-sensai" 
                options={{
                    animation: 'slide_from_right',
                }}
            />
        </Stack>
    );
}
