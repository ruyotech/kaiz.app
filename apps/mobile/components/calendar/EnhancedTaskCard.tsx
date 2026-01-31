import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Task } from '../../types/models';
import { useTranslation } from '../../hooks/useTranslation';

// Helper to check if a string is an emoji (not a MaterialCommunityIcons name)
const isEmoji = (str: string): boolean => {
    if (!str) return false;
    // MaterialCommunityIcons names are typically lowercase with dashes (e.g., "heart-pulse")
    // Emojis are unicode characters that don't match this pattern
    const emojiRegex = /^[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F000}-\u{1F02F}\u{1F0A0}-\u{1F0FF}\u{1F100}-\u{1F64F}\u{1F680}-\u{1F6FF}]/u;
    return emojiRegex.test(str) || (str.length <= 2 && !/^[a-z-]+$/.test(str));
};

// Render icon as emoji text or MaterialCommunityIcons
const renderIcon = (icon: string, size: number, color: string) => {
    if (isEmoji(icon)) {
        return <Text style={{ fontSize: size, lineHeight: size + 2 }}>{icon}</Text>;
    }
    return <MaterialCommunityIcons name={icon as any} size={size} color={color} />;
};

interface EnhancedTaskCardProps {
    task: Task;
    epic?: any;
    lifeWheelArea?: { id: string; name: string; icon: string; color: string };
    onPress: () => void;
    viewType?: 'week' | 'day';
    commentsCount?: number;
}

// Status configuration for visual display
const STATUS_CONFIG: Record<string, { bg: string; text: string; icon: string; label: string }> = {
    'draft': { bg: 'bg-slate-100', text: 'text-slate-600', icon: 'file-document-edit-outline', label: 'Draft' },
    'todo': { bg: 'bg-gray-100', text: 'text-gray-700', icon: 'checkbox-blank-circle-outline', label: 'To Do' },
    'in_progress': { bg: 'bg-blue-100', text: 'text-blue-700', icon: 'progress-clock', label: 'In Progress' },
    'done': { bg: 'bg-green-100', text: 'text-green-700', icon: 'check-circle', label: 'Done' },
    'blocked': { bg: 'bg-red-100', text: 'text-red-700', icon: 'alert-circle', label: 'Blocked' },
};

// Get recurrence label based on frequency - in week view show combined label
const getRecurrenceLabel = (task: Task, viewType: 'week' | 'day'): { label: string; emoji: string } | null => {
    if (!task.isRecurring || !task.recurrence) return null;

    const freq = task.recurrence.frequency;

    // In week view, show a combined label for recurring tasks
    if (viewType === 'week') {
        switch (freq) {
            case 'DAILY':
                // Daily could mean weekdays (Mon-Fri) - show as "Weekdaily"
                return { label: 'Weekdaily', emoji: '💼' };
            case 'WEEKLY':
                return { label: 'Weekly', emoji: '🔄' };
            case 'BIWEEKLY':
                return { label: 'Bi-weekly', emoji: '📆' };
            case 'MONTHLY':
                return { label: 'Monthly', emoji: '🗓️' };
            case 'YEARLY':
                return { label: 'Yearly', emoji: '🎂' };
            default:
                return { label: 'Recurring', emoji: '🔁' };
        }
    }

    // In day view, just show a simple indicator
    switch (freq) {
        case 'DAILY':
            return { label: 'Daily', emoji: '📅' };
        case 'WEEKLY':
            return { label: 'Weekly', emoji: '🔄' };
        default:
            return null;
    }
};

export function EnhancedTaskCard({
    task,
    epic,
    lifeWheelArea,
    onPress,
    viewType = 'week',
    commentsCount = 0,
}: EnhancedTaskCardProps) {
    const { t } = useTranslation();
    const statusConfig = STATUS_CONFIG[task.status] || STATUS_CONFIG.todo;
    const recurrenceInfo = getRecurrenceLabel(task, viewType);

    // Time range display
    const hasTimeRange = task.recurrence?.scheduledTime && task.recurrence?.scheduledEndTime;
    const timeRangeLabel = hasTimeRange
        ? `${task.recurrence!.scheduledTime!.substring(0, 5)} - ${task.recurrence!.scheduledEndTime!.substring(0, 5)}`
        : task.recurrence?.scheduledTime
            ? `${task.recurrence.scheduledTime.substring(0, 5)}`
            : null;

    // Default life wheel area if not provided
    const wheelArea = lifeWheelArea || {
        id: 'unknown',
        name: 'General',
        icon: 'help-circle',
        color: '#6B7280'
    };

    return (
        <TouchableOpacity
            onPress={onPress}
            className="bg-white rounded-xl mb-3 border border-gray-200 overflow-hidden"
            style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 4,
                elevation: 3,
            }}
        >
            {/* Colored top bar based on wheel of life */}
            <View 
                className="h-1.5"
                style={{ backgroundColor: wheelArea.color }}
            />

            <View className="p-4">
                {/* Header Row: Title + Recurrence Badge */}
                <View className="flex-row items-start justify-between mb-2">
                    <View className="flex-1 mr-2">
                        <Text className="font-bold text-base text-gray-900" numberOfLines={2}>
                            {task.title}
                        </Text>
                    </View>
                    {recurrenceInfo && (
                        <View className="bg-purple-100 px-2.5 py-1 rounded-full flex-row items-center">
                            <Text className="text-sm mr-1">{recurrenceInfo.emoji}</Text>
                            <Text className="text-xs font-bold text-purple-700">
                                {recurrenceInfo.label}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Time Range */}
                {timeRangeLabel && (
                    <View className="flex-row items-center mb-2">
                        <MaterialCommunityIcons name="clock-outline" size={14} color="#9333EA" />
                        <Text className="text-sm text-purple-600 ml-1.5 font-medium">
                            {timeRangeLabel}
                        </Text>
                    </View>
                )}

                {/* Description preview */}
                {task.description && (
                    <Text className="text-sm text-gray-500 mb-3" numberOfLines={2}>
                        {task.description}
                    </Text>
                )}

                {/* Main Info Row: Wheel of Life + Status */}
                <View className="flex-row items-center flex-wrap gap-2 mb-3">
                    {/* Wheel of Life Badge */}
                    <View 
                        className="flex-row items-center px-2.5 py-1.5 rounded-lg"
                        style={{ backgroundColor: wheelArea.color + '15' }}
                    >
                        {renderIcon(wheelArea.icon, 14, wheelArea.color)}
                        <Text 
                            className="text-xs font-semibold ml-1.5" 
                            style={{ color: wheelArea.color }}
                        >
                            {wheelArea.name}
                        </Text>
                    </View>

                    {/* Status Badge with Icon */}
                    <View className={`flex-row items-center px-2.5 py-1.5 rounded-lg ${statusConfig.bg}`}>
                        <MaterialCommunityIcons 
                            name={statusConfig.icon as any} 
                            size={14} 
                            color={statusConfig.text.includes('blue') ? '#2563EB' : 
                                   statusConfig.text.includes('green') ? '#16A34A' :
                                   statusConfig.text.includes('red') ? '#DC2626' :
                                   statusConfig.text.includes('slate') ? '#475569' : '#6B7280'} 
                        />
                        <Text className={`text-xs font-semibold ml-1 ${statusConfig.text}`}>
                            {statusConfig.label}
                        </Text>
                    </View>
                </View>

                {/* Footer Row: Story Points + Comments + Epic */}
                <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-3">
                        {/* Story Points */}
                        <View className="flex-row items-center bg-gray-100 px-2.5 py-1 rounded-lg">
                            <MaterialCommunityIcons name="star-four-points" size={12} color="#6B7280" />
                            <Text className="text-xs font-bold text-gray-700 ml-1">
                                {task.storyPoints || 0} {t('tasks.pts')}
                            </Text>
                        </View>

                        {/* Comments Count */}
                        {commentsCount > 0 && (
                            <View className="flex-row items-center">
                                <MaterialCommunityIcons name="comment-outline" size={14} color="#6B7280" />
                                <Text className="text-xs text-gray-500 ml-1">
                                    {commentsCount}
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* Epic Badge */}
                    {epic && (
                        <View 
                            className="px-3 py-1.5 rounded-full flex-row items-center"
                            style={{ backgroundColor: epic.color + '20' }}
                        >
                            <MaterialCommunityIcons 
                                name={epic.icon as any} 
                                size={14} 
                                color={epic.color} 
                            />
                            <Text 
                                className="text-xs font-bold ml-1" 
                                style={{ color: epic.color }}
                                numberOfLines={1}
                            >
                                {epic.title}
                            </Text>
                        </View>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
}

// Compact version for day schedule view
export function CompactTaskCard({
    task,
    epic,
    lifeWheelArea,
    onPress,
}: Omit<EnhancedTaskCardProps, 'viewType' | 'commentsCount'>) {
    const statusConfig = STATUS_CONFIG[task.status] || STATUS_CONFIG.todo;
    const wheelArea = lifeWheelArea || { name: 'General', icon: 'help-circle', color: '#6B7280' };

    return (
        <TouchableOpacity
            onPress={onPress}
            className="bg-white rounded-lg p-3 mb-2 border border-gray-200"
            style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
                elevation: 1,
            }}
        >
            <View className="flex-row items-center">
                {/* Wheel of Life indicator dot */}
                <View 
                    className="w-2 h-2 rounded-full mr-2"
                    style={{ backgroundColor: wheelArea.color }}
                />

                {/* Title */}
                <Text className="font-medium text-gray-900 flex-1" numberOfLines={1}>
                    {task.title}
                </Text>

                {/* Status indicator */}
                <View className={`px-2 py-0.5 rounded ${statusConfig.bg}`}>
                    <Text className={`text-[10px] font-semibold ${statusConfig.text}`}>
                        {statusConfig.label}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );
}
