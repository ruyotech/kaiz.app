/**
 * PlanningTemplatesTab — Inline template browsing for sprint planning wizard.
 *
 * Features:
 * - Browse global templates with life-wheel area filter pills
 * - Multi-select checkboxes for bulk task creation
 * - "Create X Tasks from Templates" bulk action button
 * - Single-template detail tap → CreateFromTemplateSheet (for customization)
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useGlobalTemplates, useBulkCreateTasks } from '../../hooks/queries';
import { useThemeContext } from '../../providers/ThemeProvider';
import { logger } from '../../utils/logger';
import type { TaskTemplate, Task } from '../../types/models';

const LIFE_WHEEL_PILLS = [
  { id: 'all', name: 'All', emoji: '🎯', color: '#6b7280' },
  { id: 'lw-1', name: 'Health', emoji: '💪', color: '#10b981' },
  { id: 'lw-2', name: 'Career', emoji: '💼', color: '#3b82f6' },
  { id: 'lw-3', name: 'Finance', emoji: '💰', color: '#f59e0b' },
  { id: 'lw-4', name: 'Growth', emoji: '📚', color: '#8b5cf6' },
  { id: 'lw-5', name: 'Family', emoji: '❤️', color: '#ef4444' },
  { id: 'lw-6', name: 'Friends', emoji: '👥', color: '#ec4899' },
  { id: 'lw-7', name: 'Fun', emoji: '🎉', color: '#14b8a6' },
  { id: 'lw-8', name: 'Environment', emoji: '🌍', color: '#84cc16' },
];

interface CreatedFromTemplate {
  id: string;
  title: string;
  storyPoints: number;
  lifeWheelAreaId: string;
}

interface PlanningTemplatesTabProps {
  sprintId: string;
  onTasksCreated: (tasks: CreatedFromTemplate[]) => void;
}

export const PlanningTemplatesTab = React.memo(function PlanningTemplatesTab({
  sprintId,
  onTasksCreated,
}: PlanningTemplatesTabProps) {
  const { colors, isDark } = useThemeContext();
  const { data: globalTemplates = [], isLoading } = useGlobalTemplates();
  const bulkCreateMutation = useBulkCreateTasks();

  const [selectedArea, setSelectedArea] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplateIds, setSelectedTemplateIds] = useState<Set<string>>(new Set());

  // Filter templates
  const filteredTemplates = useMemo(() => {
    let result = globalTemplates as TaskTemplate[];
    if (selectedArea !== 'all') {
      result = result.filter(t => t.defaultLifeWheelAreaId === selectedArea);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(t =>
        t.name.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q) ||
        t.tags?.some(tag => tag.toLowerCase().includes(q))
      );
    }
    return result;
  }, [globalTemplates, selectedArea, searchQuery]);

  const toggleTemplate = useCallback((id: string) => {
    setSelectedTemplateIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedTemplateIds(new Set(filteredTemplates.map(t => t.id)));
  }, [filteredTemplates]);

  const deselectAll = useCallback(() => {
    setSelectedTemplateIds(new Set());
  }, []);

  const handleBulkCreate = useCallback(async () => {
    const templates = (globalTemplates as TaskTemplate[]).filter(t => selectedTemplateIds.has(t.id));
    if (templates.length === 0) return;

    const tasks = templates.map(t => ({
      title: t.name,
      description: t.description || '',
      storyPoints: t.defaultStoryPoints || 3,
      lifeWheelAreaId: t.defaultLifeWheelAreaId || 'lw-2',
      eisenhowerQuadrantId: t.defaultEisenhowerQuadrantId || 'eq-2',
      sprintId,
      status: 'TODO',
      createdFromTemplateId: t.id,
    }));

    try {
      const response = await bulkCreateMutation.mutateAsync({ tasks });
      const created: CreatedFromTemplate[] = (response?.created || []).map((task: Task) => ({
        id: task.id,
        title: task.title,
        storyPoints: task.storyPoints || 3,
        lifeWheelAreaId: task.lifeWheelAreaId || 'lw-2',
      }));

      if (created.length > 0) {
        onTasksCreated(created);
        setSelectedTemplateIds(new Set());
      }

      if (response?.errors?.length) {
        logger.warn('PlanningTemplates', `${response.errors.length} templates failed to create tasks`);
      }
    } catch (error: unknown) {
      logger.error('PlanningTemplates', 'Bulk create from templates failed', error instanceof Error ? error : undefined);
    }
  }, [selectedTemplateIds, globalTemplates, sprintId, bulkCreateMutation, onTasksCreated]);

  const selectedCount = selectedTemplateIds.size;

  if (isLoading) {
    return (
      <View className="items-center py-12">
        <ActivityIndicator size="large" color={colors.primary} />
        <Text className="mt-3 text-sm" style={{ color: colors.textSecondary }}>Loading templates…</Text>
      </View>
    );
  }

  return (
    <View className="flex-1">
      {/* Search */}
      <View
        className="flex-row items-center rounded-xl px-3 py-2 mb-2"
        style={{ backgroundColor: colors.backgroundSecondary, borderWidth: 1, borderColor: colors.border }}
      >
        <MaterialCommunityIcons name="magnify" size={18} color={colors.placeholder} />
        <TextInput
          className="flex-1 ml-2 text-sm"
          style={{ color: colors.text }}
          placeholder="Search templates…"
          placeholderTextColor={colors.placeholder}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Life wheel area pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mb-3"
        contentContainerStyle={{ gap: 6 }}
      >
        {LIFE_WHEEL_PILLS.map(area => {
          const isActive = selectedArea === area.id;
          return (
            <TouchableOpacity
              key={area.id}
              onPress={() => setSelectedArea(area.id)}
              className="px-3 py-1.5 rounded-full flex-row items-center"
              style={isActive
                ? { backgroundColor: area.color }
                : { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }
              }
            >
              <Text className="text-xs">{area.emoji}</Text>
              <Text className="text-xs font-medium ml-1" style={{ color: isActive ? '#FFFFFF' : colors.textSecondary }}>
                {area.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Select All / Deselect All */}
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-xs" style={{ color: colors.textTertiary }}>
          {filteredTemplates.length} templates • {selectedCount} selected
        </Text>
        <TouchableOpacity onPress={selectedCount === filteredTemplates.length ? deselectAll : selectAll}>
          <Text className="text-xs font-semibold" style={{ color: colors.primary }}>
            {selectedCount === filteredTemplates.length ? 'Deselect All' : 'Select All'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Template list */}
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {filteredTemplates.length === 0 ? (
          <View className="items-center py-10">
            <MaterialCommunityIcons name="file-document-multiple-outline" size={40} color={colors.textTertiary} />
            <Text className="text-sm mt-2" style={{ color: colors.textSecondary }}>
              No templates found
            </Text>
          </View>
        ) : (
          filteredTemplates.map(template => {
            const isSelected = selectedTemplateIds.has(template.id);
            const areaConfig = LIFE_WHEEL_PILLS.find(a => a.id === template.defaultLifeWheelAreaId) || LIFE_WHEEL_PILLS[0];
            return (
              <TouchableOpacity
                key={template.id}
                onPress={() => toggleTemplate(template.id)}
                className="p-3 rounded-xl mb-2 flex-row items-center"
                style={{
                  backgroundColor: colors.card,
                  borderWidth: 2,
                  borderColor: isSelected ? colors.primary : 'transparent',
                }}
              >
                {/* Checkbox */}
                <View
                  className="w-8 h-8 rounded-lg items-center justify-center mr-3"
                  style={{ backgroundColor: isSelected ? colors.primary : colors.backgroundSecondary }}
                >
                  {isSelected ? (
                    <MaterialCommunityIcons name="check" size={16} color="#FFFFFF" />
                  ) : (
                    <Text className="text-sm">{template.icon || areaConfig.emoji}</Text>
                  )}
                </View>

                {/* Content */}
                <View className="flex-1">
                  <Text className="font-medium" style={{ color: colors.text }} numberOfLines={1}>
                    {template.name}
                  </Text>
                  <View className="flex-row items-center mt-0.5">
                    <Text className="text-xs" style={{ color: areaConfig.color }}>
                      {areaConfig.emoji} {areaConfig.name}
                    </Text>
                    <Text className="text-xs mx-1.5" style={{ color: colors.textTertiary }}>•</Text>
                    <Text className="text-xs" style={{ color: colors.textSecondary }}>
                      {template.defaultStoryPoints || 3} pts
                    </Text>
                    {template.rating > 0 && (
                      <>
                        <Text className="text-xs mx-1.5" style={{ color: colors.textTertiary }}>•</Text>
                        <Text className="text-xs" style={{ color: '#f59e0b' }}>
                          ⭐ {template.rating.toFixed(1)}
                        </Text>
                      </>
                    )}
                  </View>
                </View>

                {/* Points badge */}
                <View className="px-2.5 py-1 rounded-full" style={{ backgroundColor: colors.backgroundSecondary }}>
                  <Text className="font-bold text-xs" style={{ color: colors.text }}>
                    {template.defaultStoryPoints || 3}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* Bulk create button */}
      {selectedCount > 0 && (
        <TouchableOpacity
          onPress={handleBulkCreate}
          disabled={bulkCreateMutation.isPending}
          className="mt-3 p-4 rounded-xl flex-row items-center justify-center"
          style={{ backgroundColor: colors.primary }}
        >
          {bulkCreateMutation.isPending ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <>
              <MaterialCommunityIcons name="playlist-plus" size={20} color="#FFFFFF" />
              <Text className="text-white font-bold ml-2">
                Create {selectedCount} Task{selectedCount !== 1 ? 's' : ''} from Templates
              </Text>
            </>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
});
