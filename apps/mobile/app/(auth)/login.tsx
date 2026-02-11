import { logger } from '../../utils/logger';
/**
 * LoginScreen.tsx - Authentication screen with Face ID support
 * 
 * Features:
 * - Email/password login
 * - Face ID / Touch ID quick login (if enabled in settings)
 * - Validation with error states
 * - Animated transitions
 * 
 * Face ID Flow:
 * 1. On mount, check if biometric login is enabled
 * 2. If enabled, show the Face ID button
 * 3. When tapped, authenticate with biometrics
 * 4. On success, log the user in automatically using stored email
 * 
 * @author Kaiz Team
 * @version 2.0.0
 */

import {
    View,
    Text,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    Alert,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Container } from '../../components/layout/Container';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../store/authStore';
import { useBiometricStore } from '../../store/biometricStore';
import { useAppStore } from '../../store/appStore';
import { useTranslation } from '../../hooks';
import { useThemeContext } from '../../providers/ThemeProvider';

export default function LoginScreen() {
    const router = useRouter();
    const { t } = useTranslation();
    const { login, loading, error: authError } = useAuthStore();
    const { colors } = useThemeContext();
    const { setOnboarded } = useAppStore();
    const {
        isBiometricEnabled,
        enrolledEmail,
        capability: biometricCapability,
        isChecking: isBiometricChecking,
        checkBiometricCapability,
        authenticateWithBiometric,
        getStoredCredentials,
    } = useBiometricStore();

    // Default dev credentials for easier testing in simulator
    const DEV_EMAIL = __DEV__ ? 'erajbabayev@gmail.com' : '';
    const DEV_PASSWORD = __DEV__ ? 'Safiya373!' : '';
    
    const [email, setEmail] = useState(DEV_EMAIL);
    const [password, setPassword] = useState(DEV_PASSWORD);
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isBiometricLoggingIn, setIsBiometricLoggingIn] = useState(false);

    // Check biometric capability on mount
    useEffect(() => {
        checkBiometricCapability();
    }, []);

    // Determine if we should show the Face ID button
    const shouldShowBiometricButton = 
        isBiometricEnabled && 
        enrolledEmail && 
        biometricCapability?.isHardwareAvailable && 
        biometricCapability?.isEnrolled;

    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) {
            setEmailError('Email is required');
            return false;
        }
        if (!emailRegex.test(email)) {
            setEmailError('Please enter a valid email');
            return false;
        }
        setEmailError('');
        return true;
    };

    const validatePassword = (password: string): boolean => {
        if (!password) {
            setPasswordError('Password is required');
            return false;
        }
        if (password.length < 6) {
            setPasswordError('Password must be at least 6 characters');
            return false;
        }
        setPasswordError('');
        return true;
    };

    const handleLogin = async () => {
        const isEmailValid = validateEmail(email);
        const isPasswordValid = validatePassword(password);

        if (!isEmailValid || !isPasswordValid) {
            return;
        }

        try {
            await login(email, password);
            // Returning user — mark onboarding complete so they skip it on next launch
            setOnboarded(true);
            // @ts-ignore - Dynamic route
            router.replace('/(tabs)/sprints/calendar');
        } catch (error: unknown) {
            const message = (error instanceof Error ? error.message : undefined) || authError || 'Invalid email or password. Please try again.';
            Alert.alert('Login Failed', message, [{ text: 'OK' }]);
        }
    };

    /**
     * Handle Face ID / Touch ID login
     * 
     * Flow:
     * 1. Authenticate with biometrics
     * 2. If successful, retrieve stored credentials from secure storage
     * 3. Login with those credentials automatically
     */
    const handleBiometricLogin = useCallback(async () => {
        if (!enrolledEmail) {
            Alert.alert('Error', 'No account associated with biometric login.');
            return;
        }

        setIsBiometricLoggingIn(true);

        try {
            logger.log('Attempting biometric login...');
            const success = await authenticateWithBiometric();

            if (success) {
                logger.log('Biometric authentication successful');
                
                // Retrieve stored credentials
                const credentials = await getStoredCredentials();
                
                if (credentials) {
                    logger.log('Found stored credentials, logging in...');
                    try {
                        await login(credentials.email, credentials.password);
                        // @ts-ignore - Dynamic route
                        router.replace('/(tabs)/sprints/calendar');
                    } catch (loginError: unknown) {
                        logger.error('Login with stored credentials failed:', loginError);
                        Alert.alert(
                            'Login Failed',
                            'Stored credentials are invalid. Please login with your password.',
                            [{ text: 'OK' }]
                        );
                    }
                } else {
                    logger.log('No stored credentials found');
                    // Fallback: prefill email and ask for password
                    setEmail(enrolledEmail);
                    Alert.alert(
                        'Credentials Not Found',
                        'Please enter your password to complete login. Your credentials will be saved for future Face ID logins.',
                        [{ text: 'OK' }]
                    );
                }
            } else {
                logger.log('Biometric authentication failed');
                // Don't show alert here - the biometric store handles specific errors
            }
        } catch (error) {
            logger.error('Biometric login error:', error);
            Alert.alert(
                'Error',
                'Failed to authenticate. Please try again or use your password.',
                [{ text: 'OK' }]
            );
        } finally {
            setIsBiometricLoggingIn(false);
        }
    }, [enrolledEmail, authenticateWithBiometric, getStoredCredentials, login, router]);

    return (
        <Container safeArea={false}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                <ScrollView
                    className="flex-1"
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    <View className="flex-1 justify-center px-6 pt-20 pb-8">
                        {/* Logo/Header Section */}
                        <Animated.View
                            entering={FadeInDown.delay(100).springify()}
                            className="items-center mb-12"
                        >
                            <View 
                                className="w-20 h-20 rounded-full items-center justify-center mb-4"
                                style={{ backgroundColor: colors.primary }}
                            >
                                <Text className="text-5xl">K</Text>
                            </View>
                            <Text 
                                className="text-4xl font-bold"
                                style={{ color: colors.text }}
                            >
                                {t('auth.login.welcomeBack')}
                            </Text>
                            <Text 
                                className="text-base mt-2"
                                style={{ color: colors.textSecondary }}
                            >
                                {t('auth.login.subtitle')}
                            </Text>
                        </Animated.View>

                        {/* Face ID / Touch ID Quick Login Button */}
                        {shouldShowBiometricButton && (
                            <Animated.View 
                                entering={FadeInDown.delay(150).springify()}
                                className="mb-8"
                            >
                                <TouchableOpacity
                                    onPress={handleBiometricLogin}
                                    disabled={isBiometricLoggingIn || isBiometricChecking}
                                    className="rounded-2xl p-4 flex-row items-center justify-center"
                                    style={{ 
                                        backgroundColor: colors.primaryLight + '20',
                                        borderWidth: 2,
                                        borderColor: colors.primary + '40'
                                    }}
                                    activeOpacity={0.7}
                                >
                                    {isBiometricLoggingIn ? (
                                        <ActivityIndicator size="small" color={colors.primary} />
                                    ) : (
                                        <MaterialCommunityIcons
                                            name={biometricCapability?.iconName as any || 'face-recognition'}
                                            size={32}
                                            color={colors.primary}
                                        />
                                    )}
                                    <View className="ml-3">
                                        <Text 
                                            className="font-semibold text-base"
                                            style={{ color: colors.primary }}
                                        >
                                            {t('auth.login.loginWith')} {biometricCapability?.displayName || 'Face ID'}
                                        </Text>
                                        <Text 
                                            className="text-xs mt-0.5"
                                            style={{ color: colors.primary + '99' }}
                                        >
                                            {enrolledEmail}
                                        </Text>
                                    </View>
                                </TouchableOpacity>

                                {/* Divider */}
                                <View className="flex-row items-center my-6">
                                    <View 
                                        className="flex-1 h-px"
                                        style={{ backgroundColor: colors.border }}
                                    />
                                    <Text 
                                        className="text-sm mx-4"
                                        style={{ color: colors.textSecondary }}
                                    >
                                        {t('auth.login.orSignInWithEmail')}
                                    </Text>
                                    <View 
                                        className="flex-1 h-px"
                                        style={{ backgroundColor: colors.border }}
                                    />
                                </View>
                            </Animated.View>
                        )}

                        {/* Login Form */}
                        <Animated.View entering={FadeInDown.delay(200).springify()}>
                            <Input
                                label={t('auth.login.email')}
                                value={email}
                                onChangeText={(text) => {
                                    setEmail(text);
                                    if (emailError) validateEmail(text);
                                }}
                                placeholder={t('auth.login.emailPlaceholder')}
                                keyboardType="email-address"
                                error={emailError}
                            />

                            <View className="relative">
                                <Input
                                    label={t('auth.login.password')}
                                    value={password}
                                    onChangeText={(text) => {
                                        setPassword(text);
                                        if (passwordError) validatePassword(text);
                                    }}
                                    placeholder={t('auth.login.passwordPlaceholder')}
                                    secureTextEntry={!showPassword}
                                    error={passwordError}
                                />
                                <Pressable
                                    onPress={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-11"
                                >
                                    <Text 
                                        className="font-semibold"
                                        style={{ color: colors.primary }}
                                    >
                                        {showPassword ? t('common.hide') : t('common.show')}
                                    </Text>
                                </Pressable>
                            </View>

                            <Pressable
                                onPress={() => router.push('/(auth)/forgot-password')}
                                className="mb-6"
                            >
                                <Text 
                                    className="font-semibold text-right"
                                    style={{ color: colors.primary }}
                                >
                                    {t('auth.login.forgotPassword')}
                                </Text>
                            </Pressable>

                            <Button
                                onPress={handleLogin}
                                loading={loading}
                                fullWidth
                                size="lg"
                            >
                                {t('auth.login.signIn')}
                            </Button>
                        </Animated.View>

                        {/* Sign Up Link */}
                        <Animated.View
                            entering={FadeInUp.delay(300).springify()}
                            className="flex-row justify-center mt-8"
                        >
                            <Text style={{ color: colors.textSecondary }}>{t('auth.login.noAccount')} </Text>
                            <Pressable onPress={() => router.push('/(auth)/register')}>
                                <Text 
                                    className="font-semibold"
                                    style={{ color: colors.primary }}
                                >
                                    {t('auth.login.signUp')}
                                </Text>
                            </Pressable>
                        </Animated.View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </Container>
    );
}
