/**
 * Draft Detail Screen
 * 
 * Shows full details of a pending draft from the Command Center AI.
 * Three actions available:
 * - Reject: Discard and return to Command Center conversation
 * - Confirm: Add to pending approval list for later review
 * - Approve: Directly create the item (task/event/challenge)
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Container } from '../../../components/layout/Container';
import { ScreenHeader } from '../../../components/layout/ScreenHeader';
import { commandCenterService } from '../../../services/commandCenter';
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

// ============================================================================
// Field Display Component
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
          value={draft.eisenhowerQuadrant ? formatQuadrant(draft.eisenhowerQuadrant) : null}
          color="#F59E0B"
        />
        <DetailField 
          icon="chart-donut" 
          label="Life Wheel Area" 
          value={draft.lifeWheelArea}
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
          icon="clock-start" 
          label="Start Time" 
          value={formatDateTime(draft.startTime)}
          color="#06B6D4"
        />
        <DetailField 
          icon="clock-end" 
          label="End Time" 
          value={draft.endTime ? formatDateTime(draft.endTime) : null}
          color="#8B5CF6"
        />
        <DetailField 
          icon="map-marker" 
          label="Location" 
          value={draft.location}
          color="#EF4444"
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
          value={draft.recurrence}
          color="#10B981"
        />
        {draft.isAllDay && (
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
        return JSON.parse(params.draft);
      }
      return null;
    } catch (e) {
      console.error('Failed to parse draft:', e);
      return null;
    }
  }, [params.draft]);
  
  // State
  const [processingAction, setProcessingAction] = useState<ActionType | null>(null);
  
  // Get type info
  const typeColor = draft ? getDraftTypeColor(draft.draftType) : colors.primary;
  const typeIcon = draft ? getDraftTypeIcon(draft.draftType) : 'file-document';
  const typeName = draft ? getDraftTypeDisplayName(draft.draftType) : 'Item';
  const title = draft ? getDraftTitle(draft.draft) : 'Draft';
  
  // =========================================================================
  // Actions
  // =========================================================================
  
  const handleReject = useCallback(async () => {
    if (!draft) return;
    
    setProcessingAction('reject');
    try {
      await commandCenterService.rejectDraft(draft.id);
      // Go back to Command Center with rejection message
      router.back();
    } catch (error) {
      console.error('Error rejecting draft:', error);
      Alert.alert('Error', 'Failed to reject. Please try again.');
    } finally {
      setProcessingAction(null);
    }
  }, [draft, router]);
  
  const handleConfirm = useCallback(async () => {
    if (!draft) return;
    
    // The draft is already in PENDING_APPROVAL status from the AI
    // Just navigate to the pending approvals screen
    Alert.alert(
      'Added to Pending',
      `${typeName} "${title}" has been added to your pending approvals list.`,
      [
        {
          text: 'View Pending',
          onPress: () => {
            router.replace('/(tabs)/command-center/pending');
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
  }, [draft, router, typeName, title]);
  
  const handleApprove = useCallback(async () => {
    if (!draft) return;
    
    setProcessingAction('approve');
    try {
      const response = await commandCenterService.approveDraft(draft.id);
      
      if (response.success) {
        Alert.alert(
          '✅ Created!',
          `${typeName} "${title}" has been created successfully.`,
          [
            {
              text: 'OK',
              onPress: () => router.back(),
            },
          ]
        );
      } else {
        Alert.alert('Error', response.error || 'Failed to create. Please try again.');
      }
    } catch (error) {
      console.error('Error approving draft:', error);
      Alert.alert('Error', 'Failed to create. Please try again.');
    } finally {
      setProcessingAction(null);
    }
  }, [draft, router, typeName, title]);
  
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
        title="Review Item"
        subtitle={`${typeName} from AI`}
        showBack
      />
      
      <ScrollView 
        className="flex-1" 
        contentContainerStyle={{ padding: 16, paddingBottom: 200 }}
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
                {title}
              </Text>
            </View>
            {/* Confidence Badge */}
            <View 
              className="px-3 py-1.5 rounded-full"
              style={{ backgroundColor: typeColor + '20' }}
            >
              <Text className="text-sm font-semibold" style={{ color: typeColor }}>
                {Math.round(draft.confidence * 100)}%
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
        
        {/* Detail Section based on type */}
        <View className="mb-6">
          <Text className="text-lg font-bold text-gray-900 mb-4">
            Details
          </Text>
          
          {draft.draftType === 'TASK' && (
            <TaskDetailSection draft={draft.draft as TaskDraft} />
          )}
          {draft.draftType === 'CHALLENGE' && (
            <ChallengeDetailSection draft={draft.draft as ChallengeDraft} />
          )}
          {draft.draftType === 'EVENT' && (
            <EventDetailSection draft={draft.draft as EventDraft} />
          )}
          {draft.draftType === 'BILL' && (
            <BillDetailSection draft={draft.draft as BillDraft} />
          )}
          {draft.draftType === 'NOTE' && (
            <NoteDetailSection draft={draft.draft as NoteDraft} />
          )}
        </View>
      </ScrollView>
      
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
  switch (quadrant) {
    case 'DO': return 'Do First (Urgent & Important)';
    case 'SCHEDULE': return 'Schedule (Important, Not Urgent)';
    case 'DELEGATE': return 'Delegate (Urgent, Not Important)';
    case 'ELIMINATE': return 'Eliminate (Neither)';
    default: return quadrant;
  }
}
