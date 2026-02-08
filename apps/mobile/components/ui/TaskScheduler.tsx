/**
 * TaskScheduler — Unified task scheduling component.
 *
 * Composes TaskTypeGrid, DatePickerSheet, TimePickerSheet,
 * RecurrencePickerSheet, AlertPickerSheet into a single controlled component.
 *
 * Layout:
 *   Row 0: TaskTypeGrid (Task / Event / Birthday)
 *   Row 1: All-day toggle
 *   Row 2: Date + Time
 *   Row 3: Recurrence
 *   Row 4: Alert
 *   Row 5: Location (Event/Birthday only)
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  Pressable,
  Switch,
  TextInput,
  StyleSheet,
  Platform,
} from 'react-native';
import { AppIcon } from './AppIcon';
import { TaskTypeGrid } from './TaskTypeGrid';
import { DatePickerSheet } from './DatePickerSheet';
import { TimePickerSheet } from './TimePickerSheet';
import { RecurrencePickerSheet } from './RecurrencePickerSheet';
import { AlertPickerSheet } from './AlertPickerSheet';
import { scheduleIcons } from '../../constants/icons';
import { useThemeContext } from '../../providers/ThemeProvider';
import { spacing, borderRadius, fontSize } from '../../constants/theme';
import type {
  TaskType,
  TaskScheduleState,
  RecurrencePreset,
  CustomRecurrence,
  AlertBefore,
} from '../../types/schedule.types';
import {
  createDefaultScheduleState,
  RECURRENCE_PRESET_LABELS,
  ALERT_BEFORE_LABELS,
} from '../../types/schedule.types';

interface TaskSchedulerProps {
  value: TaskScheduleState;
  onChange: (state: TaskScheduleState) => void;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function getRecurrenceLabel(
  preset: RecurrencePreset,
  custom: CustomRecurrence | null,
): string {
  if (preset === 'CUSTOM' && custom) {
    const unitLabel =
      custom.interval === 1
        ? custom.unit
        : `${custom.unit}s`;
    return `Every ${custom.interval} ${unitLabel}`;
  }
  return RECURRENCE_PRESET_LABELS[preset];
}

function TaskSchedulerComponent({ value, onChange }: TaskSchedulerProps) {
  const { colors, isDark } = useThemeContext();

  // Sheet visibility states
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showRecurrencePicker, setShowRecurrencePicker] = useState(false);
  const [showAlertPicker, setShowAlertPicker] = useState(false);

  // ---- Handlers ----

  const handleTaskTypeChange = useCallback(
    (type: TaskType) => {
      // When switching type, reset to smart defaults for that type
      const defaults = createDefaultScheduleState(type);
      onChange({
        ...defaults,
        // Preserve the date the user already selected
        date: value.date,
      });
    },
    [value.date, onChange],
  );

  const handleAllDayToggle = useCallback(
    (allDay: boolean) => {
      onChange({ ...value, allDay });
    },
    [value, onChange],
  );

  const handleDateConfirm = useCallback(
    (date: Date) => {
      setShowDatePicker(false);
      onChange({ ...value, date });
    },
    [value, onChange],
  );

  const handleTimeConfirm = useCallback(
    (time: Date) => {
      setShowTimePicker(false);
      onChange({ ...value, time });
    },
    [value, onChange],
  );

  const handleRecurrenceSelect = useCallback(
    (preset: RecurrencePreset, custom?: CustomRecurrence) => {
      setShowRecurrencePicker(false);
      onChange({
        ...value,
        recurrence: preset,
        customRecurrence: custom ?? null,
      });
    },
    [value, onChange],
  );

  const handleAlertSelect = useCallback(
    (alert: AlertBefore) => {
      setShowAlertPicker(false);
      onChange({ ...value, alertBefore: alert });
    },
    [value, onChange],
  );

  const handleLocationChange = useCallback(
    (location: string) => {
      onChange({ ...value, location });
    },
    [value, onChange],
  );

  // ---- Derived values ----

  const showLocation = value.taskType === 'EVENT' || value.taskType === 'BIRTHDAY';
  const recurrenceLabel = useMemo(
    () => getRecurrenceLabel(value.recurrence, value.customRecurrence),
    [value.recurrence, value.customRecurrence],
  );
  const alertLabel = ALERT_BEFORE_LABELS[value.alertBefore];

  return (
    <View style={styles.container}>
      {/* ---- Row 0: Task Type Grid ---- */}
      <View style={styles.section}>
        <TaskTypeGrid value={value.taskType} onChange={handleTaskTypeChange} />
      </View>

      {/* ---- Row 1: All-day toggle ---- */}
      <View
        style={[
          styles.card,
          { backgroundColor: colors.backgroundSecondary, borderColor: colors.border },
        ]}
      >
        <View style={styles.row}>
          <AppIcon icon={scheduleIcons.allDay} size={22} color={colors.textSecondary} />
          <Text style={[styles.rowLabel, { color: colors.text }]}>All-day</Text>
          <Switch
            value={value.allDay}
            onValueChange={handleAllDayToggle}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={Platform.OS === 'android' ? '#FFFFFF' : undefined}
          />
        </View>

        {/* ---- Row 2: Date + Time ---- */}
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <View style={styles.dateTimeRow}>
          <Pressable
            onPress={() => setShowDatePicker(true)}
            style={styles.dateButton}
            hitSlop={4}
          >
            <Text style={[styles.dateText, { color: colors.text }]}>
              {formatDate(value.date)}
            </Text>
          </Pressable>
          {!value.allDay && (
            <Pressable
              onPress={() => setShowTimePicker(true)}
              style={styles.timeButton}
              hitSlop={4}
            >
              <Text style={[styles.timeText, { color: colors.primary }]}>
                {formatTime(value.time)}
              </Text>
            </Pressable>
          )}
        </View>

        {/* ---- Row 3: Recurrence ---- */}
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <Pressable
          onPress={() => setShowRecurrencePicker(true)}
          style={styles.row}
          hitSlop={4}
        >
          <AppIcon
            icon={scheduleIcons.recurrence}
            size={22}
            color={colors.textSecondary}
          />
          <Text style={[styles.rowLabel, { color: colors.text, flex: 1 }]}>
            {recurrenceLabel}
          </Text>
          <AppIcon
            icon={scheduleIcons.chevronUp}
            size={18}
            color={colors.textTertiary}
          />
          <AppIcon
            icon={scheduleIcons.chevronDown}
            size={18}
            color={colors.textTertiary}
            style={{ marginLeft: -10, marginTop: -4 }}
          />
        </Pressable>

        {/* ---- Row 4: Alert ---- */}
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <Pressable
          onPress={() => setShowAlertPicker(true)}
          style={styles.row}
          hitSlop={4}
        >
          <AppIcon
            icon={scheduleIcons.alert}
            size={22}
            color={colors.textSecondary}
          />
          <Text style={[styles.rowLabel, { color: colors.text, flex: 1 }]}>
            {alertLabel}
          </Text>
          <AppIcon
            icon={scheduleIcons.chevron}
            size={18}
            color={colors.textTertiary}
          />
        </Pressable>

        {/* ---- Row 5: Location (Event/Birthday only) ---- */}
        {showLocation && (
          <>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.row}>
              <AppIcon
                icon={scheduleIcons.location}
                size={22}
                color={colors.textSecondary}
              />
              <TextInput
                value={value.location}
                onChangeText={handleLocationChange}
                placeholder="Add location"
                placeholderTextColor={colors.placeholder}
                style={[
                  styles.locationInput,
                  { color: colors.text },
                ]}
              />
            </View>
          </>
        )}
      </View>

      {/* ---- Picker Sheets ---- */}
      <DatePickerSheet
        visible={showDatePicker}
        value={value.date}
        onConfirm={handleDateConfirm}
        onCancel={() => setShowDatePicker(false)}
      />
      <TimePickerSheet
        visible={showTimePicker}
        value={value.time}
        onConfirm={handleTimeConfirm}
        onCancel={() => setShowTimePicker(false)}
      />
      <RecurrencePickerSheet
        visible={showRecurrencePicker}
        value={value.recurrence}
        customRecurrence={value.customRecurrence}
        onSelect={handleRecurrenceSelect}
        onCancel={() => setShowRecurrencePicker(false)}
      />
      <AlertPickerSheet
        visible={showAlertPicker}
        value={value.alertBefore}
        onSelect={handleAlertSelect}
        onCancel={() => setShowAlertPicker(false)}
      />
    </View>
  );
}

export const TaskScheduler = React.memo(TaskSchedulerComponent);

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  section: {
    // TaskTypeGrid wrapper
  },
  card: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  rowLabel: {
    fontSize: fontSize.md,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: spacing.lg,
  },
  dateTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  dateButton: {
    flex: 1,
  },
  dateText: {
    fontSize: fontSize.md,
    fontWeight: '500',
  },
  timeButton: {
    paddingLeft: spacing.md,
  },
  timeText: {
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  locationInput: {
    flex: 1,
    fontSize: fontSize.md,
    padding: 0,
  },
});
