/**
 * CarriedOverBadge — Shows a carried-over indicator on tasks
 * that were moved from a previous sprint.
 */
import React from 'react';
import { View, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useThemeContext } from '../../providers/ThemeProvider';

interface CarriedOverBadgeProps {
  /** Original sprint the task was carried from */
  fromSprintId?: string | null;
  /** Original story points before re-estimation */
  originalPoints?: number | null;
  /** Current story points (after re-estimation) */
  currentPoints?: number;
  /** Compact mode — just icon + text, no points */
  compact?: boolean;
}

export const CarriedOverBadge = React.memo(function CarriedOverBadge({
  fromSprintId,
  originalPoints,
  currentPoints,
  compact = false,
}: CarriedOverBadgeProps) {
  const { colors } = useThemeContext();

  if (!fromSprintId) return null;

  const wasReEstimated = originalPoints != null && currentPoints != null && originalPoints !== currentPoints;

  return (
    <View
      className="flex-row items-center px-2 py-1 rounded-full"
      style={{ backgroundColor: '#F59E0B20' }}
    >
      <MaterialCommunityIcons name="arrow-right-bold-circle-outline" size={12} color="#F59E0B" />
      <Text className="text-xs font-medium ml-1" style={{ color: '#F59E0B' }}>
        Carried Over
      </Text>
      {!compact && wasReEstimated && (
        <Text className="text-xs ml-1" style={{ color: colors.textSecondary }}>
          ({originalPoints}→{currentPoints}pts)
        </Text>
      )}
    </View>
  );
});
