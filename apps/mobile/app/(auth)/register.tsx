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
import { useTranslation } from '../../hooks';
import { useThemeContext } from '../../providers/ThemeProvider';

export default function RegisterScreen() {
    const router = useRouter();
    const { t } = useTranslation();
    const { register, error: authError } = useAuthStore();
    const { timezone } = usePreferencesStore();
    const { colors } = useThemeContext();
    const [loading, setLoading] = useState(false);

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
            setFullNameError(t('auth.validation.fullNameRequired'));
            return false;
        }
        if (name.trim().length < 2) {
            setFullNameError(t('auth.validation.fullNameMinLength'));
            return false;
        }
        setFullNameError('');
        return true;
    };

    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) {
            setEmailError(t('auth.validation.emailRequired'));
            return false;
        }
        if (!emailRegex.test(email)) {
            setEmailError(t('auth.validation.emailInvalid'));
            return false;
        }
        setEmailError('');
        return true;
    };

    const validatePassword = (password: string): boolean => {
        if (!password) {
            setPasswordError(t('auth.validation.passwordRequired'));
            return false;
        }
        if (password.length < 6) {
            setPasswordError(t('auth.validation.passwordMinLength'));
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
            Alert.alert(t('auth.register.termsRequired'), t('auth.register.termsRequiredMessage'));
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
                                <Text 
                                    className="font-semibold text-lg"
                                    style={{ color: colors.primary }}
                                >
                                    ← {t('common.back')}
                                </Text>
                            </Pressable>
                            <Text 
                                className="text-4xl font-bold"
                                style={{ color: colors.text }}
                            >
                                {t('auth.register.title')}
                            </Text>
                            <Text 
                                className="text-base mt-2"
                                style={{ color: colors.textSecondary }}
                            >
                                {t('auth.register.subtitle')}
                            </Text>
                        </Animated.View>

                        {/* Registration Form */}
                        <Animated.View entering={FadeInDown.delay(150).springify()}>
                            <Input
                                label={t('auth.register.fullName')}
                                value={fullName}
                                onChangeText={(text) => {
                                    setFullName(text);
                                    if (fullNameError) validateFullName(text);
                                }}
                                placeholder={t('auth.register.fullNamePlaceholder')}
                                error={fullNameError}
                            />

                            <Input
                                label={t('auth.register.email')}
                                value={email}
                                onChangeText={(text) => {
                                    setEmail(text);
                                    if (emailError) validateEmail(text);
                                }}
                                placeholder={t('auth.register.emailPlaceholder')}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                error={emailError}
                            />

                            <View className="relative mb-4">
                                <Input
                                    label={t('auth.register.password')}
                                    value={password}
                                    onChangeText={(text) => {
                                        setPassword(text);
                                        if (passwordError) validatePassword(text);
                                    }}
                                    placeholder={t('auth.register.passwordPlaceholder')}
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

                            {/* Terms Checkbox */}
                            <Pressable
                                onPress={() => setAgreeToTerms(!agreeToTerms)}
                                className="flex-row items-start mb-6"
                            >
                                <View
                                    className="w-6 h-6 rounded-md items-center justify-center mr-3 mt-0.5"
                                    style={{
                                        borderWidth: 2,
                                        backgroundColor: agreeToTerms ? colors.primary : 'transparent',
                                        borderColor: agreeToTerms ? colors.primary : colors.border
                                    }}
                                >
                                    {agreeToTerms && (
                                        <Text style={{ color: colors.textInverse }} className="text-sm font-bold">✓</Text>
                                    )}
                                </View>
                                <Text 
                                    className="flex-1 text-sm leading-6"
                                    style={{ color: colors.textSecondary }}
                                >
                                    {t('auth.register.agreeToTerms')}
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
                            <Text style={{ color: colors.textSecondary }}>Already have an account? </Text>
                            <Pressable onPress={() => router.push('/(auth)/login')}>
                                <Text 
                                    className="font-semibold"
                                    style={{ color: colors.primary }}
                                >
                                    Sign In
                                </Text>
                            </Pressable>
                        </Animated.View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </Container>
    );
}
