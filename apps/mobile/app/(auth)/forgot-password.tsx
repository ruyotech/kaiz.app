import { View, Text, Pressable, ScrollView, Alert } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Container } from '../../components/layout/Container';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../store/authStore';

export default function ForgotPasswordScreen() {
    const router = useRouter();
    const { resetPassword, error: authError } = useAuthStore();
    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState('');
    const [loading, setLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

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

    const handleSendResetLink = async () => {
        if (!validateEmail(email)) {
            return;
        }

        setLoading(true);

        try {
            await resetPassword(email);
            setEmailSent(true);
        } catch (error: any) {
            const message = error?.message || authError || 'Failed to send reset link. Please try again.';
            Alert.alert('Error', message);
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setLoading(true);
        try {
            await resetPassword(email);
            Alert.alert('Success', 'Reset link has been resent to your email');
        } catch (error: any) {
            const message = error?.message || 'Failed to resend. Please try again.';
            Alert.alert('Error', message);
        } finally {
            setLoading(false);
        }
    };

    if (emailSent) {
        return (
            <Container safeArea={false}>
                <View className="flex-1 px-6 pt-20 justify-center">
                    <Animated.View
                        entering={FadeInDown.springify()}
                        className="items-center"
                    >
                        {/* Success Icon */}
                        <View className="w-24 h-24 rounded-full bg-green-100 items-center justify-center mb-6">
                            <Text className="text-6xl">📧</Text>
                        </View>

                        <Text className="text-3xl font-bold text-center mb-3">
                            Check Your Email
                        </Text>
                        
                        <Text className="text-base text-gray-600 text-center mb-2 px-4">
                            We've sent a password reset link to:
                        </Text>
                        
                        <Text className="text-base font-semibold text-blue-600 mb-8">
                            {email}
                        </Text>

                        <View className="bg-blue-50 p-4 rounded-lg mb-6 w-full">
                            <Text className="text-sm text-blue-900 text-center">
                                💡 The link will expire in 1 hour. Check your spam folder if you
                                don't see it in your inbox.
                            </Text>
                        </View>

                        <Button onPress={handleResend} variant="outline" fullWidth loading={loading}>
                            Resend Link
                        </Button>

                        <Pressable
                            onPress={() => router.back()}
                            className="mt-6"
                        >
                            <Text className="text-blue-600 font-semibold text-center">
                                ← Back to Login
                            </Text>
                        </Pressable>
                    </Animated.View>
                </View>
            </Container>
        );
    }

    return (
        <Container safeArea={false}>
            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                <View className="flex-1 px-6 pt-20">
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

                        <View className="w-20 h-20 rounded-full bg-yellow-100 items-center justify-center mb-6">
                            <Text className="text-5xl">🔑</Text>
                        </View>

                        <Text className="text-4xl font-bold text-gray-900 mb-3">
                            Reset Password
                        </Text>
                        <Text className="text-base text-gray-600">
                            Enter your email address and we'll send you a link to reset your
                            password.
                        </Text>
                    </Animated.View>

                    {/* Form */}
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

                        <Button
                            onPress={handleSendResetLink}
                            loading={loading}
                            fullWidth
                            size="lg"
                        >
                            Send Reset Link
                        </Button>
                    </Animated.View>

                    {/* Additional Info */}
                    <Animated.View
                        entering={FadeInDown.delay(300).springify()}
                        className="mt-8"
                    >
                        <View className="bg-gray-50 p-4 rounded-lg">
                            <Text className="text-sm text-gray-700 font-semibold mb-2">
                                Remember your password?
                            </Text>
                            <Pressable onPress={() => router.back()}>
                                <Text className="text-blue-600 font-semibold">
                                    Return to Login →
                                </Text>
                            </Pressable>
                        </View>
                    </Animated.View>
                </View>
            </ScrollView>
        </Container>
    );
}
