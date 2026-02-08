/**
 * Velocity Analytics Screen
 *
 * Detailed velocity analytics and history.
 */

import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useVelocityMetrics } from '../../../hooks/queries';
import { VelocityCard } from '../../../components/sprints/VelocityCard';
import { toLocaleDateStringLocalized } from '../../../utils/localizedDate';
import { useTranslation } from '../../../hooks/useTranslation';
import { useThemeContext } from '../../../providers/ThemeProvider';

export default function VelocityScreen() {
    const router = useRouter();
    const { t } = useTranslation();
    const { colors, isDark } = useThemeContext();
    const { data: velocityMetrics, refetch, isRefetching } = useVelocityMetrics();

    const [refreshing, setRefreshing] = React.useState(false);
    const chartHeight = 150;
    const velocityHistory = velocityMetrics?.velocityHistory || [];
    const maxVelocity = velocityHistory.length > 0
        ? Math.max(...velocityHistory.map((v: any) => Math.max(v.committedPoints, v.completedPoints)), 1)
        : 1;

    const handleRefresh = async () => {
        setRefreshing(true);
        await refetch();
        setRefreshing(false);
    };

    const velocityTips = [
        { icon: 'target', title: t('sensai.velocity.tips.planRealisticTitle'), desc: t('sensai.velocity.tips.planRealisticDesc') },
        { icon: 'clock-outline', title: t('sensai.velocity.tips.protectFocusTitle'), desc: t('sensai.velocity.tips.protectFocusDesc') },
        { icon: 'format-list-checks', title: t('sensai.velocity.tips.breakDownTitle'), desc: t('sensai.velocity.tips.breakDownDesc') },
        { icon: 'chart-line', title: t('sensai.velocity.tips.trackTitle'), desc: t('sensai.velocity.tips.trackDesc') },
    ];

    return (
        <SafeAreaView className="flex-1" edges={['top']} style={{ backgroundColor: colors.background }}>
            {/* Header */}
            <View className="flex-row items-center px-4 py-3" style={{ borderBottomWidth: 1, borderBottomColor: colors.border }}>
                <TouchableOpacity onPress={() => router.back()}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text className="text-lg font-bold ml-4" style={{ color: colors.text }}>{t('sensai.velocity.title')}</Text>
            </View>

            <ScrollView
                className="flex-1"
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
                }
                showsVerticalScrollIndicator={false}
            >
                {/* Main Velocity Card */}
                {velocityMetrics && (
                    <View className="px-4 pt-4">
                        <VelocityCard metrics={velocityMetrics} showChart={true} />
                    </View>
                )}

                {/* Velocity Explanation */}
                <View className="px-4 mt-6">
                    <View className="rounded-xl p-4" style={{ backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : '#EFF6FF' }}>
                        <View className="flex-row items-start">
                            <MaterialCommunityIcons name="information" size={20} color="#3B82F6" />
                            <View className="ml-3 flex-1">
                                <Text className="text-sm font-semibold" style={{ color: isDark ? '#93C5FD' : '#1E40AF' }}>{t('sensai.velocity.whatIsVelocity')}</Text>
                                <Text className="text-xs mt-1" style={{ color: isDark ? '#60A5FA' : '#1D4ED8' }}>
                                    {t('sensai.velocity.whatIsVelocityDescription')}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Detailed Sprint History */}
                <View className="px-4 mt-6">
                    <Text className="text-lg font-bold mb-4" style={{ color: colors.text }}>{t('sensai.velocity.sprintHistory')}</Text>

                    {/* Chart */}
                    {velocityHistory.length > 0 && (
                        <View className="rounded-xl p-4 mb-4" style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }}>
                            <View className="flex-row items-center mb-4">
                                <View className="flex-row items-center mr-6">
                                    <View className="w-3 h-3 bg-blue-500 rounded-full mr-2" />
                                    <Text className="text-xs" style={{ color: colors.textSecondary }}>{t('common.committed')}</Text>
                                </View>
                                <View className="flex-row items-center">
                                    <View className="w-3 h-3 bg-green-500 rounded-full mr-2" />
                                    <Text className="text-xs" style={{ color: colors.textSecondary }}>{t('common.completed')}</Text>
                                </View>
                            </View>

                            <View className="flex-row items-end justify-between" style={{ height: chartHeight }}>
                                {velocityHistory.slice(-8).map((sprint: any, index: number) => {
                                    const committedHeight = (sprint.committedPoints / maxVelocity) * chartHeight;
                                    const completedHeight = (sprint.completedPoints / maxVelocity) * chartHeight;

                                    return (
                                        <View key={sprint.sprintId} className="items-center flex-1 mx-1">
                                            <View className="flex-row items-end h-full">
                                                <View
                                                    className="w-3 bg-blue-300 rounded-t mr-0.5"
                                                    style={{ height: Math.max(committedHeight, 4) }}
                                                />
                                                <View
                                                    className="w-3 bg-green-500 rounded-t"
                                                    style={{ height: Math.max(completedHeight, 4) }}
                                                />
                                            </View>
                                            <Text className="text-[9px] mt-2" style={{ color: colors.textTertiary }}>
                                                W{sprint.weekNumber}
                                            </Text>
                                        </View>
                                    );
                                })}
                            </View>
                        </View>
                    )}

                    {/* Sprint Details List */}
                    {velocityHistory.slice().reverse().map((sprint: any) => (
                        <View
                            key={sprint.sprintId}
                            className="rounded-xl p-4 mb-3"
                            style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }}
                        >
                            <View className="flex-row items-center justify-between mb-3">
                                <View>
                                    <Text className="text-base font-semibold" style={{ color: colors.text }}>
                                        {t('common.week')} {sprint.weekNumber}
                                    </Text>
                                    <Text className="text-xs" style={{ color: colors.textTertiary }}>
                                        {toLocaleDateStringLocalized(sprint.startDate, { month: 'short', day: 'numeric' })} - {toLocaleDateStringLocalized(sprint.endDate, { month: 'short', day: 'numeric' })}
                                    </Text>
                                </View>
                                <View className="px-3 py-1 rounded-full" style={{
                                    backgroundColor: sprint.completionRate >= 90 ? (isDark ? 'rgba(16, 185, 129, 0.2)' : '#ECFDF5') :
                                        sprint.completionRate >= 70 ? (isDark ? 'rgba(245, 158, 11, 0.2)' : '#FFFBEB') :
                                            (isDark ? 'rgba(239, 68, 68, 0.2)' : '#FEF2F2'),
                                }}>
                                    <Text className="text-sm font-semibold" style={{
                                        color: sprint.completionRate >= 90 ? colors.success :
                                            sprint.completionRate >= 70 ? '#F59E0B' : colors.error,
                                    }}>
                                        {sprint.completionRate.toFixed(0)}%
                                    </Text>
                                </View>
                            </View>

                            <View className="flex-row">
                                <View className="flex-1 items-center">
                                    <Text className="text-xs" style={{ color: colors.textTertiary }}>{t('common.committed')}</Text>
                                    <Text className="text-lg font-bold" style={{ color: '#3B82F6' }}>{sprint.committedPoints}</Text>
                                </View>
                                <View className="flex-1 items-center" style={{ borderLeftWidth: 1, borderRightWidth: 1, borderColor: colors.border }}>
                                    <Text className="text-xs" style={{ color: colors.textTertiary }}>{t('common.completed')}</Text>
                                    <Text className="text-lg font-bold" style={{ color: colors.success }}>{sprint.completedPoints}</Text>
                                </View>
                                <View className="flex-1 items-center">
                                    <Text className="text-xs" style={{ color: colors.textTertiary }}>{t('common.delta')}</Text>
                                    <Text className="text-lg font-bold" style={{
                                        color: sprint.completedPoints >= sprint.committedPoints ? colors.success : colors.error,
                                    }}>
                                        {sprint.completedPoints >= sprint.committedPoints ? '+' : ''}
                                        {sprint.completedPoints - sprint.committedPoints}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Velocity Tips */}
                <View className="px-4 mt-4 mb-8">
                    <Text className="text-lg font-bold mb-4" style={{ color: colors.text }}>{t('sensai.velocity.improveVelocity')}</Text>

                    <View className="rounded-xl" style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }}>
                        {velocityTips.map((tip, index) => (
                            <View
                                key={index}
                                className="flex-row items-center p-4"
                                style={index < 3 ? { borderBottomWidth: 1, borderBottomColor: colors.border } : {}}
                            >
                                <View className="w-10 h-10 rounded-full items-center justify-center" style={{ backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : '#EFF6FF' }}>
                                    <MaterialCommunityIcons name={tip.icon as any} size={20} color="#3B82F6" />
                                </View>
                                <View className="ml-3 flex-1">
                                    <Text className="text-sm font-medium" style={{ color: colors.text }}>{tip.title}</Text>
                                    <Text className="text-xs" style={{ color: colors.textTertiary }}>{tip.desc}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
