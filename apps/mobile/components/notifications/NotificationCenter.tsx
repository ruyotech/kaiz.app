import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Animated,
    Pressable,
    Image,
    RefreshControl,
    Dimensions,
    FlatList,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { format, isToday, isYesterday, isThisWeek, formatDistanceToNow } from 'date-fns';
import { BlurView } from 'expo-blur';
import {
    EnhancedNotification,
    NotificationCategory,
    NOTIFICATION_CATEGORIES,
    getNotificationTypeConfig,
    getCategoryConfig,
} from '../../types/notification.types';
import { useNotificationStore } from '../../store/notificationStore';
import { useTranslation } from '../../hooks';
import { useThemeContext } from '../../providers/ThemeProvider';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ==========================================
// NotificationItem Component
// ==========================================

interface NotificationItemProps {
    notification: EnhancedNotification;
    onPress: () => void;
    onMarkRead: () => void;
    onArchive: () => void;
    onPin?: () => void;
    isExpanded?: boolean;
}

export function NotificationItem({
    notification,
    onPress,
    onMarkRead,
    onArchive,
    onPin,
    isExpanded = false,
}: NotificationItemProps) {
    const { colors, isDark } = useThemeContext();
    const swipeAnim = useRef(new Animated.Value(0)).current;
    const typeConfig = getNotificationTypeConfig(notification.type);
    const categoryConfig = getCategoryConfig(notification.category);
    
    const iconName = notification.icon || typeConfig?.icon || 'bell-outline';
    const iconColor = notification.iconColor || typeConfig?.color || categoryConfig?.color || colors.textSecondary;
    const bgColor = isDark 
        ? (categoryConfig?.color ? `${categoryConfig.color}20` : colors.backgroundSecondary)
        : (categoryConfig?.bgColor || '#F3F4F6');

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        if (isToday(date)) {
            return formatDistanceToNow(date, { addSuffix: true });
        }
        if (isYesterday(date)) {
            return 'Yesterday';
        }
        if (isThisWeek(date)) {
            return format(date, 'EEEE');
        }
        return format(date, 'MMM d');
    };

    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.7}
            className="mx-4 mb-2 rounded-2xl overflow-hidden"
            style={{
                backgroundColor: !notification.isRead ? colors.card : colors.backgroundSecondary,
                shadowColor: !notification.isRead ? '#000' : 'transparent',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: !notification.isRead ? 0.08 : 0,
                shadowRadius: 8,
                elevation: !notification.isRead ? 3 : 0,
            }}
        >
            <View className="flex-row p-4">
                {/* Icon/Avatar */}
                <View className="mr-3">
                    {notification.metadata?.senderAvatar ? (
                        <Image
                            source={{ uri: notification.metadata.senderAvatar }}
                            className="w-12 h-12 rounded-full"
                        />
                    ) : (
                        <View
                            className="w-12 h-12 rounded-full items-center justify-center"
                            style={{ backgroundColor: bgColor }}
                        >
                            {notification.emoji ? (
                                <Text className="text-2xl">{notification.emoji}</Text>
                            ) : (
                                <MaterialCommunityIcons
                                    name={iconName as any}
                                    size={24}
                                    color={iconColor}
                                />
                            )}
                        </View>
                    )}
                    {/* Unread indicator */}
                    {!notification.isRead && (
                        <View
                            className="absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white"
                            style={{ backgroundColor: iconColor }}
                        />
                    )}
                </View>

                {/* Content */}
                <View className="flex-1">
                    <View className="flex-row items-start justify-between mb-1">
                        <Text
                            className="text-base flex-1 mr-2"
                            style={{
                                fontWeight: !notification.isRead ? '600' : '500',
                                color: !notification.isRead ? colors.text : colors.textSecondary
                            }}
                            numberOfLines={1}
                        >
                            {notification.title}
                        </Text>
                        <Text className="text-xs" style={{ color: colors.textTertiary }}>
                            {formatTime(notification.createdAt)}
                        </Text>
                    </View>
                    
                    <Text
                        className="text-sm"
                        style={{ color: !notification.isRead ? colors.textSecondary : colors.textTertiary }}
                        numberOfLines={isExpanded ? undefined : 2}
                    >
                        {notification.body}
                    </Text>

                    {/* Metadata - Progress indicator */}
                    {notification.metadata?.progress !== undefined && (
                        <View className="mt-2">
                            <View 
                                className="h-1.5 rounded-full overflow-hidden"
                                style={{ backgroundColor: colors.backgroundTertiary }}
                            >
                                <View
                                    className="h-full rounded-full"
                                    style={{
                                        width: `${notification.metadata.progress}%`,
                                        backgroundColor: iconColor,
                                    }}
                                />
                            </View>
                        </View>
                    )}

                    {/* Actions */}
                    {notification.actions && notification.actions.length > 0 && (
                        <View className="flex-row mt-3 gap-2">
                            {notification.actions.slice(0, 2).map((action) => (
                                <TouchableOpacity
                                    key={action.id}
                                    className="px-3 py-1.5 rounded-full"
                                    style={{
                                        backgroundColor: action.type === 'primary'
                                            ? '#3B82F6'
                                            : colors.backgroundSecondary
                                    }}
                                    onPress={() => {
                                        // Handle action
                                    }}
                                >
                                    <Text
                                        className="text-xs font-medium"
                                        style={{
                                            color: action.type === 'primary' ? '#fff' : colors.textSecondary
                                        }}
                                    >
                                        {action.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </View>

                {/* Pin indicator */}
                {notification.isPinned && (
                    <MaterialCommunityIcons
                        name="pin"
                        size={14}
                        color="#F59E0B"
                        style={{ position: 'absolute', top: 8, right: 8 }}
                    />
                )}
            </View>

            {/* Priority indicator for urgent */}
            {notification.priority === 'urgent' && (
                <View className="absolute top-0 left-0 right-0 h-1 bg-red-500" />
            )}
        </TouchableOpacity>
    );
}

// ==========================================
// CategoryTab Component
// ==========================================

interface CategoryTabProps {
    category: 'all' | NotificationCategory;
    label: string;
    icon: string;
    color: string;
    isActive: boolean;
    unreadCount: number;
    onPress: () => void;
}

function CategoryTab({ category, label, icon, color, isActive, unreadCount, onPress }: CategoryTabProps) {
    const { colors, isDark } = useThemeContext();
    
    return (
        <TouchableOpacity
            onPress={onPress}
            className="items-center px-4 py-2 mr-2 rounded-2xl"
            style={{
                backgroundColor: isActive 
                    ? (isDark ? '#374151' : '#1F2937') 
                    : colors.card,
                shadowColor: isActive ? '#000' : 'transparent',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: isActive ? 0.15 : 0,
                shadowRadius: 4,
                elevation: isActive ? 3 : 0,
            }}
        >
            <View className="flex-row items-center">
                <MaterialCommunityIcons
                    name={icon as any}
                    size={18}
                    color={isActive ? '#FFFFFF' : color}
                />
                <Text
                    className="ml-1.5 text-sm font-medium"
                    style={{
                        color: isActive ? '#fff' : colors.textSecondary
                    }}
                >
                    {label}
                </Text>
                {unreadCount > 0 && (
                    <View
                        className="ml-1.5 min-w-[18px] h-[18px] rounded-full items-center justify-center px-1"
                        style={{ backgroundColor: isActive ? '#FFFFFF' : color }}
                    >
                        <Text
                            className="text-[10px] font-bold"
                            style={{ color: isActive ? '#1F2937' : '#FFFFFF' }}
                        >
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );
}

// ==========================================
// NotificationSection Component
// ==========================================

interface NotificationSectionProps {
    title: string;
    notifications: EnhancedNotification[];
    onNotificationPress: (notification: EnhancedNotification) => void;
}

function NotificationSection({ title, notifications, onNotificationPress }: NotificationSectionProps) {
    const { markAsRead } = useNotificationStore();
    const { colors } = useThemeContext();
    
    if (notifications.length === 0) return null;

    return (
        <View className="mb-4">
            <Text 
                className="text-sm font-semibold uppercase tracking-wide px-4 mb-2"
                style={{ color: colors.textSecondary }}
            >
                {title}
            </Text>
            {notifications.map((notification) => (
                <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onPress={() => onNotificationPress(notification)}
                    onMarkRead={() => markAsRead(notification.id)}
                    onArchive={() => {}}
                />
            ))}
        </View>
    );
}

// ==========================================
// Empty State Component
// ==========================================

interface EmptyStateProps {
    category: 'all' | NotificationCategory;
}

function EmptyState({ category }: EmptyStateProps) {
    const { colors } = useThemeContext();
    const categoryConfig = category !== 'all' ? getCategoryConfig(category) : null;
    
    const getEmptyMessage = () => {
        switch (category) {
            case 'all':
                return { icon: '🎉', title: "You're all caught up!", subtitle: 'No new notifications' };
            case 'tasks':
                return { icon: '✅', title: 'No task updates', subtitle: 'Complete tasks to see updates here' };
            case 'challenges':
                return { icon: '🏆', title: 'No challenge updates', subtitle: 'Start a challenge to get motivated!' };
            case 'community':
                return { icon: '👋', title: 'No social updates', subtitle: 'Connect with others to see activity' };
            case 'essentia':
                return { icon: '📚', title: 'No learning updates', subtitle: 'Start reading to track progress' };
            case 'events':
                return { icon: '📅', title: 'No event reminders', subtitle: 'Add events to get notified' };
            case 'system':
                return { icon: '⚙️', title: 'No system updates', subtitle: 'App is running smoothly' };
            case 'ai':
                return { icon: '🤖', title: 'No AI insights yet', subtitle: 'Use the app to get personalized tips' };
            default:
                return { icon: '🔔', title: 'No notifications', subtitle: '' };
        }
    };

    const { icon, title, subtitle } = getEmptyMessage();

    return (
        <View className="flex-1 items-center justify-center py-16">
            <Text className="text-6xl mb-4">{icon}</Text>
            <Text className="text-xl font-semibold mb-1" style={{ color: colors.text }}>{title}</Text>
            <Text className="text-center px-8" style={{ color: colors.textSecondary }}>{subtitle}</Text>
        </View>
    );
}

// ==========================================
// Main NotificationCenter Component
// ==========================================

interface NotificationCenterProps {
    onClose?: () => void;
    isModal?: boolean;
}

export function NotificationCenter({ onClose, isModal = false }: NotificationCenterProps) {
    const router = useRouter();
    const { t } = useTranslation();
    const { colors, isDark } = useThemeContext();
    const { notifications, unreadCount, fetchNotifications, markAllAsRead, loading } = useNotificationStore();
    const [selectedCategory, setSelectedCategory] = useState<'all' | NotificationCategory>('all');
    const [refreshing, setRefreshing] = useState(false);
    const scrollRef = useRef<ScrollView>(null);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchNotifications();
        setRefreshing(false);
    }, [fetchNotifications]);

    // Filter and transform notifications
    const enhancedNotifications: EnhancedNotification[] = notifications.map(n => ({
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

    const filteredNotifications = selectedCategory === 'all'
        ? enhancedNotifications
        : enhancedNotifications.filter(n => n.category === selectedCategory);

    // Group notifications by time
    const groupedNotifications = {
        pinned: filteredNotifications.filter(n => n.isPinned),
        today: filteredNotifications.filter(n => !n.isPinned && isToday(new Date(n.createdAt))),
        yesterday: filteredNotifications.filter(n => !n.isPinned && isYesterday(new Date(n.createdAt))),
        thisWeek: filteredNotifications.filter(n => 
            !n.isPinned && 
            !isToday(new Date(n.createdAt)) && 
            !isYesterday(new Date(n.createdAt)) && 
            isThisWeek(new Date(n.createdAt))
        ),
        older: filteredNotifications.filter(n => 
            !n.isPinned && 
            !isThisWeek(new Date(n.createdAt))
        ),
    };

    // Count unread per category
    const getUnreadCount = (category: 'all' | NotificationCategory) => {
        if (category === 'all') return unreadCount;
        return enhancedNotifications.filter(n => n.category === category && !n.isRead).length;
    };

    const handleNotificationPress = (notification: EnhancedNotification) => {
        // Mark as read
        if (!notification.isRead) {
            // markAsRead will be called
        }
        
        // Navigate to deep link if available
        if (notification.deepLink) {
            router.push(notification.deepLink as any);
        }
        
        if (onClose) onClose();
    };

    const handleBack = () => {
        if (onClose) {
            onClose();
        } else {
            router.back();
        }
    };

    return (
        <View className="flex-1" style={{ backgroundColor: colors.background }}>
            {/* Header */}
            <View 
                className="px-4 pt-2 pb-3"
                style={{ backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border }}
            >
                <View className="flex-row items-center justify-between mb-3">
                    <View className="flex-row items-center">
                        <TouchableOpacity onPress={handleBack} className="mr-3">
                            <MaterialCommunityIcons 
                                name={isModal ? "close" : "arrow-left"} 
                                size={24} 
                                color={colors.text} 
                            />
                        </TouchableOpacity>
                        <Text className="text-2xl font-bold" style={{ color: colors.text }}>Notifications</Text>
                        {unreadCount > 0 && (
                            <View className="ml-2 bg-blue-600 px-2 py-0.5 rounded-full">
                                <Text className="text-xs font-bold text-white">{unreadCount}</Text>
                            </View>
                        )}
                    </View>
                    <View className="flex-row items-center">
                        {unreadCount > 0 && (
                            <TouchableOpacity
                                onPress={markAllAsRead}
                                className="mr-3"
                            >
                                <Text className="text-sm font-medium text-blue-600">Mark all read</Text>
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity
                            onPress={() => {
                                router.push('/profile');
                                if (onClose) onClose();
                            }}
                        >
                            <MaterialCommunityIcons name="cog-outline" size={24} color={colors.textSecondary} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Category Tabs */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingRight: 16 }}
                >
                    <CategoryTab
                        category="all"
                        label={t('notifications.filterAll')}
                        icon="bell-outline"
                        color="#6B7280"
                        isActive={selectedCategory === 'all'}
                        unreadCount={getUnreadCount('all')}
                        onPress={() => setSelectedCategory('all')}
                    />
                    {NOTIFICATION_CATEGORIES.map((cat) => (
                        <CategoryTab
                            key={cat.id}
                            category={cat.id}
                            label={cat.name}
                            icon={cat.icon}
                            color={cat.color}
                            isActive={selectedCategory === cat.id}
                            unreadCount={getUnreadCount(cat.id)}
                            onPress={() => setSelectedCategory(cat.id)}
                        />
                    ))}
                </ScrollView>
            </View>

            {/* Notification List */}
            <ScrollView
                ref={scrollRef}
                className="flex-1"
                contentContainerStyle={{ paddingTop: 12, paddingBottom: 32 }}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {filteredNotifications.length === 0 ? (
                    <EmptyState category={selectedCategory} />
                ) : (
                    <>
                        {groupedNotifications.pinned.length > 0 && (
                            <NotificationSection
                                title={`📌 ${t('common.pinned')}`}
                                notifications={groupedNotifications.pinned}
                                onNotificationPress={handleNotificationPress}
                            />
                        )}
                        <NotificationSection
                            title={t('common.today')}
                            notifications={groupedNotifications.today}
                            onNotificationPress={handleNotificationPress}
                        />
                        <NotificationSection
                            title={t('common.yesterday')}
                            notifications={groupedNotifications.yesterday}
                            onNotificationPress={handleNotificationPress}
                        />
                        <NotificationSection
                            title={t('common.thisWeek')}
                            notifications={groupedNotifications.thisWeek}
                            onNotificationPress={handleNotificationPress}
                        />
                        <NotificationSection
                            title={t('common.earlier')}
                            notifications={groupedNotifications.older}
                            onNotificationPress={handleNotificationPress}
                        />
                    </>
                )}
            </ScrollView>
        </View>
    );
}

export default NotificationCenter;
