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
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Calendar } from 'react-native-calendars';

import { Container } from '../../../components/layout/Container';
import { ScreenHeader } from '../../../components/layout/ScreenHeader';
import { taskApi, sprintApi, lifeWheelApi } from '../../../services/api';
import { useThemeContext } from '../../../providers/ThemeProvider';
import { STORY_POINTS } from '../../../utils/constants';

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
  isEvent?: boolean;
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

const LIFE_WHEEL_CONFIG: Record<string, { color: string; name: string; emoji: string }> = {
  'lw-1': { color: '#10B981', name: 'Health & Fitness', emoji: '🏃' },
  'lw-2': { color: '#3B82F6', name: 'Career & Work', emoji: '💼' },
  'lw-3': { color: '#F59E0B', name: 'Finance', emoji: '💰' },
  'lw-4': { color: '#8B5CF6', name: 'Personal Growth', emoji: '📚' },
  'lw-5': { color: '#EF4444', name: 'Relationships', emoji: '❤️' },
  'lw-6': { color: '#EC4899', name: 'Creativity', emoji: '🎨' },
  'lw-7': { color: '#F97316', name: 'Fun & Recreation', emoji: '🎉' },
  'lw-8': { color: '#06B6D4', name: 'Contribution', emoji: '🌍' },
};

const DESTINATION_OPTIONS = [
  { id: 'sprint', label: 'Current Sprint', icon: 'run-fast', description: 'Add to active sprint' },
  { id: 'backlog', label: 'Backlog', icon: 'inbox-full', description: 'Save for later planning' },
];

// Time picker constants
const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = [0, 15, 30, 45];

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
    console.log('[CreateFromSensAI] Raw params.draftData:', params.draftData);
    console.log('[CreateFromSensAI] params.draftData type:', typeof params.draftData);
    
    if (!params.draftData) {
      console.log('[CreateFromSensAI] No draftData in params');
      return { title: '' };
    }
    
    try {
      // Handle if draftData is already an object (shouldn't happen but safety check)
      if (typeof params.draftData === 'object') {
        console.log('[CreateFromSensAI] draftData is already an object');
        return params.draftData as unknown as DraftData;
      }
      
      const parsed = JSON.parse(params.draftData);
      console.log('[CreateFromSensAI] Parsed draft data:', JSON.stringify(parsed, null, 2));
      return parsed;
    } catch (error) {
      console.error('[CreateFromSensAI] Failed to parse draftData:', error);
      console.error('[CreateFromSensAI] Raw value was:', params.draftData);
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
  
  // Destination
  const [destination, setDestination] = useState<'sprint' | 'backlog'>('sprint');
  const [selectedSprintId, setSelectedSprintId] = useState<string | null>(null);
  
  // Date - Parse from AI if available
  const [targetDate, setTargetDate] = useState<Date | null>(() => {
    if (initialDraft.dueDate) {
      const parsed = new Date(initialDraft.dueDate);
      return isNaN(parsed.getTime()) ? null : parsed;
    }
    return null;
  });
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Event-specific
  const isEvent = initialDraft.isEvent || false;
  const [location, setLocation] = useState(initialDraft.location || '');
  const [isAllDay, setIsAllDay] = useState(initialDraft.isAllDay || false);

  // Time picker state - Parse initial time from draft data
  const parseTimeFromString = (timeStr?: string): { hour: number; minute: number } | null => {
    if (!timeStr) return null;
    
    // Handle HH:mm format
    if (timeStr.includes(':')) {
      const [hourStr, minuteStr] = timeStr.split(':');
      const hour = parseInt(hourStr, 10);
      const minute = parseInt(minuteStr, 10);
      if (!isNaN(hour) && !isNaN(minute)) {
        return { hour, minute };
      }
    }
    
    // Handle ISO datetime format (e.g., "2025-01-26T14:00:00")
    if (timeStr.includes('T')) {
      const timePart = timeStr.split('T')[1];
      if (timePart) {
        const [hourStr, minuteStr] = timePart.split(':');
        const hour = parseInt(hourStr, 10);
        const minute = parseInt(minuteStr, 10);
        if (!isNaN(hour) && !isNaN(minute)) {
          return { hour, minute };
        }
      }
    }
    
    return null;
  };

  const startTimeParsed = parseTimeFromString(initialDraft.startTime);
  const endTimeParsed = parseTimeFromString(initialDraft.endTime);
  
  const [hasTime, setHasTime] = useState(!!startTimeParsed);
  const [selectedHour, setSelectedHour] = useState(startTimeParsed?.hour ?? 9);
  const [selectedMinute, setSelectedMinute] = useState(startTimeParsed?.minute ?? 0);
  const [hasEndTime, setHasEndTime] = useState(!!endTimeParsed);
  const [selectedEndHour, setSelectedEndHour] = useState(endTimeParsed?.hour ?? (startTimeParsed ? (startTimeParsed.hour + 1) % 24 : 10));
  const [selectedEndMinute, setSelectedEndMinute] = useState(endTimeParsed?.minute ?? 0);

  // Data loading
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [quadrants, setQuadrants] = useState<EisenhowerQuadrant[]>([]);
  const [lifeWheelAreas, setLifeWheelAreas] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // UI state
  const [showSprintPicker, setShowSprintPicker] = useState(false);
  const [showLifeWheelPicker, setShowLifeWheelPicker] = useState(false);
  const [showStoryPointsPicker, setShowStoryPointsPicker] = useState(false);
  
  // Update state when params change (Expo Router may load params async)
  useEffect(() => {
    const draft = parseDraftData();
    console.log('[CreateFromSensAI] Params changed, updating form with:', draft);
    
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
        setTargetDate(parsed);
      }
    }
    if (draft.location) {
      setLocation(draft.location);
    }
    if (typeof draft.isAllDay === 'boolean') {
      setIsAllDay(draft.isAllDay);
    }
    // Parse and update time fields
    if (draft.startTime) {
      const parsed = parseTimeFromString(draft.startTime);
      if (parsed) {
        setHasTime(true);
        setSelectedHour(parsed.hour);
        setSelectedMinute(parsed.minute);
      }
    }
    if (draft.endTime) {
      const parsed = parseTimeFromString(draft.endTime);
      if (parsed) {
        setHasEndTime(true);
        setSelectedEndHour(parsed.hour);
        setSelectedEndMinute(parsed.minute);
      }
    }
  }, [params.draftData]);
  
  // Log initial state for debugging
  useEffect(() => {
    console.log('[CreateFromSensAI] Current form state:', {
      title,
      description,
      storyPoints,
      eisenhowerQuadrantId,
      selectedLifeWheelAreaId,
      targetDate,
      isEvent,
      location,
      hasTime,
      selectedHour,
      selectedMinute,
      hasEndTime,
      selectedEndHour,
      selectedEndMinute,
    });
  }, [title, description, hasTime, selectedHour, selectedMinute]);

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
      const sprintData = await sprintApi.getSprints(currentYear);
      const now = new Date();
      
      const availableSprints = sprintData
        .filter((s: Sprint) => new Date(s.endDate) >= now)
        .sort((a: Sprint, b: Sprint) => 
          new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
        );
      
      setSprints(availableSprints);
      if (availableSprints.length > 0 && !selectedSprintId) {
        setSelectedSprintId(availableSprints[0].id);
      }
    } catch (error) {
      console.error('Failed to load sprints:', error);
    }
  };

  const fetchQuadrants = async () => {
    try {
      const quadrantsData = await lifeWheelApi.getEisenhowerQuadrants();
      setQuadrants(quadrantsData);
    } catch (error) {
      console.error('Failed to load quadrants:', error);
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
      console.error('Failed to load life wheel areas:', error);
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
      // Helper to create ISO instant from date and time
      const createInstant = (date: Date, hour: number, minute: number): string => {
        const d = new Date(date);
        d.setHours(hour, minute, 0, 0);
        return d.toISOString();
      };

      // Build event start/end times as Instant if this is an event with time
      let eventStartTime: string | null = null;
      let eventEndTime: string | null = null;
      
      if (isEvent && hasTime && !isAllDay && targetDate) {
        eventStartTime = createInstant(targetDate, selectedHour, selectedMinute);
        if (hasEndTime) {
          eventEndTime = createInstant(targetDate, selectedEndHour, selectedEndMinute);
        }
      }

      const taskData: any = {
        title: title.trim(),
        description: description.trim() || null,
        eisenhowerQuadrantId,
        lifeWheelAreaId: selectedLifeWheelAreaId,
        sprintId: destination === 'sprint' ? selectedSprintId : null,
        storyPoints,
        status: 'TODO',
        targetDate: targetDate ? targetDate.toISOString() : null,
        isEvent,
        location: isEvent ? location : null,
        isAllDay: isEvent ? isAllDay : false,
        // Event time fields must be Instant (ISO datetime strings)
        eventStartTime,
        eventEndTime,
      };

      const newTask = await taskApi.createTask(taskData);

      // Add AI summary as comment if available
      if (newTask && (initialDraft.aiReasoning || initialDraft.aiSummary)) {
        try {
          const commentText = initialDraft.aiSummary 
            || `🤖 AI Analysis:\n${initialDraft.aiReasoning}`;
          
          await taskApi.addComment(newTask.id, {
            commentText,
            isAiGenerated: true,
          });
        } catch (commentError) {
          console.error('Failed to add AI comment:', commentError);
          // Don't fail the whole operation if comment fails
        }
      }

      Alert.alert(
        '✅ Created!',
        `${isEvent ? 'Event' : 'Task'} "${title}" has been added to ${
          destination === 'sprint' ? 'your sprint' : 'backlog'
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
      console.error('Failed to create task:', error);
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

  const formatSprintName = (sprint: Sprint): string => {
    const start = new Date(sprint.startDate);
    const end = new Date(sprint.endDate);
    const isCurrentSprint = sprints[0]?.id === sprint.id;
    const monthName = start.toLocaleDateString('en-US', { month: 'short' });
    return `S${sprint.weekNumber.toString().padStart(2, '0')} • ${monthName} ${start.getDate()}-${end.getDate()}${isCurrentSprint ? ' (Current)' : ''}`;
  };

  const selectedQuadrant = quadrants.find(q => q.id === eisenhowerQuadrantId);
  const selectedSprint = sprints.find(s => s.id === selectedSprintId);
  const currentWheelConfig = LIFE_WHEEL_CONFIG[selectedLifeWheelAreaId] || { color: '#6b7280', name: 'General', emoji: '📋' };

  // =========================================================================
  // Render
  // =========================================================================

  if (isLoadingData) {
    return (
      <Container safeArea={false}>
        <ScreenHeader 
          title={`Create ${isEvent ? 'Event' : 'Task'}`}
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
        title={`Create ${isEvent ? 'Event' : 'Task'}`}
        subtitle="From SensAI"
        showBack 
        rightAction={
          <TouchableOpacity onPress={handleCancel}>
            <Text className="text-gray-500">Cancel</Text>
          </TouchableOpacity>
        }
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ 
            paddingHorizontal: 16,
            paddingBottom: Math.max(insets.bottom, 16) + 100,
          }}
          keyboardShouldPersistTaps="handled"
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

          {/* Destination Selection */}
          <View className="mt-6">
            <Text className="text-sm font-medium text-gray-700 mb-3">Add to</Text>
            <View className="flex-row gap-3">
              {DESTINATION_OPTIONS.map(option => (
                <TouchableOpacity
                  key={option.id}
                  onPress={() => setDestination(option.id as 'sprint' | 'backlog')}
                  className="flex-1 p-4 rounded-xl border-2"
                  style={{
                    borderColor: destination === option.id ? colors.primary : '#E5E7EB',
                    backgroundColor: destination === option.id ? colors.primary + '10' : 'white',
                  }}
                >
                  <MaterialCommunityIcons 
                    name={option.icon as any} 
                    size={24} 
                    color={destination === option.id ? colors.primary : '#6B7280'} 
                  />
                  <Text 
                    className="font-semibold mt-2"
                    style={{ color: destination === option.id ? colors.primary : '#374151' }}
                  >
                    {option.label}
                  </Text>
                  <Text className="text-xs text-gray-500 mt-1">{option.description}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Sprint Picker (if destination is sprint) */}
          {destination === 'sprint' && sprints.length > 0 && (
            <View className="mt-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">Select Sprint</Text>
              <TouchableOpacity
                onPress={() => setShowSprintPicker(!showSprintPicker)}
                className="bg-gray-100 rounded-xl px-4 py-3 flex-row items-center justify-between"
              >
                <View className="flex-row items-center">
                  <MaterialCommunityIcons name="run-fast" size={20} color={colors.primary} />
                  <Text className="ml-2 text-gray-900">
                    {selectedSprint ? formatSprintName(selectedSprint) : 'Select sprint'}
                  </Text>
                </View>
                <MaterialCommunityIcons 
                  name={showSprintPicker ? 'chevron-up' : 'chevron-down'} 
                  size={20} 
                  color="#6B7280" 
                />
              </TouchableOpacity>
              
              {showSprintPicker && (
                <View className="mt-2 bg-white rounded-xl border border-gray-200 overflow-hidden">
                  {sprints.map(sprint => (
                    <TouchableOpacity
                      key={sprint.id}
                      onPress={() => {
                        setSelectedSprintId(sprint.id);
                        setShowSprintPicker(false);
                      }}
                      className="px-4 py-3 border-b border-gray-100 flex-row items-center justify-between"
                      style={{ backgroundColor: selectedSprintId === sprint.id ? colors.primary + '10' : 'white' }}
                    >
                      <Text className="text-gray-900">{formatSprintName(sprint)}</Text>
                      {selectedSprintId === sprint.id && (
                        <MaterialCommunityIcons name="check" size={20} color={colors.primary} />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          )}

          {/* Life Wheel Area */}
          <View className="mt-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">Life Area</Text>
            <TouchableOpacity
              onPress={() => setShowLifeWheelPicker(!showLifeWheelPicker)}
              className="bg-gray-100 rounded-xl px-4 py-3 flex-row items-center justify-between"
            >
              <View className="flex-row items-center">
                <Text className="text-xl mr-2">{currentWheelConfig.emoji}</Text>
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
                      <Text className="text-xl mr-2">{config.emoji}</Text>
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

          {/* Due Date */}
          <View className="mt-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">Due Date (optional)</Text>
            <TouchableOpacity
              onPress={() => setShowDatePicker(!showDatePicker)}
              className="bg-gray-100 rounded-xl px-4 py-3 flex-row items-center justify-between"
            >
              <View className="flex-row items-center">
                <MaterialCommunityIcons name="calendar" size={20} color={colors.primary} />
                <Text className="ml-2 text-gray-900">
                  {targetDate 
                    ? targetDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
                    : 'No due date'
                  }
                </Text>
              </View>
              {targetDate && (
                <TouchableOpacity onPress={() => setTargetDate(null)}>
                  <MaterialCommunityIcons name="close-circle" size={20} color="#9CA3AF" />
                </TouchableOpacity>
              )}
            </TouchableOpacity>

            {showDatePicker && (
              <View className="mt-2 bg-white rounded-xl border border-gray-200 overflow-hidden">
                <Calendar
                  current={targetDate?.toISOString() || new Date().toISOString()}
                  onDayPress={(day: any) => {
                    setTargetDate(new Date(day.dateString));
                    setShowDatePicker(false);
                  }}
                  markedDates={targetDate ? {
                    [targetDate.toISOString().split('T')[0]]: { selected: true, selectedColor: colors.primary }
                  } : {}}
                  minDate={new Date().toISOString().split('T')[0]}
                  theme={{
                    todayTextColor: colors.primary,
                    selectedDayBackgroundColor: colors.primary,
                    arrowColor: colors.primary,
                  }}
                />
              </View>
            )}
          </View>

          {/* Event-specific fields */}
          {isEvent && (
            <>
              <View className="mt-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">Location</Text>
                <TextInput
                  value={location}
                  onChangeText={setLocation}
                  placeholder="Where is this event?"
                  placeholderTextColor="#9CA3AF"
                  className="bg-gray-100 rounded-xl px-4 py-3 text-base text-gray-900"
                />
              </View>

              <View className="mt-4 flex-row items-center justify-between">
                <Text className="text-sm font-medium text-gray-700">All Day Event</Text>
                <Switch
                  value={isAllDay}
                  onValueChange={setIsAllDay}
                  trackColor={{ false: '#D1D5DB', true: colors.primary + '50' }}
                  thumbColor={isAllDay ? colors.primary : '#F3F4F6'}
                />
              </View>

              {/* Time Picker - Only show if not all day */}
              {!isAllDay && (
                <View className="mt-4">
                  {/* Add Time Toggle */}
                  <TouchableOpacity
                    onPress={() => setHasTime(!hasTime)}
                    className={`flex-row items-center p-3 rounded-xl border ${
                      hasTime ? 'bg-amber-50 border-amber-300' : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <View className={`w-8 h-8 rounded-full items-center justify-center mr-3 ${
                      hasTime ? 'bg-amber-100' : 'bg-gray-200'
                    }`}>
                      <MaterialCommunityIcons name="clock-outline" size={18} color={hasTime ? '#d97706' : '#6b7280'} />
                    </View>
                    <Text className={`flex-1 font-medium ${hasTime ? 'text-amber-800' : 'text-gray-600'}`}>
                      {hasTime 
                        ? hasEndTime
                          ? `${selectedHour.toString().padStart(2, '0')}:${selectedMinute.toString().padStart(2, '0')} - ${selectedEndHour.toString().padStart(2, '0')}:${selectedEndMinute.toString().padStart(2, '0')}`
                          : `At ${selectedHour.toString().padStart(2, '0')}:${selectedMinute.toString().padStart(2, '0')}`
                        : 'Add specific time'
                      }
                    </Text>
                    <MaterialCommunityIcons 
                      name={hasTime ? "checkbox-marked" : "checkbox-blank-outline"} 
                      size={22} 
                      color={hasTime ? "#d97706" : "#9ca3af"} 
                    />
                  </TouchableOpacity>

                  {/* Time Picker UI */}
                  {hasTime && (
                    <View className="mt-2 p-4 bg-amber-50 rounded-xl border border-amber-200">
                      {/* Start Time */}
                      <View>
                        <Text className="text-xs text-amber-700 font-medium mb-2">Start Time</Text>
                        <View className="flex-row items-center gap-2">
                          {/* Hour Selector */}
                          <View className="flex-1">
                            <Text className="text-xs text-amber-600 mb-1 text-center">Hour</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="max-h-12">
                              <View className="flex-row gap-1">
                                {HOURS.map((hour) => (
                                  <TouchableOpacity
                                    key={hour}
                                    onPress={() => setSelectedHour(hour)}
                                    className={`w-10 h-10 rounded-lg items-center justify-center ${
                                      selectedHour === hour
                                        ? 'bg-amber-500'
                                        : 'bg-white border border-amber-200'
                                    }`}
                                  >
                                    <Text className={`font-medium ${
                                      selectedHour === hour ? 'text-white' : 'text-gray-700'
                                    }`}>
                                      {hour.toString().padStart(2, '0')}
                                    </Text>
                                  </TouchableOpacity>
                                ))}
                              </View>
                            </ScrollView>
                          </View>
                        </View>
                        {/* Minute Selector */}
                        <View className="mt-2">
                          <Text className="text-xs text-amber-600 mb-1 text-center">Minute</Text>
                          <View className="flex-row justify-center gap-3">
                            {MINUTES.map((minute) => (
                              <TouchableOpacity
                                key={minute}
                                onPress={() => setSelectedMinute(minute)}
                                className={`w-14 h-10 rounded-lg items-center justify-center ${
                                  selectedMinute === minute
                                    ? 'bg-amber-500'
                                    : 'bg-white border border-amber-200'
                                }`}
                              >
                                <Text className={`font-medium ${
                                  selectedMinute === minute ? 'text-white' : 'text-gray-700'
                                }`}>
                                  :{minute.toString().padStart(2, '0')}
                                </Text>
                              </TouchableOpacity>
                            ))}
                          </View>
                        </View>
                      </View>

                      {/* End Time Toggle */}
                      <TouchableOpacity
                        onPress={() => {
                          setHasEndTime(!hasEndTime);
                          if (!hasEndTime) {
                            setSelectedEndHour((selectedHour + 1) % 24);
                            setSelectedEndMinute(selectedMinute);
                          }
                        }}
                        className={`mt-3 flex-row items-center p-3 rounded-xl border ${
                          hasEndTime ? 'bg-purple-50 border-purple-300' : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <View className={`w-7 h-7 rounded-full items-center justify-center mr-2 ${
                          hasEndTime ? 'bg-purple-100' : 'bg-gray-200'
                        }`}>
                          <MaterialCommunityIcons name="clock-end" size={16} color={hasEndTime ? '#9333ea' : '#6b7280'} />
                        </View>
                        <Text className={`flex-1 font-medium ${hasEndTime ? 'text-purple-800' : 'text-gray-600'}`}>
                          {hasEndTime 
                            ? `Until ${selectedEndHour.toString().padStart(2, '0')}:${selectedEndMinute.toString().padStart(2, '0')}`
                            : 'Add end time'
                          }
                        </Text>
                        <MaterialCommunityIcons 
                          name={hasEndTime ? "checkbox-marked" : "checkbox-blank-outline"} 
                          size={22} 
                          color={hasEndTime ? "#9333ea" : "#9ca3af"} 
                        />
                      </TouchableOpacity>

                      {/* End Time Picker */}
                      {hasEndTime && (
                        <View className="mt-2 p-3 bg-purple-50 rounded-xl border border-purple-200">
                          <Text className="text-xs text-purple-700 font-medium mb-2">End Time</Text>
                          <View className="flex-row items-center gap-2">
                            {/* End Hour Selector */}
                            <View className="flex-1">
                              <Text className="text-xs text-purple-600 mb-1 text-center">Hour</Text>
                              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="max-h-12">
                                <View className="flex-row gap-1">
                                  {HOURS.map((hour) => (
                                    <TouchableOpacity
                                      key={hour}
                                      onPress={() => setSelectedEndHour(hour)}
                                      className={`w-10 h-10 rounded-lg items-center justify-center ${
                                        selectedEndHour === hour
                                          ? 'bg-purple-500'
                                          : 'bg-white border border-purple-200'
                                      }`}
                                    >
                                      <Text className={`font-medium ${
                                        selectedEndHour === hour ? 'text-white' : 'text-gray-700'
                                      }`}>
                                        {hour.toString().padStart(2, '0')}
                                      </Text>
                                    </TouchableOpacity>
                                  ))}
                                </View>
                              </ScrollView>
                            </View>
                          </View>
                          {/* End Minute Selector */}
                          <View className="mt-2">
                            <Text className="text-xs text-purple-600 mb-1 text-center">Minute</Text>
                            <View className="flex-row justify-center gap-3">
                              {MINUTES.map((minute) => (
                                <TouchableOpacity
                                  key={minute}
                                  onPress={() => setSelectedEndMinute(minute)}
                                  className={`w-14 h-10 rounded-lg items-center justify-center ${
                                    selectedEndMinute === minute
                                      ? 'bg-purple-500'
                                      : 'bg-white border border-purple-200'
                                  }`}
                                >
                                  <Text className={`font-medium ${
                                    selectedEndMinute === minute ? 'text-white' : 'text-gray-700'
                                  }`}>
                                    :{minute.toString().padStart(2, '0')}
                                  </Text>
                                </TouchableOpacity>
                              ))}
                            </View>
                          </View>
                        </View>
                      )}
                    </View>
                  )}
                </View>
              )}
            </>
          )}
        </ScrollView>

        {/* Bottom Action Button */}
        <View 
          className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-4"
          style={{ paddingBottom: Math.max(insets.bottom, 16) }}
        >
          <TouchableOpacity
            onPress={handleCreate}
            disabled={isLoading || !title.trim()}
            className="py-4 rounded-xl flex-row items-center justify-center"
            style={{ 
              backgroundColor: title.trim() ? colors.primary : '#D1D5DB',
              opacity: isLoading ? 0.7 : 1,
            }}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <MaterialCommunityIcons name="check" size={20} color="white" />
                <Text className="text-white font-semibold text-lg ml-2">
                  Create {isEvent ? 'Event' : 'Task'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Container>
  );
}
