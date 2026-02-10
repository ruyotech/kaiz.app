/**
 * Daily Standup Screen — Production-ready, task-driven DSU
 *
 * Shows real sprint tasks grouped by status:
 *   ✅ Done (yesterday) → 🔄 In Progress → 📋 To Do → 🚫 Blocked
 * Plus a mood/energy check-in and blocker reporting.
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  useTodayStandup,
  useCompleteStandup,
  useCurrentSprintHealth,
} from '../../../hooks/queries';
import { useCurrentSprint, useSprintTasks } from '../../../hooks/queries/useSprints';
import { SprintHealthCard } from '../../../components/sprints/SprintHealthCard';
import { CarriedOverBadge } from '../../../components/sprints/CarriedOverBadge';
import { useThemeContext } from '../../../providers/ThemeProvider';
import { taskStatusColors } from '../../../constants/theme';
import type { Task, TaskStatus } from '../../../types/models';

type StandupStep = 'tasks' | 'blockers' | 'mood';

const MOOD_OPTIONS = [
  { value: 'great', icon: 'rocket-launch-outline', label: 'Great', color: '#10B981' },
  { value: 'good', icon: 'emoticon-happy-outline', label: 'Good', color: '#3B82F6' },
  { value: 'okay', icon: 'emoticon-neutral-outline', label: 'Okay', color: '#F59E0B' },
  { value: 'struggling', icon: 'emoticon-sad-outline', label: 'Struggling', color: '#EF4444' },
] as const;

const STATUS_SECTIONS: { key: TaskStatus; title: string; icon: string; color: string; emptyText: string }[] = [
  { key: 'done', title: 'Completed', icon: 'check-circle', color: '#10B981', emptyText: 'No tasks completed yet' },
  { key: 'in_progress', title: 'In Progress', icon: 'progress-clock', color: '#F59E0B', emptyText: 'Nothing in progress' },
  { key: 'todo', title: 'To Do', icon: 'checkbox-blank-circle-outline', color: '#3B82F6', emptyText: 'No upcoming tasks' },
  { key: 'blocked', title: 'Blocked', icon: 'alert-octagon', color: '#EF4444', emptyText: 'Nothing blocked — great!' },
];

export default function StandupScreen() {
  const router = useRouter();
  const { colors, isDark } = useThemeContext();

  // ── Data ───────────────────────────────────────────────────────────────
  const { data: standupResponse } = useTodayStandup();
  const { data: healthData } = useCurrentSprintHealth();
  const completeStandupMutation = useCompleteStandup();

  const { data: currentSprintRaw } = useCurrentSprint();
  const currentSprint = currentSprintRaw as { id: string; weekNumber: number } | undefined;
  const sprintId = currentSprint?.id ?? '';
  const { data: sprintTasksRaw = [] } = useSprintTasks(sprintId);

  const hasCompletedToday = standupResponse?.hasCompletedToday ?? false;
  const todayStandup = standupResponse?.standup;

  // ── State ──────────────────────────────────────────────────────────────
  const [step, setStep] = useState<StandupStep>('tasks');
  const [blockerInput, setBlockerInput] = useState('');
  const [blockers, setBlockers] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [mood, setMood] = useState<'great' | 'good' | 'okay' | 'struggling' | null>(null);

  // ── Derived — group tasks by status ────────────────────────────────────
  const tasksByStatus = useMemo(() => {
    const tasks = (Array.isArray(sprintTasksRaw) ? sprintTasksRaw : []) as Task[];
    const map: Record<string, Task[]> = { done: [], in_progress: [], todo: [], blocked: [] };
    for (const t of tasks) {
      const s = (t.status ?? 'todo').toLowerCase();
      if (map[s]) map[s].push(t);
      else map.todo.push(t); // fallback
    }
    return map;
  }, [sprintTasksRaw]);

  const totalTasks = useMemo(() => {
    const tasks = (Array.isArray(sprintTasksRaw) ? sprintTasksRaw : []) as Task[];
    return tasks.length;
  }, [sprintTasksRaw]);

  const doneCount = tasksByStatus.done.length;
  const inProgressCount = tasksByStatus.in_progress.length;
  const blockedCount = tasksByStatus.blocked.length;

  // ── Handlers ───────────────────────────────────────────────────────────
  const handleAddBlocker = useCallback(() => {
    if (blockerInput.trim()) {
      setBlockers((prev) => [...prev, blockerInput.trim()]);
      setBlockerInput('');
    }
  }, [blockerInput]);

  const handleRemoveBlocker = useCallback((index: number) => {
    setBlockers((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleComplete = useCallback(async () => {
    await completeStandupMutation.mutateAsync({
      blockers,
      notes,
      mood: mood || undefined,
    } as any);
    router.back();
  }, [completeStandupMutation, blockers, notes, mood, router]);

  // ── Task Card Renderer ─────────────────────────────────────────────────
  const renderTaskCard = useCallback(
    (task: Task, statusColor: string) => (
      <View
        key={task.id}
        className="rounded-xl p-4 mb-2"
        style={{
          backgroundColor: colors.card,
          borderLeftWidth: 4,
          borderLeftColor: statusColor,
        }}
      >
        <View className="flex-row items-center">
          <View className="flex-1">
            <Text className="text-sm font-medium" style={{ color: colors.text }}>
              {task.title}
            </Text>
            <View className="flex-row items-center mt-1" style={{ gap: 8 }}>
              {task.storyPoints != null && (
                <View
                  className="flex-row items-center px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: colors.backgroundTertiary }}
                >
                  <Text className="text-xs font-semibold" style={{ color: colors.textSecondary }}>
                    {task.storyPoints} pts
                  </Text>
                </View>
              )}
              <CarriedOverBadge
                fromSprintId={task.carriedOverFromSprintId}
                originalPoints={task.originalStoryPoints}
                currentPoints={task.storyPoints}
                compact
              />
            </View>
          </View>
        </View>
      </View>
    ),
    [colors],
  );

  // ──────────────────────────────────────────────────────────────────────
  // Already-completed view
  // ──────────────────────────────────────────────────────────────────────
  if (hasCompletedToday) {
    return (
      <SafeAreaView className="flex-1" edges={['top']} style={{ backgroundColor: colors.background }}>
        <View
          className="flex-row items-center px-4 py-3"
          style={{ borderBottomWidth: 1, borderBottomColor: colors.border }}
        >
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text className="text-lg font-bold ml-4" style={{ color: colors.text }}>
            Today's Standup
          </Text>
        </View>

        <ScrollView className="flex-1 px-4 pt-4">
          {/* Success banner */}
          <View
            className="rounded-2xl p-6 items-center mb-6"
            style={{
              backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : '#ECFDF5',
              borderWidth: 1,
              borderColor: isDark ? '#10B981' : '#A7F3D0',
            }}
          >
            <View
              className="w-16 h-16 rounded-full items-center justify-center mb-4"
              style={{ backgroundColor: colors.success }}
            >
              <MaterialCommunityIcons name="check" size={36} color="white" />
            </View>
            <Text className="text-xl font-bold" style={{ color: isDark ? '#6EE7B7' : '#065F46' }}>
              Standup Complete!
            </Text>
            <Text className="text-sm mt-1" style={{ color: isDark ? '#34D399' : '#047857' }}>
              Completed at{' '}
              {new Date(todayStandup?.completedAt || '').toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>

          {/* Quick summary cards */}
          <View className="flex-row mb-4" style={{ gap: 8 }}>
            <View className="flex-1 rounded-xl p-4 items-center" style={{ backgroundColor: colors.card }}>
              <Text className="text-2xl font-bold" style={{ color: '#10B981' }}>{doneCount}</Text>
              <Text className="text-xs" style={{ color: colors.textSecondary }}>Done</Text>
            </View>
            <View className="flex-1 rounded-xl p-4 items-center" style={{ backgroundColor: colors.card }}>
              <Text className="text-2xl font-bold" style={{ color: '#F59E0B' }}>{inProgressCount}</Text>
              <Text className="text-xs" style={{ color: colors.textSecondary }}>In Progress</Text>
            </View>
            <View className="flex-1 rounded-xl p-4 items-center" style={{ backgroundColor: colors.card }}>
              <Text className="text-2xl font-bold" style={{ color: '#EF4444' }}>{blockedCount}</Text>
              <Text className="text-xs" style={{ color: colors.textSecondary }}>Blocked</Text>
            </View>
          </View>

          {healthData && (
            <View className="mb-6">
              <Text className="text-lg font-bold mb-3" style={{ color: colors.text }}>Sprint Health</Text>
              <SprintHealthCard health={healthData} />
            </View>
          )}

          {/* Motivational card */}
          <View
            className="rounded-2xl p-4 mb-6"
            style={{
              backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : '#F0FDF4',
              borderWidth: 1,
              borderColor: isDark ? 'rgba(16, 185, 129, 0.3)' : '#BBF7D0',
            }}
          >
            <View className="flex-row items-center mb-2">
              <MaterialCommunityIcons name="star-circle" size={24} color={colors.success} />
              <Text className="text-base font-semibold ml-2" style={{ color: colors.text }}>
                Stay focused!
              </Text>
            </View>
            <Text className="text-sm" style={{ color: colors.textSecondary }}>
              You have {inProgressCount} task{inProgressCount !== 1 ? 's' : ''} in progress. Make
              progress, not perfection.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ──────────────────────────────────────────────────────────────────────
  // Active DSU flow — 3 steps: Tasks → Blockers → Mood / Complete
  // ──────────────────────────────────────────────────────────────────────
  const STEPS: StandupStep[] = ['tasks', 'blockers', 'mood'];
  const stepIdx = STEPS.indexOf(step);

  return (
    <SafeAreaView className="flex-1" edges={['top']} style={{ backgroundColor: colors.background }}>
      {/* Header */}
      <View
        className="flex-row items-center px-4 py-3"
        style={{ borderBottomWidth: 1, borderBottomColor: colors.border }}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text className="text-lg font-bold ml-4 flex-1" style={{ color: colors.text }}>
          Daily Standup
        </Text>
        {/* Step dots */}
        <View className="flex-row" style={{ gap: 6 }}>
          {STEPS.map((s, i) => (
            <View
              key={s}
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: i <= stepIdx ? colors.primary : colors.backgroundTertiary }}
            />
          ))}
        </View>
      </View>

      {/* ── Step 1: Tasks Overview ──────────────────────────────────────── */}
      {step === 'tasks' && (
        <View className="flex-1">
          <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
            {/* Quick stats bar */}
            <View className="flex-row mb-4" style={{ gap: 8 }}>
              <View
                className="flex-1 rounded-xl py-3 items-center"
                style={{ backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : '#ECFDF5' }}
              >
                <Text className="text-lg font-bold" style={{ color: '#10B981' }}>{doneCount}</Text>
                <Text className="text-[10px]" style={{ color: colors.textSecondary }}>Done</Text>
              </View>
              <View
                className="flex-1 rounded-xl py-3 items-center"
                style={{ backgroundColor: isDark ? 'rgba(245, 158, 11, 0.15)' : '#FFFBEB' }}
              >
                <Text className="text-lg font-bold" style={{ color: '#F59E0B' }}>{inProgressCount}</Text>
                <Text className="text-[10px]" style={{ color: colors.textSecondary }}>In Progress</Text>
              </View>
              <View
                className="flex-1 rounded-xl py-3 items-center"
                style={{ backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : '#EFF6FF' }}
              >
                <Text className="text-lg font-bold" style={{ color: '#3B82F6' }}>
                  {tasksByStatus.todo.length}
                </Text>
                <Text className="text-[10px]" style={{ color: colors.textSecondary }}>To Do</Text>
              </View>
              <View
                className="flex-1 rounded-xl py-3 items-center"
                style={{ backgroundColor: isDark ? 'rgba(239, 68, 68, 0.15)' : '#FEF2F2' }}
              >
                <Text className="text-lg font-bold" style={{ color: '#EF4444' }}>{blockedCount}</Text>
                <Text className="text-[10px]" style={{ color: colors.textSecondary }}>Blocked</Text>
              </View>
            </View>

            {/* Status sections */}
            {STATUS_SECTIONS.map((section) => {
              const tasks = tasksByStatus[section.key] ?? [];
              return (
                <View key={section.key} className="mb-4">
                  <View className="flex-row items-center mb-2">
                    <MaterialCommunityIcons name={section.icon as any} size={18} color={section.color} />
                    <Text className="text-sm font-semibold ml-2" style={{ color: colors.text }}>
                      {section.title}
                    </Text>
                    <View
                      className="ml-2 px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: `${section.color}20` }}
                    >
                      <Text className="text-xs font-semibold" style={{ color: section.color }}>
                        {tasks.length}
                      </Text>
                    </View>
                  </View>

                  {tasks.length > 0 ? (
                    tasks.map((t) => renderTaskCard(t, section.color))
                  ) : (
                    <View
                      className="rounded-xl py-3 px-4"
                      style={{ backgroundColor: colors.backgroundSecondary }}
                    >
                      <Text className="text-xs" style={{ color: colors.textTertiary }}>
                        {section.emptyText}
                      </Text>
                    </View>
                  )}
                </View>
              );
            })}
          </ScrollView>

          <View className="px-4 pb-4">
            <TouchableOpacity
              onPress={() => setStep('blockers')}
              className="py-4 rounded-xl items-center"
              style={{ backgroundColor: colors.primary }}
            >
              <Text className="text-white font-bold text-base">Continue — Blockers</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ── Step 2: Blockers ──────────────────────────────────────────── */}
      {step === 'blockers' && (
        <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View className="px-4 mt-4 mb-4">
            <Text className="text-xl font-bold mb-1" style={{ color: colors.text }}>
              Any blockers?
            </Text>
            <Text className="text-sm" style={{ color: colors.textSecondary }}>
              What's slowing you down or stopping progress?
            </Text>
          </View>

          <ScrollView className="flex-1 px-4">
            {/* Existing blockers from standup data */}
            {(todayStandup?.blockers ?? [])
              .filter((b: any) => !b.convertedToTask)
              .map((blocker: any) => (
                <View
                  key={blocker.id}
                  className="rounded-xl p-4 mb-3"
                  style={{
                    backgroundColor: isDark ? 'rgba(239, 68, 68, 0.15)' : '#FEF2F2',
                    borderWidth: 1,
                    borderColor: isDark ? '#EF4444' : '#FECACA',
                  }}
                >
                  <View className="flex-row items-start">
                    <MaterialCommunityIcons name="alert-circle" size={20} color="#EF4444" />
                    <Text className="flex-1 ml-3 text-sm" style={{ color: colors.text }}>
                      {blocker.description}
                    </Text>
                  </View>
                </View>
              ))}

            {/* User-added blockers */}
            {blockers.map((blocker, index) => (
              <View
                key={index}
                className="rounded-xl p-4 mb-3"
                style={{
                  backgroundColor: isDark ? 'rgba(245, 158, 11, 0.15)' : '#FFFBEB',
                  borderWidth: 1,
                  borderColor: isDark ? '#F59E0B' : '#FDE68A',
                }}
              >
                <View className="flex-row items-start">
                  <MaterialCommunityIcons name="alert" size={20} color="#F59E0B" />
                  <Text className="flex-1 ml-3 text-sm" style={{ color: colors.text }}>
                    {blocker}
                  </Text>
                  <TouchableOpacity onPress={() => handleRemoveBlocker(index)}>
                    <MaterialCommunityIcons name="close-circle" size={20} color={colors.textTertiary} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            {/* Add blocker input */}
            <View className="flex-row items-center mb-4">
              <TextInput
                value={blockerInput}
                onChangeText={setBlockerInput}
                placeholder="Describe a blocker..."
                placeholderTextColor={colors.placeholder}
                className="flex-1 rounded-xl px-4 py-3 text-base"
                style={{
                  backgroundColor: colors.inputBackground,
                  borderWidth: 1,
                  borderColor: colors.border,
                  color: colors.text,
                }}
                multiline
                onSubmitEditing={handleAddBlocker}
              />
              <TouchableOpacity
                onPress={handleAddBlocker}
                className="ml-2 w-12 h-12 rounded-xl items-center justify-center"
                style={{ backgroundColor: colors.primary }}
                disabled={!blockerInput.trim()}
              >
                <MaterialCommunityIcons name="plus" size={24} color="white" />
              </TouchableOpacity>
            </View>

            {blockers.length === 0 && (todayStandup?.blockers ?? []).length === 0 && (
              <View
                className="rounded-xl p-4 items-center"
                style={{ backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : '#ECFDF5' }}
              >
                <MaterialCommunityIcons name="check-circle" size={32} color="#10B981" />
                <Text className="mt-2" style={{ color: isDark ? '#6EE7B7' : '#047857' }}>
                  No blockers — clear path ahead!
                </Text>
              </View>
            )}
          </ScrollView>

          <View className="px-4 pb-4 flex-row" style={{ gap: 8 }}>
            <TouchableOpacity
              onPress={() => setStep('tasks')}
              className="flex-1 py-4 rounded-xl items-center"
              style={{ backgroundColor: colors.backgroundSecondary }}
            >
              <Text className="font-medium" style={{ color: colors.text }}>Back</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setStep('mood')}
              className="flex-1 py-4 rounded-xl items-center"
              style={{ backgroundColor: colors.primary }}
            >
              <Text className="text-white font-bold">Continue</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      )}

      {/* ── Step 3: Mood + Summary + Complete ─────────────────────────── */}
      {step === 'mood' && (
        <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <ScrollView className="flex-1 px-4 pt-4">
            <Text className="text-xl font-bold mb-1" style={{ color: colors.text }}>
              How are you feeling?
            </Text>
            <Text className="text-sm mb-4" style={{ color: colors.textSecondary }}>
              Quick check-in before we wrap up
            </Text>

            <View className="flex-row justify-between mb-6" style={{ gap: 6 }}>
              {MOOD_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  onPress={() => setMood(opt.value)}
                  className="flex-1 py-4 rounded-xl items-center"
                  style={{
                    backgroundColor:
                      mood === opt.value
                        ? `${opt.color}20`
                        : colors.backgroundSecondary,
                    borderWidth: mood === opt.value ? 2 : 1,
                    borderColor: mood === opt.value ? opt.color : colors.border,
                  }}
                >
                  <MaterialCommunityIcons
                    name={opt.icon as any}
                    size={28}
                    color={mood === opt.value ? opt.color : colors.textTertiary}
                  />
                  <Text
                    className="text-xs mt-1"
                    style={{
                      color: mood === opt.value ? opt.color : colors.textSecondary,
                      fontWeight: mood === opt.value ? '600' : '400',
                    }}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text className="text-sm font-medium mb-2" style={{ color: colors.text }}>
              Notes (optional)
            </Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Quick thoughts for the day..."
              placeholderTextColor={colors.placeholder}
              className="rounded-xl px-4 py-3 text-base mb-6"
              style={{
                backgroundColor: colors.inputBackground,
                borderWidth: 1,
                borderColor: colors.border,
                color: colors.text,
              }}
              multiline
              numberOfLines={3}
            />

            {/* Summary card */}
            <View className="rounded-xl p-4" style={{ backgroundColor: colors.backgroundSecondary }}>
              <Text className="text-sm font-semibold mb-3" style={{ color: colors.text }}>
                Standup Summary
              </Text>
              <View className="flex-row justify-between">
                <View className="items-center">
                  <Text className="text-2xl font-bold" style={{ color: '#10B981' }}>{doneCount}</Text>
                  <Text className="text-xs" style={{ color: colors.textSecondary }}>Done</Text>
                </View>
                <View className="items-center">
                  <Text className="text-2xl font-bold" style={{ color: '#F59E0B' }}>{inProgressCount}</Text>
                  <Text className="text-xs" style={{ color: colors.textSecondary }}>In Progress</Text>
                </View>
                <View className="items-center">
                  <Text className="text-2xl font-bold" style={{ color: '#EF4444' }}>
                    {blockedCount + blockers.length}
                  </Text>
                  <Text className="text-xs" style={{ color: colors.textSecondary }}>Blockers</Text>
                </View>
                <View className="items-center">
                  <Text className="text-2xl font-bold" style={{ color: colors.primary }}>{totalTasks}</Text>
                  <Text className="text-xs" style={{ color: colors.textSecondary }}>Total</Text>
                </View>
              </View>
            </View>
          </ScrollView>

          <View className="px-4 pb-4 flex-row" style={{ gap: 8 }}>
            <TouchableOpacity
              onPress={() => setStep('blockers')}
              className="flex-1 py-4 rounded-xl items-center"
              style={{ backgroundColor: colors.backgroundSecondary }}
            >
              <Text className="font-medium" style={{ color: colors.text }}>Back</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleComplete}
              disabled={completeStandupMutation.isPending}
              className="flex-1 py-4 rounded-xl items-center flex-row justify-center"
              style={{ backgroundColor: colors.success }}
            >
              {completeStandupMutation.isPending ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <MaterialCommunityIcons name="check" size={20} color="white" />
                  <Text className="text-white font-bold ml-2">Complete</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}
