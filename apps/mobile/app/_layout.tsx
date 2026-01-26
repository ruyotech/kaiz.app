import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { NotificationToastContainer } from '../components/notifications';
import { TranslationProvider } from '../i18n/TranslationProvider';

export default function RootLayout() {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <TranslationProvider>
                <StatusBar style="auto" />
                <Stack screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="index" />
                    <Stack.Screen name="(tabs)" />
                    <Stack.Screen name="(auth)" />
                    <Stack.Screen name="(onboarding)" />
                </Stack>
                {/* Global notification toast container */}
                <NotificationToastContainer />
            </TranslationProvider>
        </GestureHandlerRootView>
    );
}
