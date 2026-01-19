import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';

export default function Index() {
    const router = useRouter();

    useEffect(() => {
        // Simple redirect to main app for testing
        const timer = setTimeout(() => {
            router.replace('/(tabs)');
        }, 100);

        return () => clearTimeout(timer);
    }, []);

    return (
        <View className="flex-1 items-center justify-center bg-white">
            <ActivityIndicator size="large" color="#3B82F6" />
        </View>
    );
}
