import React, { useCallback } from 'react';
import { View, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useThemeContext } from '../../providers/ThemeProvider';
import type { TaskStatus } from '../../types/models';

const SWIPE_THRESHOLD = 80;

/**
 * Status transition map — defines the next status when swiping right (advance)
 * and the status when swiping left (block/revert).
 */
const NEXT_STATUS: Record<string, TaskStatus> = {
    'todo': 'in_progress',
    'in_progress': 'done',
    'blocked': 'todo',
    'draft': 'todo',
};

const PREV_STATUS: Record<string, TaskStatus> = {
    'in_progress': 'todo',
    'done': 'in_progress',
    'todo': 'blocked',
};

const STATUS_LABELS: Record<TaskStatus, string> = {
    'draft': 'Draft',
    'todo': 'To Do',
    'in_progress': 'In Progress',
    'done': 'Done',
    'blocked': 'Blocked',
    'pending_approval': 'Pending',
};

interface SwipeableTaskCardProps {
    taskId: string;
    currentStatus: TaskStatus;
    onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
    children: React.ReactNode;
}

export const SwipeableTaskCard = React.memo(function SwipeableTaskCard({
    taskId,
    currentStatus,
    onStatusChange,
    children,
}: SwipeableTaskCardProps) {
    const { colors, isDark } = useThemeContext();
    const translateX = useSharedValue(0);
    const isSwipeActive = useSharedValue(false);

    const nextStatus = NEXT_STATUS[currentStatus];
    const prevStatus = PREV_STATUS[currentStatus];

    const handleSwipeRight = useCallback(() => {
        if (nextStatus) {
            onStatusChange(taskId, nextStatus);
        }
    }, [taskId, nextStatus, onStatusChange]);

    const handleSwipeLeft = useCallback(() => {
        if (prevStatus) {
            onStatusChange(taskId, prevStatus);
        }
    }, [taskId, prevStatus, onStatusChange]);

    const panGesture = Gesture.Pan()
        .activeOffsetX([-15, 15])
        .failOffsetY([-10, 10])
        .onUpdate((event) => {
            // Clamp the swipe range
            const maxSwipe = 120;
            translateX.value = Math.max(-maxSwipe, Math.min(maxSwipe, event.translationX));
            isSwipeActive.value = Math.abs(event.translationX) > 20;
        })
        .onEnd((event) => {
            if (event.translationX > SWIPE_THRESHOLD && nextStatus) {
                translateX.value = withTiming(200, { duration: 200 }, () => {
                    runOnJS(handleSwipeRight)();
                    translateX.value = withSpring(0, { damping: 15, stiffness: 150 });
                });
            } else if (event.translationX < -SWIPE_THRESHOLD && prevStatus) {
                translateX.value = withTiming(-200, { duration: 200 }, () => {
                    runOnJS(handleSwipeLeft)();
                    translateX.value = withSpring(0, { damping: 15, stiffness: 150 });
                });
            } else {
                translateX.value = withSpring(0, { damping: 15, stiffness: 150 });
            }
            isSwipeActive.value = false;
        });

    const cardStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }],
    }));

    const rightActionStyle = useAnimatedStyle(() => ({
        opacity: translateX.value > 30 ? withTiming(1, { duration: 150 }) : withTiming(0, { duration: 100 }),
    }));

    const leftActionStyle = useAnimatedStyle(() => ({
        opacity: translateX.value < -30 ? withTiming(1, { duration: 150 }) : withTiming(0, { duration: 100 }),
    }));

    // Don't wrap if task can't be swiped either direction
    if (!nextStatus && !prevStatus) {
        return <>{children}</>;
    }

    return (
        <View className="relative mb-0.5">
            {/* Right swipe action (advance status) */}
            {nextStatus && (
                <Animated.View
                    className="absolute left-0 top-0 bottom-0 w-24 rounded-xl items-center justify-center"
                    style={[
                        {
                            backgroundColor: nextStatus === 'done' ? '#16A34A' :
                                nextStatus === 'in_progress' ? '#2563EB' : '#6B7280',
                        },
                        rightActionStyle,
                    ]}
                >
                    <MaterialCommunityIcons
                        name={nextStatus === 'done' ? 'check-circle' :
                            nextStatus === 'in_progress' ? 'progress-clock' : 'arrow-right'}
                        size={20}
                        color="#fff"
                    />
                    <Text className="text-white text-[10px] font-bold mt-0.5">
                        {STATUS_LABELS[nextStatus]}
                    </Text>
                </Animated.View>
            )}

            {/* Left swipe action (revert / block) */}
            {prevStatus && (
                <Animated.View
                    className="absolute right-0 top-0 bottom-0 w-24 rounded-xl items-center justify-center"
                    style={[
                        {
                            backgroundColor: prevStatus === 'blocked' ? '#DC2626' :
                                prevStatus === 'todo' ? '#6B7280' : '#CA8A04',
                        },
                        leftActionStyle,
                    ]}
                >
                    <MaterialCommunityIcons
                        name={prevStatus === 'blocked' ? 'alert-circle' :
                            prevStatus === 'todo' ? 'arrow-left' : 'arrow-left'}
                        size={20}
                        color="#fff"
                    />
                    <Text className="text-white text-[10px] font-bold mt-0.5">
                        {STATUS_LABELS[prevStatus]}
                    </Text>
                </Animated.View>
            )}

            {/* Swipeable card content */}
            <GestureDetector gesture={panGesture}>
                <Animated.View style={cardStyle}>
                    {children}
                </Animated.View>
            </GestureDetector>
        </View>
    );
});

export default SwipeableTaskCard;
