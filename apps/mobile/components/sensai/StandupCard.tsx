/**
 * StandupCard Component
 * 
 * Displays daily standup summary and quick access.
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DailyStandup, SprintHealth } from '../../types/sensai.types';
import { useTranslation } from '../../hooks';
import { useThemeContext } from '../../providers/ThemeProvider';

interface StandupCardProps {
    standup: DailyStandup | null;
    sprintHealth: SprintHealth | null;
    onStartStandup: () => void;
    onViewStandup?: () => void;
}

export function StandupCard({ standup, sprintHealth, onStartStandup, onViewStandup }: StandupCardProps) {
    const { t } = useTranslation();
    const { colors, isDark } = useThemeContext();
    const hasCompletedToday = standup?.status === 'completed';
    const wasSkipped = standup?.status === 'skipped';

    if (hasCompletedToday && standup) {
        return (
            <TouchableOpacity 
                onPress={onViewStandup}
                className="rounded-2xl p-4"
                style={{ 
                    backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : '#ECFDF5',
                    borderWidth: 1,
                    borderColor: isDark ? 'rgba(16, 185, 129, 0.3)' : '#A7F3D0'
                }}
                activeOpacity={0.7}
            >
                <View className="flex-row items-center mb-3">
                    <View className="w-10 h-10 bg-green-500 rounded-full items-center justify-center">
                        <MaterialCommunityIcons name="check" size={24} color="white" />
                    </View>
                    <View className="ml-3 flex-1">
                        <Text className="text-base font-bold" style={{ color: isDark ? '#6EE7B7' : '#065F46' }}>{t('sensai.standup.complete')}</Text>
                        <Text className="text-sm" style={{ color: isDark ? '#34D399' : '#047857' }}>
                            {new Date(standup.completedAt || '').toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                            })}
                        </Text>
                    </View>
                    <MaterialCommunityIcons name="chevron-right" size={24} color="#10B981" />
                </View>

                {/* Summary */}
                <View className="flex-row">
                    <View 
                        className="flex-1 rounded-lg p-2 mr-2"
                        style={{ backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.6)' }}
                    >
                        <Text className="text-xs" style={{ color: colors.textSecondary }}>{t('sensai.standup.yesterday')}</Text>
                        <Text className="text-sm font-semibold" style={{ color: colors.text }}>
                            {standup.completedYesterday.length} {t('tasks.title').toLowerCase()}
                        </Text>
                    </View>
                    <View 
                        className="flex-1 rounded-lg p-2 mr-2"
                        style={{ backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.6)' }}
                    >
                        <Text className="text-xs" style={{ color: colors.textSecondary }}>{t('sensai.standup.todayPlan')}</Text>
                        <Text className="text-sm font-semibold" style={{ color: colors.text }}>
                            {standup.focusToday.length} {t('tasks.title').toLowerCase()}
                        </Text>
                    </View>
                    <View 
                        className="flex-1 rounded-lg p-2"
                        style={{ backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.6)' }}
                    >
                        <Text className="text-xs" style={{ color: colors.textSecondary }}>{t('sensai.standup.blockers')}</Text>
                        <Text className={`text-sm font-semibold`} style={{ 
                            color: standup.blockers.length > 0 ? colors.warning : colors.text
                        }}>
                            {standup.blockers.length}
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    }

    if (wasSkipped) {
        return (
            <View 
                className="rounded-2xl p-4"
                style={{ 
                    backgroundColor: colors.backgroundSecondary,
                    borderWidth: 1,
                    borderColor: colors.border
                }}
            >
                <View className="flex-row items-center">
                    <View 
                        className="w-10 h-10 rounded-full items-center justify-center"
                        style={{ backgroundColor: isDark ? '#4B5563' : '#D1D5DB' }}
                    >
                        <MaterialCommunityIcons name="calendar-remove" size={24} color="white" />
                    </View>
                    <View className="ml-3 flex-1">
                        <Text className="text-base font-bold" style={{ color: colors.textSecondary }}>{t('sensai.standup.skipped')}</Text>
                        <Text className="text-sm" style={{ color: colors.textTertiary }}>{t('sensai.standup.skippedMessage')}</Text>
                    </View>
                    <TouchableOpacity 
                        onPress={onStartStandup}
                        className="px-4 py-2 rounded-full"
                        style={{ backgroundColor: colors.backgroundTertiary }}
                    >
                        <Text className="font-medium" style={{ color: colors.textSecondary }}>{t('common.start')}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    // Pending standup
    return (
        <View 
            className="rounded-2xl p-4"
            style={{ 
                backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : '#EFF6FF',
                borderWidth: 1,
                borderColor: isDark ? 'rgba(59, 130, 246, 0.3)' : '#BFDBFE'
            }}
        >
            <View className="flex-row items-center mb-4">
                <View className="w-12 h-12 bg-blue-500 rounded-full items-center justify-center">
                    <MaterialCommunityIcons name="clipboard-check-outline" size={26} color="white" />
                </View>
                <View className="ml-3 flex-1">
                    <Text className="text-lg font-bold" style={{ color: isDark ? '#93C5FD' : '#1E40AF' }}>{t('sensai.standup.dailyStandup')}</Text>
                    <Text className="text-sm" style={{ color: isDark ? '#60A5FA' : '#2563EB' }}>{t('sensai.standup.readyMessage')}</Text>
                </View>
            </View>

            {/* Sprint Health Preview */}
            {sprintHealth && (
                <View 
                    className="rounded-xl p-3 mb-4"
                    style={{ backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.6)' }}
                >
                    <View className="flex-row items-center justify-between mb-2">
                        <Text className="text-sm" style={{ color: colors.textSecondary }}>{t('sensai.standup.sprintProgress')}</Text>
                        <Text className="text-sm font-semibold" style={{ color: colors.text }}>
                            {t('sensai.standup.dayOfSprint', { current: sprintHealth.dayOfSprint, total: sprintHealth.totalDays })}
                        </Text>
                    </View>
                    <View 
                        className="h-2 rounded-full overflow-hidden"
                        style={{ backgroundColor: isDark ? '#374151' : '#E5E7EB' }}
                    >
                        <View 
                            className="h-full rounded-full"
                            style={{ 
                                width: `${sprintHealth.completionPercentage}%`,
                                backgroundColor: sprintHealth.healthStatus === 'on_track' || sprintHealth.healthStatus === 'ahead'
                                    ? '#10B981'
                                    : sprintHealth.healthStatus === 'at_risk'
                                    ? '#F59E0B'
                                    : '#EF4444'
                            }}
                        />
                    </View>
                    <View className="flex-row justify-between mt-2">
                        <Text className="text-xs" style={{ color: colors.textTertiary }}>
                            {sprintHealth.completedPoints}/{sprintHealth.committedPoints} {t('common.pts')}
                        </Text>
                        <Text className="text-xs" style={{ color: colors.textTertiary }}>
                            {sprintHealth.completionPercentage}% {t('common.complete')}
                        </Text>
                    </View>
                </View>
            )}

            <TouchableOpacity 
                onPress={onStartStandup}
                className="bg-blue-600 py-4 rounded-xl items-center flex-row justify-center"
                activeOpacity={0.8}
            >
                <MaterialCommunityIcons name="play" size={20} color="white" />
                <Text className="text-white font-bold text-base ml-2">{t('sensai.standup.startStandup')}</Text>
            </TouchableOpacity>

            <TouchableOpacity 
                onPress={() => {/* Skip logic */}}
                className="mt-2 py-2 items-center"
            >
                <Text className="text-sm" style={{ color: colors.primary }}>{t('sensai.standup.skipToday')}</Text>
            </TouchableOpacity>
        </View>
    );
}

export default StandupCard;
