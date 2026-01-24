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

export default function LoginScreen() {
    const router = useRouter();
    const { login, loading } = useAuthStore();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

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
            router.replace('/(tabs)');
        } catch (error) {
            Alert.alert(
                'Login Failed',
                'Invalid email or password. Please try again.',
                [{ text: 'OK' }]
            );
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
