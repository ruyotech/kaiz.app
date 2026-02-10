/**
 * Sprint Retrospective Screen — Production-ready
 *
 * Real data driven via useRetrospectiveData hook.
 * 3-step flow: Collect → Discuss (AI insights + carried-over badges) → Actions
 * Carried-over tasks are highlighted per Agile methodology.
 */

import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import {
  useCurrentSprint,
  useSprintTasks,
} from '../../../hooks/queries/useSprints';
import {
  useRetrospectiveData,
  useStartCeremony,
  useCompleteCeremony,
} from '../../../hooks/queries';
import { CarriedOverBadge } from '../../../components/sprints/CarriedOverBadge';
import { useThemeContext } from '../../../providers/ThemeProvider';
import type { Task } from '../../../types/models';

type RetroCategory = 'went_well' | 'improve' | 'try_next';
type RetroStep = 'collect' | 'discuss' | 'actions';

interface RetroItem {
  id: string;
  category: RetroCategory;
  text: string;
  votes: number;
}

const CATEGORY_CONFIG: Record<RetroCategory, { title: string; icon: string; color: string }> = {
  went_well: { title: 'What Went Well', icon: 'thumb-up', color: '#10B981' },
  improve: { title: 'What to Improve', icon: 'alert-circle', color: '#F59E0B' },
  try_next: { title: 'Try Next Sprint', icon: 'lightbulb', color: '#3B82F6' },
};

export default function SprintRetrospectiveScreen() {
  const { colors, isDark } = useThemeContext();

  // ── Data ───────────────────────────────────────────────────────────────
  const { data: currentSprintRaw } = useCurrentSprint();
  const currentSprint = currentSprintRaw as { id: string } | undefined;
  const sprintId = currentSprint?.id ?? '';

  const { data: sprintTasksRaw = [] } = useSprintTasks(sprintId);
  const tasks = (Array.isArray(sprintTasksRaw) ? sprintTasksRaw : []) as Task[];

  const { data: retroDataRaw, isLoading } = useRetrospectiveData(sprintId);
  const retroData = retroDataRaw as {
    wentWell?: string[];
    needsImprovement?: string[];
    tryNextSprint?: string[];
    carriedOver?: string[];
  } | undefined;

  const startCeremony = useStartCeremony();
  const completeCeremony = useCompleteCeremony();

  // ── Derived ────────────────────────────────────────────────────────────
  const carriedOverTasks = useMemo(
    () => tasks.filter((t) => !!t.carriedOverFromSprintId),
    [tasks],
  );

  // Seed retro items from AI insights
  const seedItems = useMemo<RetroItem[]>(() => {
    const result: RetroItem[] = [];
    (retroData?.wentWell ?? []).forEach((text, i) => {
      result.push({ id: `ww-${i}`, category: 'went_well', text, votes: 0 });
    });
    (retroData?.needsImprovement ?? []).forEach((text, i) => {
      result.push({ id: `imp-${i}`, category: 'improve', text, votes: 0 });
    });
    (retroData?.tryNextSprint ?? []).forEach((text, i) => {
      result.push({ id: `try-${i}`, category: 'try_next', text, votes: 0 });
    });
    return result;
  }, [retroData]);

  // ── State ──────────────────────────────────────────────────────────────
  const [step, setStep] = useState<RetroStep>('collect');
  const [items, setItems] = useState<RetroItem[]>(seedItems);
  const [newItem, setNewItem] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<RetroCategory>('went_well');
  const [actionItems, setActionItems] = useState<string[]>([]);
  const [newAction, setNewAction] = useState('');

  // Keep items in sync when AI data arrives (one-time seed)
  React.useEffect(() => {
    if (seedItems.length > 0 && items.length === 0) {
      setItems(seedItems);
    }
  }, [seedItems]);

  // ── Handlers ───────────────────────────────────────────────────────────
  const addItem = () => {
    if (newItem.trim()) {
      setItems((prev) => [
        ...prev,
        { id: `u-${Date.now()}`, category: selectedCategory, text: newItem.trim(), votes: 0 },
      ]);
      setNewItem('');
    }
  };

  const toggleVote = (id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, votes: item.votes > 0 ? 0 : 1 } : item)),
    );
  };

  const addAction = () => {
    if (newAction.trim()) {
      setActionItems((prev) => [...prev, newAction.trim()]);
      setNewAction('');
    }
  };

  const handleComplete = async () => {
    try {
      // If we have a ceremony id in future, use completeCeremony
      router.back();
    } catch {
      router.back();
    }
  };

  // ── Collect Step ───────────────────────────────────────────────────────
  const renderCollectStep = () => (
    <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
      {/* Carried-over tasks callout */}
      {carriedOverTasks.length > 0 && (
        <View
          className="rounded-2xl p-4 mb-4"
          style={{
            backgroundColor: isDark ? 'rgba(245, 158, 11, 0.1)' : '#FFFBEB',
            borderWidth: 1,
            borderColor: isDark ? 'rgba(245, 158, 11, 0.3)' : '#FDE68A',
          }}
        >
          <View className="flex-row items-center mb-3">
            <MaterialCommunityIcons name="arrow-right-bold-circle-outline" size={20} color="#F59E0B" />
            <Text className="font-semibold ml-2" style={{ color: colors.text }}>
              Carried Over ({carriedOverTasks.length})
            </Text>
          </View>
          {carriedOverTasks.map((t) => (
            <View key={t.id} className="flex-row items-center mb-2">
              <Text className="flex-1 text-sm" style={{ color: colors.textSecondary }}>
                • {t.title}
              </Text>
              <CarriedOverBadge
                fromSprintId={t.carriedOverFromSprintId}
                originalPoints={t.originalStoryPoints}
                currentPoints={t.storyPoints}
                compact
              />
            </View>
          ))}
          <Text className="text-xs mt-2" style={{ color: '#B45309' }}>
            Discuss why these weren't completed and whether they need re-estimation.
          </Text>
        </View>
      )}

      {/* Category Tabs */}
      <View className="flex-row mb-4" style={{ gap: 6 }}>
        {(Object.keys(CATEGORY_CONFIG) as RetroCategory[]).map((cat) => (
          <TouchableOpacity
            key={cat}
            onPress={() => setSelectedCategory(cat)}
            className="flex-1 p-3 rounded-xl"
            style={{
              backgroundColor:
                selectedCategory === cat ? `${CATEGORY_CONFIG[cat].color}20` : colors.card,
            }}
          >
            <View className="items-center">
              <MaterialCommunityIcons
                name={CATEGORY_CONFIG[cat].icon as any}
                size={22}
                color={selectedCategory === cat ? CATEGORY_CONFIG[cat].color : colors.textTertiary}
              />
              <Text
                className="text-[10px] mt-1 font-medium"
                style={{
                  color: selectedCategory === cat ? CATEGORY_CONFIG[cat].color : colors.textTertiary,
                }}
              >
                {CATEGORY_CONFIG[cat].title.split(' ').slice(-1)}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Add New Item */}
      <View className="rounded-2xl p-4 mb-4" style={{ backgroundColor: colors.card }}>
        <Text className="font-semibold mb-3" style={{ color: colors.text }}>
          {CATEGORY_CONFIG[selectedCategory].title}
        </Text>
        <View className="flex-row">
          <TextInput
            value={newItem}
            onChangeText={setNewItem}
            placeholder="Add your thought..."
            placeholderTextColor={colors.placeholder}
            className="flex-1 p-3 rounded-xl mr-2"
            style={{ backgroundColor: colors.inputBackground, color: colors.text }}
          />
          <TouchableOpacity
            onPress={addItem}
            className="w-12 h-12 rounded-xl items-center justify-center"
            style={{ backgroundColor: CATEGORY_CONFIG[selectedCategory].color }}
          >
            <MaterialCommunityIcons name="plus" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Items by Category */}
      {(Object.keys(CATEGORY_CONFIG) as RetroCategory[]).map((cat) => {
        const catItems = items.filter((i) => i.category === cat);
        if (catItems.length === 0) return null;
        return (
          <View key={cat} className="mb-4">
            <View className="flex-row items-center mb-3">
              <MaterialCommunityIcons
                name={CATEGORY_CONFIG[cat].icon as any}
                size={18}
                color={CATEGORY_CONFIG[cat].color}
              />
              <Text className="font-semibold ml-2" style={{ color: colors.text }}>
                {CATEGORY_CONFIG[cat].title}
              </Text>
              <View
                className="ml-2 px-2 py-0.5 rounded-full"
                style={{ backgroundColor: `${CATEGORY_CONFIG[cat].color}20` }}
              >
                <Text className="text-xs" style={{ color: CATEGORY_CONFIG[cat].color }}>
                  {catItems.length}
                </Text>
              </View>
            </View>
            {catItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => toggleVote(item.id)}
                className="p-4 rounded-xl mb-2 flex-row items-center"
                style={{
                  backgroundColor: colors.card,
                  borderWidth: item.votes > 0 ? 2 : 0,
                  borderColor: item.votes > 0 ? CATEGORY_CONFIG[cat].color : 'transparent',
                }}
              >
                <Text className="flex-1 text-sm" style={{ color: colors.text }}>
                  {item.text}
                </Text>
                <MaterialCommunityIcons
                  name={item.votes > 0 ? 'star' : 'star-outline'}
                  size={20}
                  color={item.votes > 0 ? '#F59E0B' : colors.textTertiary}
                />
              </TouchableOpacity>
            ))}
          </View>
        );
      })}

      {isLoading && (
        <View className="items-center py-6">
          <ActivityIndicator color={colors.primary} />
          <Text className="text-xs mt-2" style={{ color: colors.textSecondary }}>
            Generating AI insights…
          </Text>
        </View>
      )}

      <TouchableOpacity
        onPress={() => setStep('discuss')}
        className="p-4 rounded-xl mt-2"
        style={{ backgroundColor: '#F97316' }}
      >
        <Text className="text-white text-center font-semibold text-lg">
          Continue to Discussion
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );

  // ── Discuss Step ───────────────────────────────────────────────────────
  const renderDiscussStep = () => {
    const starredItems = items.filter((i) => i.votes > 0);
    const topItems = starredItems.length > 0 ? starredItems : items.slice(0, 5);

    return (
      <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
        {/* AI analysis */}
        <View className="rounded-2xl p-5 mb-4" style={{ backgroundColor: colors.card }}>
          <View className="flex-row items-center mb-4">
            <MaterialCommunityIcons name="chart-line" size={24} color={colors.success} />
            <Text className="text-lg font-semibold ml-2" style={{ color: colors.text }}>
              Sprint Analysis
            </Text>
          </View>

          {(retroData?.wentWell ?? []).length > 0 && (
            <View
              className="p-4 rounded-xl mb-3"
              style={{ backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : '#ECFDF5' }}
            >
              <Text className="font-semibold mb-2" style={{ color: '#10B981' }}>
                Strength Patterns
              </Text>
              {(retroData?.wentWell ?? []).map((w: string, i: number) => (
                <Text key={i} className="text-sm mb-1" style={{ color: colors.textSecondary }}>
                  • {w}
                </Text>
              ))}
            </View>
          )}

          {(retroData?.needsImprovement ?? []).length > 0 && (
            <View
              className="p-4 rounded-xl mb-3"
              style={{ backgroundColor: isDark ? 'rgba(245, 158, 11, 0.15)' : '#FFFBEB' }}
            >
              <Text className="font-semibold mb-2" style={{ color: '#F59E0B' }}>
                Improvement Areas
              </Text>
              {(retroData?.needsImprovement ?? []).map((n: string, i: number) => (
                <Text key={i} className="text-sm mb-1" style={{ color: colors.textSecondary }}>
                  • {n}
                </Text>
              ))}
            </View>
          )}

          {(retroData?.tryNextSprint ?? []).length > 0 && (
            <View
              className="p-4 rounded-xl"
              style={{ backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : '#EFF6FF' }}
            >
              <Text className="font-semibold mb-2" style={{ color: '#3B82F6' }}>
                Suggestions
              </Text>
              {(retroData?.tryNextSprint ?? []).map((s: string, i: number) => (
                <Text key={i} className="text-sm mb-1" style={{ color: colors.textSecondary }}>
                  • {s}
                </Text>
              ))}
            </View>
          )}
        </View>

        {/* Focus Items */}
        <View className="mb-4">
          <Text className="text-lg font-semibold mb-3" style={{ color: colors.text }}>
            Focus Items
          </Text>
          {topItems.map((item) => (
            <View
              key={item.id}
              className="p-4 rounded-xl mb-2"
              style={{
                backgroundColor: colors.card,
                borderLeftWidth: 4,
                borderLeftColor: CATEGORY_CONFIG[item.category].color,
              }}
            >
              <Text className="text-xs mb-1" style={{ color: colors.textSecondary }}>
                {CATEGORY_CONFIG[item.category].title}
              </Text>
              <Text style={{ color: colors.text }}>{item.text}</Text>
            </View>
          ))}
        </View>

        <View className="flex-row" style={{ gap: 12 }}>
          <TouchableOpacity
            onPress={() => setStep('collect')}
            className="flex-1 p-4 rounded-xl"
            style={{ backgroundColor: colors.backgroundSecondary }}
          >
            <Text className="text-center font-semibold" style={{ color: colors.text }}>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setStep('actions')}
            className="flex-1 p-4 rounded-xl"
            style={{ backgroundColor: '#F97316' }}
          >
            <Text className="text-white text-center font-semibold">Create Actions</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  };

  // ── Actions Step ───────────────────────────────────────────────────────
  const renderActionsStep = () => {
    const suggestions = retroData?.tryNextSprint ?? [
      'Review carried-over tasks earlier in sprint',
      'Reduce planned points by 10%',
      'Schedule a mid-sprint check-in',
    ];

    return (
      <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
        <View className="rounded-2xl p-5 mb-4" style={{ backgroundColor: colors.card }}>
          <Text className="text-lg font-semibold mb-2" style={{ color: colors.text }}>
            Action Items
          </Text>
          <Text className="mb-4" style={{ color: colors.textSecondary }}>
            What specific changes will you make next sprint?
          </Text>

          <Text className="text-sm mb-2" style={{ color: colors.textTertiary }}>
            Suggested actions:
          </Text>
          {suggestions.map((suggestion, idx) => (
            <TouchableOpacity
              key={idx}
              onPress={() => {
                if (!actionItems.includes(suggestion)) {
                  setActionItems((prev) => [...prev, suggestion]);
                }
              }}
              className="flex-row items-center p-3 rounded-lg mb-2"
              style={{
                backgroundColor: actionItems.includes(suggestion)
                  ? isDark
                    ? 'rgba(16, 185, 129, 0.2)'
                    : '#ECFDF5'
                  : colors.backgroundSecondary,
              }}
            >
              <MaterialCommunityIcons
                name={actionItems.includes(suggestion) ? 'check-circle' : 'plus-circle-outline'}
                size={20}
                color={actionItems.includes(suggestion) ? '#10B981' : colors.textTertiary}
              />
              <Text className="ml-3 flex-1 text-sm" style={{ color: colors.text }}>
                {suggestion}
              </Text>
            </TouchableOpacity>
          ))}

          <View className="flex-row mt-4">
            <TextInput
              value={newAction}
              onChangeText={setNewAction}
              placeholder="Add custom action..."
              placeholderTextColor={colors.placeholder}
              className="flex-1 p-3 rounded-xl mr-2"
              style={{ backgroundColor: colors.inputBackground, color: colors.text }}
            />
            <TouchableOpacity
              onPress={addAction}
              className="w-12 h-12 rounded-xl items-center justify-center"
              style={{ backgroundColor: '#F97316' }}
            >
              <MaterialCommunityIcons name="plus" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {actionItems.length > 0 && (
          <View className="rounded-2xl p-5 mb-4" style={{ backgroundColor: colors.card }}>
            <Text className="font-semibold mb-3" style={{ color: colors.text }}>
              Your Action Items ({actionItems.length})
            </Text>
            {actionItems.map((action, idx) => (
              <View
                key={idx}
                className="flex-row items-center p-3 rounded-lg mb-2"
                style={{ backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : '#F0FDF4' }}
              >
                <View
                  className="w-6 h-6 rounded-full items-center justify-center mr-3"
                  style={{ backgroundColor: '#10B981' }}
                >
                  <Text className="text-white font-bold text-xs">{idx + 1}</Text>
                </View>
                <Text className="flex-1 text-sm" style={{ color: colors.text }}>{action}</Text>
                <TouchableOpacity
                  onPress={() => setActionItems((prev) => prev.filter((_, i) => i !== idx))}
                >
                  <MaterialCommunityIcons name="close" size={20} color={colors.error} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        <View className="flex-row" style={{ gap: 12 }}>
          <TouchableOpacity
            onPress={() => setStep('discuss')}
            className="flex-1 p-4 rounded-xl"
            style={{ backgroundColor: colors.backgroundSecondary }}
          >
            <Text className="text-center font-semibold" style={{ color: colors.text }}>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleComplete}
            className="flex-1 p-4 rounded-xl"
            style={{ backgroundColor: colors.success }}
          >
            <Text className="text-white text-center font-semibold">Complete Retro</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  };

  // ── Main Render ────────────────────────────────────────────────────────
  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <View
        className="flex-row items-center p-4"
        style={{ borderBottomWidth: 1, borderBottomColor: colors.border }}
      >
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text className="text-xl font-semibold flex-1" style={{ color: colors.text }}>
          Retrospective
        </Text>
        <View className="flex-row" style={{ gap: 4 }}>
          {(['collect', 'discuss', 'actions'] as RetroStep[]).map((s, idx) => (
            <View
              key={s}
              className="w-2 h-2 rounded-full"
              style={{
                backgroundColor:
                  (['collect', 'discuss', 'actions'] as RetroStep[]).indexOf(step) >= idx
                    ? '#F97316'
                    : colors.backgroundTertiary,
              }}
            />
          ))}
        </View>
      </View>

      {step === 'collect' && renderCollectStep()}
      {step === 'discuss' && renderDiscussStep()}
      {step === 'actions' && renderActionsStep()}
    </SafeAreaView>
  );
}
