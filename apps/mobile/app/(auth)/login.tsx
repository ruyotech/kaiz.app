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

export default function LoginScreen() {
    const router = useRouter();
    const { login, loading, error: authError } = useAuthStore();
    const {
        isBiometricEnabled,
        enrolledEmail,
        capability: biometricCapability,
        isChecking: isBiometricChecking,
        checkBiometricCapability,
        authenticateWithBiometric,
    } = useBiometricStore();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
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
            // @ts-ignore - Dynamic route
            router.replace('/(tabs)/sdlc/calendar');
        } catch (error: any) {
            const message = error?.message || authError || 'Invalid email or password. Please try again.';
            Alert.alert('Login Failed', message, [{ text: 'OK' }]);
        }
    };

    /**
     * Handle Face ID / Touch ID login
     * 
     * Flow:
     * 1. Authenticate with biometrics
     * 2. If successful, use the stored email to log in
     * 3. Since we don't store passwords, we use a special biometric login flow
     *    (In production, this would use a secure token stored in keychain)
     */
    const handleBiometricLogin = useCallback(async () => {
        if (!enrolledEmail) {
            Alert.alert('Error', 'No account associated with biometric login.');
            return;
        }

        setIsBiometricLoggingIn(true);

        try {
            console.log('🔐 Attempting biometric login...');
            const success = await authenticateWithBiometric();

            if (success) {
                console.log('✅ Biometric authentication successful');
                
                // In a real app, you would use a secure token stored in keychain
                // For demo purposes, we'll simulate a successful login
                // by using a demo password or token-based auth
                
                try {
                    // Try to login with the enrolled email
                    // Note: In production, use a biometric token instead of password
                    await login(enrolledEmail, 'biometric-auth-token');
                    
                    // @ts-ignore - Dynamic route
                    router.replace('/(tabs)/sdlc/calendar');
                } catch (loginError: any) {
                    console.log('⚠️ Token login failed, showing demo mode option');
                    
                    // If the biometric token login fails (expected in demo),
                    // offer to enter demo mode or use password
                    Alert.alert(
                        'Authentication Successful',
                        `${biometricCapability?.displayName || 'Biometric'} verified! However, automatic login requires additional setup.\n\nWould you like to continue in demo mode?`,
                        [
                            { text: 'Cancel', style: 'cancel' },
                            { 
                                text: 'Enter Demo Mode', 
                                onPress: async () => {
                                    const { loginDemo } = useAuthStore.getState();
                                    await loginDemo();
                                    // @ts-ignore - Dynamic route
                                    router.replace('/(tabs)/sdlc/calendar');
                                }
                            },
                        ]
                    );
                }
            } else {
                console.log('❌ Biometric authentication failed');
                // Don't show alert here - the biometric store handles specific errors
            }
        } catch (error) {
            console.error('❌ Biometric login error:', error);
            Alert.alert(
                'Error',
                'Failed to authenticate. Please try again or use your password.',
                [{ text: 'OK' }]
            );
        } finally {
            setIsBiometricLoggingIn(false);
        }
    }, [enrolledEmail, authenticateWithBiometric, login, router, biometricCapability?.displayName]);

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
                            <View className="w-20 h-20 rounded-full bg-blue-600 items-center justify-center mb-4">
                                <Text className="text-5xl">🚀</Text>
                            </View>
                            <Text className="text-4xl font-bold text-gray-900">
                                Welcome Back
                            </Text>
                            <Text className="text-base text-gray-600 mt-2">
                                Sign in to continue your journey
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
                                    className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4 flex-row items-center justify-center"
                                    activeOpacity={0.7}
                                >
                                    {isBiometricLoggingIn ? (
                                        <ActivityIndicator size="small" color="#3B82F6" />
                                    ) : (
                                        <MaterialCommunityIcons
                                            name={biometricCapability?.iconName as any || 'face-recognition'}
                                            size={32}
                                            color="#3B82F6"
                                        />
                                    )}
                                    <View className="ml-3">
                                        <Text className="text-blue-600 font-semibold text-base">
                                            Login with {biometricCapability?.displayName || 'Face ID'}
                                        </Text>
                                        <Text className="text-blue-400 text-xs mt-0.5">
                                            {enrolledEmail}
                                        </Text>
                                    </View>
                                </TouchableOpacity>

                                {/* Divider */}
                                <View className="flex-row items-center my-6">
                                    <View className="flex-1 h-px bg-gray-200" />
                                    <Text className="text-gray-400 text-sm mx-4">or sign in with email</Text>
                                    <View className="flex-1 h-px bg-gray-200" />
                                </View>
                            </Animated.View>
                        )}

                        {/* Login Form */}
                        <Animated.View entering={FadeInDown.delay(200).springify()}>
                            <Input
                                label="Email"
                                value={email}
                                onChangeText={(text) => {
                                    setEmail(text);
                                    if (emailError) validateEmail(text);
                                }}
                                placeholder="your@email.com"
                                keyboardType="email-address"
                                error={emailError}
                            />

                            <View className="relative">
                                <Input
                                    label="Password"
                                    value={password}
                                    onChangeText={(text) => {
                                        setPassword(text);
                                        if (passwordError) validatePassword(text);
                                    }}
                                    placeholder="Enter your password"
                                    secureTextEntry={!showPassword}
                                    error={passwordError}
                                />
                                <Pressable
                                    onPress={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-11"
                                >
                                    <Text className="text-blue-600 font-semibold">
                                        {showPassword ? 'Hide' : 'Show'}
                                    </Text>
                                </Pressable>
                            </View>

                            <Pressable
                                onPress={() => router.push('/(auth)/forgot-password')}
                                className="mb-6"
                            >
                                <Text className="text-blue-600 font-semibold text-right">
                                    Forgot Password?
                                </Text>
                            </Pressable>

                            <Button
                                onPress={handleLogin}
                                loading={loading}
                                fullWidth
                                size="lg"
                            >
                                Sign In
                            </Button>
                        </Animated.View>

                        {/* Sign Up Link */}
                        <Animated.View
                            entering={FadeInUp.delay(300).springify()}
                            className="flex-row justify-center mt-8"
                        >
                            <Text className="text-gray-600">Don't have an account? </Text>
                            <Pressable onPress={() => router.push('/(auth)/register')}>
                                <Text className="text-blue-600 font-semibold">Sign Up</Text>
                            </Pressable>
                        </Animated.View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </Container>
    );
}
