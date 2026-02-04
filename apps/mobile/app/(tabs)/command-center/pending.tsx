/**
 * Pending Drafts Screen
 * 
 * Displays all AI-generated drafts awaiting user approval.
 * Allows users to approve or reject tasks, events, challenges, etc.
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
import { PendingDraftCard } from '../../../components/command-center';
import { commandCenterService } from '../../../services/commandCenter';
import { useThemeContext } from '../../../providers/ThemeProvider';
import {
  DraftPreview,
  getDraftTitle,
  getDraftTypeIcon,
  getDraftTypeColor,
  getDraftTypeDisplayName,
} from '../../../types/commandCenter';

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

export default function PendingDraftsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useThemeContext();

  // State
  const [drafts, setDrafts] = useState<DraftPreview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [processingDraftId, setProcessingDraftId] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);

  // =========================================================================
  // Data Fetching
  // =========================================================================

  const fetchDrafts = useCallback(async (showRefresh = false) => {
    if (showRefresh) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const response = await commandCenterService.getPendingDrafts();
      if (response.success && response.data) {
        setDrafts(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch pending drafts:', error);
      Alert.alert('Error', 'Failed to load pending items');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDrafts();
  }, [fetchDrafts]);

  // =========================================================================
  // Actions
  // =========================================================================

  const handleApprove = useCallback(async (draftId: string) => {
    setProcessingDraftId(draftId);

    try {
      const response = await commandCenterService.approveDraft(draftId);
      if (response.success) {
        // Remove from list
        setDrafts(prev => prev.filter(d => d.id !== draftId));
        // Show success feedback
        Alert.alert('✅ Created!', 'Item has been added successfully.');
      } else {
        Alert.alert('Error', response.error || 'Failed to approve');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to approve item');
    } finally {
      setProcessingDraftId(null);
    }
  }, []);

  const handleReject = useCallback(async (draftId: string) => {
    Alert.alert(
      'Reject Item',
      'Are you sure you want to reject this item? It will be discarded.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            setProcessingDraftId(draftId);
            try {
              const response = await commandCenterService.rejectDraft(draftId);
              if (response.success) {
                setDrafts(prev => prev.filter(d => d.id !== draftId));
              } else {
                Alert.alert('Error', response.error || 'Failed to reject');
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to reject item');
            } finally {
              setProcessingDraftId(null);
            }
          },
        },
      ]
    );
  }, []);

  const handleApproveAll = useCallback(() => {
    const filteredDrafts = selectedFilter 
      ? drafts.filter(d => d.draftType === selectedFilter)
      : drafts;

    if (filteredDrafts.length === 0) return;

    Alert.alert(
      'Approve All',
      `Create all ${filteredDrafts.length} pending items?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve All',
          onPress: async () => {
            for (const draft of filteredDrafts) {
              await handleApprove(draft.id);
            }
          },
        },
      ]
    );
  }, [drafts, selectedFilter, handleApprove]);

  // =========================================================================
  // Computed Values
  // =========================================================================

  // Count drafts by type
  const draftCounts = drafts.reduce((acc, draft) => {
    acc[draft.draftType] = (acc[draft.draftType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Filter drafts
  const filteredDrafts = selectedFilter 
    ? drafts.filter(d => d.draftType === selectedFilter)
    : drafts;

  // Available filter types
  const filterTypes = [
    { type: 'TASK', label: 'Tasks', icon: 'checkbox-marked-circle-outline', color: '#3B82F6' },
    { type: 'EVENT', label: 'Events', icon: 'calendar', color: '#8B5CF6' },
    { type: 'CHALLENGE', label: 'Challenges', icon: 'trophy', color: '#F59E0B' },
    { type: 'NOTE', label: 'Notes', icon: 'note-text', color: '#10B981' },
    { type: 'BILL', label: 'Bills', icon: 'receipt', color: '#EF4444' },
    { type: 'EPIC', label: 'Epics', icon: 'view-dashboard', color: '#6366F1' },
  ].filter(f => draftCounts[f.type] > 0);

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
        subtitle={`${drafts.length} item${drafts.length !== 1 ? 's' : ''} awaiting review`}
        showBack
        rightAction={
          drafts.length > 0 ? (
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

      {drafts.length === 0 ? (
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
                  count={drafts.length}
                  isSelected={selectedFilter === null}
                  onPress={() => setSelectedFilter(null)}
                />
                {filterTypes.map(filter => (
                  <FilterChip
                    key={filter.type}
                    label={filter.label}
                    icon={filter.icon}
                    color={filter.color}
                    count={draftCounts[filter.type] || 0}
                    isSelected={selectedFilter === filter.type}
                    onPress={() => setSelectedFilter(
                      selectedFilter === filter.type ? null : filter.type
                    )}
                  />
                ))}
              </ScrollView>
            </View>
          )}

          {/* Drafts List */}
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ 
              padding: 16,
              paddingBottom: Math.max(insets.bottom, 16) + 16,
            }}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={() => fetchDrafts(true)}
                tintColor={colors.primary}
              />
            }
          >
            {filteredDrafts.length === 0 ? (
              <View className="items-center py-8">
                <Text style={{ color: colors.textSecondary }}>
                  No {selectedFilter?.toLowerCase() || ''} items pending
                </Text>
              </View>
            ) : (
              filteredDrafts.map(draft => (
                <PendingDraftCard
                  key={draft.id}
                  draft={draft}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  isLoading={processingDraftId === draft.id}
                />
              ))
            )}
          </ScrollView>
        </View>
      )}
    </Container>
  );
}
