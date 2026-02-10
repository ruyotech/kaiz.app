import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Notification } from '../types/models';
import { notificationApi } from '../services/api';
import {
    EnhancedNotification,
    NotificationCategory,
    NotificationPreferences,
    NotificationFilters,
} from '../types/notification.types';

// ==========================================
// Default Notification Preferences
// ==========================================

const DEFAULT_PREFERENCES: NotificationPreferences = {
    enabled: true,
    quietHoursEnabled: false,
    quietHoursStart: '22:00',
    quietHoursEnd: '07:00',
    pushEnabled: true,
    pushSound: true,
    pushVibrate: true,
    categories: {
        tasks: { enabled: true, push: true, inApp: true, email: false },
        challenges: { enabled: true, push: true, inApp: true, email: false },
        community: { enabled: true, push: true, inApp: true, email: false },
        essentia: { enabled: true, push: true, inApp: true, email: false },
        events: { enabled: true, push: true, inApp: true, email: true },
        system: { enabled: true, push: false, inApp: true, email: false },
        ai: { enabled: true, push: true, inApp: true, email: false },
    },
    types: {},
    smartGrouping: true,
    dailyDigest: false,
    dailyDigestTime: '08:00',
    weeklyRecap: true,
};

// ==========================================
// Store Interface
// ==========================================

interface NotificationState {
    // Data
    notifications: Notification[];
    enhancedNotifications: EnhancedNotification[];
    unreadCount: number;
    loading: boolean;
    error: string | null;
    
    // Preferences
    preferences: NotificationPreferences;
    
    // Filters
    activeFilter: 'all' | 'unread' | NotificationCategory;
    searchQuery: string;
    
    // Actions - Fetch
    fetchNotifications: () => Promise<void>;
    refreshNotifications: () => Promise<void>;
    
    // Actions - Read/Archive
    markAsRead: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    markCategoryAsRead: (category: NotificationCategory) => Promise<void>;
    archiveNotification: (id: string) => void;
    deleteNotification: (id: string) => Promise<void>;
    clearAllNotifications: () => void;
    
    // Actions - Pin
    pinNotification: (id: string) => void;
    unpinNotification: (id: string) => void;
    
    // Actions - Filtering
    setActiveFilter: (filter: 'all' | 'unread' | NotificationCategory) => void;
    setSearchQuery: (query: string) => void;
    
    // Actions - Preferences
    updatePreferences: (prefs: Partial<NotificationPreferences>) => void;
    toggleCategoryNotifications: (category: NotificationCategory, enabled: boolean) => void;
    
    // Computed
    getFilteredNotifications: () => EnhancedNotification[];
    getUnreadByCategory: () => Record<NotificationCategory | 'all', number>;
    
    // Demo data for development
    addDemoNotifications: () => void;
}

// ==========================================
// Demo Notifications Generator
// ==========================================

const generateDemoNotifications = (): EnhancedNotification[] => {
    const now = new Date();
    const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    return [
        // Today - Urgent
        {
            id: 'demo-1',
            userId: 'user-1',
            type: 'task_overdue',
            category: 'tasks',
            title: 'Task Overdue!',
            body: '"Complete quarterly review" was due yesterday. Would you like to reschedule or mark as done?',
            priority: 'urgent',
            isRead: false,
            isArchived: false,
            createdAt: hourAgo.toISOString(),
            actions: [
                { id: 'reschedule', label: 'Reschedule', type: 'primary', action: 'reschedule' },
                { id: 'done', label: 'Mark Done', type: 'secondary', action: 'complete' },
            ],
            metadata: { relatedId: 'task-123', relatedType: 'task' },
        },
        // Today - Challenge
        {
            id: 'demo-2',
            userId: 'user-1',
            type: 'challenge_streak',
            category: 'challenges',
            title: '7-Day Streak!',
            body: "You've maintained your meditation challenge for 7 days straight! Keep it going!",
            emoji: 'fire',
            priority: 'medium',
            isRead: false,
            isArchived: false,
            isPinned: true,
            createdAt: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
            metadata: { relatedId: 'challenge-456', progress: 70, count: 7 },
        },
        // Today - Community
        {
            id: 'demo-3',
            userId: 'user-1',
            type: 'kudos_received',
            category: 'community',
            title: 'Sarah sent you kudos!',
            body: '"Thanks for always being so supportive in the productivity group!"',
            priority: 'low',
            isRead: false,
            isArchived: false,
            createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
            metadata: {
                senderUserId: 'user-sarah',
                senderName: 'Sarah Chen',
                senderAvatar: 'https://i.pravatar.cc/150?u=sarah',
            },
        },
        // Today - AI
        {
            id: 'demo-4',
            userId: 'user-1',
            type: 'ai_daily_brief',
            category: 'ai',
            title: 'Good morning! Here\'s your daily brief',
            body: 'You have 5 tasks today. Focus on "Project proposal" first - it\'s in your Q2 (Important/Not Urgent). Your velocity is up 15% this week!',
            priority: 'medium',
            isRead: true,
            isArchived: false,
            createdAt: new Date(now.setHours(8, 0, 0, 0)).toISOString(),
            deepLink: '/(tabs)/sprints/calendar',
        },
        // Yesterday - Birthday
        {
            id: 'demo-5',
            userId: 'user-1',
            type: 'birthday_reminder',
            category: 'events',
            title: "Mom's birthday tomorrow!",
            body: "Don't forget - your mom's birthday is tomorrow. You saved a gift idea: \"Spa day voucher\"",
            emoji: 'cake-variant-outline',
            priority: 'high',
            isRead: false,
            isArchived: false,
            createdAt: yesterday.toISOString(),
            metadata: { dueDate: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString() },
        },
        // Yesterday - Sprint
        {
            id: 'demo-6',
            userId: 'user-1',
            type: 'sprint_ending',
            category: 'tasks',
            title: 'Sprint S04-Jan-2026 ends in 2 days',
            body: "You've completed 18/25 story points (72%). 3 tasks remaining in your backlog.",
            priority: 'medium',
            isRead: true,
            isArchived: false,
            createdAt: yesterday.toISOString(),
            metadata: { progress: 72 },
        },
        // This week - Learning
        {
            id: 'demo-7',
            userId: 'user-1',
            type: 'streak_at_risk',
            category: 'essentia',
            title: 'Your reading streak is at risk!',
            body: "You haven't read today yet. Just 5 minutes will keep your 12-day streak alive!",
            priority: 'high',
            isRead: false,
            isArchived: false,
            createdAt: twoDaysAgo.toISOString(),
            deepLink: '/(tabs)/essentia',
            actions: [
                { id: 'read', label: 'Read Now', type: 'primary', action: 'navigate' },
            ],
        },
        // This week - Partner
        {
            id: 'demo-8',
            userId: 'user-1',
            type: 'partner_request',
            category: 'community',
            title: 'New accountability partner request',
            body: 'Alex wants to be your accountability partner for the "10K Steps" challenge.',
            priority: 'medium',
            isRead: true,
            isArchived: false,
            createdAt: twoDaysAgo.toISOString(),
            metadata: {
                senderUserId: 'user-alex',
                senderName: 'Alex Rivera',
                senderAvatar: 'https://i.pravatar.cc/150?u=alex',
            },
            actions: [
                { id: 'accept', label: 'Accept', type: 'primary', action: 'accept' },
                { id: 'decline', label: 'Decline', type: 'secondary', action: 'decline' },
            ],
        },
        // Older - Achievement
        {
            id: 'demo-9',
            userId: 'user-1',
            type: 'badge_earned',
            category: 'community',
            title: 'Badge Earned: Sprint Starter',
            body: "Congratulations! You've completed your first sprint. You're officially part of the Kaiz community!",
            emoji: 'medal-outline',
            priority: 'low',
            isRead: true,
            isArchived: false,
            createdAt: weekAgo.toISOString(),
        },
        // Older - System
        {
            id: 'demo-10',
            userId: 'user-1',
            type: 'feature_announcement',
            category: 'system',
            title: 'New: Smart Notification Center',
            body: "We've redesigned notifications to help you stay organized. Filter by category, pin important alerts, and never miss what matters.",
            priority: 'low',
            isRead: true,
            isArchived: false,
            createdAt: weekAgo.toISOString(),
        },
    ];
};

// ==========================================
// Store Implementation
// ==========================================

export const useNotificationStore = create<NotificationState>()(
    persist(
        (set, get) => ({
            // Initial state
            notifications: [],
            enhancedNotifications: [],
            unreadCount: 0,
            loading: false,
            error: null,
            preferences: DEFAULT_PREFERENCES,
            activeFilter: 'all',
            searchQuery: '',

            // Fetch notifications from API
            fetchNotifications: async () => {
                set({ loading: true, error: null });
                try {
                    const [notificationsPage, unreadCount] = await Promise.all([
                        notificationApi.getNotifications(),
                        notificationApi.getUnreadCount(),
                    ]);
                    const notifications = notificationsPage.content || notificationsPage;
                    
                    // Convert to enhanced notifications
                    const enhanced: EnhancedNotification[] = (notifications as unknown as Notification[]).map(n => ({
                        id: n.id,
                        userId: n.userId,
                        type: n.type === 'ai_scrum_master' ? 'ai_insight' :
                              n.type === 'challenge' ? 'challenge_reminder' :
                              n.type === 'family' ? 'birthday_reminder' : 'tip_of_day',
                        category: n.type === 'ai_scrum_master' ? 'ai' :
                                  n.type === 'challenge' ? 'challenges' :
                                  n.type === 'family' ? 'events' : 'system',
                        title: n.title,
                        body: n.content,
                        priority: 'medium',
                        isRead: n.isRead,
                        isArchived: false,
                        createdAt: n.createdAt,
                    } as EnhancedNotification));
                    
                    set({ 
                        notifications: notifications as unknown as Notification[], 
                        enhancedNotifications: enhanced,
                        unreadCount: typeof unreadCount === 'number' ? unreadCount : unreadCount.total, 
                        loading: false 
                    });
                } catch (error) {
                    // If API fails, use demo data for development
                    const demoNotifications = generateDemoNotifications();
                    const unreadCount = demoNotifications.filter(n => !n.isRead).length;
                    set({ 
                        enhancedNotifications: demoNotifications,
                        unreadCount,
                        loading: false,
                        error: null,
                    });
                }
            },

            refreshNotifications: async () => {
                await get().fetchNotifications();
            },

            markAsRead: async (id) => {
                try {
                    await notificationApi.markAsRead(id);
                } catch (error) {
                    // Continue with local update even if API fails
                }
                set(state => ({
                    notifications: state.notifications.map(n =>
                        n.id === id ? { ...n, isRead: true } : n
                    ),
                    enhancedNotifications: state.enhancedNotifications.map(n =>
                        n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n
                    ),
                    unreadCount: Math.max(0, state.unreadCount - 1),
                }));
            },

            markAllAsRead: async () => {
                try {
                    await notificationApi.markAllAsRead();
                } catch (error) {
                    // Continue with local update
                }
                set(state => ({
                    notifications: state.notifications.map(n => ({ ...n, isRead: true })),
                    enhancedNotifications: state.enhancedNotifications.map(n => ({ 
                        ...n, 
                        isRead: true,
                        readAt: new Date().toISOString(),
                    })),
                    unreadCount: 0,
                }));
            },

            markCategoryAsRead: async (category) => {
                set(state => {
                    const updated = state.enhancedNotifications.map(n =>
                        n.category === category ? { ...n, isRead: true, readAt: new Date().toISOString() } : n
                    );
                    return {
                        enhancedNotifications: updated,
                        unreadCount: updated.filter(n => !n.isRead).length,
                    };
                });
            },

            archiveNotification: (id) => {
                set(state => ({
                    enhancedNotifications: state.enhancedNotifications.map(n =>
                        n.id === id ? { ...n, isArchived: true } : n
                    ),
                }));
            },

            deleteNotification: async (id) => {
                set(state => ({
                    enhancedNotifications: state.enhancedNotifications.filter(n => n.id !== id),
                    notifications: state.notifications.filter(n => n.id !== id),
                }));
            },

            pinNotification: (id) => {
                set(state => ({
                    enhancedNotifications: state.enhancedNotifications.map(n =>
                        n.id === id ? { ...n, isPinned: true } : n
                    ),
                }));
            },

            unpinNotification: (id) => {
                set(state => ({
                    enhancedNotifications: state.enhancedNotifications.map(n =>
                        n.id === id ? { ...n, isPinned: false } : n
                    ),
                }));
            },

            setActiveFilter: (filter) => {
                set({ activeFilter: filter });
            },

            setSearchQuery: (query) => {
                set({ searchQuery: query });
            },

            updatePreferences: (prefs) => {
                set(state => ({
                    preferences: { ...state.preferences, ...prefs },
                }));
            },

            toggleCategoryNotifications: (category, enabled) => {
                set(state => ({
                    preferences: {
                        ...state.preferences,
                        categories: {
                            ...state.preferences.categories,
                            [category]: {
                                ...state.preferences.categories[category],
                                enabled,
                            },
                        },
                    },
                }));
            },

            getFilteredNotifications: () => {
                const { enhancedNotifications, activeFilter, searchQuery, preferences } = get();
                
                let filtered = enhancedNotifications.filter(n => !n.isArchived);

                // Filter by category
                if (activeFilter === 'unread') {
                    filtered = filtered.filter(n => !n.isRead);
                } else if (activeFilter !== 'all') {
                    filtered = filtered.filter(n => n.category === activeFilter);
                }

                // Filter by search query
                if (searchQuery.trim()) {
                    const query = searchQuery.toLowerCase();
                    filtered = filtered.filter(n =>
                        n.title.toLowerCase().includes(query) ||
                        n.body.toLowerCase().includes(query)
                    );
                }

                // Filter by preferences
                filtered = filtered.filter(n => 
                    preferences.categories[n.category]?.enabled !== false
                );

                // Sort: pinned first, then by date
                return filtered.sort((a, b) => {
                    if (a.isPinned && !b.isPinned) return -1;
                    if (!a.isPinned && b.isPinned) return 1;
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                });
            },

            getUnreadByCategory: () => {
                const { enhancedNotifications } = get();
                const counts: Record<NotificationCategory | 'all', number> = {
                    all: 0,
                    tasks: 0,
                    challenges: 0,
                    community: 0,
                    essentia: 0,
                    events: 0,
                    system: 0,
                    ai: 0,
                };

                enhancedNotifications.forEach(n => {
                    if (!n.isRead && !n.isArchived) {
                        counts.all++;
                        counts[n.category]++;
                    }
                });

                return counts;
            },

            addDemoNotifications: () => {
                const demoNotifications = generateDemoNotifications();
                set({
                    enhancedNotifications: demoNotifications,
                    unreadCount: demoNotifications.filter(n => !n.isRead).length,
                });
            },

            clearAllNotifications: () => {
                set({
                    notifications: [],
                    enhancedNotifications: [],
                    unreadCount: 0,
                });
            },
        }),
        {
            name: 'notification-store',
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({
                preferences: state.preferences,
                // Don't persist notifications - fetch fresh each time
            }),
        }
    )
);
