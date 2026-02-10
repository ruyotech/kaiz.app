import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import { View, Pressable, Text } from 'react-native';
import { SplashScreen } from '../components/SplashScreen';
import { useAppStore } from '../store/appStore';
import { useAuthStore } from '../store/authStore';
import { logger } from '../utils/logger';

export default function Index() {
    const router = useRouter();
    const [showSplash, setShowSplash] = useState(true);
    const [showDevReset, setShowDevReset] = useState(false);
    const { isOnboarded, reset: resetApp } = useAppStore();
    const { user, validateSession, reset: resetAuth } = useAuthStore();

    // Pre-validate session during splash so navigation is instant
    const sessionResult = useRef<'valid' | 'invalid' | 'pending'>('pending');

    useEffect(() => {
        // Start validation immediately (runs in parallel with splash animation)
        if (isOnboarded) {
            validateSession().then((valid) => {
                sessionResult.current = valid ? 'valid' : 'invalid';
                logger.info('Navigation', `Session pre-validated: ${valid ? 'valid' : 'invalid'}`);
            });
        }
    }, []);

    useEffect(() => {
        if (!showSplash) {
            (async () => {
                logger.info('Navigation', 'Splash done, navigating…');

                if (!isOnboarded) {
                    logger.info('Navigation', '→ Welcome Screen (not onboarded)');
                    router.replace('/(onboarding)/welcome' as never);
                    return;
                }

                // If pre-validation already finished, use the result immediately
                // Otherwise wait for it (should be rare since splash is 2.5s)
                let valid = sessionResult.current !== 'pending'
                    ? sessionResult.current === 'valid'
                    : await validateSession();

                if (!valid) {
                    logger.info('Navigation', '→ Login (session invalid)');
                    router.replace('/(auth)/login' as never);
                } else {
                    logger.info('Navigation', '→ Sprint Calendar (session valid)');
                    router.replace('/(tabs)/sprints/calendar' as never);
                }
            })();
        }
    }, [showSplash, isOnboarded]);

    const handleSplashFinish = () => {
        setShowSplash(false);
    };

    const handleDevReset = async () => {
        logger.info('App', 'Resetting app state…');
        const { reset: resetPreferences } = require('../store/preferencesStore').usePreferencesStore.getState();
        
        resetApp();
        resetAuth();
        resetPreferences();
        setShowDevReset(false);
        
        await new Promise(resolve => setTimeout(resolve, 100));
        router.replace('/(onboarding)/welcome' as never);
    };

    if (showSplash) {
        return (
            <View style={{ flex: 1 }}>
                <SplashScreen onFinish={handleSplashFinish} />
                
                {/* Developer Reset Button - Hidden in corner */}
                <Pressable
                    onLongPress={() => setShowDevReset(true)}
                    style={{
                        position: 'absolute',
                        top: 50,
                        left: 20,
                        width: 60,
                        height: 60,
                        opacity: 0.01,
                    }}
                >
                    <View />
                </Pressable>

                {/* Reset Confirmation */}
                {showDevReset && (
                    <View
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: 'rgba(0,0,0,0.8)',
                            justifyContent: 'center',
                            alignItems: 'center',
                            padding: 20,
                        }}
                    >
                        <View
                            style={{
                                backgroundColor: 'white',
                                borderRadius: 16,
                                padding: 24,
                                width: '90%',
                                maxWidth: 400,
                            }}
                        >
                            <Text
                                style={{
                                    fontSize: 24,
                                    fontWeight: 'bold',
                                    marginBottom: 12,
                                    textAlign: 'center',
                                }}
                            >
                                Reset App
                            </Text>
                            <Text
                                style={{
                                    fontSize: 16,
                                    color: '#6B7280',
                                    marginBottom: 8,
                                    textAlign: 'center',
                                }}
                            >
                                Current State:
                            </Text>
                            <Text
                                style={{
                                    fontSize: 14,
                                    color: '#374151',
                                    marginBottom: 20,
                                    textAlign: 'center',
                                }}
                            >
                                Onboarded: {isOnboarded ? '✓' : '✗'} | User: {user ? '✓' : '✗'}
                            </Text>
                            <Text
                                style={{
                                    fontSize: 14,
                                    color: '#6B7280',
                                    marginBottom: 20,
                                    textAlign: 'center',
                                }}
                            >
                                This will reset the app and show the welcome screens
                            </Text>
                            <View style={{ flexDirection: 'row', gap: 12 }}>
                                <Pressable
                                    onPress={() => setShowDevReset(false)}
                                    style={{
                                        flex: 1,
                                        backgroundColor: '#E5E7EB',
                                        padding: 16,
                                        borderRadius: 8,
                                        alignItems: 'center',
                                    }}
                                >
                                    <Text style={{ fontWeight: '600', color: '#374151' }}>
                                        Cancel
                                    </Text>
                                </Pressable>
                                <Pressable
                                    onPress={handleDevReset}
                                    style={{
                                        flex: 1,
                                        backgroundColor: '#2563EB',
                                        padding: 16,
                                        borderRadius: 8,
                                        alignItems: 'center',
                                    }}
                                >
                                    <Text style={{ fontWeight: '600', color: 'white' }}>
                                        Reset App
                                    </Text>
                                </Pressable>
                            </View>
                        </View>
                    </View>
                )}
            </View>
        );
    }

    return null;
}
