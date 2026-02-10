import { logger } from '../../../utils/logger';
/**
 * Create From SensAI Screen
 * 
 * Creates a task/event from AI-generated draft data.
 * Similar to CreateFromTemplateSheet but for AI drafts.
 * User can select sprint/backlog and customize before final creation.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Pressable,
  Platform,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Container } from '../../../components/layout/Container';
import { ScreenHeader } from '../../../components/layout/ScreenHeader';
import { taskApi, sprintApi, lifeWheelApi } from '../../../services/api';
import { useThemeContext } from '../../../providers/ThemeProvider';
import { STORY_POINTS } from '../../../utils/constants';
import { TaskScheduler } from '../../../components/ui/TaskScheduler';
import { TaskScheduleState, createDefaultScheduleState, TaskType } from '../../../types/schedule.types';

// ============================================================================
// Types
// ============================================================================

interface Sprint {
  id: string;
  name: string;
  weekNumber: number;
  startDate: string;
  endDate: string;
}

interface EisenhowerQuadrant {
  id: string;
  name: string;
  label: string;
  color: string;
}

interface DraftData {
  title: string;
  description?: string;
  lifeWheelAreaId?: string;
  eisenhowerQuadrantId?: string;
  storyPoints?: number;
  dueDate?: string;
  taskType?: TaskType;
  location?: string;
  isAllDay?: boolean;
  startTime?: string;
  endTime?: string;
  isRecurring?: boolean;
  aiReasoning?: string;
  aiSummary?: string;
}

// ============================================================================
// Constants
// ============================================================================

const LIFE_WHEEL_CONFIG: Record<string, { color: string; name: string; icon: string }> = {
  'lw-1': { color: '#10B981', name: 'Health & Fitness', icon: 'run' },
  'lw-2': { color: '#3B82F6', name: 'Career & Work', icon: 'briefcase-outline' },
  'lw-3': { color: '#F59E0B', name: 'Finance', icon: 'cash-multiple' },
  'lw-4': { color: '#8B5CF6', name: 'Personal Growth', icon: 'book-open-variant' },
  'lw-5': { color: '#EF4444', name: 'Relationships', icon: 'heart-outline' },
  'lw-6': { color: '#EC4899', name: 'Creativity', icon: 'palette-outline' },
  'lw-7': { color: '#F97316', name: 'Fun & Recreation', icon: 'party-popper' },
  'lw-8': { color: '#06B6D4', name: 'Contribution', icon: 'earth' },
};

// ============================================================================
// Helpers
// ============================================================================

const parseTimeFromString = (timeStr?: string): { hour: number; minute: number } | null => {
  if (!timeStr) return null;
  if (timeStr.includes(':')) {
    const [hourStr, minuteStr] = timeStr.split(':');
    const hour = parseInt(hourStr, 10);
    const minute = parseInt(minuteStr, 10);
    if (!isNaN(hour) && !isNaN(minute)) return { hour, minute };
  }
  if (timeStr.includes('T')) {
    const timePart = timeStr.split('T')[1];
    if (timePart) {
      const [hourStr, minuteStr] = timePart.split(':');
      const hour = parseInt(hourStr, 10);
      const minute = parseInt(minuteStr, 10);
      if (!isNaN(hour) && !isNaN(minute)) return { hour, minute };
    }
  }
  return null;
};

// ============================================================================
// Main Screen
// ============================================================================

export default function CreateFromSensAIScreen() {

  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useThemeContext();
  const params = useLocalSearchParams<{ 
    draftData: string;
    sessionId?: string;
    clearChat?: string;
  }>();

  // Parse draft data from params with error handling
  const parseDraftData = useCallback((): DraftData => {
    logger.log('[CreateFromSensAI] Raw params.draftData:', params.draftData);
    logger.log('[CreateFromSensAI] params.draftData type:', typeof params.draftData);
    
    if (!params.draftData) {
      logger.log('[CreateFromSensAI] No draftData in params');
      return { title: '' };
    }
    
    try {
      // Handle if draftData is already an object (shouldn't happen but safety check)
      if (typeof params.draftData === 'object') {
        logger.log('[CreateFromSensAI] draftData is already an object');
        return params.draftData as unknown as DraftData;
      }
      
      const parsed = JSON.parse(params.draftData);
      logger.log('[CreateFromSensAI] Parsed draft data:', JSON.stringify(parsed, null, 2));
      return parsed;
    } catch (error) {
      logger.error('[CreateFromSensAI] Failed to parse draftData:', error);
      logger.error('[CreateFromSensAI] Raw value was:', params.draftData);
      return { title: '' };
    }
  }, [params.draftData]);
  
  const initialDraft: DraftData = parseDraftData();

  // =========================================================================
  // State
  // =========================================================================

  // Form data - Initialize from AI data
  const [title, setTitle] = useState(initialDraft.title || '');
  const [description, setDescription] = useState(initialDraft.description || '');
  const [storyPoints, setStoryPoints] = useState(initialDraft.storyPoints || 3);
  const [eisenhowerQuadrantId, setEisenhowerQuadrantId] = useState(initialDraft.eisenhowerQuadrantId || 'eq-2');
  const [selectedLifeWheelAreaId, setSelectedLifeWheelAreaId] = useState(initialDraft.lifeWheelAreaId || 'lw-4');
  
  // Schedule state (unified via TaskScheduler — includes sprint/backlog assignment)
  const [schedule, setSchedule] = useState<TaskScheduleState>(() => {
    const taskType: TaskType = initialDraft.taskType || 'TASK';
    const date = initialDraft.dueDate ? new Date(initialDraft.dueDate) : new Date();
    
    // Parse start/end times
    let startTime = new Date(date);
    startTime.setHours(9, 0, 0, 0);
    let endTimeVal = new Date(date);
    endTimeVal.setHours(10, 0, 0, 0);
    
    if (initialDraft.startTime) {
      const parsed = parseTimeFromString(initialDraft.startTime);
      if (parsed) {
        startTime = new Date(date);
        startTime.setHours(parsed.hour, parsed.minute, 0, 0);
      }
    }
    if (initialDraft.endTime) {
      const parsed = parseTimeFromString(initialDraft.endTime);
      if (parsed) {
        endTimeVal = new Date(date);
        endTimeVal.setHours(parsed.hour, parsed.minute, 0, 0);
      }
    }
    
    return {
      ...createDefaultScheduleState(taskType),
      date,
      time: startTime,
      endTime: endTimeVal,
      allDay: initialDraft.isAllDay || false,
      location: initialDraft.location || '',
    };
  });

  // Data loading
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [quadrants, setQuadrants] = useState<EisenhowerQuadrant[]>([]);
  const [lifeWheelAreas, setLifeWheelAreas] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // UI state
  const [showLifeWheelPicker, setShowLifeWheelPicker] = useState(false);
  const [showStoryPointsPicker, setShowStoryPointsPicker] = useState(false);
  
  // Update state when params change (Expo Router may load params async)
  useEffect(() => {
    const draft = parseDraftData();
    logger.log('[CreateFromSensAI] Params changed, updating form with:', draft);
    
    if (draft.title) {
      setTitle(draft.title);
    }
    if (draft.description) {
      setDescription(draft.description);
    }
    if (draft.storyPoints) {
      setStoryPoints(draft.storyPoints);
    }
    if (draft.eisenhowerQuadrantId) {
      setEisenhowerQuadrantId(draft.eisenhowerQuadrantId);
    }
    if (draft.lifeWheelAreaId) {
      setSelectedLifeWheelAreaId(draft.lifeWheelAreaId);
    }
    if (draft.dueDate) {
      const parsed = new Date(draft.dueDate);
      if (!isNaN(parsed.getTime())) {
        setSchedule(prev => ({ ...prev, date: parsed }));
      }
    }
    if (draft.location) {
      setSchedule(prev => ({ ...prev, location: draft.location || '' }));
    }
    if (typeof draft.isAllDay === 'boolean') {
      setSchedule(prev => ({ ...prev, allDay: draft.isAllDay || false }));
    }
    if (draft.taskType) {
      setSchedule(prev => ({ ...prev, taskType: draft.taskType || 'TASK' }));
    }
    // Parse and update time fields
    if (draft.startTime) {
      const parsed = parseTimeFromString(draft.startTime);
      if (parsed) {
        setSchedule(prev => {
          const st = new Date(prev.date);
          st.setHours(parsed.hour, parsed.minute, 0, 0);
          return { ...prev, time: st };
        });
      }
    }
    if (draft.endTime) {
      const parsed = parseTimeFromString(draft.endTime);
      if (parsed) {
        setSchedule(prev => {
          const et = new Date(prev.date);
          et.setHours(parsed.hour, parsed.minute, 0, 0);
          return { ...prev, endTime: et };
        });
      }
    }
  }, [params.draftData]);
  
  // Log initial state for debugging
  useEffect(() => {
    logger.log('[CreateFromSensAI] Current form state:', {
      title,
      description,
      storyPoints,
      eisenhowerQuadrantId,
      selectedLifeWheelAreaId,
      schedule: {
        taskType: schedule.taskType,
        date: schedule.date,
        isAllDay: schedule.allDay,
        location: schedule.location,
      },
    });
  }, [title, description, schedule.taskType]);

  // =========================================================================
  // Data Fetching
  // =========================================================================

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoadingData(true);
    try {
      await Promise.all([
        fetchSprints(),
        fetchQuadrants(),
        fetchLifeWheelAreas(),
      ]);
    } finally {
      setIsLoadingData(false);
    }
  };

  const fetchSprints = async () => {
    try {
      const currentYear = new Date().getFullYear();
      const sprintData = await sprintApi.getSprints(currentYear) as Sprint[];
      const now = new Date();
      
      const availableSprints = sprintData
        .filter((s: Sprint) => new Date(s.endDate) >= now)
        .sort((a: Sprint, b: Sprint) => 
          new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
        );
      
      setSprints(availableSprints);
      // Auto-set first sprint (current) in schedule if none selected
      if (availableSprints.length > 0) {
        setSchedule(prev => prev.sprintId ? prev : { ...prev, sprintId: availableSprints[0].id });
      }
    } catch (error) {
      logger.error('Failed to load sprints:', error);
    }
  };

  const fetchQuadrants = async () => {
    try {
      const quadrantsData = await lifeWheelApi.getEisenhowerQuadrants() as EisenhowerQuadrant[];
      setQuadrants(quadrantsData);
    } catch (error) {
      logger.error('Failed to load quadrants:', error);
      setQuadrants([
        { id: 'eq-1', name: 'Do First', label: 'Urgent & Important', color: '#DC2626' },
        { id: 'eq-2', name: 'Schedule', label: 'Not Urgent & Important', color: '#2563EB' },
        { id: 'eq-3', name: 'Delegate', label: 'Urgent & Not Important', color: '#CA8A04' },
        { id: 'eq-4', name: 'Eliminate', label: 'Not Urgent & Not Important', color: '#6B7280' },
      ]);
    }
  };

  const fetchLifeWheelAreas = async () => {
    try {
      const areas = await lifeWheelApi.getLifeWheelAreas();
      setLifeWheelAreas(areas);
    } catch (error) {
      logger.error('Failed to load life wheel areas:', error);
    }
  };

  // =========================================================================
  // Handlers
  // =========================================================================

  const handleCreate = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }

    setIsLoading(true);
    try {
      const isEventLike = schedule.taskType === 'EVENT' || schedule.taskType === 'BIRTHDAY';
      const isRecurring = schedule.recurrence !== 'NONE';

      // Build event start/end times as Instant if this is an event with time
      let eventStartTime: string | null = null;
      let eventEndTime: string | null = null;
      
      if (isEventLike && !schedule.allDay) {
        eventStartTime = schedule.time.toISOString();
        eventEndTime = schedule.endTime?.toISOString() ?? null;
      }

      const taskData: any = {
        title: title.trim(),
        description: description.trim() || null,
        eisenhowerQuadrantId,
        lifeWheelAreaId: selectedLifeWheelAreaId,
        sprintId: isRecurring || schedule.dateMode === 'backlog' ? null : schedule.sprintId,
        storyPoints,
        status: 'TODO',
        targetDate: schedule.dateMode === 'specific' && !isRecurring ? schedule.date.toISOString() : null,
        taskType: schedule.taskType,
        alertBefore: schedule.alertBefore,
        isAllDay: isEventLike ? schedule.allDay : false,
        eventStartTime,
        eventEndTime,
      };

      const newTask = await taskApi.createTask(taskData);

      // Add AI summary as comment if available
      if (newTask && (initialDraft.aiReasoning || initialDraft.aiSummary)) {
        try {
          const commentText = initialDraft.aiSummary 
            || `AI Analysis:\n${initialDraft.aiReasoning}`;
          
          await taskApi.addComment((newTask as any).id, {
            commentText,
            isAiGenerated: true,
          });
        } catch (commentError) {
          logger.error('Failed to add AI comment:', commentError);
          // Don't fail the whole operation if comment fails
        }
      }

      const typeLabel = schedule.taskType === 'EVENT' ? 'Event' : schedule.taskType === 'BIRTHDAY' ? 'Birthday' : 'Task';
      Alert.alert(
        'Created!',
        `${typeLabel} "${title}" has been added to ${
          schedule.sprintId ? 'your sprint' : 'backlog'
        }.`,
        [
          {
            text: 'OK',
            onPress: () => {
              // Navigate back to command center with clearChat flag
              if (params.clearChat === 'true') {
                router.replace({
                  pathname: '/(tabs)/command-center',
                  params: { clearChat: 'true' },
                });
              } else {
                router.back();
              }
            },
          },
        ]
      );
    } catch (error) {
      logger.error('Failed to create task:', error);
      Alert.alert('Error', 'Failed to create. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  // =========================================================================
  // Helpers
  // =========================================================================

  const currentWheelConfig = LIFE_WHEEL_CONFIG[selectedLifeWheelAreaId] || { color: '#6b7280', name: 'General', icon: 'clipboard-text-outline' };

  // =========================================================================
  // Render
  // =========================================================================

  const typeLabel = schedule.taskType === 'EVENT' ? 'Event' : schedule.taskType === 'BIRTHDAY' ? 'Birthday' : 'Task';

  if (isLoadingData) {
    return (
      <Container safeArea={false}>
        <ScreenHeader 
          title={`Create ${typeLabel}`}
          subtitle="From SensAI"
          showBack 
        />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary} />
          <Text className="mt-4 text-gray-500">Loading...</Text>
        </View>
      </Container>
    );
  }

  return (
    <Container safeArea={false}>
      <ScreenHeader 
        title={`Create ${typeLabel}`}
        subtitle="From SensAI"
        showBack 
        rightAction={
          <TouchableOpacity onPress={handleCancel}>
            <Text className="text-gray-500">Cancel</Text>
          </TouchableOpacity>
        }
      />

      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ 
          paddingHorizontal: 16,
          paddingBottom: 120,
        }}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid
        extraScrollHeight={Platform.OS === 'ios' ? 120 : 80}
        enableAutomaticScroll
        showsVerticalScrollIndicator={false}
      >
          {/* AI Summary Badge */}
          {initialDraft.aiReasoning && (
            <View 
              className="mt-4 p-3 rounded-xl flex-row items-start"
              style={{ backgroundColor: '#8B5CF615' }}
            >
              <MaterialCommunityIcons name="robot" size={20} color="#8B5CF6" />
              <View className="flex-1 ml-2">
                <Text className="text-xs font-medium text-purple-600 mb-1">AI Analysis</Text>
                <Text className="text-sm text-gray-600" numberOfLines={2}>
                  {initialDraft.aiReasoning}
                </Text>
              </View>
            </View>
          )}

          {/* Title */}
          <View className="mt-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">Title</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="What do you want to accomplish?"
              placeholderTextColor="#9CA3AF"
              className="bg-gray-100 rounded-xl px-4 py-3 text-base text-gray-900"
            />
          </View>

          {/* Description */}
          <View className="mt-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">Description (optional)</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Add more details..."
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={3}
              className="bg-gray-100 rounded-xl px-4 py-3 text-base text-gray-900"
              style={{ minHeight: 80, textAlignVertical: 'top' }}
            />
          </View>

          {/* Life Wheel Area */}
          <View className="mt-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">Life Area</Text>
            <TouchableOpacity
              onPress={() => setShowLifeWheelPicker(!showLifeWheelPicker)}
              className="bg-gray-100 rounded-xl px-4 py-3 flex-row items-center justify-between"
            >
              <View className="flex-row items-center">
                <MaterialCommunityIcons name={currentWheelConfig.icon as any} size={22} color={currentWheelConfig.color} style={{ marginRight: 8 }} />
                <Text className="text-gray-900">{currentWheelConfig.name}</Text>
              </View>
              <MaterialCommunityIcons 
                name={showLifeWheelPicker ? 'chevron-up' : 'chevron-down'} 
                size={20} 
                color="#6B7280" 
              />
            </TouchableOpacity>

            {showLifeWheelPicker && (
              <View className="mt-2 bg-white rounded-xl border border-gray-200 overflow-hidden">
                {Object.entries(LIFE_WHEEL_CONFIG).map(([id, config]) => (
                  <TouchableOpacity
                    key={id}
                    onPress={() => {
                      setSelectedLifeWheelAreaId(id);
                      setShowLifeWheelPicker(false);
                    }}
                    className="px-4 py-3 border-b border-gray-100 flex-row items-center justify-between"
                    style={{ backgroundColor: selectedLifeWheelAreaId === id ? config.color + '15' : 'white' }}
                  >
                    <View className="flex-row items-center">
                      <MaterialCommunityIcons name={config.icon as any} size={22} color={config.color} style={{ marginRight: 8 }} />
                      <Text className="text-gray-900">{config.name}</Text>
                    </View>
                    {selectedLifeWheelAreaId === id && (
                      <MaterialCommunityIcons name="check" size={20} color={config.color} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Story Points */}
          <View className="mt-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">Effort Estimate</Text>
            <View className="flex-row flex-wrap gap-2">
              {STORY_POINTS.map(sp => (
                <TouchableOpacity
                  key={sp}
                  onPress={() => setStoryPoints(sp)}
                  className="px-4 py-2 rounded-xl border-2"
                  style={{
                    borderColor: storyPoints === sp ? colors.primary : '#E5E7EB',
                    backgroundColor: storyPoints === sp ? colors.primary + '15' : 'white',
                  }}
                >
                  <Text 
                    className="font-semibold"
                    style={{ color: storyPoints === sp ? colors.primary : '#6B7280' }}
                  >
                    {sp} SP
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Priority (Eisenhower) */}
          <View className="mt-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">Priority</Text>
            <View className="flex-row flex-wrap gap-2">
              {quadrants.map(q => (
                <TouchableOpacity
                  key={q.id}
                  onPress={() => setEisenhowerQuadrantId(q.id)}
                  className="px-3 py-2 rounded-xl border-2"
                  style={{
                    borderColor: eisenhowerQuadrantId === q.id ? q.color : '#E5E7EB',
                    backgroundColor: eisenhowerQuadrantId === q.id ? q.color + '15' : 'white',
                  }}
                >
                  <Text 
                    className="font-medium text-sm"
                    style={{ color: eisenhowerQuadrantId === q.id ? q.color : '#6B7280' }}
                  >
                    {q.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Schedule (Date, Time, Type, Recurrence, Alert, Location) */}
          <View className="mt-4">
            <Text className="text-sm font-medium text-gray-700 mb-3">Schedule</Text>
            <TaskScheduler value={schedule} onChange={setSchedule} sprints={sprints} />
          </View>
        </KeyboardAwareScrollView>

        {/* Native Bottom Action Button */}
        <View style={[csStyles.buttonContainer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <Pressable
            onPress={handleCreate}
            disabled={isLoading || !title.trim()}
            style={({ pressed }) => [
              csStyles.createButton,
              {
                backgroundColor: title.trim() ? colors.primary : '#D1D5DB',
                opacity: pressed ? 0.85 : isLoading ? 0.6 : 1,
              },
            ]}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <MaterialCommunityIcons name="check-circle" size={22} color="#FFFFFF" />
                <Text style={csStyles.createButtonText}>
                  Create {typeLabel}
                </Text>
              </>
            )}
          </Pressable>
        </View>
    </Container>
  );
}

const csStyles = StyleSheet.create({
  buttonContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E7EB',
  },
  createButton: {
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
});
