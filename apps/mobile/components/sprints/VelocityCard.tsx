/**
 * VelocityCard Component
 * 
 * Displays user's velocity metrics with trend indicators.
 */

import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { VelocityMetrics } from '../../types/sensai.types';
import { useTranslation } from '../../hooks';
import { useThemeContext } from '../../providers/ThemeProvider';

interface VelocityCardProps {
    metrics: VelocityMetrics;
    showChart?: boolean;
}

export function VelocityCard({ metrics, showChart = true }: VelocityCardProps) {
    const { t } = useTranslation();
    const { colors, isDark } = useThemeContext();
    
    const TREND_CONFIG = {
        up: {
            icon: 'trending-up',
            color: '#10B981',
            label: t('sensai.velocity.improving'),
        },
        down: {
            icon: 'trending-down',
            color: '#EF4444',
            label: t('sensai.velocity.declining'),
        },
        stable: {
            icon: 'minus',
            color: '#6B7280',
            label: t('sensai.velocity.stable'),
        },
    };
    
    const trend = TREND_CONFIG[metrics.velocityTrend] || TREND_CONFIG.stable;
    const screenWidth = Dimensions.get('window').width;
    const chartWidth = screenWidth - 64; // Account for padding

    // Safely get velocity history with fallback to empty array
    const velocityHistory = metrics.velocityHistory || [];

    // Calculate chart data
    const maxVelocity = velocityHistory.length > 0 
        ? Math.max(...velocityHistory.map(v => v.completedPoints), metrics.currentVelocity)
        : metrics.currentVelocity || 1;
    const chartHeight = 80;

    return (
        <View 
            className="rounded-2xl p-4 shadow-sm"
            style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }}
        >
            {/* Header */}
            <View className="flex-row items-center justify-between mb-4">
                <View>
                    <Text className="text-sm" style={{ color: colors.textSecondary }}>{t('sensai.velocity.yourVelocity')}</Text>
                    <View className="flex-row items-baseline">
                        <Text className="text-3xl font-bold" style={{ color: colors.text }}>
                            {metrics.currentVelocity}
                        </Text>
                        <Text className="text-sm ml-1" style={{ color: colors.textSecondary }}>{t('sensai.velocity.ptsPerSprint')}</Text>
                    </View>
                </View>
                
                <View className="items-end">
                    <View 
                        className="flex-row items-center px-3 py-1 rounded-full"
                        style={{ backgroundColor: `${trend.color}15` }}
                    >
                        <MaterialCommunityIcons 
                            name={trend.icon as any} 
                            size={16} 
                            color={trend.color} 
                        />
                        <Text className="ml-1 text-sm font-medium" style={{ color: trend.color }}>
                            {trend.label}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Stats Row */}
            <View className="flex-row mb-4">
                <View 
                    className="flex-1 rounded-xl p-3 mr-2"
                    style={{ backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : '#EFF6FF' }}
                >
                    <Text className="text-xs" style={{ color: isDark ? '#60A5FA' : '#2563EB' }}>{t('sensai.velocity.average')}</Text>
                    <Text className="text-lg font-bold" style={{ color: isDark ? '#93C5FD' : '#1E40AF' }}>{metrics.averageVelocity} {t('common.pts')}</Text>
                </View>
                <View 
                    className="flex-1 rounded-xl p-3 ml-2"
                    style={{ backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : '#ECFDF5' }}
                >
                    <Text className="text-xs" style={{ color: isDark ? '#34D399' : '#059669' }}>{t('sensai.velocity.personalBest')}</Text>
                    <Text className="text-lg font-bold" style={{ color: isDark ? '#6EE7B7' : '#065F46' }}>{metrics.personalBest} {t('common.pts')}</Text>
                </View>
            </View>

            {/* Mini Chart */}
            {showChart && velocityHistory.length > 0 && (
                <View className="mt-2">
                    <Text className="text-xs mb-2" style={{ color: colors.textSecondary }}>{t('sensai.velocity.lastSprints', { count: velocityHistory.length })}</Text>
                    <View className="flex-row items-end justify-between" style={{ height: chartHeight }}>
                        {velocityHistory.slice(-8).map((sprint, index) => {
                            const height = (sprint.completedPoints / maxVelocity) * chartHeight;
                            const isLatest = index === velocityHistory.slice(-8).length - 1;
                            
                            return (
                                <View key={sprint.sprintId} className="items-center flex-1 mx-0.5">
                                    <View 
                                        className="w-full rounded-t-md"
                                        style={{ 
                                            height: Math.max(height, 4),
                                            backgroundColor: isLatest ? colors.primary : (isDark ? '#4B5563' : '#D1D5DB')
                                        }}
                                    />
                                    <Text className="text-[10px] mt-1" style={{ color: colors.textTertiary }}>
                                        {t('sensai.velocity.weekPrefix')}{sprint.weekNumber}
                                    </Text>
                                </View>
                            );
                        })}
                    </View>
                </View>
            )}

            {/* Capacity Indicator */}
            <View className="mt-4 pt-4" style={{ borderTopWidth: 1, borderTopColor: colors.border }}>
                <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                        <MaterialCommunityIcons name="gauge" size={18} color={colors.textSecondary} />
                        <Text className="text-sm ml-2" style={{ color: colors.textSecondary }}>{t('sensai.velocity.projectedCapacity')}</Text>
                    </View>
                    <Text className="text-sm font-semibold" style={{ color: colors.text }}>
                        {metrics.projectedCapacity} {t('common.pts')}
                    </Text>
                </View>
                {metrics.projectedCapacity < metrics.currentVelocity && (
                    <Text className="text-xs mt-1" style={{ color: colors.warning }}>
                        {t('sensai.velocity.reducedCapacity')}
                    </Text>
                )}
            </View>
        </View>
    );
}

export default VelocityCard;
