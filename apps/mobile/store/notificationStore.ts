import { create } from 'zustand';
import { Notification } from '../types/models';
import { mockApi } from '../services/mockApi';

interface NotificationState {
    notifications: Notification[];
    unreadCount: number;
    loading: boolean;
    error: string | null;

    fetchNotifications: (userId: string) => Promise<void>;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
    notifications: [],
    unreadCount: 0,
    loading: false,
    error: null,

    fetchNotifications: async (userId) => {
        set({ loading: true, error: null });
        try {
            const notifications = await mockApi.getNotifications(userId) as Notification[];
            const unreadCount = await mockApi.getUnreadCount(userId);
            set({ notifications, unreadCount, loading: false });
        } catch (error) {
            set({ error: 'Failed to fetch notifications', loading: false });
        }
    },

    markAsRead: (id) => {
        set(state => ({
            notifications: state.notifications.map(n =>
                n.id === id ? { ...n, isRead: true } : n
            ),
            unreadCount: Math.max(0, state.unreadCount - 1),
        }));
    },

    markAllAsRead: () => {
        set(state => ({
            notifications: state.notifications.map(n => ({ ...n, isRead: true })),
            unreadCount: 0,
        }));
    },
}));
