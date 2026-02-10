/**
 * Sprint Review Screen — Production-ready
 *
 * Real data driven via useSprintReviewData hook.
 * Features: completion ring, metric cards, completed task list,
 * carried-over section with badges, auto-generated insights.
 */

import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import {
  useCurrentSprint,
  useSprintTasks,
  useCompleteSprint,
} from '../../../hooks/queries/useSprints';
import {
  useSprintReviewData,
  useStartCeremony,
  useCompleteCeremony,
} from '../../../hooks/queries';
import { SprintCompletionRing } from '../../../components/sprints/SprintCompletionRing';
import { MetricCard } from '../../../components/sprints/MetricCard';
import { CarriedOverBadge } from '../../../components/sprints/CarriedOverBadge';
import { useThemeContext } from '../../../providers/ThemeProvider';
import type { Task } from '../../../types/models';

export default function SprintReviewScreen() {
  const { colors, isDark } = useThemeContext();

  // ── Data ───────────────────────────────────────────────────────────────
  const { data: currentSprintRaw } = useCurrentSprint();
  const currentSprint = currentSprintRaw as { id: string; weekNumber: number; totalPoints: number } | undefined;
  const sprintId = currentSprint?.id ?? '';

  const { data: sprintTasksRaw = [] } = useSprintTasks(sprintId);
  const tasks = (Array.isArray(sprintTasksRaw) ? sprintTasksRaw : []) as Task[];

  const { data: reviewDataRaw, isLoading: reviewLoading } = useSprintReviewData(sprintId);
  const reviewData = reviewDataRaw as {
    pointsDelivered?: number;
    tasksCompleted?: number;
    highlights?: string[];
    carriedOver?: string[];
    wentWell?: string[];
    needsImprovement?: string[];
  } | undefined;

  const startCeremony = useStartCeremony();
  const completeCeremony = useCompleteCeremony();

  // ── Derived ────────────────────────────────────────────────────────────
  const completedTasks = tasks.filter((t) => (t.status ?? '').toLowerCase() === 'done');
  const incompleteTasks = tasks.filter((t) => (t.status ?? '').toLowerCase() !== 'done');
  const carriedOverTasks = tasks.filter((t) => !!t.carriedOverFromSprintId);

  const totalPlanned = currentSprint?.totalPoints || tasks.reduce((s, t) => s + (t.storyPoints || 0), 0);
  const pointsDelivered = reviewData?.pointsDelivered ?? completedTasks.reduce((s, t) => s + (t.storyPoints || 0), 0);
  const completionRate = totalPlanned > 0 ? Math.round((pointsDelivered / totalPlanned) * 100) : 0;

  const highlights = reviewData?.highlights ?? [];
  const carriedOverNames = reviewData?.carriedOver ?? [];

  // ── UI ─────────────────────────────────────────────────────────────────
  if (!sprintId) {
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
        <Header />
        <View className="flex-1 justify-center items-center p-6">
          <MaterialCommunityIcons name="calendar-blank" size={48} color={colors.textTertiary} />
          <Text className="text-base mt-3" style={{ color: colors.textSecondary }}>
            No active sprint to review
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <Header />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* ── Completion Ring Hero ──────────────────────────────────────── */}
        <View
          className="items-center pt-6 pb-4 mx-4 mt-4 rounded-2xl"
          style={{
            backgroundColor: isDark ? 'rgba(168, 85, 247, 0.1)' : '#FAF5FF',
            borderWidth: 1,
            borderColor: isDark ? 'rgba(168, 85, 247, 0.3)' : '#E9D5FF',
          }}
        >
          <SprintCompletionRing
            percentage={completionRate}
            size={150}
            subLabel="completion"
          />
          <Text className="text-sm mt-3" style={{ color: colors.textSecondary }}>
            {pointsDelivered} of {totalPlanned} points delivered
          </Text>
        </View>

        {/* ── Metric Cards Row ─────────────────────────────────────────── */}
        <View className="flex-row px-4 mt-4" style={{ gap: 8 }}>
          <MetricCard
            icon="check-circle"
            iconColor="#10B981"
            label="Completed"
            value={completedTasks.length}
          />
          <MetricCard
            icon="arrow-right-bold-circle-outline"
            iconColor="#F59E0B"
            label="Carried Over"
            value={incompleteTasks.length}
          />
          <MetricCard
            icon="speedometer"
            iconColor="#3B82F6"
            label="Pts / Day"
            value={totalPlanned > 0 ? Math.round(pointsDelivered / 14) : 0}
          />
        </View>

        {/* ── Completed Tasks ──────────────────────────────────────────── */}
        <View className="px-4 mt-6">
          <Text className="text-lg font-semibold mb-3" style={{ color: colors.text }}>
            Completed This Sprint
          </Text>
          {completedTasks.length > 0 ? (
            completedTasks.map((task) => (
              <View
                key={task.id}
                className="p-4 rounded-xl mb-2 flex-row items-center"
                style={{ backgroundColor: colors.card }}
              >
                <MaterialCommunityIcons name="check-circle" size={22} color="#10B981" />
                <View className="flex-1 ml-3">
                  <Text className="font-medium" style={{ color: colors.text }}>{task.title}</Text>
                </View>
                <View
                  className="px-3 py-1 rounded-full"
                  style={{ backgroundColor: isDark ? 'rgba(16, 185, 129, 0.2)' : '#ECFDF5' }}
                >
                  <Text style={{ color: '#10B981' }} className="font-semibold text-xs">
                    +{task.storyPoints ?? 0}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <View className="rounded-xl p-6 items-center" style={{ backgroundColor: colors.card }}>
              <Text style={{ color: colors.textSecondary }}>No completed tasks</Text>
            </View>
          )}
        </View>

        {/* ── Carried Over Tasks ────────────────────────────────────────── */}
        {incompleteTasks.length > 0 && (
          <View className="px-4 mt-6">
            <Text className="text-lg font-semibold mb-3" style={{ color: colors.text }}>
              Carried Over
            </Text>
            {incompleteTasks.map((task) => (
              <View
                key={task.id}
                className="p-4 rounded-xl mb-2"
                style={{
                  backgroundColor: colors.card,
                  borderLeftWidth: 4,
                  borderLeftColor: '#F59E0B',
                }}
              >
                <View className="flex-row items-center mb-1">
                  <Text className="font-medium flex-1" style={{ color: colors.text }}>{task.title}</Text>
                  <Text style={{ color: colors.textTertiary }} className="text-xs">
                    {task.storyPoints ?? 0} pts
                  </Text>
                </View>
                <CarriedOverBadge
                  fromSprintId={task.carriedOverFromSprintId}
                  originalPoints={task.originalStoryPoints}
                  currentPoints={task.storyPoints}
                />
              </View>
            ))}
          </View>
        )}

        {/* ── AI-Generated Insights ────────────────────────────────────── */}
        {(highlights.length > 0 || (reviewData?.wentWell ?? []).length > 0) && (
          <View className="px-4 mt-6">
            <View className="rounded-2xl p-5" style={{ backgroundColor: colors.card }}>
              <View className="flex-row items-center mb-4">
                <MaterialCommunityIcons name="chart-line" size={24} color={colors.success} />
                <Text className="text-lg font-semibold ml-2" style={{ color: colors.text }}>
                  Insights
                </Text>
              </View>

              {highlights.map((h, i) => (
                <View key={`h-${i}`} className="flex-row items-start mb-3">
                  <MaterialCommunityIcons name="star" size={18} color="#F59E0B" />
                  <Text className="ml-3 flex-1 text-sm" style={{ color: colors.textSecondary }}>
                    {h}
                  </Text>
                </View>
              ))}

              {(reviewData?.wentWell ?? []).map((w: string, i: number) => (
                <View key={`w-${i}`} className="flex-row items-start mb-3">
                  <MaterialCommunityIcons name="check-circle" size={18} color="#10B981" />
                  <Text className="ml-3 flex-1 text-sm" style={{ color: colors.textSecondary }}>
                    {w}
                  </Text>
                </View>
              ))}

              {(reviewData?.needsImprovement ?? []).map((n: string, i: number) => (
                <View key={`n-${i}`} className="flex-row items-start mb-3">
                  <MaterialCommunityIcons name="alert-circle" size={18} color="#F59E0B" />
                  <Text className="ml-3 flex-1 text-sm" style={{ color: colors.textSecondary }}>
                    {n}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ── Actions ──────────────────────────────────────────────────── */}
        <View className="flex-row px-4 mt-6 mb-8" style={{ gap: 12 }}>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/sprints/retrospective')}
            className="flex-1 p-4 rounded-xl flex-row items-center justify-center"
            style={{ backgroundColor: colors.backgroundSecondary }}
          >
            <MaterialCommunityIcons name="thought-bubble" size={20} color={colors.text} />
            <Text className="font-semibold ml-2" style={{ color: colors.text }}>
              Start Retro
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.back()}
            className="flex-1 p-4 rounded-xl"
            style={{ backgroundColor: colors.success }}
          >
            <Text className="text-white text-center font-semibold">Done</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/** Extracted header to avoid duplication */
function Header() {
  const { colors } = useThemeContext();
  return (
    <View
      className="flex-row items-center p-4"
      style={{ borderBottomWidth: 1, borderBottomColor: colors.border }}
    >
      <TouchableOpacity onPress={() => router.back()} className="mr-4">
        <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
      </TouchableOpacity>
      <Text className="text-xl font-semibold" style={{ color: colors.text }}>Sprint Review</Text>
    </View>
  );
}
