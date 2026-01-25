import { create } from 'zustand';
import { Notification } from '../types/models';
import { notificationApi } from '../services/api';

interface NotificationState {
    notifications: Notification[];
    unreadCount: number;
    loading: boolean;
    error: string | null;

    fetchNotifications: () => Promise<void>;
    markAsRead: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
    notifications: [],
    unreadCount: 0,
    loading: false,
    error: null,

    fetchNotifications: async () => {
        set({ loading: true, error: null });
        try {
            const [notificationsPage, unreadCount] = await Promise.all([
                notificationApi.getNotifications(),
                notificationApi.getUnreadCount(),
            ]);
            // Handle paginated response
            const notifications = notificationsPage.content || notificationsPage;
            set({ notifications: notifications as Notification[], unreadCount, loading: false });
        } catch (error) {
            set({ error: 'Failed to fetch notifications', loading: false });
        }
    },

    markAsRead: async (id) => {
        try {
            await notificationApi.markAsRead(id);
            set(state => ({
                notifications: state.notifications.map(n =>
                    n.id === id ? { ...n, isRead: true } : n
                ),
                unreadCount: Math.max(0, state.unreadCount - 1),
            }));
        } catch (error) {
            set({ error: 'Failed to mark notification as read' });
        }
    },

    markAllAsRead: async () => {
        try {
            await notificationApi.markAllAsRead();
            set(state => ({
                notifications: state.notifications.map(n => ({ ...n, isRead: true })),
                unreadCount: 0,
            }));
        } catch (error) {
            set({ error: 'Failed to mark all as read' });
        }
    },
}));
