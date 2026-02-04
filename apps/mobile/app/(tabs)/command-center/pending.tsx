/**
 * Pending Approvals Screen
 * 
 * Displays all tasks/events with PENDING_APPROVAL status.
 * Allows users to approve (move to TODO) or reject (delete) items.
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Container } from '../../../components/layout/Container';
import { ScreenHeader } from '../../../components/layout/ScreenHeader';
import { PendingTaskCard } from '../../../components/command-center/PendingTaskCard';
import { commandCenterService } from '../../../services/commandCenter';
import { useThemeContext } from '../../../providers/ThemeProvider';

// ============================================================================
// Empty State Component
// ============================================================================

function EmptyState() {
  const { colors } = useThemeContext();
  const router = useRouter();

  return (
    <View className="flex-1 items-center justify-center px-8">
      <View 
        className="w-24 h-24 rounded-full items-center justify-center mb-6"
        style={{ backgroundColor: colors.primary + '15' }}
      >
        <MaterialCommunityIcons 
          name="check-circle-outline" 
          size={48} 
          color={colors.primary} 
        />
      </View>
      <Text 
        className="text-xl font-bold text-center mb-2"
        style={{ color: colors.text }}
      >
        All Caught Up!
      </Text>
      <Text 
        className="text-center mb-6"
        style={{ color: colors.textSecondary }}
      >
        No pending items to review. Use Command Center to create tasks, events, and challenges.
      </Text>
      <TouchableOpacity
        onPress={() => router.back()}
        className="px-6 py-3 rounded-xl"
        style={{ backgroundColor: colors.primary }}
      >
        <Text className="text-white font-semibold">Open Command Center</Text>
      </TouchableOpacity>
    </View>
  );
}

// ============================================================================
// Draft Type Filter Chip
// ============================================================================

interface FilterChipProps {
  label: string;
  icon: string;
  color: string;
  count: number;
  isSelected: boolean;
  onPress: () => void;
}

function FilterChip({ label, icon, color, count, isSelected, onPress }: FilterChipProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center px-3 py-2 rounded-full mr-2"
      style={{ 
        backgroundColor: isSelected ? color + '20' : '#F3F4F6',
        borderWidth: 1,
        borderColor: isSelected ? color : 'transparent',
      }}
    >
      <MaterialCommunityIcons 
        name={icon as any} 
        size={16} 
        color={isSelected ? color : '#6B7280'} 
      />
      <Text 
        className="text-sm font-medium ml-1.5"
        style={{ color: isSelected ? color : '#6B7280' }}
      >
        {label}
      </Text>
      {count > 0 && (
        <View 
          className="ml-1.5 px-1.5 py-0.5 rounded-full"
          style={{ backgroundColor: isSelected ? color : '#D1D5DB' }}
        >
          <Text 
            className="text-xs font-bold"
            style={{ color: isSelected ? 'white' : '#6B7280' }}
          >
            {count}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

// ============================================================================
// Main Screen
// ============================================================================

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

export default function PendingDraftsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useThemeContext();

  // State - now using PendingTask instead of DraftPreview
  const [tasks, setTasks] = useState<PendingTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [processingTaskId, setProcessingTaskId] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);

  // =========================================================================
  // Data Fetching
  // =========================================================================

  const fetchTasks = useCallback(async (showRefresh = false) => {
    if (showRefresh) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const response = await commandCenterService.getPendingApprovalTasks();
      if (response.success && response.data) {
        setTasks(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch pending tasks:', error);
      Alert.alert('Error', 'Failed to load pending items');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // =========================================================================
  // Actions
  // =========================================================================

  const handleApprove = useCallback(async (taskId: string) => {
    setProcessingTaskId(taskId);

    try {
      const response = await commandCenterService.approvePendingTask(taskId);
      if (response.success) {
        // Remove from list
        setTasks(prev => prev.filter(t => t.id !== taskId));
        // Show success feedback
        Alert.alert('✅ Approved!', 'Task has been added to your TODO list.');
      } else {
        Alert.alert('Error', response.error || 'Failed to approve');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to approve task');
    } finally {
      setProcessingTaskId(null);
    }
  }, []);

  const handleReject = useCallback(async (taskId: string) => {
    Alert.alert(
      'Reject Task',
      'Are you sure you want to reject this task? It will be deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            setProcessingTaskId(taskId);
            try {
              const response = await commandCenterService.rejectPendingTask(taskId);
              if (response.success) {
                setTasks(prev => prev.filter(t => t.id !== taskId));
              } else {
                Alert.alert('Error', response.error || 'Failed to reject');
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to reject task');
            } finally {
              setProcessingTaskId(null);
            }
          },
        },
      ]
    );
  }, []);

  const handleApproveAll = useCallback(() => {
    const filteredTasks = selectedFilter 
      ? tasks.filter(t => (t.isEvent ? 'EVENT' : 'TASK') === selectedFilter)
      : tasks;

    if (filteredTasks.length === 0) return;

    Alert.alert(
      'Approve All',
      `Approve all ${filteredTasks.length} pending items?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve All',
          onPress: async () => {
            for (const task of filteredTasks) {
              await handleApprove(task.id);
            }
          },
        },
      ]
    );
  }, [tasks, selectedFilter, handleApprove]);

  // =========================================================================
  // Computed Values
  // =========================================================================

  // Count tasks by type (task vs event)
  const taskCounts = tasks.reduce((acc, task) => {
    const type = task.isEvent ? 'EVENT' : 'TASK';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Filter tasks
  const filteredTasks = selectedFilter 
    ? tasks.filter(t => (t.isEvent ? 'EVENT' : 'TASK') === selectedFilter)
    : tasks;

  // Available filter types
  const filterTypes = [
    { type: 'TASK', label: 'Tasks', icon: 'checkbox-marked-circle-outline', color: '#3B82F6' },
    { type: 'EVENT', label: 'Events', icon: 'calendar', color: '#8B5CF6' },
  ].filter(f => taskCounts[f.type] > 0);

  // =========================================================================
  // Render
  // =========================================================================

  if (isLoading) {
    return (
      <Container safeArea={false}>
        <ScreenHeader
          title="Pending Approvals"
          subtitle="Review AI-generated items"
          showBack
        />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary} />
          <Text className="mt-4" style={{ color: colors.textSecondary }}>
            Loading pending items...
          </Text>
        </View>
      </Container>
    );
  }

  return (
    <Container safeArea={false}>
      <ScreenHeader
        title="Pending Approvals"
        subtitle={`${tasks.length} item${tasks.length !== 1 ? 's' : ''} awaiting review`}
        showBack
        rightAction={
          tasks.length > 0 ? (
            <TouchableOpacity
              onPress={handleApproveAll}
              className="px-3 py-1.5 rounded-lg"
              style={{ backgroundColor: colors.primary + '20' }}
            >
              <Text className="text-sm font-medium" style={{ color: colors.primary }}>
                Approve All
              </Text>
            </TouchableOpacity>
          ) : undefined
        }
      />

      {tasks.length === 0 ? (
        <EmptyState />
      ) : (
        <View className="flex-1">
          {/* Filter Chips */}
          {filterTypes.length > 1 && (
            <View className="px-4 py-3 border-b border-gray-100">
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingRight: 16 }}
              >
                <FilterChip
                  label="All"
                  icon="view-grid"
                  color={colors.primary}
                  count={tasks.length}
                  isSelected={selectedFilter === null}
                  onPress={() => setSelectedFilter(null)}
                />
                {filterTypes.map(filter => (
                  <FilterChip
                    key={filter.type}
                    label={filter.label}
                    icon={filter.icon}
                    color={filter.color}
                    count={taskCounts[filter.type] || 0}
                    isSelected={selectedFilter === filter.type}
                    onPress={() => setSelectedFilter(
                      selectedFilter === filter.type ? null : filter.type
                    )}
                  />
                ))}
              </ScrollView>
            </View>
          )}

          {/* Tasks List */}
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ 
              padding: 16,
              paddingBottom: Math.max(insets.bottom, 16) + 16,
            }}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={() => fetchTasks(true)}
                tintColor={colors.primary}
              />
            }
          >
            {filteredTasks.length === 0 ? (
              <View className="items-center py-8">
                <Text style={{ color: colors.textSecondary }}>
                  No {selectedFilter?.toLowerCase() || ''} items pending
                </Text>
              </View>
            ) : (
              filteredTasks.map(task => (
                <PendingTaskCard
                  key={task.id}
                  task={task}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  isLoading={processingTaskId === task.id}
                />
              ))
            )}
          </ScrollView>
        </View>
      )}
    </Container>
  );
}
