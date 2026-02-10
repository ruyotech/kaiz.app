import { logger } from '../../../utils/logger';
/**
 * Draft Detail Screen
 * 
 * Shows full details of a pending draft from the Command Center AI.
 * All fields are EDITABLE - user can modify before confirming.
 * Three actions available:
 * - Reject: Discard and return to Command Center conversation
 * - Confirm: Add to pending approval list for later review
 * - Approve: Directly create the item (task/event/challenge)
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Container } from '../../../components/layout/Container';
import { ScreenHeader } from '../../../components/layout/ScreenHeader';
import { commandCenterApi } from '../../../services/api';
import { lifeWheelApi } from '../../../services/api';
import { useThemeContext } from '../../../providers/ThemeProvider';
import {
  DraftPreview,
  DraftType,
  TaskDraft,
  ChallengeDraft,
  EventDraft,
  BillDraft,
  NoteDraft,
  getDraftTitle,
  getDraftTypeDisplayName,
  getDraftTypeIcon,
  getDraftTypeColor,
} from '../../../types/commandCenter';

// ============================================================================
// Types
// ============================================================================

type ActionType = 'reject' | 'confirm' | 'approve';

// Editable form data structure
interface EditableFormData {
  title: string;
  description: string;
  dueDate: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  priority: string;
  storyPoints: number;
  estimatedMinutes: number;
  eisenhowerQuadrantId: string;
  lifeWheelAreaId: string;
  category: string;
  attendees: string;
  isRecurring: boolean;
  isAllDay: boolean;
}

// ============================================================================
// Editable Field Component
// ============================================================================

interface EditableFieldProps {
  icon: string;
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  multiline?: boolean;
  keyboardType?: 'default' | 'numeric';
}

function EditableField({ 
  icon, 
  label, 
  value, 
  onChangeText, 
  placeholder,
  multiline = false,
  keyboardType = 'default'
}: EditableFieldProps) {
  return (
    <View className="flex-row items-start py-3 border-b border-gray-100">
      <View className="w-10 h-10 rounded-xl bg-gray-100 items-center justify-center mr-3">
        <MaterialCommunityIcons name={icon as any} size={20} color="#6B7280" />
      </View>
      <View className="flex-1">
        <Text className="text-xs text-gray-500 uppercase tracking-wide mb-1">{label}</Text>
        <TextInput
          className="text-base text-gray-800 bg-gray-50 rounded-lg px-3 py-2"
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder || `Enter ${label.toLowerCase()}`}
          placeholderTextColor="#9CA3AF"
          multiline={multiline}
          numberOfLines={multiline ? 3 : 1}
          keyboardType={keyboardType}
          style={multiline ? { minHeight: 60, textAlignVertical: 'top' } : {}}
        />
      </View>
    </View>
  );
}

// ============================================================================
// Field Display Component (read-only)
// ============================================================================

interface DetailFieldProps {
  icon: string;
  label: string;
  value: string | number | null | undefined;
  color?: string;
}

function DetailField({ icon, label, value, color = '#6B7280' }: DetailFieldProps) {
  if (!value && value !== 0) return null;
  
  return (
    <View className="flex-row items-start mb-4">
      <View 
        className="w-10 h-10 rounded-xl items-center justify-center mr-3"
        style={{ backgroundColor: color + '15' }}
      >
        <MaterialCommunityIcons name={icon as any} size={20} color={color} />
      </View>
      <View className="flex-1">
        <Text className="text-xs text-gray-500 uppercase tracking-wide mb-0.5">
          {label}
        </Text>
        <Text className="text-base text-gray-900 font-medium">
          {String(value)}
        </Text>
      </View>
    </View>
  );
}

// ============================================================================
// Task Detail Section
// ============================================================================

function TaskDetailSection({ draft }: { draft: TaskDraft }) {
  // Backend may return lifeWheelAreaId or lifeWheelArea
  const lifeWheelDisplay = formatLifeWheelArea(
    (draft as any).lifeWheelAreaId || draft.lifeWheelArea
  );
  // Backend may return eisenhowerQuadrantId or eisenhowerQuadrant
  const quadrantDisplay = formatQuadrant(
    (draft as any).eisenhowerQuadrantId || draft.eisenhowerQuadrant || ''
  );
  // Story points from backend
  const storyPointsDisplay = formatStoryPoints((draft as any).storyPoints);
  
  return (
    <>
      {draft.description && (
        <View className="mb-6">
          <Text className="text-xs text-gray-500 uppercase tracking-wide mb-2">
            Description
          </Text>
          <Text className="text-base text-gray-700 leading-6">
            {draft.description}
          </Text>
        </View>
      )}
      
      <View className="bg-gray-50 rounded-2xl p-4">
        <DetailField 
          icon="calendar" 
          label="Due Date" 
          value={draft.dueDate ? formatDate(draft.dueDate) : null}
          color="#3B82F6"
        />
        <DetailField 
          icon="flag" 
          label="Priority" 
          value={draft.priority}
          color={getPriorityColor(draft.priority)}
        />
        <DetailField 
          icon="star-outline" 
          label="Story Points" 
          value={storyPointsDisplay}
          color="#8B5CF6"
        />
        <DetailField 
          icon="clock-outline" 
          label="Estimated Time" 
          value={draft.estimatedMinutes ? `${draft.estimatedMinutes} minutes` : null}
          color="#8B5CF6"
        />
        <DetailField 
          icon="folder" 
          label="Category" 
          value={draft.category}
          color="#10B981"
        />
        <DetailField 
          icon="view-grid" 
          label="Eisenhower Quadrant" 
          value={quadrantDisplay || null}
          color="#F59E0B"
        />
        <DetailField 
          icon="chart-donut" 
          label="Life Wheel Area" 
          value={lifeWheelDisplay || null}
          color="#EC4899"
        />
        {draft.tags && draft.tags.length > 0 && (
          <View className="mt-2">
            <Text className="text-xs text-gray-500 uppercase tracking-wide mb-2">
              Tags
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {draft.tags.map((tag, i) => (
                <View key={i} className="bg-blue-100 rounded-full px-3 py-1">
                  <Text className="text-blue-700 text-sm">{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>
    </>
  );
}

// ============================================================================
// Challenge Detail Section
// ============================================================================

function ChallengeDetailSection({ draft }: { draft: ChallengeDraft }) {
  return (
    <>
      {draft.description && (
        <View className="mb-6">
          <Text className="text-xs text-gray-500 uppercase tracking-wide mb-2">
            Description
          </Text>
          <Text className="text-base text-gray-700 leading-6">
            {draft.description}
          </Text>
        </View>
      )}
      
      <View className="bg-gray-50 rounded-2xl p-4">
        <DetailField 
          icon="repeat" 
          label="Challenge Type" 
          value={draft.challengeType}
          color="#F59E0B"
        />
        <DetailField 
          icon="calendar-range" 
          label="Duration" 
          value={draft.targetDays ? `${draft.targetDays} days` : null}
          color="#3B82F6"
        />
        <DetailField 
          icon="sync" 
          label="Frequency" 
          value={draft.frequency}
          color="#8B5CF6"
        />
        <DetailField 
          icon="calendar-start" 
          label="Start Date" 
          value={draft.startDate ? formatDate(draft.startDate) : null}
          color="#10B981"
        />
        <DetailField 
          icon="calendar-end" 
          label="End Date" 
          value={draft.endDate ? formatDate(draft.endDate) : null}
          color="#EF4444"
        />
        <DetailField 
          icon="folder" 
          label="Category" 
          value={draft.category}
          color="#6366F1"
        />
        {draft.specificDays && draft.specificDays.length > 0 && (
          <View className="mt-2">
            <Text className="text-xs text-gray-500 uppercase tracking-wide mb-2">
              Specific Days
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {draft.specificDays.map((day, i) => (
                <View key={i} className="bg-amber-100 rounded-full px-3 py-1">
                  <Text className="text-amber-700 text-sm">{day}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>
    </>
  );
}

// ============================================================================
// Event Detail Section
// ============================================================================

function EventDetailSection({ draft }: { draft: EventDraft }) {
  // Backend returns date + startTime (as LocalTime strings like "14:00")
  // Frontend expects startTime as full datetime
  // Handle both formats
  const draftAny = draft as any;
  
  // Format start time - could be full datetime or just time
  let startTimeDisplay: string | null = null;
  if (draftAny.date && draftAny.startTime) {
    // Backend format: date="2026-02-05", startTime="14:00"
    startTimeDisplay = `${formatDate(draftAny.date)} at ${draftAny.startTime}`;
  } else if (draft.startTime) {
    startTimeDisplay = formatDateTime(draft.startTime);
  }
  
  // Format end time
  let endTimeDisplay: string | null = null;
  if (draftAny.endTime) {
    if (draftAny.date) {
      endTimeDisplay = draftAny.endTime; // Just time like "15:00"
    } else {
      endTimeDisplay = formatDateTime(draftAny.endTime);
    }
  }
  
  return (
    <>
      {draft.description && (
        <View className="mb-6">
          <Text className="text-xs text-gray-500 uppercase tracking-wide mb-2">
            Description
          </Text>
          <Text className="text-base text-gray-700 leading-6">
            {draft.description}
          </Text>
        </View>
      )}
      
      <View className="bg-gray-50 rounded-2xl p-4">
        <DetailField 
          icon="calendar" 
          label="Date" 
          value={draftAny.date ? formatDate(draftAny.date) : null}
          color="#3B82F6"
        />
        <DetailField 
          icon="clock-start" 
          label="Start Time" 
          value={startTimeDisplay}
          color="#06B6D4"
        />
        <DetailField 
          icon="clock-end" 
          label="End Time" 
          value={endTimeDisplay}
          color="#8B5CF6"
        />
        <DetailField 
          icon="map-marker" 
          label="Location" 
          value={draftAny.location}
          color="#EF4444"
        />
        <DetailField 
          icon="account-group" 
          label="Attendees" 
          value={draftAny.attendees?.length > 0 ? draftAny.attendees.join(', ') : null}
          color="#10B981"
        />
        <DetailField 
          icon="bell" 
          label="Reminder" 
          value={draft.reminder ? `${draft.reminder} minutes before` : null}
          color="#F59E0B"
        />
        <DetailField 
          icon="repeat" 
          label="Recurrence" 
          value={draftAny.recurrence}
          color="#10B981"
        />
        {(draft.isAllDay || draftAny.isAllDay) && (
          <View className="flex-row items-center bg-cyan-100 rounded-lg px-3 py-2 mt-2">
            <MaterialCommunityIcons name="calendar-today" size={16} color="#06B6D4" />
            <Text className="text-cyan-700 ml-2 font-medium">All Day Event</Text>
          </View>
        )}
      </View>
    </>
  );
}

// ============================================================================
// Bill Detail Section
// ============================================================================

function BillDetailSection({ draft }: { draft: BillDraft }) {
  return (
    <View className="bg-gray-50 rounded-2xl p-4">
      <DetailField 
        icon="currency-usd" 
        label="Amount" 
        value={`${draft.currency || '$'}${draft.amount.toFixed(2)}`}
        color="#EF4444"
      />
      <DetailField 
        icon="calendar" 
        label="Due Date" 
        value={formatDate(draft.dueDate)}
        color="#3B82F6"
      />
      <DetailField 
        icon="folder" 
        label="Category" 
        value={draft.category}
        color="#10B981"
      />
      {draft.isRecurring && (
        <>
          <View className="flex-row items-center bg-amber-100 rounded-lg px-3 py-2 mt-2">
            <MaterialCommunityIcons name="repeat" size={16} color="#F59E0B" />
            <Text className="text-amber-700 ml-2 font-medium">Recurring Bill</Text>
          </View>
          {draft.recurrencePattern && (
            <Text className="text-gray-600 text-sm mt-2">
              Pattern: {draft.recurrencePattern}
            </Text>
          )}
        </>
      )}
    </View>
  );
}

// ============================================================================
// Note Detail Section
// ============================================================================

function NoteDetailSection({ draft }: { draft: NoteDraft }) {
  return (
    <>
      <View className="mb-6">
        <Text className="text-xs text-gray-500 uppercase tracking-wide mb-2">
          Content
        </Text>
        <View className="bg-gray-50 rounded-2xl p-4">
          <Text className="text-base text-gray-700 leading-6">
            {draft.content}
          </Text>
        </View>
      </View>
      
      {(draft.category || (draft.tags && draft.tags.length > 0)) && (
        <View className="bg-gray-50 rounded-2xl p-4">
          <DetailField 
            icon="folder" 
            label="Category" 
            value={draft.category}
            color="#8B5CF6"
          />
          {draft.tags && draft.tags.length > 0 && (
            <View className="mt-2">
              <Text className="text-xs text-gray-500 uppercase tracking-wide mb-2">
                Tags
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {draft.tags.map((tag, i) => (
                  <View key={i} className="bg-purple-100 rounded-full px-3 py-1">
                    <Text className="text-purple-700 text-sm">{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      )}
    </>
  );
}

// ============================================================================
// Generic Fields Section - Shows any additional fields not covered by type-specific sections
// ============================================================================

function GenericFieldsSection({ draft }: { draft: any }) {
  // Fields already shown by other sections
  const alreadyDisplayedFields = [
    'type', 'title', 'description', 'dueDate', 'priority', 'storyPoints',
    'estimatedMinutes', 'category', 'eisenhowerQuadrant', 'eisenhowerQuadrantId',
    'lifeWheelArea', 'lifeWheelAreaId', 'tags', 'date', 'startTime', 'endTime',
    'location', 'isAllDay', 'reminder', 'recurrence', 'attendees', 'content',
    'amount', 'currency', 'isRecurring', 'recurrencePattern', 'challengeType',
    'targetDays', 'frequency', 'specificDays', 'startDate', 'endDate', 'name',
    'metricType', 'targetValue', 'unit', 'duration', 'whyStatement', 
    'rewardDescription', 'graceDays', 'reminderTime', 'suggestedEpicId',
    'suggestedSprintId', 'suggestedTasks', 'color', 'icon',
  ];
  
  // Get fields that haven't been displayed
  const extraFields = Object.entries(draft || {}).filter(([key, value]) => {
    return !alreadyDisplayedFields.includes(key) && value != null && value !== '';
  });
  
  if (extraFields.length === 0) return null;
  
  return (
    <View className="mt-4 bg-gray-50 rounded-2xl p-4">
      <Text className="text-xs text-gray-500 uppercase tracking-wide mb-3">
        Additional Information
      </Text>
      {extraFields.map(([key, value]) => (
        <DetailField
          key={key}
          icon="information-outline"
          label={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
          value={typeof value === 'object' ? JSON.stringify(value) : String(value)}
          color="#6B7280"
        />
      ))}
    </View>
  );
}

// ============================================================================
// Main Screen
// ============================================================================

export default function DraftDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useThemeContext();
  const params = useLocalSearchParams<{ draft: string }>();
  
  // Parse draft from params
  const draft = useMemo<DraftPreview | null>(() => {
    try {
      if (params.draft) {
        const parsed = JSON.parse(params.draft);
        logger.log('[DraftDetail] Parsed draft:', JSON.stringify(parsed, null, 2));
        return parsed;
      }
      return null;
    } catch (e) {
      logger.error('[DraftDetail] Failed to parse draft:', e);
      return null;
    }
  }, [params.draft]);
  
  // Editable form state - initialized from draft data
  const [formData, setFormData] = useState<EditableFormData>({
    title: '',
    description: '',
    dueDate: '',
    date: '',
    startTime: '',
    endTime: '',
    location: '',
    priority: 'MEDIUM',
    storyPoints: 3,
    estimatedMinutes: 30,
    eisenhowerQuadrantId: 'eq-2',
    lifeWheelAreaId: 'lw-4',
    category: '',
    attendees: '',
    isRecurring: false,
    isAllDay: false,
  });
  
  // Initialize form data from draft
  useEffect(() => {
    if (draft?.draft) {
      // Cast to any since we're handling multiple draft types dynamically
      const d = draft.draft as any;
      setFormData({
        title: d.title || draft.title || '',
        description: d.description || '',
        dueDate: d.dueDate || '',
        date: d.date || '',
        startTime: d.startTime || '',
        endTime: d.endTime || '',
        location: d.location || '',
        priority: d.priority || 'MEDIUM',
        storyPoints: d.storyPoints || 3,
        estimatedMinutes: d.estimatedMinutes || 30,
        eisenhowerQuadrantId: d.eisenhowerQuadrantId || 'eq-2',
        lifeWheelAreaId: d.lifeWheelAreaId || 'lw-4',
        category: d.category || '',
        attendees: Array.isArray(d.attendees) ? d.attendees.join(', ') : (d.attendees || ''),
        isRecurring: d.isRecurring || false,
        isAllDay: d.isAllDay || false,
      });
    }
  }, [draft]);
  
  // Processing state
  const [processingAction, setProcessingAction] = useState<ActionType | null>(null);
  
  // Quadrants and Life Wheel Areas from API
  const [quadrants, setQuadrants] = useState<any[]>([]);
  const [lifeWheelAreas, setLifeWheelAreas] = useState<any[]>([]);
  const [showQuadrantPicker, setShowQuadrantPicker] = useState(false);
  const [showLifeWheelPicker, setShowLifeWheelPicker] = useState(false);
  
  // Fetch quadrants and life wheel areas
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [quadrantsData, areasData] = await Promise.all([
          lifeWheelApi.getEisenhowerQuadrants(),
          lifeWheelApi.getLifeWheelAreas(),
        ]);
        setQuadrants(quadrantsData);
        setLifeWheelAreas(areasData);
      } catch (error) {
        logger.error('Failed to load quadrants/areas:', error);
        // Set fallback data
        setQuadrants([
          { id: 'eq-1', name: 'Do First', label: 'Urgent & Important', color: '#EF4444' },
          { id: 'eq-2', name: 'Schedule', label: 'Not Urgent & Important', color: '#3B82F6' },
          { id: 'eq-3', name: 'Delegate', label: 'Urgent & Not Important', color: '#F59E0B' },
          { id: 'eq-4', name: 'Eliminate', label: 'Not Urgent & Not Important', color: '#6B7280' },
        ]);
        setLifeWheelAreas([
          { id: 'lw-1', name: 'Health & Fitness', icon: 'arm-flex-outline', color: '#10B981' },
          { id: 'lw-2', name: 'Career & Work', icon: 'briefcase-outline', color: '#3B82F6' },
          { id: 'lw-3', name: 'Finance & Money', icon: 'cash-multiple', color: '#F59E0B' },
          { id: 'lw-4', name: 'Personal Growth', icon: 'book-open-variant', color: '#8B5CF6' },
          { id: 'lw-5', name: 'Relationships & Family', icon: 'heart-outline', color: '#EF4444' },
          { id: 'lw-6', name: 'Social Life', icon: 'account-group-outline', color: '#EC4899' },
          { id: 'lw-7', name: 'Fun & Recreation', icon: 'gamepad-variant-outline', color: '#14B8A6' },
          { id: 'lw-8', name: 'Environment & Home', icon: 'home-outline', color: '#84CC16' },
        ]);
      }
    };
    fetchData();
  }, []);
  
  // Get selected quadrant/area info
  const selectedQuadrant = quadrants.find(q => q.id === formData.eisenhowerQuadrantId);
  const selectedLifeWheelArea = lifeWheelAreas.find(a => a.id === formData.lifeWheelAreaId);
  
  // Get type info with safe defaults
  const draftType = draft?.draftType || 'TASK';
  const typeColor = getDraftTypeColor(draftType);
  const typeIcon = getDraftTypeIcon(draftType);
  const typeName = getDraftTypeDisplayName(draftType);
  const confidence = draft?.confidence ?? 0.8;
  
  // Determine if this looks like an event
  const isEventLike = formData.startTime || formData.location || formData.attendees;
  
  // =========================================================================
  // Form Updaters
  // =========================================================================
  
  const updateField = useCallback((field: keyof EditableFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);
  
  // =========================================================================
  // Actions
  // =========================================================================
  
  const handleReject = useCallback(async () => {
    if (!draft) return;
    
    setProcessingAction('reject');
    try {
      // Just go back - no need to call API for rejection of unsaved draft
      router.back();
    } catch (error) {
      logger.error('Error rejecting draft:', error);
      Alert.alert('Error', 'Failed to reject. Please try again.');
    } finally {
      setProcessingAction(null);
    }
  }, [draft, router]);
  
  const handleConfirm = useCallback(async () => {
    if (!draft) return;
    
    if (!formData.title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }
    
    setProcessingAction('confirm');
    try {
      // Use new endpoint that accepts draft data directly (bypasses session lookup)
      const response = await commandCenterApi.createPendingFromDraft({
        draftType: draftType,
        title: formData.title,
        description: formData.description || undefined,
        dueDate: formData.dueDate || undefined,
        priority: formData.priority || undefined,
        storyPoints: formData.storyPoints || undefined,
        estimatedMinutes: formData.estimatedMinutes || undefined,
        eisenhowerQuadrantId: formData.eisenhowerQuadrantId || undefined,
        lifeWheelAreaId: formData.lifeWheelAreaId || undefined,
        category: formData.category || undefined,
        isRecurring: formData.isRecurring || undefined,
        date: formData.date || undefined,
        startTime: formData.startTime || undefined,
        endTime: formData.endTime || undefined,
        location: formData.location || undefined,
        isAllDay: formData.isAllDay || undefined,
        attendees: formData.attendees ? formData.attendees.split(',').map(a => a.trim()).filter(Boolean) : undefined,
      });
      
      if (response.success && response.data) {
        const { taskId } = response.data;
        Alert.alert(
          'Added to Pending',
          `${typeName} "${formData.title}" has been saved for approval.`,
          [
            {
              text: 'View Pending',
              onPress: () => {
                router.replace({
                  pathname: '/(tabs)/command-center/pending-task',
                  params: { taskId }
                });
              },
            },
            {
              text: 'Back to Chat',
              onPress: () => {
                router.back();
              },
            },
          ]
        );
      } else {
        throw new Error((typeof response.error === 'string' ? response.error : 'Failed to save to pending'));
      }
    } catch (error: unknown) {
      logger.error('[DraftDetail] Error saving to pending:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to save. Please try again.');
    } finally {
      setProcessingAction(null);
    }
  }, [draft, formData, draftType, router, typeName]);
  
  const handleApprove = useCallback(async () => {
    if (!draft) return;
    
    if (!formData.title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }
    
    setProcessingAction('approve');
    try {
      // For now, approve also uses createPendingFromDraft but could create directly
      const response = await commandCenterApi.createPendingFromDraft({
        draftType: draftType,
        title: formData.title,
        description: formData.description || undefined,
        dueDate: formData.dueDate || undefined,
        priority: formData.priority || undefined,
        storyPoints: formData.storyPoints || undefined,
        estimatedMinutes: formData.estimatedMinutes || undefined,
        eisenhowerQuadrantId: formData.eisenhowerQuadrantId || undefined,
        lifeWheelAreaId: formData.lifeWheelAreaId || undefined,
        category: formData.category || undefined,
        isRecurring: formData.isRecurring || undefined,
        date: formData.date || undefined,
        startTime: formData.startTime || undefined,
        endTime: formData.endTime || undefined,
        location: formData.location || undefined,
        isAllDay: formData.isAllDay || undefined,
        attendees: formData.attendees ? formData.attendees.split(',').map(a => a.trim()).filter(Boolean) : undefined,
      });
      
      if (response.success) {
        Alert.alert(
          'Created!',
          `${typeName} "${formData.title}" has been created successfully.`,
          [
            {
              text: 'OK',
              onPress: () => router.back(),
            },
          ]
        );
      } else {
        Alert.alert('Error', (typeof response.error === 'string' ? response.error : undefined) || 'Failed to create. Please try again.');
      }
    } catch (error) {
      logger.error('Error approving draft:', error);
      Alert.alert('Error', 'Failed to create. Please try again.');
    } finally {
      setProcessingAction(null);
    }
  }, [draft, formData, draftType, router, typeName]);
  
  // =========================================================================
  // Render
  // =========================================================================
  
  if (!draft) {
    return (
      <Container safeArea={false}>
        <ScreenHeader
          title="Draft Detail"
          showBack
        />
        <View className="flex-1 items-center justify-center">
          <MaterialCommunityIcons name="alert-circle" size={48} color="#EF4444" />
          <Text className="text-gray-600 mt-4">Failed to load draft details</Text>
          <TouchableOpacity
            onPress={() => router.back()}
            className="mt-4 px-6 py-3 bg-gray-200 rounded-xl"
          >
            <Text className="text-gray-700 font-medium">Go Back</Text>
          </TouchableOpacity>
        </View>
      </Container>
    );
  }
  
  return (
    <Container safeArea={false}>
      <ScreenHeader
        title="Review & Edit"
        subtitle={`${typeName} from AI`}
        showBack
      />
      
      <KeyboardAvoidingView 
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          className="flex-1" 
          contentContainerStyle={{ padding: 16, paddingBottom: 200 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header Card */}
          <View 
            className="rounded-3xl overflow-hidden mb-6"
            style={{ backgroundColor: typeColor + '10' }}
          >
            {/* Type Badge */}
            <View 
              className="px-4 py-3 flex-row items-center"
              style={{ backgroundColor: typeColor + '15' }}
            >
              <View 
                className="w-12 h-12 rounded-2xl items-center justify-center"
              style={{ backgroundColor: typeColor + '25' }}
            >
              <MaterialCommunityIcons name={typeIcon as any} size={24} color={typeColor} />
            </View>
            <View className="flex-1 ml-3">
              <Text className="text-sm" style={{ color: typeColor }}>
                {typeName}
              </Text>
              <Text className="text-xl font-bold text-gray-900" numberOfLines={2}>
                {formData.title || 'Untitled'}
              </Text>
            </View>
            {/* Confidence Badge */}
            <View 
              className="px-3 py-1.5 rounded-full"
              style={{ backgroundColor: typeColor + '20' }}
            >
              <Text className="text-sm font-semibold" style={{ color: typeColor }}>
                {Math.round(confidence * 100)}%
              </Text>
            </View>
          </View>
          
          {/* AI Reasoning */}
          {draft.reasoning && (
            <View className="px-4 py-3 border-t" style={{ borderColor: typeColor + '20' }}>
              <View className="flex-row items-center mb-2">
                <MaterialCommunityIcons name="robot" size={16} color="#8B5CF6" />
                <Text className="text-sm font-medium text-purple-600 ml-2">
                  AI Analysis
                </Text>
              </View>
              <Text className="text-gray-700 leading-5">
                {draft.reasoning}
              </Text>
            </View>
          )}
          
          {/* Suggestions */}
          {draft.suggestions && draft.suggestions.length > 0 && (
            <View className="px-4 py-3 border-t" style={{ borderColor: typeColor + '20' }}>
              <View className="flex-row items-center mb-2">
                <MaterialCommunityIcons name="lightbulb-outline" size={16} color="#F59E0B" />
                <Text className="text-sm font-medium text-amber-600 ml-2">
                  Suggestions
                </Text>
              </View>
              <View className="flex-row flex-wrap gap-2">
                {draft.suggestions.map((suggestion, i) => (
                  <View key={i} className="bg-amber-50 rounded-full px-3 py-1">
                    <Text className="text-amber-700 text-sm">{suggestion}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
        
        {/* EDITABLE Form Fields */}
        <View className="mb-6 bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <Text className="text-lg font-bold text-gray-900 mb-1">
            Edit Details
          </Text>
          <Text className="text-sm text-gray-500 mb-4">
            Modify any fields before confirming
          </Text>
          
          {/* Title - Always shown */}
          <EditableField
            icon="format-title"
            label="Title"
            value={formData.title}
            onChangeText={(v) => updateField('title', v)}
            placeholder="Enter title"
          />
          
          {/* Description - Always shown */}
          <EditableField
            icon="text"
            label="Description"
            value={formData.description}
            onChangeText={(v) => updateField('description', v)}
            placeholder="Add description (optional)"
            multiline
          />
          
          {/* Event-specific fields */}
          {(isEventLike || draftType === 'EVENT' || (draftType as string) === 'MEETING') && (
            <>
              <EditableField
                icon="calendar"
                label="Date"
                value={formData.date}
                onChangeText={(v) => updateField('date', v)}
                placeholder="yyyy-MM-dd (e.g., 2026-02-05)"
              />
              
              <EditableField
                icon="clock-start"
                label="Start Time"
                value={formData.startTime}
                onChangeText={(v) => updateField('startTime', v)}
                placeholder="HH:mm (e.g., 14:00)"
              />
              
              <EditableField
                icon="clock-end"
                label="End Time"
                value={formData.endTime}
                onChangeText={(v) => updateField('endTime', v)}
                placeholder="HH:mm (e.g., 15:00)"
              />
              
              <EditableField
                icon="map-marker"
                label="Location"
                value={formData.location}
                onChangeText={(v) => updateField('location', v)}
                placeholder="Enter location"
              />
              
              <EditableField
                icon="account-group"
                label="Attendees"
                value={formData.attendees}
                onChangeText={(v) => updateField('attendees', v)}
                placeholder="Comma-separated emails or names"
              />
            </>
          )}
          
          {/* Task-specific fields */}
          {(draftType === 'TASK' && !isEventLike) && (
            <>
              <EditableField
                icon="calendar-check"
                label="Due Date"
                value={formData.dueDate}
                onChangeText={(v) => updateField('dueDate', v)}
                placeholder="yyyy-MM-dd (e.g., 2026-02-05)"
              />
              
              <EditableField
                icon="poker-chip"
                label="Story Points"
                value={String(formData.storyPoints || '')}
                onChangeText={(v) => updateField('storyPoints', parseInt(v) || 0)}
                placeholder="1, 2, 3, 5, 8, 13"
                keyboardType="numeric"
              />
              
              <EditableField
                icon="clock-outline"
                label="Estimated Minutes"
                value={String(formData.estimatedMinutes || '')}
                onChangeText={(v) => updateField('estimatedMinutes', parseInt(v) || 0)}
                placeholder="Time in minutes"
                keyboardType="numeric"
              />
            </>
          )}
          
          {/* Eisenhower Quadrant Picker */}
          <TouchableOpacity
            onPress={() => setShowQuadrantPicker(true)}
            className="flex-row items-start py-3 border-b border-gray-100"
          >
            <View 
              className="w-10 h-10 rounded-xl items-center justify-center mr-3"
              style={{ backgroundColor: (selectedQuadrant?.color || '#F59E0B') + '20' }}
            >
              <MaterialCommunityIcons name="grid" size={20} color={selectedQuadrant?.color || '#F59E0B'} />
            </View>
            <View className="flex-1">
              <Text className="text-xs text-gray-500 uppercase tracking-wide mb-1">Eisenhower Quadrant</Text>
              <Text className="text-base text-gray-800">
                {selectedQuadrant ? `${selectedQuadrant.name} (${selectedQuadrant.label})` : 'Select quadrant...'}
              </Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color="#9CA3AF" />
          </TouchableOpacity>
          
          {/* Life Wheel Area Picker */}
          <TouchableOpacity
            onPress={() => setShowLifeWheelPicker(true)}
            className="flex-row items-start py-3"
          >
            <View 
              className="w-10 h-10 rounded-xl items-center justify-center mr-3"
              style={{ backgroundColor: (selectedLifeWheelArea?.color || '#F43F5E') + '20' }}
            >
              <MaterialCommunityIcons name={(selectedLifeWheelArea?.icon && selectedLifeWheelArea.icon.length > 2 ? selectedLifeWheelArea.icon : 'target') as any} size={18} color={colors.text} />
            </View>
            <View className="flex-1">
              <Text className="text-xs text-gray-500 uppercase tracking-wide mb-1">Life Wheel Area</Text>
              <Text className="text-base text-gray-800">
                {selectedLifeWheelArea?.name || 'Select area...'}
              </Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>
        </ScrollView>
      </KeyboardAvoidingView>
      
      {/* Quadrant Picker Modal */}
      <Modal
        visible={showQuadrantPicker}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowQuadrantPicker(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl max-h-[70%]">
            <View className="p-4 border-b border-gray-100 flex-row justify-between items-center">
              <Text className="text-lg font-bold text-gray-900">Eisenhower Quadrant</Text>
              <TouchableOpacity onPress={() => setShowQuadrantPicker(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <ScrollView className="p-4">
              {quadrants.map((q) => (
                <TouchableOpacity
                  key={q.id}
                  onPress={() => {
                    updateField('eisenhowerQuadrantId', q.id);
                    setShowQuadrantPicker(false);
                  }}
                  className="flex-row items-center p-3 rounded-xl mb-2"
                  style={{ 
                    backgroundColor: formData.eisenhowerQuadrantId === q.id ? q.color + '20' : '#F9FAFB'
                  }}
                >
                  <View 
                    className="w-10 h-10 rounded-xl items-center justify-center mr-3"
                    style={{ backgroundColor: q.color + '30' }}
                  >
                    <MaterialCommunityIcons name="grid" size={20} color={q.color} />
                  </View>
                  <View className="flex-1">
                    <Text className="font-semibold text-gray-900">{q.name}</Text>
                    <Text className="text-sm text-gray-500">{q.label}</Text>
                  </View>
                  {formData.eisenhowerQuadrantId === q.id && (
                    <MaterialCommunityIcons name="check-circle" size={24} color={q.color} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
      
      {/* Life Wheel Area Picker Modal */}
      <Modal
        visible={showLifeWheelPicker}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowLifeWheelPicker(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl max-h-[70%]">
            <View className="p-4 border-b border-gray-100 flex-row justify-between items-center">
              <Text className="text-lg font-bold text-gray-900">Life Wheel Area</Text>
              <TouchableOpacity onPress={() => setShowLifeWheelPicker(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <ScrollView className="p-4">
              {lifeWheelAreas.map((area) => (
                <TouchableOpacity
                  key={area.id}
                  onPress={() => {
                    updateField('lifeWheelAreaId', area.id);
                    setShowLifeWheelPicker(false);
                  }}
                  className="flex-row items-center p-3 rounded-xl mb-2"
                  style={{ 
                    backgroundColor: formData.lifeWheelAreaId === area.id ? area.color + '20' : '#F9FAFB'
                  }}
                >
                  <View 
                    className="w-10 h-10 rounded-xl items-center justify-center mr-3"
                    style={{ backgroundColor: area.color + '30' }}
                  >
                    <MaterialCommunityIcons name={(area.icon && area.icon.length > 2 ? area.icon : 'circle-outline') as any} size={18} color={colors.text} />
                  </View>
                  <View className="flex-1">
                    <Text className="font-semibold text-gray-900">{area.name}</Text>
                  </View>
                  {formData.lifeWheelAreaId === area.id && (
                    <MaterialCommunityIcons name="check-circle" size={24} color={area.color} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
      
      {/* Bottom Action Bar */}
      <View 
        className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 pt-4"
        style={{ paddingBottom: Math.max(insets.bottom, 16) + 8 }}
      >
        {/* Action Description */}
        <View className="mb-4 bg-gray-50 rounded-xl p-3">
          <View className="flex-row items-center">
            <MaterialCommunityIcons name="information-outline" size={18} color="#6B7280" />
            <Text className="text-gray-600 text-sm ml-2 flex-1">
              Choose how to handle this AI-generated {typeName.toLowerCase()}
            </Text>
          </View>
        </View>
        
        {/* Action Buttons */}
        <View className="flex-row gap-3">
          {/* Reject Button */}
          <TouchableOpacity
            onPress={handleReject}
            disabled={processingAction !== null}
            className="flex-1 bg-gray-100 rounded-2xl py-4 items-center"
            style={{ opacity: processingAction && processingAction !== 'reject' ? 0.5 : 1 }}
          >
            {processingAction === 'reject' ? (
              <ActivityIndicator size="small" color="#6B7280" />
            ) : (
              <>
                <MaterialCommunityIcons name="close" size={22} color="#6B7280" />
                <Text className="text-gray-600 font-semibold mt-1">Reject</Text>
                <Text className="text-gray-400 text-xs mt-0.5">Discard</Text>
              </>
            )}
          </TouchableOpacity>
          
          {/* Confirm Button */}
          <TouchableOpacity
            onPress={handleConfirm}
            disabled={processingAction !== null}
            className="flex-1 bg-amber-50 rounded-2xl py-4 items-center border-2 border-amber-200"
            style={{ opacity: processingAction && processingAction !== 'confirm' ? 0.5 : 1 }}
          >
            {processingAction === 'confirm' ? (
              <ActivityIndicator size="small" color="#F59E0B" />
            ) : (
              <>
                <MaterialCommunityIcons name="clock-check-outline" size={22} color="#F59E0B" />
                <Text className="text-amber-600 font-semibold mt-1">Confirm</Text>
                <Text className="text-amber-400 text-xs mt-0.5">Add to Pending</Text>
              </>
            )}
          </TouchableOpacity>
          
          {/* Approve Button */}
          <TouchableOpacity
            onPress={handleApprove}
            disabled={processingAction !== null}
            className="flex-1 rounded-2xl py-4 items-center"
            style={{ 
              backgroundColor: typeColor,
              opacity: processingAction && processingAction !== 'approve' ? 0.5 : 1 
            }}
          >
            {processingAction === 'approve' ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <MaterialCommunityIcons name="check" size={22} color="white" />
                <Text className="text-white font-semibold mt-1">Approve</Text>
                <Text className="text-white/70 text-xs mt-0.5">Create Now</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Container>
  );
}

// ============================================================================
// Helpers
// ============================================================================

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString([], { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

function formatDateTime(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleString([], { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

function getPriorityColor(priority?: string): string {
  switch (priority) {
    case 'URGENT': return '#EF4444';
    case 'HIGH': return '#F97316';
    case 'MEDIUM': return '#F59E0B';
    case 'LOW': return '#10B981';
    default: return '#6B7280';
  }
}

function formatQuadrant(quadrant: string): string {
  switch (quadrant?.toUpperCase()) {
    case 'DO': case 'Q1': return 'Do First (Urgent & Important)';
    case 'SCHEDULE': case 'Q2': return 'Schedule (Important, Not Urgent)';
    case 'DELEGATE': case 'Q3': return 'Delegate (Urgent, Not Important)';
    case 'ELIMINATE': case 'Q4': return 'Eliminate (Neither)';
    default: return quadrant || '';
  }
}

function formatLifeWheelArea(areaId: string | undefined): string {
  if (!areaId) return '';
  
  // Map backend IDs (lw-1, lw-2, etc.) to display names
  const areaMap: Record<string, string> = {
    'lw-1': 'Health & Fitness',
    'lw-2': 'Career & Work',
    'lw-3': 'Finance & Wealth',
    'lw-4': 'Personal Growth',
    'lw-5': 'Relationships',
    'lw-6': 'Family',
    'lw-7': 'Recreation & Fun',
    'lw-8': 'Environment',
    'life-health': 'Health & Fitness',
    'life-career': 'Career & Work',
    'life-finance': 'Finance & Wealth',
    'life-growth': 'Personal Growth',
    'life-relationships': 'Relationships',
    'life-family': 'Family',
    'life-recreation': 'Recreation & Fun',
    'life-environment': 'Environment',
  };
  
  return areaMap[areaId.toLowerCase()] || areaId;
}

function formatStoryPoints(points: number | undefined): string {
  if (!points) return '';
  const effort: Record<number, string> = {
    1: '1 - Trivial',
    2: '2 - Easy',
    3: '3 - Small',
    5: '5 - Medium',
    8: '8 - Large',
    13: '13 - Extra Large',
  };
  return effort[points] || `${points} points`;
}
