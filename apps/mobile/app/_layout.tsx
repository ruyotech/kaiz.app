import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NotificationToastContainer } from '../components/notifications';
import { TranslationProvider } from '../i18n/TranslationProvider';
import { ThemeProvider } from '../providers/ThemeProvider';

export default function RootLayout() {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <ThemeProvider>
                <TranslationProvider>
                    <Stack screenOptions={{ headerShown: false }}>
                        <Stack.Screen name="index" />
                        <Stack.Screen name="(tabs)" />
                        <Stack.Screen name="(auth)" />
                        <Stack.Screen name="(onboarding)" />
                    </Stack>
                    {/* Global notification toast container */}
                    <NotificationToastContainer />
                </TranslationProvider>
            </ThemeProvider>
        </GestureHandlerRootView>
    );
}
