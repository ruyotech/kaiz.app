import { View, Text, ScrollView, FlatList } from 'react-native';
import { useEffect, useState } from 'react';
import { Container } from '../components/layout/Container';
import { ScreenHeader } from '../components/layout/ScreenHeader';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { useNotificationStore } from '../store/notificationStore';
import { useAuthStore } from '../store/authStore';
import { formatDateTime } from '../utils/dateHelpers';

export default function NotificationsScreen() {
    const { user } = useAuthStore();
    const { notifications, fetchNotifications, markAsRead, markAllAsRead } = useNotificationStore();

    useEffect(() => {
        if (user) {
            fetchNotifications(user.id);
        }
    }, [user]);

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'ai_scrum_master':
                return '🤖';
            case 'challenge':
                return '🏆';
            case 'family':
                return '👨‍👩‍👧‍👦';
            default:
                return '📬';
        }
    };

    const renderNotification = ({ item }: any) => (
        <Card
            className={`mb-3 ${!item.isRead ? 'border-l-4 border-blue-600' : ''}`}
        >
            <View className="flex-row items-start justify-between mb-2">
                <View className="flex-row items-center flex-1">
                    <Text className="text-2xl mr-2">{getNotificationIcon(item.type)}</Text>
                    <Text className="text-lg font-semibold flex-1">{item.title}</Text>
                </View>
                {!item.isRead && (
                    <Badge variant="info" size="sm">New</Badge>
                )}
            </View>
            <Text className="text-gray-700 mb-2">{item.content}</Text>
            <Text className="text-xs text-gray-500">{formatDateTime(item.createdAt)}</Text>
            {!item.isRead && (
                <Button
                    size="sm"
                    variant="ghost"
                    onPress={() => markAsRead(item.id)}
                    className="mt-2"
                >
                    Mark as Read
                </Button>
            )}
        </Card>
    );

    return (
        <Container>
            <ScreenHeader
                title="Notifications"
                subtitle={`${notifications.filter(n => !n.isRead).length} unread`}
                showBack
                rightAction={
                    notifications.some(n => !n.isRead) && (
                        <Button size="sm" variant="ghost" onPress={markAllAsRead}>
                            Clear All
                        </Button>
                    )
                }
            />

            {notifications.length === 0 ? (
                <View className="flex-1 items-center justify-center p-8">
                    <Text className="text-6xl mb-4">🔔</Text>
                    <Text className="text-xl font-semibold text-gray-900 mb-2">
                        No Notifications
                    </Text>
                    <Text className="text-gray-600 text-center">
                        You're all caught up!
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={notifications}
                    renderItem={renderNotification}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ padding: 16 }}
                />
            )}
        </Container>
    );
}
