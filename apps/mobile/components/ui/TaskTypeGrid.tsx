/**
 * TaskTypeGrid — 3-column grid selector for Task / Event / Birthday.
 *
 * Each type has a distinct icon, color, and smart defaults when selected.
 * Uses semantic icons from constants/icons.ts and colors from schedule types.
 */

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { AppIcon } from './AppIcon';
import { scheduleIcons } from '../../constants/icons';
import { useThemeContext } from '../../providers/ThemeProvider';
import { spacing, borderRadius, fontSize } from '../../constants/theme';
import type { TaskType } from '../../types/schedule.types';
import { TASK_TYPE_LABELS, TASK_TYPE_COLORS } from '../../types/schedule.types';

interface TaskTypeGridProps {
  value: TaskType;
  onChange: (type: TaskType) => void;
}

const TASK_TYPES: TaskType[] = ['TASK', 'EVENT', 'BIRTHDAY'];

const TYPE_ICON_MAP = {
  TASK: scheduleIcons.task,
  EVENT: scheduleIcons.event,
  BIRTHDAY: scheduleIcons.birthday,
} as const;

function TaskTypeGridComponent({ value, onChange }: TaskTypeGridProps) {
  const { colors } = useThemeContext();

  return (
    <View style={styles.container}>
      {TASK_TYPES.map((type) => {
        const isSelected = value === type;
        const accentColor = TASK_TYPE_COLORS[type];

        return (
          <Pressable
            key={type}
            onPress={() => onChange(type)}
            style={[
              styles.typeCard,
              {
                backgroundColor: isSelected ? accentColor + '18' : colors.backgroundSecondary,
                borderColor: isSelected ? accentColor : colors.border,
                borderWidth: isSelected ? 1.5 : 1,
              },
            ]}
          >
            <AppIcon
              icon={TYPE_ICON_MAP[type]}
              size={28}
              color={isSelected ? accentColor : colors.textSecondary}
            />
            <Text
              style={[
                styles.label,
                {
                  color: isSelected ? accentColor : colors.textSecondary,
                  fontWeight: isSelected ? '600' : '400',
                },
              ]}
            >
              {TASK_TYPE_LABELS[type]}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export const TaskTypeGrid = React.memo(TaskTypeGridComponent);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  typeCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.xs,
  },
  label: {
    fontSize: fontSize.sm,
  },
});
