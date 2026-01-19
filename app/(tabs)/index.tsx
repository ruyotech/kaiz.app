import { View, Text, ScrollView } from 'react-native';
import { Container } from '../../components/layout/Container';
import { ScreenHeader } from '../../components/layout/ScreenHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import { useNotificationStore } from '../../store/notificationStore';
import { useEffect } from 'react';

export default function DashboardScreen() {
    const router = useRouter();
    const { user } = useAuthStore();
    const { unreadCount, fetchNotifications } = useNotificationStore();

    useEffect(() => {
        if (user) {
            fetchNotifications(user.id);
        }
    }, [user]);

    return (
        <Container>
            <ScreenHeader
                title={`Welcome, ${user?.fullName || 'User'}!`}
                subtitle="Your personal SDLC dashboard"
            />
            <ScrollView className="flex-1 p-4">
                {/* Quick Stats */}
                <View className="flex-row mb-4">
                    <Card className="flex-1 mr-2">
                        <Text className="text-2xl font-bold text-blue-600">12</Text>
                        <Text className="text-sm text-gray-600">Active Tasks</Text>
                    </Card>
                    <Card className="flex-1 ml-2">
                        <Text className="text-2xl font-bold text-green-600">24</Text>
                        <Text className="text-sm text-gray-600">Points This Week</Text>
                    </Card>
                </View>

                {/* Notifications */}
                {unreadCount > 0 && (
                    <Card className="mb-4">
                        <Text className="text-lg font-semibold mb-2">Notifications</Text>
                        <Text className="text-gray-700 mb-3">
                            You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                        </Text>
                        <Button
                            onPress={() => router.push('/notifications')}
                            variant="outline"
                            size="sm"
                        >
                            View All
                        </Button>
                    </Card>
                )}

                {/* Quick Actions */}
                <Card className="mb-4">
                    <Text className="text-lg font-semibold mb-3">Quick Actions</Text>
                    <Button
                        onPress={() => router.push('/sdlc/create-task')}
                        className="mb-2"
                    >
                        + Create Task
                    </Button>
                    <Button
                        onPress={() => router.push('/challenges')}
                        variant="secondary"
                    >
                        View Challenges
                    </Button>
                </Card>

                {/* Today's Quote */}
                <Card>
                    <Text className="text-lg font-semibold mb-2">💪 Daily Motivation</Text>
                    <Text className="text-gray-700 italic">
                        "The only way to do great work is to love what you do."
                    </Text>
                    <Text className="text-gray-500 text-sm mt-1">- Steve Jobs</Text>
                </Card>
            </ScrollView>
        </Container>
    );
}
