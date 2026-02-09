import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Task } from '../../types/models';
import { useThemeContext } from '../../providers/ThemeProvider';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const isEmoji = (str: string): boolean => {
    if (!str) return false;
    const emojiRegex = /^[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F000}-\u{1F02F}\u{1F0A0}-\u{1F0FF}\u{1F100}-\u{1F64F}\u{1F680}-\u{1F6FF}]/u;
    return emojiRegex.test(str) || (str.length <= 2 && !/^[a-z-]+$/.test(str));
};

const renderIcon = (icon: string, size: number, color: string) => {
    if (isEmoji(icon)) {
        return <Text style={{ fontSize: size, lineHeight: size + 2 }}>{icon}</Text>;
    }
    return <MaterialCommunityIcons name={icon as any} size={size} color={color} />;
};

// ─── Eisenhower Priority Config ───────────────────────────────────────────────

export const EISENHOWER_CONFIG: Record<string, { label: string; shortLabel: string; color: string; icon: string }> = {
    'eq-1': { label: 'Urgent & Important', shortLabel: 'P1', color: '#DC2626', icon: 'fire' },
    'eq-2': { label: 'Not Urgent & Important', shortLabel: 'P2', color: '#2563EB', icon: 'target' },
    'eq-3': { label: 'Urgent & Not Important', shortLabel: 'P3', color: '#CA8A04', icon: 'clock-fast' },
    'eq-4': { label: 'Not Urgent & Not Important', shortLabel: 'P4', color: '#6B7280', icon: 'delete-outline' },
};

// ─── Status Config ────────────────────────────────────────────────────────────

export const STATUS_CONFIG: Record<string, { color: string; icon: string; label: string }> = {
    'draft': { color: '#9CA3AF', icon: 'file-document-edit-outline', label: 'Draft' },
    'todo': { color: '#6B7280', icon: 'checkbox-blank-circle-outline', label: 'To Do' },
    'in_progress': { color: '#2563EB', icon: 'progress-clock', label: 'In Progress' },
    'done': { color: '#16A34A', icon: 'check-circle', label: 'Done' },
    'blocked': { color: '#DC2626', icon: 'alert-circle', label: 'Blocked' },
    'pending_approval': { color: '#CA8A04', icon: 'clock-alert-outline', label: 'Pending' },
};

// ─── Recurrence Label ─────────────────────────────────────────────────────────

const getRecurrenceIcon = (task: Task): string | null => {
    if (!task.recurrence?.frequency) return null;
    switch (task.recurrence.frequency) {
        case 'DAILY': return '🔁';
        case 'WEEKLY': return '🔄';
        case 'BIWEEKLY': return '📆';
        case 'MONTHLY': return '🗓️';
        case 'YEARLY': return '🎂';
        default: return '🔁';
    }
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface EnhancedTaskCardProps {
    task: Task;
    epic?: { id: string; title: string; color: string; icon: string } | null;
    lifeWheelArea?: { id: string; name: string; icon: string; color: string } | null;
    onPress: () => void;
    /** When true, shows a subtle status dot instead of full badge (used inside status tabs) */
    hideStatusBadge?: boolean;
    viewType?: 'week' | 'day';
    commentsCount?: number;
}

// ─── Main Card ────────────────────────────────────────────────────────────────

export const EnhancedTaskCard = React.memo(function EnhancedTaskCard({
    task,
    epic,
    lifeWheelArea,
    onPress,
    hideStatusBadge = false,
    commentsCount = 0,
}: EnhancedTaskCardProps) {
    const { colors, isDark } = useThemeContext();

    const eisenhower = EISENHOWER_CONFIG[task.eisenhowerQuadrantId] ?? EISENHOWER_CONFIG['eq-4'];
    const statusCfg = STATUS_CONFIG[task.status] ?? STATUS_CONFIG.todo;
    const recurrenceIcon = getRecurrenceIcon(task);
    const wheelArea = lifeWheelArea ?? { id: 'unknown', name: 'General', icon: 'help-circle', color: '#6B7280' };

    // Time display (from recurrence or event fields)
    const timeLabel = (() => {
        if (task.eventStartTime) {
            const start = new Date(task.eventStartTime);
            const end = task.eventEndTime ? new Date(task.eventEndTime) : null;
            const fmt = (d: Date) => `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
            return end ? `${fmt(start)} – ${fmt(end)}` : fmt(start);
        }
        if (task.recurrence?.scheduledTime) {
            const s = task.recurrence.scheduledTime.substring(0, 5);
            const e = task.recurrence.scheduledEndTime?.substring(0, 5);
            return e ? `${s} – ${e}` : s;
        }
        return null;
    })();

    return (
        <TouchableOpacity
            onPress={onPress}
            className="rounded-xl mb-2.5 overflow-hidden"
            style={{
                backgroundColor: colors.card,
                borderWidth: 1,
                borderColor: colors.border,
                shadowColor: colors.shadow,
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.06,
                shadowRadius: 3,
                elevation: 2,
            }}
            activeOpacity={0.7}
        >
            {/* Colored accent bar (life wheel area) */}
            <View className="h-1" style={{ backgroundColor: wheelArea.color }} />

            <View className="p-3.5">
                {/* ── Row 1: Title + status dot + recurrence ── */}
                <View className="flex-row items-start mb-1.5">
                    {/* Status dot (always visible for quick scanning) */}
                    {!hideStatusBadge ? (
                        <View
                            className="w-2.5 h-2.5 rounded-full mt-1.5 mr-2"
                            style={{ backgroundColor: statusCfg.color }}
                        />
                    ) : (
                        <View
                            className="w-1.5 h-1.5 rounded-full mt-2 mr-2"
                            style={{ backgroundColor: statusCfg.color, opacity: 0.6 }}
                        />
                    )}

                    <Text
                        className="font-bold text-[15px] flex-1 leading-5"
                        style={{ color: colors.text }}
                        numberOfLines={2}
                    >
                        {task.title}
                    </Text>

                    {recurrenceIcon && (
                        <Text className="ml-2 text-sm">{recurrenceIcon}</Text>
                    )}
                </View>

                {/* ── Row 2: Time (if scheduled) ── */}
                {timeLabel && (
                    <View className="flex-row items-center mb-2 ml-4">
                        <MaterialCommunityIcons name="clock-outline" size={12} color={colors.primary} />
                        <Text className="text-xs font-medium ml-1" style={{ color: colors.primary }}>
                            {timeLabel}
                        </Text>
                    </View>
                )}

                {/* ── Row 3: Description (1 line) ── */}
                {task.description ? (
                    <Text
                        className="text-xs mb-2.5 ml-4"
                        style={{ color: colors.textSecondary }}
                        numberOfLines={1}
                    >
                        {task.description}
                    </Text>
                ) : null}

                {/* ── Row 4: Tag chips ── */}
                <View className="flex-row items-center flex-wrap gap-1.5 ml-4">
                    {/* Eisenhower priority chip */}
                    <View
                        className="flex-row items-center px-2 py-1 rounded-lg"
                        style={{ backgroundColor: eisenhower.color + (isDark ? '25' : '12') }}
                    >
                        <MaterialCommunityIcons
                            name={eisenhower.icon as any}
                            size={11}
                            color={eisenhower.color}
                        />
                        <Text
                            className="text-[10px] font-bold ml-1"
                            style={{ color: eisenhower.color }}
                        >
                            {eisenhower.shortLabel}
                        </Text>
                    </View>

                    {/* Life Wheel chip */}
                    <View
                        className="flex-row items-center px-2 py-1 rounded-lg"
                        style={{ backgroundColor: wheelArea.color + (isDark ? '25' : '12') }}
                    >
                        {renderIcon(wheelArea.icon, 11, wheelArea.color)}
                        <Text
                            className="text-[10px] font-semibold ml-1"
                            style={{ color: wheelArea.color }}
                            numberOfLines={1}
                        >
                            {wheelArea.name}
                        </Text>
                    </View>

                    {/* Story points chip */}
                    <View
                        className="flex-row items-center px-2 py-1 rounded-lg"
                        style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' }}
                    >
                        <MaterialCommunityIcons name="star-four-points" size={10} color={colors.textSecondary} />
                        <Text
                            className="text-[10px] font-bold ml-1"
                            style={{ color: colors.textSecondary }}
                        >
                            {task.storyPoints || 0} pts
                        </Text>
                    </View>

                    {/* Epic chip */}
                    {epic && (
                        <View
                            className="flex-row items-center px-2 py-1 rounded-lg"
                            style={{ backgroundColor: epic.color + '15' }}
                        >
                            <MaterialCommunityIcons name={epic.icon as any} size={10} color={epic.color} />
                            <Text
                                className="text-[10px] font-bold ml-1"
                                style={{ color: epic.color }}
                                numberOfLines={1}
                            >
                                {epic.title}
                            </Text>
                        </View>
                    )}

                    {/* User tags */}
                    {task.tags?.map((tag) => (
                        <View
                            key={tag.id}
                            className="flex-row items-center px-2 py-1 rounded-lg"
                            style={{ backgroundColor: tag.color + '15' }}
                        >
                            <MaterialCommunityIcons name="tag-outline" size={10} color={tag.color} />
                            <Text
                                className="text-[10px] font-semibold ml-1"
                                style={{ color: tag.color }}
                            >
                                {tag.name}
                            </Text>
                        </View>
                    ))}

                    {/* Comments count */}
                    {commentsCount > 0 && (
                        <View className="flex-row items-center px-2 py-1 rounded-lg"
                            style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' }}
                        >
                            <MaterialCommunityIcons name="comment-outline" size={10} color={colors.textTertiary} />
                            <Text className="text-[10px] font-medium ml-1" style={{ color: colors.textTertiary }}>
                                {commentsCount}
                            </Text>
                        </View>
                    )}

                    {/* Status badge (only in "All" tab view) */}
                    {!hideStatusBadge && (
                        <View
                            className="flex-row items-center px-2 py-1 rounded-lg"
                            style={{ backgroundColor: statusCfg.color + (isDark ? '25' : '12') }}
                        >
                            <MaterialCommunityIcons
                                name={statusCfg.icon as any}
                                size={10}
                                color={statusCfg.color}
                            />
                            <Text
                                className="text-[10px] font-semibold ml-1"
                                style={{ color: statusCfg.color }}
                            >
                                {statusCfg.label}
                            </Text>
                        </View>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
});

// ─── Compact Version (for day schedule positioned cards) ──────────────────────

export const CompactTaskCard = React.memo(function CompactTaskCard({
    task,
    lifeWheelArea,
    onPress,
}: {
    task: Task;
    epic?: { id: string; title: string; color: string; icon: string } | null;
    lifeWheelArea?: { id: string; name: string; icon: string; color: string } | null;
    onPress: () => void;
}) {
    const { colors } = useThemeContext();
    const statusCfg = STATUS_CONFIG[task.status] ?? STATUS_CONFIG.todo;
    const wheelArea = lifeWheelArea ?? { name: 'General', icon: 'help-circle', color: '#6B7280' };

    return (
        <TouchableOpacity
            onPress={onPress}
            className="rounded-lg p-2.5 mb-1.5"
            style={{
                backgroundColor: colors.card,
                borderWidth: 1,
                borderColor: colors.border,
                shadowColor: colors.shadow,
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.04,
                shadowRadius: 2,
                elevation: 1,
            }}
        >
            <View className="flex-row items-center">
                <View className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: wheelArea.color }} />
                <Text className="font-semibold text-sm flex-1" style={{ color: colors.text }} numberOfLines={1}>
                    {task.title}
                </Text>
                <View className="w-2 h-2 rounded-full ml-2" style={{ backgroundColor: statusCfg.color }} />
            </View>
        </TouchableOpacity>
    );
});
