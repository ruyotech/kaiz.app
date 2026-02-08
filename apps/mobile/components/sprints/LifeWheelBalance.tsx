/**
 * LifeWheelBalance — visual donut/ring chart showing dimension distribution
 * of selected tasks during sprint planning.
 */

import React from 'react';
import { View, Text } from 'react-native';
import { useThemeContext } from '../../providers/ThemeProvider';

const DIMENSION_META: Record<string, { color: string; name: string }> = {
    'lw-1': { color: '#EF4444', name: 'Health' },
    'lw-2': { color: '#3B82F6', name: 'Career' },
    'lw-3': { color: '#EC4899', name: 'Family & Romance' },
    'lw-4': { color: '#F59E0B', name: 'Finance' },
    'lw-5': { color: '#8B5CF6', name: 'Growth' },
    'lw-6': { color: '#06B6D4', name: 'Friends' },
    'lw-7': { color: '#F97316', name: 'Fun & Recreation' },
    'lw-8': { color: '#14B8A6', name: 'Environment' },
};

interface DimensionData {
    areaId: string;
    points: number;
}

interface LifeWheelBalanceProps {
    distribution: DimensionData[];
    totalPoints: number;
    targetVelocity: number;
}

export const LifeWheelBalance = React.memo(function LifeWheelBalance({
    distribution,
    totalPoints,
    targetVelocity,
}: LifeWheelBalanceProps) {
    const { colors } = useThemeContext();

    const maxPoints = Math.max(...distribution.map(d => d.points), 1);
    const totalDimensions = distribution.filter(d => d.points > 0).length;

    return (
        <View className="rounded-2xl p-5" style={{ backgroundColor: colors.card }}>
            <View className="flex-row items-center mb-4">
                <Text className="text-base font-bold" style={{ color: colors.text }}>Life Balance</Text>
                <View className="ml-auto px-3 py-1 rounded-full" style={{ backgroundColor: totalDimensions >= 4 ? '#10B98120' : '#F59E0B20' }}>
                    <Text className="text-xs font-semibold" style={{ color: totalDimensions >= 4 ? '#10B981' : '#F59E0B' }}>
                        {totalDimensions}/8 areas
                    </Text>
                </View>
            </View>

            {/* Horizontal bar chart */}
            <View className="gap-2">
                {distribution.map((dim) => {
                    const meta = DIMENSION_META[dim.areaId] || { color: '#6B7280', name: dim.areaId };
                    const percentage = maxPoints > 0 ? (dim.points / maxPoints) * 100 : 0;
                    return (
                        <View key={dim.areaId} className="flex-row items-center">
                            <Text className="text-xs w-20" numberOfLines={1} style={{ color: colors.textSecondary }}>
                                {meta.name}
                            </Text>
                            <View className="flex-1 h-5 rounded-full mx-2 overflow-hidden" style={{ backgroundColor: colors.backgroundSecondary }}>
                                <View
                                    className="h-full rounded-full"
                                    style={{
                                        width: `${Math.max(percentage, dim.points > 0 ? 8 : 0)}%`,
                                        backgroundColor: meta.color,
                                        opacity: dim.points > 0 ? 1 : 0.2,
                                    }}
                                />
                            </View>
                            <Text className="text-xs font-semibold w-8 text-right" style={{ color: dim.points > 0 ? colors.text : colors.textTertiary }}>
                                {dim.points}
                            </Text>
                        </View>
                    );
                })}
            </View>

            {/* Balance tip */}
            {totalDimensions < 3 && totalPoints > 0 && (
                <View className="mt-3 p-3 rounded-xl" style={{ backgroundColor: '#F59E0B15' }}>
                    <Text className="text-xs" style={{ color: '#F59E0B' }}>
                        💡 Try adding tasks from more life areas for better balance
                    </Text>
                </View>
            )}
        </View>
    );
});

interface CapacityBarProps {
    selectedPoints: number;
    targetVelocity: number;
    /** If true, render as a compact floating bar */
    compact?: boolean;
}

export const CapacityBar = React.memo(function CapacityBar({
    selectedPoints,
    targetVelocity,
    compact = false,
}: CapacityBarProps) {
    const { colors } = useThemeContext();

    const percentage = targetVelocity > 0 ? Math.min((selectedPoints / targetVelocity) * 100, 120) : 0;
    const isOvercommitted = selectedPoints > targetVelocity;
    const isUndercommitted = selectedPoints < targetVelocity * 0.7;
    const barColor = isOvercommitted ? '#EF4444' : isUndercommitted ? '#F59E0B' : '#10B981';
    const statusLabel = isOvercommitted
        ? 'Overcommitted!'
        : isUndercommitted
            ? 'Room for more'
            : 'Good balance';

    if (compact) {
        return (
            <View className="px-5 py-3 flex-row items-center" style={{ backgroundColor: colors.card, borderTopWidth: 1, borderTopColor: colors.border }}>
                <View className="flex-1 h-3 rounded-full overflow-hidden mr-3" style={{ backgroundColor: colors.backgroundSecondary }}>
                    <View className="h-full rounded-full" style={{ width: `${Math.min(percentage, 100)}%`, backgroundColor: barColor }} />
                </View>
                <Text className="text-sm font-bold" style={{ color: barColor }}>
                    {selectedPoints}/{targetVelocity}
                </Text>
                <Text className="text-xs ml-2" style={{ color: colors.textSecondary }}>pts</Text>
            </View>
        );
    }

    return (
        <View className="rounded-2xl p-5" style={{ backgroundColor: colors.card }}>
            <View className="flex-row items-center justify-between mb-3">
                <Text className="text-base font-bold" style={{ color: colors.text }}>Sprint Capacity</Text>
                <View className="px-3 py-1 rounded-full" style={{ backgroundColor: barColor + '20' }}>
                    <Text className="text-xs font-semibold" style={{ color: barColor }}>{statusLabel}</Text>
                </View>
            </View>

            {/* Progress bar */}
            <View className="h-4 rounded-full overflow-hidden mb-2" style={{ backgroundColor: colors.backgroundSecondary }}>
                <View className="h-full rounded-full" style={{ width: `${Math.min(percentage, 100)}%`, backgroundColor: barColor }} />
                {/* Target line */}
                <View className="absolute right-0 top-0 bottom-0 w-0.5" style={{ backgroundColor: colors.text, left: '100%' }} />
            </View>

            <View className="flex-row justify-between">
                <Text className="text-xs" style={{ color: colors.textSecondary }}>
                    {selectedPoints} selected
                </Text>
                <Text className="text-xs font-semibold" style={{ color: colors.textSecondary }}>
                    Target: {targetVelocity} pts
                </Text>
            </View>

            {isOvercommitted && (
                <View className="mt-2 p-2 rounded-lg" style={{ backgroundColor: '#EF444415' }}>
                    <Text className="text-xs" style={{ color: '#EF4444' }}>
                        ⚠️ {selectedPoints - targetVelocity} points over capacity ({Math.round(percentage)}%)
                    </Text>
                </View>
            )}
        </View>
    );
});
