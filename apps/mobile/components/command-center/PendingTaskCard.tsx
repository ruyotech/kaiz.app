/**
 * PendingTaskCard - Card for tasks with PENDING_APPROVAL status
 *
 * Displays in the pending approval screen with inline actions to approve/reject.
 */

import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// Task type from API
interface PendingTask {
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
  createdAt: string;
}

interface PendingTaskCardProps {
  task: PendingTask;
  onCreateTask: (task: PendingTask) => void;
  isLoading?: boolean;
}

// Life Wheel Area Display Names
const LIFE_WHEEL_AREAS: Record<string, string> = {
  'lw-1': '🏃 Health & Fitness',
  'lw-2': '💼 Career & Work',
  'lw-3': '💰 Finance',
  'lw-4': '📚 Personal Growth',
  'lw-5': '❤️ Relationships',
  'lw-6': '🎨 Creativity',
  'lw-7': '🎉 Fun & Recreation',
  'lw-8': '🌍 Contribution',
};

// Story Points to Effort Label
const EFFORT_LABELS: Record<number, string> = {
  1: 'XS (1 SP)',
  2: 'S (2 SP)',
  3: 'M (3 SP)',
  5: 'L (5 SP)',
  8: 'XL (8 SP)',
  13: 'XXL (13 SP)',
};

function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
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

export function PendingTaskCard({
  task,
  onCreateTask,
  isLoading = false,
}: PendingTaskCardProps) {
  const router = useRouter();
  
  const isEvent = task.isEvent;
  const typeColor = isEvent ? '#8B5CF6' : '#3B82F6';
  const typeIcon = isEvent ? 'calendar' : 'checkbox-marked-circle-outline';
  const typeName = isEvent ? 'Event' : 'Task';
  
  const lifeWheelArea = LIFE_WHEEL_AREAS[task.lifeWheelAreaId] || task.lifeWheelAreaId;
  const effortLabel = EFFORT_LABELS[task.storyPoints] || `${task.storyPoints} SP`;

  // Navigate to task detail screen
  const handleCardPress = () => {
    router.push({
      pathname: '/(tabs)/command-center/pending-task',
      params: { taskId: task.id },
    });
  };

  return (
    <TouchableOpacity
      onPress={handleCardPress}
      disabled={isLoading}
      className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100"
      style={{ opacity: isLoading ? 0.6 : 1 }}
    >
      {/* Header Row */}
      <View className="flex-row items-center mb-3">
        {/* Type Icon */}
        <View
          className="w-10 h-10 rounded-xl items-center justify-center mr-3"
          style={{ backgroundColor: typeColor + '20' }}
        >
          <MaterialCommunityIcons
            name={typeIcon as any}
            size={20}
            color={typeColor}
          />
        </View>

        {/* Title and Type */}
        <View className="flex-1">
          <Text className="font-semibold text-gray-900" numberOfLines={1}>
            {task.title}
          </Text>
          <View className="flex-row items-center mt-0.5">
            <Text className="text-xs text-gray-500">{typeName}</Text>
            <Text className="text-gray-300 mx-1">•</Text>
            <Text className="text-xs text-gray-400">{effortLabel}</Text>
          </View>
        </View>

        {/* Confidence Badge */}
        <View
          className="px-2 py-1 rounded-full"
          style={{ backgroundColor: typeColor + '15' }}
        >
          <Text className="text-xs font-medium" style={{ color: typeColor }}>
            {Math.round((task.aiConfidence || 0.85) * 100)}%
          </Text>
        </View>
      </View>

      {/* Description (truncated) */}
      {task.description && (
        <Text className="text-sm text-gray-600 mb-3" numberOfLines={2}>
          {task.description}
        </Text>
      )}

      {/* Details Row */}
      <View className="flex-row flex-wrap gap-2 mb-3">
        {/* Life Wheel Area */}
        <View className="flex-row items-center bg-gray-100 px-2 py-1 rounded-lg">
          <Text className="text-xs text-gray-600">{lifeWheelArea}</Text>
        </View>

        {/* Date */}
        {task.targetDate && (
          <View className="flex-row items-center bg-blue-50 px-2 py-1 rounded-lg">
            <MaterialCommunityIcons name="calendar" size={12} color="#3B82F6" />
            <Text className="text-xs text-blue-600 ml-1">
              {formatDate(task.targetDate)}
            </Text>
          </View>
        )}

        {/* Time (for events) */}
        {isEvent && task.eventStartTime && (
          <View className="flex-row items-center bg-purple-50 px-2 py-1 rounded-lg">
            <MaterialCommunityIcons name="clock-outline" size={12} color="#8B5CF6" />
            <Text className="text-xs text-purple-600 ml-1">
              {task.isAllDay ? 'All Day' : formatTime(task.eventStartTime)}
            </Text>
          </View>
        )}

        {/* Location (for events) */}
        {isEvent && task.location && (
          <View className="flex-row items-center bg-green-50 px-2 py-1 rounded-lg">
            <MaterialCommunityIcons name="map-marker" size={12} color="#10B981" />
            <Text className="text-xs text-green-600 ml-1" numberOfLines={1}>
              {task.location}
            </Text>
          </View>
        )}
      </View>

      {/* Action Button */}
      <View className="flex-row gap-2">
        {/* Create Task Button */}
        <TouchableOpacity
          onPress={(e) => {
            e.stopPropagation?.();
            onCreateTask(task);
          }}
          disabled={isLoading}
          className="flex-1 flex-row items-center justify-center py-3 rounded-lg"
          style={{ backgroundColor: '#10B981' }}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <>
              <MaterialCommunityIcons name="plus" size={18} color="white" />
              <Text className="text-sm font-semibold text-white ml-1">
                {task.isEvent ? 'Create Event' : 'Create Task'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}
