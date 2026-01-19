import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Container } from '../../components/layout/Container';
import { Button } from '../../components/ui/Button';
import { useAppStore } from '../../store/appStore';

export default function WelcomeScreen() {
    const router = useRouter();
    const { setOnboarded } = useAppStore();

    const handleGetStarted = () => {
        setOnboarded(true);
        router.replace('/(auth)/login');
    };

    return (
        <Container safeArea={false}>
            <View className="flex-1 justify-center items-center p-8">
                <Text className="text-6xl mb-8">🚀</Text>
                <Text className="text-4xl font-bold text-center mb-4">
                    Welcome to Kaiz1
                </Text>
                <Text className="text-xl text-gray-600 text-center mb-8">
                    Your Personal SDLC Super-App
                </Text>
                <Text className="text-base text-gray-600 text-center mb-12">
                    Manage tasks with story points, track bills with AI OCR, stay motivated with daily quotes, and challenge friends to reach your goals.
                </Text>
                <Button onPress={handleGetStarted} fullWidth>
                    Get Started
                </Button>
            </View>
        </Container>
    );
}
