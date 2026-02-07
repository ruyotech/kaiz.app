/**
 * Dashboard Screen
 *
 * Combines user overview (greeting, quick stats) with the notification feed.
 * Serves as the home hub — replaces the old "More" menu and the separate
 * notifications-only screen as the 3rd tab bar destination.
 */

import React, { useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { format } from 'date-fns';
import { useThemeContext } from '../../../providers/ThemeProvider';
import { useTranslation } from '../../../hooks/useTranslation';
import { useNotificationStore } from '../../../store/notificationStore';
import { NotificationCenter } from '../../../components/notifications/NotificationCenter';
import { AppIcon } from '../../../components/ui/AppIcon';
import { navIcons, moduleIcons, settingsIcons } from '../../../constants/icons';

export default function DashboardScreen() {
    const { colors } = useThemeContext();
    const { t } = useTranslation();
    const router = useRouter();
    const { unreadCount, fetchNotifications } = useNotificationStore();
    const [refreshing, setRefreshing] = React.useState(false);

    const greeting = useMemo(() => {
        const hour = new Date().getHours();
        if (hour < 12) return t('dashboard.greetingMorning');
        if (hour < 17) return t('dashboard.greetingAfternoon');
        return t('dashboard.greetingEvening');
    }, [t]);

    const todayDate = useMemo(() => format(new Date(), 'EEEE, MMMM d'), []);

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        try {
            await fetchNotifications();
        } finally {
            setRefreshing(false);
        }
    }, [fetchNotifications]);

    return (
        <SafeAreaView edges={['top']} className="flex-1" style={{ backgroundColor: colors.background }}>
            {/* Header */}
            <View
                className="flex-row justify-between items-center px-5 pb-3 pt-2"
                style={{ borderBottomWidth: 1, borderBottomColor: colors.border }}
            >
                <View className="flex-1">
                    <Text className="text-2xl font-bold" style={{ color: colors.text }}>
                        {greeting}
                    </Text>
                    <Text className="text-sm mt-0.5" style={{ color: colors.textSecondary }}>
                        {todayDate}
                    </Text>
                </View>

                <TouchableOpacity
                    onPress={() => router.push('/(tabs)/settings' as never)}
                    className="w-10 h-10 rounded-xl items-center justify-center"
                    style={{ backgroundColor: colors.backgroundSecondary }}
                >
                    <AppIcon icon={settingsIcons.cogOutline} size={22} color={colors.textSecondary} />
                </TouchableOpacity>
            </View>

            {/* Quick Stats Bar */}
            <View
                className="flex-row px-4 py-3"
                style={{ borderBottomWidth: 1, borderBottomColor: colors.border }}
            >
                <TouchableOpacity
                    onPress={() => router.push('/(tabs)/sprints/calendar' as never)}
                    className="flex-1 flex-row items-center justify-center py-2 rounded-xl mr-2"
                    style={{ backgroundColor: '#3B82F610' }}
                >
                    <AppIcon icon={moduleIcons.sprints} size={18} color="#3B82F6" />
                    <Text className="text-xs font-semibold ml-1.5" style={{ color: '#3B82F6' }}>
                        {t('navigation.tabs.sprints')}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => router.push('/(tabs)/challenges' as never)}
                    className="flex-1 flex-row items-center justify-center py-2 rounded-xl mr-2"
                    style={{ backgroundColor: '#F59E0B10' }}
                >
                    <AppIcon icon={moduleIcons.challenges} size={18} color="#F59E0B" />
                    <Text className="text-xs font-semibold ml-1.5" style={{ color: '#F59E0B' }}>
                        {t('navigation.tabs.challenges')}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => router.push('/(tabs)/sensai' as never)}
                    className="flex-1 flex-row items-center justify-center py-2 rounded-xl"
                    style={{ backgroundColor: '#10B98110' }}
                >
                    <AppIcon icon={moduleIcons.sensai} size={18} color="#10B981" />
                    <Text className="text-xs font-semibold ml-1.5" style={{ color: '#10B981' }}>
                        {t('navigation.tabs.sensai')}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Notification Section Header */}
            <View className="flex-row items-center justify-between px-5 pt-4 pb-2">
                <View className="flex-row items-center">
                    <AppIcon icon={navIcons.bellOutline} size={18} color={colors.textSecondary} />
                    <Text className="text-base font-semibold ml-2" style={{ color: colors.text }}>
                        {t('navigation.tabs.notifications')}
                    </Text>
                    {unreadCount > 0 && (
                        <View
                            className="ml-2 min-w-[20px] h-[20px] rounded-full items-center justify-center px-1.5"
                            style={{ backgroundColor: colors.error }}
                        >
                            <Text className="text-[11px] font-bold" style={{ color: '#FFFFFF' }}>
                                {unreadCount > 99 ? '99+' : unreadCount}
                            </Text>
                        </View>
                    )}
                </View>
            </View>

            {/* Notification Feed */}
            <View className="flex-1">
                <NotificationCenter />
            </View>
        </SafeAreaView>
    );
}
