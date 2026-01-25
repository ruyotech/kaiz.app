import { View, Text, ScrollView } from 'react-native';
import { useEffect } from 'react';
import { Container } from '../components/layout/Container';
import { ScreenHeader } from '../components/layout/ScreenHeader';
import { Card } from '../components/ui/Card';
import { Avatar } from '../components/ui/Avatar';
import { Button } from '../components/ui/Button';
import { useAuthStore } from '../store/authStore';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
    const router = useRouter();
    const { user, logout } = useAuthStore();

    const handleLogout = async () => {
        await logout();
        router.replace('/(auth)/login');
    };

    if (!user) return null;

    return (
        <Container>
            <ScreenHeader title="Profile" showBack />

            <ScrollView className="flex-1 p-4">
                {/* User Info */}
                <Card className="mb-4">
                    <View className="items-center mb-4">
                        <Avatar name={user.fullName} size="lg" />
                        <Text className="text-2xl font-bold mt-3">{user.fullName}</Text>
                        <Text className="text-gray-600">{user.email}</Text>
                    </View>

                    <View className="border-t border-gray-200 pt-4">
                        <View className="flex-row justify-between mb-2">
                            <Text className="text-gray-600">Account Type</Text>
                            <Text className="font-semibold capitalize">{user.accountType.replace('_', ' ')}</Text>
                        </View>
                        <View className="flex-row justify-between mb-2">
                            <Text className="text-gray-600">Subscription</Text>
                            <Text className="font-semibold capitalize">{user.subscriptionTier}</Text>
                        </View>
                        <View className="flex-row justify-between">
                            <Text className="text-gray-600">Timezone</Text>
                            <Text className="font-semibold">{user.timezone}</Text>
                        </View>
                    </View>
                </Card>

                {/* Stats */}
                <Card className="mb-4">
                    <Text className="text-lg font-semibold mb-3">Your Stats</Text>
                    <View className="flex-row justify-between mb-2">
                        <Text className="text-gray-600">Total Tasks</Text>
                        <Text className="font-semibold">49</Text>
                    </View>
                    <View className="flex-row justify-between mb-2">
                        <Text className="text-gray-600">Completed Points</Text>
                        <Text className="font-semibold">213</Text>
                    </View>
                    <View className="flex-row justify-between">
                        <Text className="text-gray-600">Active Challenges</Text>
                        <Text className="font-semibold">3</Text>
                    </View>
                </Card>

                {/* Actions */}
                <Button onPress={handleLogout} variant="outline" fullWidth>
                    Sign Out
                </Button>
            </ScrollView>
        </Container>
    );
}
