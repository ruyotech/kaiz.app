/**
 * SprintHealthCard Component
 * 
 * Displays current sprint health with progress indicators
 * and status information.
 */

import React from 'react';
import { View, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SprintHealth } from '../../types/sensai.types';
import { useTranslation } from '../../hooks';
import { useThemeContext } from '../../providers/ThemeProvider';

interface SprintHealthCardProps {
    health: SprintHealth;
    compact?: boolean;
}

export function SprintHealthCard({ health, compact = false }: SprintHealthCardProps) {
    const { t } = useTranslation();
    const { colors } = useThemeContext();
    
    const STATUS_STYLES = {
        on_track: {
            bg: 'bg-green-50',
            border: 'border-green-200',
            progressBg: 'bg-green-500',
            icon: 'check-circle',
            iconColor: '#10B981',
            label: t('sensai.sprintHealth.onTrack'),
            labelColor: 'text-green-700',
        },
        ahead: {
            bg: 'bg-blue-50',
            border: 'border-blue-200',
            progressBg: 'bg-blue-500',
            icon: 'rocket-launch',
            iconColor: '#3B82F6',
            label: t('sensai.sprintHealth.ahead'),
            labelColor: 'text-blue-700',
        },
        at_risk: {
            bg: 'bg-amber-50',
            border: 'border-amber-200',
            progressBg: 'bg-amber-500',
            icon: 'alert',
            iconColor: '#F59E0B',
            label: t('sensai.sprintHealth.atRisk'),
            labelColor: 'text-amber-700',
        },
        behind: {
            bg: 'bg-red-50',
            border: 'border-red-200',
            progressBg: 'bg-red-500',
            icon: 'alert-octagon',
            iconColor: '#EF4444',
            label: t('sensai.sprintHealth.behind'),
            labelColor: 'text-red-700',
        },
    };
    
    const style = STATUS_STYLES[health.healthStatus];

    if (compact) {
        return (
            <View 
                className="rounded-xl p-3 flex-row items-center"
                style={{ 
                    backgroundColor: `${style.iconColor}10`,
                    borderWidth: 1,
                    borderColor: `${style.iconColor}30`
                }}
            >
                <MaterialCommunityIcons 
                    name={style.icon as any} 
                    size={20} 
                    color={style.iconColor} 
                />
                <Text className="ml-2 font-semibold" style={{ color: style.iconColor }}>
                    {style.label}
                </Text>
                <View className="flex-1 mx-3">
                    <View className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: colors.backgroundSecondary }}>
                        <View 
                            className="h-full rounded-full"
                            style={{ width: `${Math.min(health.completionPercentage, 100)}%`, backgroundColor: style.iconColor }}
                        />
                    </View>
                </View>
                <Text className="text-sm font-bold" style={{ color: colors.text }}>
                    {health.completionPercentage}%
                </Text>
            </View>
        );
    }

    return (
        <View 
            className="rounded-2xl p-4"
            style={{ 
                backgroundColor: `${style.iconColor}10`,
                borderWidth: 1,
                borderColor: `${style.iconColor}30`
            }}
        >
            {/* Header */}
            <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row items-center">
                    <View className="w-10 h-10 rounded-full items-center justify-center" 
                          style={{ backgroundColor: `${style.iconColor}20` }}>
                        <MaterialCommunityIcons 
                            name={style.icon as any} 
                            size={22} 
                            color={style.iconColor} 
                        />
                    </View>
                    <View className="ml-3">
                        <Text className="text-lg font-bold" style={{ color: colors.text }}>{t('sensai.sprintHealth.title')}</Text>
                        <Text className="text-sm font-medium" style={{ color: style.iconColor }}>{style.label}</Text>
                    </View>
                </View>
                <View className="items-end">
                    <Text className="text-2xl font-bold" style={{ color: colors.text }}>{health.completionPercentage}%</Text>
                    <Text className="text-xs" style={{ color: colors.textSecondary }}>{t('common.complete')}</Text>
                </View>
            </View>

            {/* Progress Bar */}
            <View className="mb-4">
                <View className="h-3 rounded-full overflow-hidden" style={{ backgroundColor: colors.backgroundSecondary }}>
                    <View 
                        className="h-full rounded-full"
                        style={{ width: `${Math.min(health.completionPercentage, 100)}%`, backgroundColor: style.iconColor }}
                    />
                </View>
                {/* Expected Progress Marker */}
                <View 
                    className="absolute h-3 w-0.5"
                    style={{ left: `${health.expectedPercentage}%`, top: 0, backgroundColor: colors.textTertiary }}
                />
            </View>

            {/* Stats Grid */}
            <View className="flex-row">
                <View className="flex-1 items-center" style={{ borderRightWidth: 1, borderRightColor: colors.border }}>
                    <Text className="text-xs" style={{ color: colors.textSecondary }}>{t('common.day')}</Text>
                    <Text className="text-lg font-bold" style={{ color: colors.text }}>
                        {health.dayOfSprint}/{health.totalDays}
                    </Text>
                </View>
                <View className="flex-1 items-center" style={{ borderRightWidth: 1, borderRightColor: colors.border }}>
                    <Text className="text-xs" style={{ color: colors.textSecondary }}>{t('common.completed')}</Text>
                    <Text className="text-lg font-bold" style={{ color: colors.text }}>
                        {health.completedPoints} {t('common.pts')}
                    </Text>
                </View>
                <View className="flex-1 items-center">
                    <Text className="text-xs" style={{ color: colors.textSecondary }}>{t('common.remaining')}</Text>
                    <Text className="text-lg font-bold" style={{ color: colors.text }}>
                        {health.remainingPoints} {t('common.pts')}
                    </Text>
                </View>
            </View>

            {/* Trend Indicator */}
            {health.burndownTrend !== 'healthy' && (
                <View 
                    className="mt-3 p-2 rounded-lg"
                    style={{ backgroundColor: health.burndownTrend === 'concerning' ? '#FEF3C7' : '#FEE2E2' }}
                >
                    <View className="flex-row items-center">
                        <MaterialCommunityIcons 
                            name="trending-down" 
                            size={16} 
                            color={health.burndownTrend === 'concerning' ? '#F59E0B' : '#EF4444'} 
                        />
                        <Text 
                            className="ml-2 text-xs"
                            style={{ color: health.burndownTrend === 'concerning' ? '#92400E' : '#991B1B' }}
                        >
                            {health.burndownTrend === 'concerning' 
                                ? t('sensai.sprintHealth.burndownConcerning')
                                : t('sensai.sprintHealth.burndownCritical')}
                        </Text>
                    </View>
                </View>
            )}
        </View>
    );
}

export default SprintHealthCard;
