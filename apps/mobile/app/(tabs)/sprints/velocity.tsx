/**
 * Velocity Analytics Screen — Production-ready
 *
 * Two tabs: Velocity (bar chart + sprint history) and Burndown (line chart).
 * Uses real data from useVelocityHistory and useBurndownData hooks.
 * VelocityBarChart + BurndownChart shared components.
 */

import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  useVelocityMetrics,
  useCurrentSprint,
} from '../../../hooks/queries';
import {
  useVelocityHistory,
  useBurndownData,
} from '../../../hooks/queries/useSprintCeremonies';
import { VelocityCard } from '../../../components/sprints/VelocityCard';
import { VelocityBarChart } from '../../../components/sprints/VelocityBarChart';
import { BurndownChart } from '../../../components/sprints/BurndownChart';
import { MetricCard } from '../../../components/sprints/MetricCard';
import { toLocaleDateStringLocalized } from '../../../utils/localizedDate';
import { useTranslation } from '../../../hooks/useTranslation';
import { useThemeContext } from '../../../providers/ThemeProvider';
import type { VelocitySprintRecord, BurndownPoint } from '../../../types/sensai.types';

type VelocityTab = 'velocity' | 'burndown';

export default function VelocityScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { colors, isDark } = useThemeContext();

  // Data
  const { data: velocityMetrics, refetch, isRefetching } = useVelocityMetrics();
  const { data: currentSprintRaw } = useCurrentSprint();
  const currentSprint = currentSprintRaw as { id: string } | undefined;
  const sprintId = currentSprint?.id ?? '';

  const { data: velocityHistoryRaw } = useVelocityHistory(8);
  const { data: burndownRaw, isLoading: burndownLoading } = useBurndownData(sprintId);

  const velocityHistory = useMemo<VelocitySprintRecord[]>(() => {
    if (Array.isArray(velocityHistoryRaw)) return velocityHistoryRaw;
    if (velocityHistoryRaw && typeof velocityHistoryRaw === 'object' && 'sprints' in (velocityHistoryRaw as Record<string, unknown>)) {
      return ((velocityHistoryRaw as Record<string, unknown>).sprints as VelocitySprintRecord[]) ?? [];
    }
    // Fallback to velocityMetrics data
    return (velocityMetrics?.velocityHistory as VelocitySprintRecord[] | undefined) ?? [];
  }, [velocityHistoryRaw, velocityMetrics]);

  const burndownData = useMemo<BurndownPoint[]>(() => {
    if (Array.isArray(burndownRaw)) return burndownRaw;
    if (burndownRaw && typeof burndownRaw === 'object' && 'points' in (burndownRaw as Record<string, unknown>)) {
      return ((burndownRaw as Record<string, unknown>).points as BurndownPoint[]) ?? [];
    }
    return [];
  }, [burndownRaw]);

  // Derived metrics
  const avgVelocity = useMemo(() => {
    if (velocityHistory.length === 0) return 0;
    const total = velocityHistory.reduce((s, v) => s + v.completedPoints, 0);
    return Math.round(total / velocityHistory.length);
  }, [velocityHistory]);

  const bestSprint = useMemo(() => {
    if (velocityHistory.length === 0) return 0;
    return Math.max(...velocityHistory.map((v) => v.completedPoints));
  }, [velocityHistory]);

  const avgCompletion = useMemo(() => {
    if (velocityHistory.length === 0) return 0;
    const total = velocityHistory.reduce((s, v) => s + (v.completionRate ?? 0), 0);
    return Math.round(total / velocityHistory.length);
  }, [velocityHistory]);

  // State
  const [activeTab, setActiveTab] = useState<VelocityTab>('velocity');
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  // ── Velocity Tab ───────────────────────────────────────────────────────
  const renderVelocityTab = () => (
    <>
      {/* Summary VelocityCard */}
      {velocityMetrics && (
        <View className="px-4 pt-4">
          <VelocityCard metrics={velocityMetrics} showChart={false} />
        </View>
      )}

      {/* Metric Cards Row */}
      <View className="flex-row px-4 mt-4" style={{ gap: 10 }}>
        <View className="flex-1">
          <MetricCard
            label="Avg Velocity"
            value={avgVelocity}
            icon="speedometer"
            iconColor="#3B82F6"
          />
        </View>
        <View className="flex-1">
          <MetricCard
            label="Best Sprint"
            value={bestSprint}
            icon="trophy"
            iconColor="#F59E0B"
          />
        </View>
        <View className="flex-1">
          <MetricCard
            label="Avg Completion"
            value={`${avgCompletion}%`}
            icon="percent"
            iconColor="#10B981"
          />
        </View>
      </View>

      {/* Bar Chart */}
      {velocityHistory.length > 0 && (
        <View className="px-4 mt-4">
          <VelocityBarChart
            sprints={velocityHistory.slice(-8)}
            title="Sprint Velocity (last 8)"
          />
        </View>
      )}

      {/* Sprint History List */}
      <View className="px-4 mt-6">
        <Text className="text-lg font-bold mb-4" style={{ color: colors.text }}>
          {t('sensai.velocity.sprintHistory')}
        </Text>

        {velocityHistory
          .slice()
          .reverse()
          .map((sprint) => (
            <View
              key={sprint.sprintId}
              className="rounded-xl p-4 mb-3"
              style={{
                backgroundColor: colors.card,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <View className="flex-row items-center justify-between mb-3">
                <View>
                  <Text className="text-base font-semibold" style={{ color: colors.text }}>
                    {t('common.week')} {sprint.weekNumber}
                  </Text>
                  {sprint.startDate && sprint.endDate && (
                    <Text className="text-xs" style={{ color: colors.textTertiary }}>
                      {toLocaleDateStringLocalized(sprint.startDate, {
                        month: 'short',
                        day: 'numeric',
                      })}{' '}
                      -{' '}
                      {toLocaleDateStringLocalized(sprint.endDate, {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </Text>
                  )}
                </View>
                <View
                  className="px-3 py-1 rounded-full"
                  style={{
                    backgroundColor:
                      (sprint.completionRate ?? 0) >= 90
                        ? isDark
                          ? 'rgba(16, 185, 129, 0.2)'
                          : '#ECFDF5'
                        : (sprint.completionRate ?? 0) >= 70
                          ? isDark
                            ? 'rgba(245, 158, 11, 0.2)'
                            : '#FFFBEB'
                          : isDark
                            ? 'rgba(239, 68, 68, 0.2)'
                            : '#FEF2F2',
                  }}
                >
                  <Text
                    className="text-sm font-semibold"
                    style={{
                      color:
                        (sprint.completionRate ?? 0) >= 90
                          ? colors.success
                          : (sprint.completionRate ?? 0) >= 70
                            ? '#F59E0B'
                            : colors.error,
                    }}
                  >
                    {(sprint.completionRate ?? 0).toFixed(0)}%
                  </Text>
                </View>
              </View>

              <View className="flex-row">
                <View className="flex-1 items-center">
                  <Text className="text-xs" style={{ color: colors.textTertiary }}>
                    {t('common.committed')}
                  </Text>
                  <Text className="text-lg font-bold" style={{ color: '#3B82F6' }}>
                    {sprint.committedPoints}
                  </Text>
                </View>
                <View
                  className="flex-1 items-center"
                  style={{
                    borderLeftWidth: 1,
                    borderRightWidth: 1,
                    borderColor: colors.border,
                  }}
                >
                  <Text className="text-xs" style={{ color: colors.textTertiary }}>
                    {t('common.completed')}
                  </Text>
                  <Text className="text-lg font-bold" style={{ color: colors.success }}>
                    {sprint.completedPoints}
                  </Text>
                </View>
                <View className="flex-1 items-center">
                  <Text className="text-xs" style={{ color: colors.textTertiary }}>
                    {t('common.delta')}
                  </Text>
                  <Text
                    className="text-lg font-bold"
                    style={{
                      color:
                        sprint.completedPoints >= sprint.committedPoints
                          ? colors.success
                          : colors.error,
                    }}
                  >
                    {sprint.completedPoints >= sprint.committedPoints ? '+' : ''}
                    {sprint.completedPoints - sprint.committedPoints}
                  </Text>
                </View>
              </View>
            </View>
          ))}
      </View>
    </>
  );

  // ── Burndown Tab ───────────────────────────────────────────────────────
  const renderBurndownTab = () => (
    <>
      {burndownLoading ? (
        <View className="items-center py-20">
          <ActivityIndicator color={colors.primary} size="large" />
          <Text className="mt-3" style={{ color: colors.textSecondary }}>
            Loading burndown data…
          </Text>
        </View>
      ) : burndownData.length === 0 ? (
        <View className="items-center py-20 px-8">
          <MaterialCommunityIcons name="chart-line-variant" size={64} color={colors.textTertiary} />
          <Text className="text-lg font-semibold mt-4 text-center" style={{ color: colors.text }}>
            No Burndown Data Yet
          </Text>
          <Text className="text-center mt-2" style={{ color: colors.textSecondary }}>
            Burndown data will appear as you complete tasks during the active sprint.
          </Text>
        </View>
      ) : (
        <View className="px-4 pt-4">
          <BurndownChart data={burndownData} title="Sprint Burndown" height={220} />

          {/* Burndown insight card */}
          <View
            className="rounded-xl p-4 mt-4"
            style={{
              backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : '#EFF6FF',
            }}
          >
            <View className="flex-row items-start">
              <MaterialCommunityIcons name="information" size={20} color="#3B82F6" />
              <View className="ml-3 flex-1">
                <Text
                  className="text-sm font-semibold"
                  style={{ color: isDark ? '#93C5FD' : '#1E40AF' }}
                >
                  Reading Your Burndown
                </Text>
                <Text
                  className="text-xs mt-1"
                  style={{ color: isDark ? '#60A5FA' : '#1D4ED8' }}
                >
                  The blue dashed line is the ideal pace. If the green line is above it, you're
                  behind schedule. If below, you're ahead. Flat sections indicate no tasks were
                  completed that day.
                </Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </>
  );

  // ── Velocity Tips ──────────────────────────────────────────────────────
  const velocityTips = [
    {
      icon: 'target',
      title: t('sensai.velocity.tips.planRealisticTitle'),
      desc: t('sensai.velocity.tips.planRealisticDesc'),
    },
    {
      icon: 'clock-outline',
      title: t('sensai.velocity.tips.protectFocusTitle'),
      desc: t('sensai.velocity.tips.protectFocusDesc'),
    },
    {
      icon: 'format-list-checks',
      title: t('sensai.velocity.tips.breakDownTitle'),
      desc: t('sensai.velocity.tips.breakDownDesc'),
    },
    {
      icon: 'chart-line',
      title: t('sensai.velocity.tips.trackTitle'),
      desc: t('sensai.velocity.tips.trackDesc'),
    },
  ];

  return (
    <SafeAreaView
      className="flex-1"
      edges={['top']}
      style={{ backgroundColor: colors.background }}
    >
      {/* Header */}
      <View
        className="flex-row items-center px-4 py-3"
        style={{ borderBottomWidth: 1, borderBottomColor: colors.border }}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text className="text-lg font-bold ml-4 flex-1" style={{ color: colors.text }}>
          {t('sensai.velocity.title')}
        </Text>
      </View>

      {/* Tab Switcher */}
      <View className="flex-row mx-4 mt-3 p-1 rounded-xl" style={{ backgroundColor: colors.backgroundSecondary }}>
        {(['velocity', 'burndown'] as VelocityTab[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            className="flex-1 py-2.5 rounded-lg items-center"
            style={{
              backgroundColor: activeTab === tab ? colors.card : 'transparent',
            }}
          >
            <View className="flex-row items-center" style={{ gap: 6 }}>
              <MaterialCommunityIcons
                name={tab === 'velocity' ? 'speedometer' : 'chart-line-variant'}
                size={16}
                color={activeTab === tab ? colors.primary : colors.textTertiary}
              />
              <Text
                className="font-semibold text-sm"
                style={{
                  color: activeTab === tab ? colors.primary : colors.textTertiary,
                }}
              >
                {tab === 'velocity' ? 'Velocity' : 'Burndown'}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'velocity' && renderVelocityTab()}
        {activeTab === 'burndown' && renderBurndownTab()}

        {/* Velocity Tips */}
        <View className="px-4 mt-6 mb-8">
          <Text className="text-lg font-bold mb-4" style={{ color: colors.text }}>
            {t('sensai.velocity.improveVelocity')}
          </Text>

          <View
            className="rounded-xl"
            style={{
              backgroundColor: colors.card,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            {velocityTips.map((tip, index) => (
              <View
                key={index}
                className="flex-row items-center p-4"
                style={
                  index < velocityTips.length - 1
                    ? { borderBottomWidth: 1, borderBottomColor: colors.border }
                    : {}
                }
              >
                <View
                  className="w-10 h-10 rounded-full items-center justify-center"
                  style={{
                    backgroundColor: isDark
                      ? 'rgba(59, 130, 246, 0.15)'
                      : '#EFF6FF',
                  }}
                >
                  <MaterialCommunityIcons
                    name={tip.icon as 'target'}
                    size={20}
                    color="#3B82F6"
                  />
                </View>
                <View className="ml-3 flex-1">
                  <Text className="text-sm font-medium" style={{ color: colors.text }}>
                    {tip.title}
                  </Text>
                  <Text className="text-xs" style={{ color: colors.textTertiary }}>
                    {tip.desc}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
