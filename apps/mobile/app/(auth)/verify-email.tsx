import { View, Text, Pressable, Alert } from 'react-native';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Container } from '../../components/layout/Container';
import { Button } from '../../components/ui/Button';
import { TextInput } from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { useThemeContext } from '../../providers/ThemeProvider';

const CODE_LENGTH = 6;

export default function VerifyEmailScreen() {
    const router = useRouter();
    const { verifyEmail, sendVerificationCode, error: authError } = useAuthStore();
    const { colors } = useThemeContext();
    const [code, setCode] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);
    const inputRefs = useRef<Array<TextInput | null>>([]);

    useEffect(() => {
        if (resendCooldown > 0) {
            const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendCooldown]);

    useEffect(() => {
        // Auto-focus first input
        inputRefs.current[0]?.focus();
    }, []);

    const handleCodeChange = (text: string, index: number) => {
        // Only allow digits
        const digit = text.replace(/[^0-9]/g, '');
        
        if (digit.length > 1) {
            // Handle paste
            const digits = digit.slice(0, CODE_LENGTH).split('');
            const newCode = [...code];
            digits.forEach((d, i) => {
                if (index + i < CODE_LENGTH) {
                    newCode[index + i] = d;
                }
            });
            setCode(newCode);
            
            // Focus the next empty input or the last one
            const nextIndex = Math.min(index + digits.length, CODE_LENGTH - 1);
            inputRefs.current[nextIndex]?.focus();
        } else {
            const newCode = [...code];
            newCode[index] = digit;
            setCode(newCode);

            // Auto-advance to next input
            if (digit && index < CODE_LENGTH - 1) {
                inputRefs.current[index + 1]?.focus();
            }
        }
    };

    const handleKeyPress = (key: string, index: number) => {
        if (key === 'Backspace' && !code[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleVerify = async () => {
        const verificationCode = code.join('');
        
        if (verificationCode.length !== CODE_LENGTH) {
            Alert.alert('Invalid Code', 'Please enter the complete verification code');
            return;
        }

        setLoading(true);

        try {
            await verifyEmail(verificationCode);

            Alert.alert(
                'Success!',
                'Your email has been verified successfully.',
                [
                    {
                        text: 'Continue',
                        onPress: () => router.replace('/(tabs)'),
                    },
                ]
            );
        } catch (error: any) {
            const message = error?.message || authError || 'Invalid verification code. Please try again.';
            Alert.alert('Verification Failed', message, [{ text: 'OK' }]);
            setCode(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (resendCooldown > 0) return;

        setLoading(true);
        
        try {
            await sendVerificationCode();
            setResendCooldown(60);
            Alert.alert('Success', 'A new verification code has been sent to your email');
        } catch (error: any) {
            const message = error?.message || 'Failed to resend code. Please try again.';
            Alert.alert('Error', message);
        } finally {
            setLoading(false);
        }
    };

    const isCodeComplete = code.every((digit) => digit !== '');

    return (
        <Container safeArea={false}>
            <View className="flex-1 px-6 pt-20">
                {/* Header */}
                <Animated.View
                    entering={FadeInDown.delay(100).springify()}
                    className="items-center mb-12"
                >
                    <View 
                        className="w-24 h-24 rounded-full items-center justify-center mb-6"
                        style={{ backgroundColor: colors.primary + '20' }}
                    >
                        <Text className="text-6xl">📬</Text>
                    </View>

                    <Text 
                        className="text-3xl font-bold text-center mb-3"
                        style={{ color: colors.text }}
                    >
                        Verify Your Email
                    </Text>
                    
                    <Text 
                        className="text-base text-center px-8"
                        style={{ color: colors.textSecondary }}
                    >
                        We've sent a 6-digit verification code to your email address. Please
                        enter it below.
                    </Text>
                </Animated.View>

                {/* Verification Code Input */}
                <Animated.View
                    entering={FadeInDown.delay(200).springify()}
                    className="mb-8"
                >
                    <View className="flex-row justify-center gap-2 mb-8">
                        {code.map((digit, index) => (
                            <TextInput
                                key={index}
                                ref={(ref) => (inputRefs.current[index] = ref)}
                                value={digit}
                                onChangeText={(text) => handleCodeChange(text, index)}
                                onKeyPress={({ nativeEvent }) =>
                                    handleKeyPress(nativeEvent.key, index)
                                }
                                keyboardType="number-pad"
                                maxLength={1}
                                selectTextOnFocus
                                className="w-12 h-14 text-center text-2xl font-bold rounded-lg"
                                style={{
                                    borderWidth: 2,
                                    borderColor: digit ? colors.primary : colors.border,
                                    backgroundColor: digit ? colors.primary + '15' : colors.card,
                                    color: colors.text
                                }}
                            />
                        ))}
                    </View>

                    <Button
                        onPress={handleVerify}
                        loading={loading}
                        disabled={!isCodeComplete}
                        fullWidth
                        size="lg"
                    >
                        Verify Email
                    </Button>
                </Animated.View>

                {/* Resend Section */}
                <Animated.View
                    entering={FadeInDown.delay(300).springify()}
                    className="items-center"
                >
                    <Text 
                        className="mb-3"
                        style={{ color: colors.textSecondary }}
                    >
                        Didn't receive the code?
                    </Text>
                    
                    {resendCooldown > 0 ? (
                        <Text style={{ color: colors.textMuted }}>
                            Resend available in {resendCooldown}s
                        </Text>
                    ) : (
                        <Pressable onPress={handleResend} disabled={loading}>
                            <Text 
                                className="font-semibold"
                                style={{ color: colors.primary }}
                            >
                                Resend Code
                            </Text>
                        </Pressable>
                    )}
                </Animated.View>

                {/* Help Section */}
                <Animated.View
                    entering={FadeInDown.delay(400).springify()}
                    className="mt-12"
                >
                    <View 
                        className="p-4 rounded-lg"
                        style={{ backgroundColor: colors.warning + '20' }}
                    >
                        <Text 
                            className="text-sm text-center mb-2"
                            style={{ color: colors.text }}
                        >
                            💡 <Text className="font-semibold">Tip:</Text> Check your spam folder
                            if you don't see the email
                        </Text>
                    </View>

                    <Pressable
                        onPress={() => router.back()}
                        className="mt-6"
                    >
                        <Text 
                            className="font-semibold text-center"
                            style={{ color: colors.primary }}
                        >
                            ← Change Email Address
                        </Text>
                    </Pressable>
                </Animated.View>
            </View>
        </Container>
    );
}
