import {
    View,
    Text,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    Alert,
} from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Container } from '../../components/layout/Container';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../store/authStore';
import { usePreferencesStore } from '../../store/preferencesStore';

export default function RegisterScreen() {
    const router = useRouter();
    const { register, loginDemo, error: authError } = useAuthStore();
    const { hasCompletedOnboarding, timezone } = usePreferencesStore();
    const [loading, setLoading] = useState(false);
    const [demoLoading, setDemoLoading] = useState(false);

    // Form state
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [agreeToTerms, setAgreeToTerms] = useState(false);

    // Error state
    const [fullNameError, setFullNameError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');

    const validateFullName = (name: string): boolean => {
        if (!name.trim()) {
            setFullNameError('Full name is required');
            return false;
        }
        if (name.trim().length < 2) {
            setFullNameError('Name must be at least 2 characters');
            return false;
        }
        setFullNameError('');
        return true;
    };

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

    const handleRegister = async () => {
        const isNameValid = validateFullName(fullName);
        const isEmailValid = validateEmail(email);
        const isPasswordValid = validatePassword(password);

        if (!isNameValid || !isEmailValid || !isPasswordValid) {
            return;
        }

        if (!agreeToTerms) {
            Alert.alert('Terms Required', 'Please agree to the Terms of Service and Privacy Policy');
            return;
        }

        setLoading(true);

        try {
            // Call the real register API
            await register(email, password, fullName, timezone);

            Alert.alert(
                'Success!',
                'Your account has been created. Welcome to Kaiz!',
                [
                    {
                        text: 'OK',
                        onPress: () => router.replace('/(tabs)/sdlc/calendar'),
                    },
                ]
            );
        } catch (error: any) {
            const message = error?.message || authError || 'Registration failed. Please try again.';
            Alert.alert('Error', message);
        } finally {
            setLoading(false);
        }
    };

    const handleTryDemo = async () => {
        setDemoLoading(true);
        try {
            // Demo user will inherit all onboarding preferences
            // (locale, life wheel areas, work style, etc. are already saved in preferences store)
            await loginDemo();
            // @ts-ignore - Dynamic route
            router.replace('/(tabs)/sdlc/calendar');
        } catch (error) {
            console.error('Demo login failed:', error);
            Alert.alert('Error', 'Demo mode failed. Please try again.');
        } finally {
            setDemoLoading(false);
        }
    };

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
                    <View className="flex-1 px-6 pt-16 pb-8">
                        {/* Header */}
                        <Animated.View
                            entering={FadeInDown.delay(100).springify()}
                            className="mb-8"
                        >
                            <Pressable onPress={() => router.back()} className="mb-4">
                                <Text className="text-blue-600 font-semibold text-lg">
                                    ← Back
                                </Text>
                            </Pressable>
                            <Text className="text-4xl font-bold text-gray-900">
                                Create Account
                            </Text>
                            <Text className="text-base text-gray-600 mt-2">
                                Start your journey to better life management
                            </Text>
                        </Animated.View>

                        {/* Demo Account Option - Only shown if onboarding completed */}
                        {hasCompletedOnboarding && (
                            <Animated.View
                                entering={FadeInDown.delay(150).springify()}
                                className="mb-6"
                            >
                                <View className="p-4 bg-purple-50 rounded-xl border-2 border-purple-200">
                                    <View className="flex-row items-start mb-3">
                                        <Text className="text-3xl mr-3">🎭</Text>
                                        <View className="flex-1">
                                            <Text className="text-lg font-bold text-purple-900 mb-1">
                                                Try Demo Mode
                                            </Text>
                                            <Text className="text-sm text-purple-700 leading-5">
                                                Experience Kaiz with your personalized settings and pre-filled data. No account needed.
                                            </Text>
                                        </View>
                                    </View>
                                    <Button
                                        onPress={handleTryDemo}
                                        variant="outline"
                                        size="lg"
                                        loading={demoLoading}
                                        fullWidth
                                    >
                                        Launch Demo Account
                                    </Button>
                                </View>
                            </Animated.View>
                        )}

                        {/* Divider - Only show if demo option was shown */}
                        {hasCompletedOnboarding && (
                            <Animated.View
                                entering={FadeInDown.delay(200).springify()}
                                className="flex-row items-center mb-6"
                            >
                                <View className="flex-1 h-px bg-gray-300" />
                                <Text className="mx-4 text-gray-500 font-semibold text-sm">OR CREATE ACCOUNT</Text>
                                <View className="flex-1 h-px bg-gray-300" />
                            </Animated.View>
                        )}

                        {/* Registration Form */}
                        <Animated.View entering={FadeInDown.delay(250).springify()}>
                            <Input
                                label="Full Name"
                                value={fullName}
                                onChangeText={(text) => {
                                    setFullName(text);
                                    if (fullNameError) validateFullName(text);
                                }}
                                placeholder="John Doe"
                                error={fullNameError}
                            />

                            <Input
                                label="Email"
                                value={email}
                                onChangeText={(text) => {
                                    setEmail(text);
                                    if (emailError) validateEmail(text);
                                }}
                                placeholder="your@email.com"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                error={emailError}
                            />

                            <View className="relative mb-4">
                                <Input
                                    label="Password"
                                    value={password}
                                    onChangeText={(text) => {
                                        setPassword(text);
                                        if (passwordError) validatePassword(text);
                                    }}
                                    placeholder="At least 6 characters"
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

                            {/* Terms Checkbox */}
                            <Pressable
                                onPress={() => setAgreeToTerms(!agreeToTerms)}
                                className="flex-row items-start mb-6"
                            >
                                <View
                                    className={`w-6 h-6 rounded-md border-2 items-center justify-center mr-3 mt-0.5 ${
                                        agreeToTerms
                                            ? 'bg-blue-600 border-blue-600'
                                            : 'border-gray-300'
                                    }`}
                                >
                                    {agreeToTerms && (
                                        <Text className="text-white text-sm font-bold">✓</Text>
                                    )}
                                </View>
                                <Text className="flex-1 text-sm text-gray-600 leading-6">
                                    I agree to the{' '}
                                    <Text className="text-blue-600 font-semibold">
                                        Terms of Service
                                    </Text>{' '}
                                    and{' '}
                                    <Text className="text-blue-600 font-semibold">
                                        Privacy Policy
                                    </Text>
                                </Text>
                            </Pressable>

                            <Button
                                onPress={handleRegister}
                                loading={loading}
                                fullWidth
                                size="lg"
                            >
                                Create Account
                            </Button>
                        </Animated.View>

                        {/* Login Link */}
                        <Animated.View
                            entering={FadeInUp.delay(300).springify()}
                            className="flex-row justify-center mt-8"
                        >
                            <Text className="text-gray-600">Already have an account? </Text>
                            <Pressable onPress={() => router.push('/(auth)/login')}>
                                <Text className="text-blue-600 font-semibold">Sign In</Text>
                            </Pressable>
                        </Animated.View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </Container>
    );
}
