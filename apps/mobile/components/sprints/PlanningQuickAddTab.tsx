/**
 * PlanningQuickAddTab — AI-powered bulk task creation for sprint planning.
 *
 * Features:
 * - Multi-line text input (type multiple task ideas, one per line)
 * - "Generate with AI" sends lines to /command-center/sprint-quick-add
 * - Editable draft cards with AI-suggested metadata
 * - "Add All" / individual toggle to select drafts
 * - Manual fallback toggle (create without AI enrichment)
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  useBulkCreateTasks,
  useSprintQuickAddAI,
} from '../../hooks/queries';
import { useThemeContext } from '../../providers/ThemeProvider';
import { logger } from '../../utils/logger';
import type { TaskDraftSuggestion, Task } from '../../types/models';

const FIBONACCI = [1, 2, 3, 5, 8, 13];

interface DraftTask {
  key: string;
  originalLine: string;
  title: string;
  description: string;
  lifeWheelAreaId: string;
  eisenhowerQuadrantId: string;
  storyPoints: number;
  tags: string[];
  aiEnriched: boolean;
  selected: boolean;
}

interface CreatedTask {
  id: string;
  title: string;
  storyPoints: number;
  lifeWheelAreaId: string;
}

interface PlanningQuickAddTabProps {
  sprintId: string;
  onTasksCreated: (tasks: CreatedTask[]) => void;
}

const DIMENSION_META: Record<string, { emoji: string; name: string; color: string }> = {
  'lw-1': { emoji: 'arm-flex-outline', name: 'Health', color: '#10b981' },
  'lw-2': { emoji: 'briefcase-outline', name: 'Career', color: '#3b82f6' },
  'lw-3': { emoji: 'cash-multiple', name: 'Finance', color: '#f59e0b' },
  'lw-4': { emoji: 'book-open-variant', name: 'Growth', color: '#8b5cf6' },
  'lw-5': { emoji: 'heart-outline', name: 'Family', color: '#ef4444' },
  'lw-6': { emoji: 'account-group-outline', name: 'Friends', color: '#ec4899' },
  'lw-7': { emoji: 'party-popper', name: 'Fun', color: '#14b8a6' },
  'lw-8': { emoji: 'earth', name: 'Environment', color: '#84cc16' },
};

export const PlanningQuickAddTab = React.memo(function PlanningQuickAddTab({
  sprintId,
  onTasksCreated,
}: PlanningQuickAddTabProps) {
  const { colors } = useThemeContext();
  const quickAddAI = useSprintQuickAddAI();
  const bulkCreate = useBulkCreateTasks();

  const [rawText, setRawText] = useState('');
  const [drafts, setDrafts] = useState<DraftTask[]>([]);
  const [useAI, setUseAI] = useState(true);

  // Parse lines from multi-line text
  const parseLines = useCallback((text: string): string[] => {
    return text
      .split('\n')
      .map(l => l.replace(/^[-•*\d.)\s]+/, '').trim())
      .filter(l => l.length > 0);
  }, []);

  // Generate drafts — with AI or manually
  const handleGenerate = useCallback(async () => {
    const lines = parseLines(rawText);
    if (lines.length === 0) {
      Alert.alert('Empty', 'Type at least one task idea (one per line).');
      return;
    }
    if (lines.length > 20) {
      Alert.alert('Too many', 'Maximum 20 task lines at once.');
      return;
    }

    if (useAI) {
      try {
        const response = await quickAddAI.mutateAsync({ lines });
        const suggestions: TaskDraftSuggestion[] = response?.suggestions || [];

        const newDrafts: DraftTask[] = suggestions.map((s, i) => ({
          key: `ai-${Date.now()}-${i}`,
          originalLine: s.originalLine,
          title: s.title || s.originalLine,
          description: s.description || '',
          lifeWheelAreaId: s.lifeWheelAreaId || 'lw-4',
          eisenhowerQuadrantId: s.eisenhowerQuadrantId || 'eq-2',
          storyPoints: s.storyPoints || 3,
          tags: s.tags || [],
          aiEnriched: true,
          selected: true,
        }));

        // For lines AI didn't return suggestions for, add basic drafts
        const coveredLines = new Set(suggestions.map(s => s.originalLine.toLowerCase()));
        const uncoveredLines = lines.filter(l => !coveredLines.has(l.toLowerCase()));
        uncoveredLines.forEach((line, i) => {
          newDrafts.push({
            key: `manual-${Date.now()}-${i}`,
            originalLine: line,
            title: line,
            description: '',
            lifeWheelAreaId: 'lw-4',
            eisenhowerQuadrantId: 'eq-2',
            storyPoints: 3,
            tags: [],
            aiEnriched: false,
            selected: true,
          });
        });

        setDrafts(newDrafts);
      } catch (error: unknown) {
        logger.error('PlanningQuickAdd', 'AI enrichment failed, falling back to manual', error instanceof Error ? error : undefined);
        // Fallback: create basic drafts
        createManualDrafts(lines);
      }
    } else {
      createManualDrafts(lines);
    }
  }, [rawText, useAI, quickAddAI, parseLines]);

  const createManualDrafts = useCallback((lines: string[]) => {
    const newDrafts: DraftTask[] = lines.map((line, i) => ({
      key: `manual-${Date.now()}-${i}`,
      originalLine: line,
      title: line,
      description: '',
      lifeWheelAreaId: 'lw-4',
      eisenhowerQuadrantId: 'eq-2',
      storyPoints: 3,
      tags: [],
      aiEnriched: false,
      selected: true,
    }));
    setDrafts(newDrafts);
  }, []);

  const toggleDraft = useCallback((key: string) => {
    setDrafts(prev => prev.map(d =>
      d.key === key ? { ...d, selected: !d.selected } : d
    ));
  }, []);

  const selectAllDrafts = useCallback(() => {
    setDrafts(prev => prev.map(d => ({ ...d, selected: true })));
  }, []);

  const updateDraftPoints = useCallback((key: string, points: number) => {
    setDrafts(prev => prev.map(d =>
      d.key === key ? { ...d, storyPoints: points } : d
    ));
  }, []);

  const removeDraft = useCallback((key: string) => {
    setDrafts(prev => prev.filter(d => d.key !== key));
  }, []);

  const handleBulkCreate = useCallback(async () => {
    const selected = drafts.filter(d => d.selected);
    if (selected.length === 0) return;

    const tasks = selected.map(d => ({
      title: d.title,
      description: d.description,
      storyPoints: d.storyPoints,
      lifeWheelAreaId: d.lifeWheelAreaId,
      eisenhowerQuadrantId: d.eisenhowerQuadrantId,
      sprintId,
      status: 'TODO',
      tags: d.tags.length > 0 ? d.tags : null,
    }));

    try {
      const response = await bulkCreate.mutateAsync({ tasks });
      const created: CreatedTask[] = (response?.created || []).map((t: Task) => ({
        id: t.id,
        title: t.title,
        storyPoints: t.storyPoints || 3,
        lifeWheelAreaId: t.lifeWheelAreaId || 'lw-4',
      }));

      if (created.length > 0) {
        onTasksCreated(created);
        setDrafts([]);
        setRawText('');
      }

      if (response?.errors?.length) {
        Alert.alert(
          'Partial Success',
          `${created.length} tasks created, ${response.errors.length} failed.`
        );
      }
    } catch (error: unknown) {
      logger.error('PlanningQuickAdd', 'Bulk create failed', error instanceof Error ? error : undefined);
      Alert.alert('Error', 'Failed to create tasks. Please try again.');
    }
  }, [drafts, sprintId, bulkCreate, onTasksCreated]);

  const selectedDraftCount = drafts.filter(d => d.selected).length;
  const totalSelectedPoints = drafts.filter(d => d.selected).reduce((sum, d) => sum + d.storyPoints, 0);
  const isGenerating = quickAddAI.isPending;
  const isCreating = bulkCreate.isPending;

  return (
    <View className="flex-1">
      {drafts.length === 0 ? (
        /* ── Input phase ── */
        <>
          <Text className="text-sm font-semibold mb-2" style={{ color: colors.textSecondary }}>
            Type your task ideas (one per line)
          </Text>

          <View className="rounded-2xl p-4 mb-3" style={{ backgroundColor: colors.card }}>
            <TextInput
              value={rawText}
              onChangeText={setRawText}
              placeholder={"Visit doctor\nWalk 30 minutes\nCall mum\nRead 20 pages\nReview budget"}
              placeholderTextColor={colors.placeholder}
              className="text-base mb-3"
              style={{
                color: colors.text,
                minHeight: 140,
                textAlignVertical: 'top',
              }}
              multiline
              numberOfLines={7}
              autoFocus
            />

            {/* AI toggle */}
            <TouchableOpacity
              onPress={() => setUseAI(!useAI)}
              className="flex-row items-center mb-3 py-2"
            >
              <View
                className="w-5 h-5 rounded-md items-center justify-center mr-2"
                style={{ backgroundColor: useAI ? colors.primary : colors.backgroundSecondary }}
              >
                {useAI && <MaterialCommunityIcons name="check" size={14} color="#FFFFFF" />}
              </View>
              <Text className="text-sm" style={{ color: colors.text }}>
                Enrich with AI (auto-assign life area, points, priority)
              </Text>
            </TouchableOpacity>

            {/* Generate button */}
            <TouchableOpacity
              onPress={handleGenerate}
              disabled={!rawText.trim() || isGenerating}
              className="p-3.5 rounded-xl flex-row items-center justify-center"
              style={{ backgroundColor: rawText.trim() ? colors.primary : colors.textTertiary }}
            >
              {isGenerating ? (
                <>
                  <ActivityIndicator color="#FFFFFF" size="small" />
                  <Text className="text-white font-semibold ml-2">Generating…</Text>
                </>
              ) : (
                <>
                  <MaterialCommunityIcons
                    name={useAI ? 'auto-fix' : 'playlist-plus'}
                    size={20}
                    color="#FFFFFF"
                  />
                  <Text className="text-white font-bold ml-2">
                    {useAI ? 'Generate with AI' : 'Create Drafts'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          <Text className="text-xs text-center" style={{ color: colors.textTertiary }}>
            {useAI
              ? 'AI will categorize each line into life areas, set story points, and suggest priorities'
              : 'Tasks will be created with default settings — you can edit them later'}
          </Text>
        </>
      ) : (
        /* ── Draft review phase ── */
        <>
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-sm font-semibold" style={{ color: colors.textSecondary }}>
              {drafts.length} draft{drafts.length !== 1 ? 's' : ''} • {selectedDraftCount} selected • {totalSelectedPoints} pts
            </Text>
            <View className="flex-row">
              <TouchableOpacity onPress={selectAllDrafts} className="mr-3">
                <Text className="text-xs font-semibold" style={{ color: colors.primary }}>Select All</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { setDrafts([]); setRawText(''); }}>
                <Text className="text-xs font-semibold" style={{ color: colors.error }}>Clear</Text>
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            {drafts.map(draft => {
              const dim = DIMENSION_META[draft.lifeWheelAreaId] || DIMENSION_META['lw-2'];
              return (
                <View
                  key={draft.key}
                  className="p-3 rounded-xl mb-2"
                  style={{
                    backgroundColor: colors.card,
                    borderWidth: 2,
                    borderColor: draft.selected ? colors.primary : 'transparent',
                    opacity: draft.selected ? 1 : 0.6,
                  }}
                >
                  <View className="flex-row items-start">
                    {/* Checkbox */}
                    <TouchableOpacity
                      onPress={() => toggleDraft(draft.key)}
                      className="w-8 h-8 rounded-lg items-center justify-center mr-3 mt-0.5"
                      style={{ backgroundColor: draft.selected ? colors.primary : colors.backgroundSecondary }}
                    >
                      {draft.selected && (
                        <MaterialCommunityIcons name="check" size={16} color="#FFFFFF" />
                      )}
                    </TouchableOpacity>

                    {/* Content */}
                    <View className="flex-1">
                      <Text className="font-medium text-sm" style={{ color: colors.text }}>{draft.title}</Text>
                      {draft.description ? (
                        <Text className="text-xs mt-0.5" style={{ color: colors.textSecondary }} numberOfLines={2}>
                          {draft.description}
                        </Text>
                      ) : null}
                      <View className="flex-row items-center mt-1.5 flex-wrap gap-1.5">
                        <View className="flex-row items-center px-2 py-0.5 rounded-full" style={{ backgroundColor: dim.color + '20' }}>
                          <Text className="text-xs">{dim.emoji}</Text>
                          <Text className="text-xs ml-1 font-medium" style={{ color: dim.color }}>{dim.name}</Text>
                        </View>
                        {draft.aiEnriched && (
                          <View className="flex-row items-center px-2 py-0.5 rounded-full" style={{ backgroundColor: '#8b5cf620' }}>
                            <Text className="text-xs" style={{ color: '#8b5cf6' }}>AI</Text>
                          </View>
                        )}
                        {draft.tags.slice(0, 2).map(tag => (
                          <View key={tag} className="px-2 py-0.5 rounded-full" style={{ backgroundColor: colors.backgroundSecondary }}>
                            <Text className="text-xs" style={{ color: colors.textSecondary }}>{tag}</Text>
                          </View>
                        ))}
                      </View>
                    </View>

                    {/* Remove button */}
                    <TouchableOpacity onPress={() => removeDraft(draft.key)} className="ml-2">
                      <MaterialCommunityIcons name="close" size={18} color={colors.textTertiary} />
                    </TouchableOpacity>
                  </View>

                  {/* Story points selector */}
                  <View className="flex-row items-center mt-2 ml-11">
                    <Text className="text-xs mr-2" style={{ color: colors.textSecondary }}>Points:</Text>
                    {FIBONACCI.slice(0, 5).map(pts => (
                      <TouchableOpacity
                        key={pts}
                        onPress={() => updateDraftPoints(draft.key, pts)}
                        className="w-7 h-7 rounded-md items-center justify-center mx-0.5"
                        style={{
                          backgroundColor: draft.storyPoints === pts ? colors.primary : colors.backgroundSecondary,
                        }}
                      >
                        <Text className="text-xs font-bold" style={{
                          color: draft.storyPoints === pts ? '#FFFFFF' : colors.text,
                        }}>
                          {pts}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              );
            })}
          </ScrollView>

          {/* Bulk create button */}
          {selectedDraftCount > 0 && (
            <TouchableOpacity
              onPress={handleBulkCreate}
              disabled={isCreating}
              className="mt-3 p-4 rounded-xl flex-row items-center justify-center"
              style={{ backgroundColor: '#10B981' }}
            >
              {isCreating ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <MaterialCommunityIcons name="rocket-launch" size={20} color="#FFFFFF" />
                  <Text className="text-white font-bold ml-2">
                    Add {selectedDraftCount} Task{selectedDraftCount !== 1 ? 's' : ''} to Sprint ({totalSelectedPoints} pts)
                  </Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </>
      )}
    </View>
  );
});
