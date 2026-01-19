import { View, Text, KeyboardAvoidingView, Platform } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Container } from '../../components/layout/Container';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../store/authStore';

export default function LoginScreen() {
    const router = useRouter();
    const { login, loading } = useAuthStore();
    const [email, setEmail] = useState('john.doe@example.com');
    const [password, setPassword] = useState('password123');

    const handleLogin = async () => {
        await login(email, password);
        router.replace('/(tabs)');
    };

    return (
        <Container safeArea={false}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                <View className="flex-1 justify-center p-6">
                    <Text className="text-4xl font-bold mb-2">Welcome Back</Text>
                    <Text className="text-gray-600 mb-8">Sign in to continue</Text>

                    <Input
                        label="Email"
                        value={email}
                        onChangeText={setEmail}
                        placeholder="your@email.com"
                        keyboardType="email-address"
                    />

                    <Input
                        label="Password"
                        value={password}
                        onChangeText={setPassword}
                        placeholder="Enter password"
                        secureTextEntry
                    />

                    <Button
                        onPress={handleLogin}
                        loading={loading}
                        fullWidth
                    >
                        Sign In
                    </Button>

                    <View className="flex-row justify-center mt-4">
                        <Text className="text-gray-600">Don't have an account? </Text>
                        <Text
                            className="text-blue-600 font-semibold"
                            onPress={() => router.push('/(auth)/register')}
                        >
                            Sign Up
                        </Text>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Container>
    );
}
