// crypto polyfill is now loaded in index.ts (app entry point) before expo-router
// import '../utils/cryptoPolyfill'; — kept here as safety comment

import { useEffect, useRef } from 'react';
import { Stack, useRouter } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NotificationToastContainer } from '../components/notifications/NotificationToast';
import { TranslationProvider } from '../i18n/TranslationProvider';
import { ThemeProvider } from '../providers/ThemeProvider';
import { QueryProvider } from '../providers/QueryProvider';
import {
    registerForPushNotifications,
    addNotificationResponseListener,
} from '../utils/notifications';
import { logger } from '../utils/logger';

export default function RootLayout() {
    const router = useRouter();
    const notificationListener = useRef<ReturnType<typeof addNotificationResponseListener> | null>(null);

    useEffect(() => {
        // Register push notifications on app launch
        registerForPushNotifications().catch((err) =>
            logger.warn('RootLayout', 'Push notification registration failed', err),
        );

        // Listen for notification taps → deep-link to screen
        notificationListener.current = addNotificationResponseListener((response) => {
            const screen = response.notification.request.content.data?.screen;
            if (screen && typeof screen === 'string') {
                logger.info('RootLayout', `Notification tapped, navigating to: ${screen}`);
                router.push(screen as any);
            }
        });

        return () => {
            notificationListener.current?.remove();
        };
    }, [router]);

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <QueryProvider>
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
            </QueryProvider>
        </GestureHandlerRootView>
    );
}
