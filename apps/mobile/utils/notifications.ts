/**
 * Notification Utilities
 *
 * Handles local notification scheduling for sprint ceremonies,
 * push notification permissions, and token registration.
 * Uses expo-notifications for all notification functionality.
 */

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { logger } from './logger';

const TAG = 'Notifications';

// Configure default notification handler
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

// ---------- Permission & Token ----------

/**
 * Request notification permissions and return the Expo push token.
 * Returns null if permissions denied or running on simulator.
 */
export async function registerForPushNotifications(): Promise<string | null> {
    if (!Device.isDevice) {
        logger.warn(TAG, 'Push notifications require a physical device');
        return null;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    if (finalStatus !== 'granted') {
        logger.warn(TAG, 'Notification permission denied');
        return null;
    }

    // Android notification channel
    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('sprint-ceremonies', {
            name: 'Sprint Ceremonies',
            importance: Notifications.AndroidImportance.HIGH,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#3B82F6',
            sound: 'default',
        });

        await Notifications.setNotificationChannelAsync('daily-standup', {
            name: 'Daily Standup',
            importance: Notifications.AndroidImportance.DEFAULT,
            sound: 'default',
        });
    }

    try {
        const tokenData = await Notifications.getExpoPushTokenAsync();
        logger.info(TAG, `Push token obtained: ${tokenData.data.substring(0, 20)}...`);
        return tokenData.data;
    } catch (error: unknown) {
        // Use warn instead of error — push token failure is expected in dev builds
        // without APS entitlement. logger.error calls console.error which shows
        // a red screen in React Native dev mode.
        logger.warn(TAG, 'Failed to get push token (expected in dev builds)', error);
        return null;
    }
}

// ---------- Sunday Planning Ceremony ----------

/**
 * Identifier for the weekly planning notification — used to cancel/reschedule.
 */
const PLANNING_NOTIFICATION_ID = 'weekly-sprint-planning';

/**
 * Schedule a recurring weekly notification for Sprint Planning on Sundays.
 * Cancels any existing planning notification before scheduling.
 *
 * @param hour - Hour in 24h format (e.g. 10 for 10:00 AM)
 * @param minute - Minute (e.g. 0 for :00)
 */
export async function schedulePlanningNotification(
    hour: number = 10,
    minute: number = 0,
): Promise<void> {
    // Cancel existing planning notification
    await cancelPlanningNotification();

    try {
        await Notifications.scheduleNotificationAsync({
            identifier: PLANNING_NOTIFICATION_ID,
            content: {
                title: '🌟 Sprint Planning Ceremony',
                body: "It's Sunday — time to plan your week! Select tasks, balance your life wheel, and commit your sprint.",
                data: { screen: '/(tabs)/sprints/planning', type: 'planning-ceremony' },
                sound: 'default',
                ...(Platform.OS === 'android' && { channelId: 'sprint-ceremonies' }),
            },
            trigger: {
                type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
                weekday: 1, // Sunday = 1 in expo-notifications
                hour,
                minute,
            },
        });
        logger.info(TAG, `Planning notification scheduled: Sundays at ${hour}:${String(minute).padStart(2, '0')}`);
    } catch (error: unknown) {
        logger.error(TAG, 'Failed to schedule planning notification', error);
    }
}

/**
 * Cancel the weekly planning notification.
 */
export async function cancelPlanningNotification(): Promise<void> {
    try {
        await Notifications.cancelScheduledNotificationAsync(PLANNING_NOTIFICATION_ID);
    } catch {
        // Notification may not exist — that's fine
    }
}

// ---------- Mid-Week Nudge ----------

const MIDWEEK_NUDGE_ID = 'midweek-sprint-nudge';

/**
 * Schedule a one-time mid-week nudge if the sprint hasn't been committed.
 * Should be called on Monday/Tuesday and cancelled once sprint is committed.
 *
 * @param targetDate - The Wednesday to send the nudge (Date object)
 * @param hour - Hour to send (default 10:00)
 */
export async function scheduleMidWeekNudge(
    targetDate: Date,
    hour: number = 10,
): Promise<void> {
    await cancelMidWeekNudge();

    const triggerDate = new Date(targetDate);
    triggerDate.setHours(hour, 0, 0, 0);

    // Only schedule if the target date is in the future
    if (triggerDate.getTime() <= Date.now()) {
        return;
    }

    try {
        await Notifications.scheduleNotificationAsync({
            identifier: MIDWEEK_NUDGE_ID,
            content: {
                title: '⚠️ Sprint Not Planned',
                body: "It's mid-week and your sprint isn't committed yet. Plan now to stay on track!",
                data: { screen: '/(tabs)/sprints/planning', type: 'midweek-nudge' },
                sound: 'default',
                ...(Platform.OS === 'android' && { channelId: 'sprint-ceremonies' }),
            },
            trigger: {
                type: Notifications.SchedulableTriggerInputTypes.DATE,
                date: triggerDate,
            },
        });
        logger.info(TAG, `Mid-week nudge scheduled for ${triggerDate.toISOString()}`);
    } catch (error: unknown) {
        logger.error(TAG, 'Failed to schedule mid-week nudge', error);
    }
}

/**
 * Cancel the mid-week nudge (e.g., after sprint is committed).
 */
export async function cancelMidWeekNudge(): Promise<void> {
    try {
        await Notifications.cancelScheduledNotificationAsync(MIDWEEK_NUDGE_ID);
    } catch {
        // Notification may not exist
    }
}

// ---------- Daily Standup ----------

const STANDUP_NOTIFICATION_ID = 'daily-standup';

/**
 * Schedule daily standup notification (Mon-Fri, or Mon-Sun if weekends enabled).
 *
 * @param hour - Hour in 24h format
 * @param minute - Minute
 * @param includeWeekends - Whether to include Sat/Sun
 */
export async function scheduleStandupNotifications(
    hour: number = 9,
    minute: number = 0,
    includeWeekends: boolean = false,
): Promise<void> {
    // Cancel all existing standup notifications
    await cancelStandupNotifications();

    const daysToSchedule = includeWeekends
        ? [1, 2, 3, 4, 5, 6, 7] // Sun=1, Mon=2, ..., Sat=7
        : [2, 3, 4, 5, 6]; // Mon-Fri

    const dayNames = ['', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (const weekday of daysToSchedule) {
        try {
            await Notifications.scheduleNotificationAsync({
                identifier: `${STANDUP_NOTIFICATION_ID}-${weekday}`,
                content: {
                    title: '☀️ Daily Standup',
                    body: "Good morning! What's on your plate today? Check your sprint tasks.",
                    data: { screen: '/(tabs)/sprints/calendar', type: 'daily-standup' },
                    sound: 'default',
                    ...(Platform.OS === 'android' && { channelId: 'daily-standup' }),
                },
                trigger: {
                    type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
                    weekday,
                    hour,
                    minute,
                },
            });
        } catch (error: unknown) {
            logger.error(TAG, `Failed to schedule standup for ${dayNames[weekday]}`, error);
        }
    }

    logger.info(TAG, `Standup notifications scheduled: ${includeWeekends ? 'Mon-Sun' : 'Mon-Fri'} at ${hour}:${String(minute).padStart(2, '0')}`);
}

/**
 * Cancel all daily standup notifications.
 */
export async function cancelStandupNotifications(): Promise<void> {
    for (let weekday = 1; weekday <= 7; weekday++) {
        try {
            await Notifications.cancelScheduledNotificationAsync(`${STANDUP_NOTIFICATION_ID}-${weekday}`);
        } catch {
            // Notification may not exist
        }
    }
}

// ---------- Helpers ----------

/**
 * Parse a time string like "10:00" into { hour, minute }.
 */
export function parseTimeString(time: string): { hour: number; minute: number } {
    const [hourStr, minuteStr] = time.split(':');
    return {
        hour: parseInt(hourStr, 10) || 10,
        minute: parseInt(minuteStr, 10) || 0,
    };
}

/**
 * Cancel all scheduled notifications (full reset).
 */
export async function cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
    logger.info(TAG, 'All scheduled notifications cancelled');
}

/**
 * Get all currently scheduled notifications (for debugging).
 */
export async function getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    return Notifications.getAllScheduledNotificationsAsync();
}

/**
 * Add a listener for notification responses (user tapped a notification).
 * Returns the subscription to clean up in useEffect.
 */
export function addNotificationResponseListener(
    handler: (response: Notifications.NotificationResponse) => void,
): Notifications.Subscription {
    return Notifications.addNotificationResponseReceivedListener(handler);
}
