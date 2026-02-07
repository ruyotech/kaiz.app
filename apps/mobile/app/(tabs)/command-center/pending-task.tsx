import { logger } from '../../../utils/logger';
/**
 * Pending Task Detail Screen
 * 
 * Shows full details of a task with PENDING_APPROVAL status.
 * Two actions available:
 * - Reject: Delete the task
 * - Approve: Change status to TODO
 */

import React, { useState, useCallback, useEffect } from 'react';
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
import { commandCenterApi } from '../../../services/api';
import { taskApi } from '../../../services/api';
import { useThemeContext } from '../../../providers/ThemeProvider';

// ============================================================================
// Types
// ============================================================================

interface TaskDetail {
  id: string;
  title: string;
  description?: string;
  lifeWheelAreaId: string;
  eisenhowerQuadrantId: string;
  storyPoints: number;
  status: string;
  targetDate?: string;
  isEvent: boolean;
  location?: string;
  isAllDay?: boolean;
  eventStartTime?: string;
  eventEndTime?: string;
  aiConfidence?: number;
  aiReasoning?: string;
  isRecurring?: boolean;
  createdAt: string;
}

// ============================================================================
// Constants
// ============================================================================

const LIFE_WHEEL_AREAS: Record<string, { name: string; emoji: string; color: string }> = {
  'lw-1': { name: 'Health & Fitness', emoji: '🏃', color: '#10B981' },
  'lw-2': { name: 'Career & Work', emoji: '💼', color: '#3B82F6' },
  'lw-3': { name: 'Finance', emoji: '💰', color: '#F59E0B' },
  'lw-4': { name: 'Personal Growth', emoji: '📚', color: '#8B5CF6' },
  'lw-5': { name: 'Relationships', emoji: '❤️', color: '#EF4444' },
  'lw-6': { name: 'Creativity', emoji: '🎨', color: '#EC4899' },
  'lw-7': { name: 'Fun & Recreation', emoji: '🎉', color: '#F97316' },
  'lw-8': { name: 'Contribution', emoji: '🌍', color: '#06B6D4' },
};

const EISENHOWER_QUADRANTS: Record<string, { name: string; description: string; color: string }> = {
  'eq-1': { name: 'Do First', description: 'Urgent & Important', color: '#EF4444' },
  'eq-2': { name: 'Schedule', description: 'Not Urgent & Important', color: '#3B82F6' },
  'eq-3': { name: 'Delegate', description: 'Urgent & Not Important', color: '#F59E0B' },
  'eq-4': { name: 'Eliminate', description: 'Not Urgent & Not Important', color: '#6B7280' },
  // Legacy format support
  'q1': { name: 'Do First', description: 'Urgent & Important', color: '#EF4444' },
  'q2': { name: 'Schedule', description: 'Not Urgent & Important', color: '#3B82F6' },
  'q3': { name: 'Delegate', description: 'Urgent & Not Important', color: '#F59E0B' },
  'q4': { name: 'Eliminate', description: 'Not Urgent & Not Important', color: '#6B7280' },
  'DO': { name: 'Do First', description: 'Urgent & Important', color: '#EF4444' },
  'SCHEDULE': { name: 'Schedule', description: 'Not Urgent & Important', color: '#3B82F6' },
  'DELEGATE': { name: 'Delegate', description: 'Urgent & Not Important', color: '#F59E0B' },
  'ELIMINATE': { name: 'Eliminate', description: 'Not Urgent & Not Important', color: '#6B7280' },
};

const EFFORT_LABELS: Record<number, { label: string; description: string }> = {
  1: { label: 'XS', description: 'Quick task (~15 min)' },
  2: { label: 'S', description: 'Small task (~30 min)' },
  3: { label: 'M', description: 'Medium task (~1-2 hours)' },
  5: { label: 'L', description: 'Large task (~half day)' },
  8: { label: 'XL', description: 'Extra large (~full day)' },
  13: { label: 'XXL', description: 'Epic task (multiple days)' },
};

// ============================================================================
// Helper Functions
// ============================================================================

function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
}

function formatTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return '';
  }
}

// ============================================================================
// Detail Field Component
// ============================================================================

interface DetailFieldProps {
  icon: string;
  label: string;
  value: string | null | undefined;
  color?: string;
  subValue?: string;
}

function DetailField({ icon, label, value, color = '#6B7280', subValue }: DetailFieldProps) {
  if (!value) return null;
  
  return (
    <View className="flex-row items-start py-3 border-b border-gray-100">
      <View 
        className="w-8 h-8 rounded-lg items-center justify-center mr-3"
        style={{ backgroundColor: color + '15' }}
      >
        <MaterialCommunityIcons name={icon as any} size={18} color={color} />
      </View>
      <View className="flex-1">
        <Text className="text-xs text-gray-500 uppercase tracking-wide mb-0.5">
          {label}
        </Text>
        <Text className="text-base text-gray-900 font-medium">{value}</Text>
        {subValue && (
          <Text className="text-sm text-gray-500 mt-0.5">{subValue}</Text>
        )}
      </View>
    </View>
  );
}

// ============================================================================
// Main Screen
// ============================================================================

export default function PendingTaskDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useThemeContext();
  const params = useLocalSearchParams<{ taskId: string }>();
  
  // State
  const [task, setTask] = useState<TaskDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [processingAction, setProcessingAction] = useState<'approve' | 'reject' | null>(null);
  
  // Fetch task details
  useEffect(() => {
    async function fetchTask() {
      if (!params.taskId) return;
      
      try {
        // taskApi.getTaskById returns unwrapped response directly (the task object)
        const taskData = await taskApi.getTaskById(params.taskId);
        if (taskData && typeof taskData === 'object' && 'id' in taskData) {
          setTask(taskData as TaskDetail);
        } else {
          logger.error('Invalid task data received:', taskData);
        }
      } catch (error) {
        logger.error('Failed to fetch task:', error);
        Alert.alert('Error', 'Failed to load task details');
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchTask();
  }, [params.taskId]);
  
  // Get display values
  const isEvent = task?.isEvent ?? false;
  const typeColor = isEvent ? '#8B5CF6' : '#3B82F6';
  const typeIcon = isEvent ? 'calendar' : 'checkbox-marked-circle-outline';
  const typeName = isEvent ? 'Event' : 'Task';
  
  const lifeWheelInfo = task ? LIFE_WHEEL_AREAS[task.lifeWheelAreaId] : null;
  const quadrantInfo = task ? EISENHOWER_QUADRANTS[task.eisenhowerQuadrantId] : null;
  const effortInfo = task ? EFFORT_LABELS[task.storyPoints] : null;
  
  // Handle reject - deletes and goes back to chat
  const handleReject = useCallback(async () => {
    if (!task) return;
    
    Alert.alert(
      'Reject Task',
      `Are you sure you want to reject "${task.title}"? This will delete it permanently.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            setProcessingAction('reject');
            try {
              const response = await commandCenterApi.rejectPendingTask(task.id);
              if (response.success) {
                // Go back to chat (conversation continues)
                router.back();
              } else {
                Alert.alert('Error', String(response.error || 'Failed to reject task'));
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to reject task');
            } finally {
              setProcessingAction(null);
            }
          },
        },
      ]
    );
  }, [task, router]);
  
  // Handle confirm - keeps task as pending, goes back to pending list
  const handleConfirm = useCallback(() => {
    if (!task) return;
    
    // Task is already in pending status, just go back to the pending list
    // Clear chat for fresh conversation
    router.replace({
      pathname: '/(tabs)/command-center/pending',
      params: { clearChat: 'true' },
    });
  }, [task, router]);
  
  // Handle approve - opens create screen to select destination
  const handleApprove = useCallback(() => {
    if (!task) return;
    
    // Navigate to create-from-sensai screen with task data
    router.push({
      pathname: '/(tabs)/command-center/create-from-sensai',
      params: {
        taskId: task.id,
        title: task.title,
        description: task.description || '',
        isEvent: task.isEvent ? 'true' : 'false',
        targetDate: task.targetDate || '',
        lifeWheelAreaId: task.lifeWheelAreaId?.toString() || '1',
        eisenhowerQuadrantId: task.eisenhowerQuadrantId?.toString() || '4',
        storyPoints: task.storyPoints?.toString() || '2',
        isAllDay: task.isAllDay ? 'true' : 'false',
        eventStartTime: task.eventStartTime || '',
        eventEndTime: task.eventEndTime || '',
        location: task.location || '',
        isRecurring: task.isRecurring ? 'true' : 'false',
        aiReasoning: task.aiReasoning || '',
        aiConfidence: task.aiConfidence?.toString() || '0.85',
      },
    });
  }, [task, router]);
  
  // Loading state
  if (isLoading) {
    return (
      <Container safeArea={false}>
        <ScreenHeader title="Pending Task" showBack />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary} />
          <Text className="mt-4" style={{ color: colors.textSecondary }}>
            Loading task details...
          </Text>
        </View>
      </Container>
    );
  }
  
  // Error state
  if (!task) {
    return (
      <Container safeArea={false}>
        <ScreenHeader title="Pending Task" showBack />
        <View className="flex-1 items-center justify-center px-8">
          <MaterialCommunityIcons name="alert-circle-outline" size={48} color="#EF4444" />
          <Text className="text-lg font-semibold mt-4 mb-2">Task Not Found</Text>
          <Text className="text-center text-gray-500">
            This task may have been deleted or approved already.
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            className="mt-6 px-6 py-3 rounded-xl"
            style={{ backgroundColor: colors.primary }}
          >
            <Text className="text-white font-semibold">Go Back</Text>
          </TouchableOpacity>
        </View>
      </Container>
    );
  }
  
  return (
    <Container safeArea={false}>
      <ScreenHeader 
        title="Review Item" 
        subtitle="Pending Approval"
        showBack 
      />
      
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ 
          paddingBottom: Math.max(insets.bottom, 16) + 100,
        }}
      >
        {/* Header Card */}
        <View className="mx-4 mt-4 mb-6">
          <View 
            className="rounded-2xl p-6"
            style={{ backgroundColor: typeColor + '10' }}
          >
            {/* Type Badge */}
            <View className="flex-row items-center mb-4">
              <View 
                className="w-12 h-12 rounded-xl items-center justify-center mr-4"
                style={{ backgroundColor: typeColor + '20' }}
              >
                <MaterialCommunityIcons 
                  name={typeIcon as any} 
                  size={24} 
                  color={typeColor} 
                />
              </View>
              <View className="flex-1">
                <View className="flex-row items-center">
                  <View 
                    className="px-3 py-1 rounded-full mr-2"
                    style={{ backgroundColor: typeColor }}
                  >
                    <Text className="text-xs font-bold text-white uppercase">
                      {typeName}
                    </Text>
                  </View>
                  <View 
                    className="px-2 py-1 rounded-full"
                    style={{ backgroundColor: '#F59E0B20' }}
                  >
                    <Text className="text-xs font-medium" style={{ color: '#F59E0B' }}>
                      PENDING
                    </Text>
                  </View>
                </View>
                <Text className="text-xs text-gray-500 mt-1">
                  AI Confidence: {Math.round((task.aiConfidence || 0.85) * 100)}%
                </Text>
              </View>
            </View>
            
            {/* Title */}
            <Text className="text-2xl font-bold text-gray-900 mb-2">
              {task.title}
            </Text>
            
            {/* Description */}
            {task.description && (
              <Text className="text-base text-gray-600 leading-6">
                {task.description}
              </Text>
            )}
          </View>
        </View>
        
        {/* Details Section */}
        <View className="mx-4 bg-white rounded-2xl p-4 mb-4">
          <Text className="text-sm font-semibold text-gray-900 mb-2 uppercase tracking-wide">
            Details
          </Text>
          
          {/* Due Date */}
          <DetailField
            icon="calendar"
            label="Due Date"
            value={task.targetDate ? formatDate(task.targetDate) : null}
            color="#3B82F6"
          />
          
          {/* Time (for events) */}
          {isEvent && task.eventStartTime && (
            <DetailField
              icon="clock-outline"
              label="Time"
              value={task.isAllDay ? 'All Day' : formatTime(task.eventStartTime)}
              subValue={task.eventEndTime && !task.isAllDay ? `to ${formatTime(task.eventEndTime)}` : undefined}
              color="#8B5CF6"
            />
          )}
          
          {/* Location (for events) */}
          {isEvent && task.location && (
            <DetailField
              icon="map-marker"
              label="Location"
              value={task.location}
              color="#10B981"
            />
          )}
          
          {/* Life Wheel Area */}
          {lifeWheelInfo && (
            <DetailField
              icon="circle-slice-8"
              label="Life Area"
              value={`${lifeWheelInfo.emoji} ${lifeWheelInfo.name}`}
              color={lifeWheelInfo.color}
            />
          )}
          
          {/* Eisenhower Quadrant */}
          {quadrantInfo && (
            <DetailField
              icon="view-grid"
              label="Priority Matrix"
              value={quadrantInfo.name}
              subValue={quadrantInfo.description}
              color={quadrantInfo.color}
            />
          )}
          
          {/* Story Points */}
          {effortInfo && (
            <DetailField
              icon="speedometer"
              label="Effort"
              value={`${effortInfo.label} (${task.storyPoints} SP)`}
              subValue={effortInfo.description}
              color="#8B5CF6"
            />
          )}
        </View>
      </ScrollView>
      
      {/* Bottom Actions */}
      <View 
        className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100"
        style={{ paddingBottom: Math.max(insets.bottom, 16) }}
      >
        {/* Help Text */}
        <View className="px-4 pt-3 pb-2">
          <Text className="text-xs text-center text-gray-500">
            <Text className="font-medium">Reject:</Text> Delete & back to chat • 
            <Text className="font-medium"> Confirm:</Text> Save for later • 
            <Text className="font-medium"> Approve:</Text> Create now
          </Text>
        </View>
        
        <View className="flex-row gap-2 px-4 pb-4">
          {/* Reject Button */}
          <TouchableOpacity
            onPress={handleReject}
            disabled={processingAction !== null}
            className="flex-1 flex-row items-center justify-center py-3 rounded-xl border-2 border-red-200 bg-red-50"
            style={{ opacity: processingAction !== null ? 0.6 : 1 }}
          >
            {processingAction === 'reject' ? (
              <ActivityIndicator size="small" color="#EF4444" />
            ) : (
              <>
                <MaterialCommunityIcons name="close" size={18} color="#EF4444" />
                <Text className="text-sm font-semibold text-red-500 ml-1">Reject</Text>
              </>
            )}
          </TouchableOpacity>
          
          {/* Confirm Button - saves to pending */}
          <TouchableOpacity
            onPress={handleConfirm}
            disabled={processingAction !== null}
            className="flex-1 flex-row items-center justify-center py-3 rounded-xl border-2 border-amber-200 bg-amber-50"
            style={{ opacity: processingAction !== null ? 0.6 : 1 }}
          >
            <MaterialCommunityIcons name="clock-outline" size={18} color="#F59E0B" />
            <Text className="text-sm font-semibold text-amber-600 ml-1">Confirm</Text>
          </TouchableOpacity>
          
          {/* Approve Button - opens create screen */}
          <TouchableOpacity
            onPress={handleApprove}
            disabled={processingAction !== null}
            className="flex-1 flex-row items-center justify-center py-3 rounded-xl"
            style={{ 
              backgroundColor: typeColor,
              opacity: processingAction !== null ? 0.6 : 1,
            }}
          >
            <MaterialCommunityIcons name="check" size={18} color="white" />
            <Text className="text-sm font-semibold text-white ml-1">Approve</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Container>
  );
}
