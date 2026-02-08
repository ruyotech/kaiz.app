/**
 * TaskScheduler — Unified task scheduling component.
 *
 * Composes TaskTypeGrid, DatePickerSheet, TimePickerSheet,
 * RecurrencePickerSheet, AlertPickerSheet into a single controlled component.
 *
 * Layout:
 *   Card 0: TaskTypeGrid (Task / Event / Birthday)
 *   Card 1: Scheduling
 *     Row 0: Date Mode toggle (Sprint | Backlog | Specific Day) — hidden for Birthday
 *     Sprint mode: Sprint picker dropdown
 *     Backlog mode: confirmation row
 *     Specific Day mode: All-day, Date+Time, Recurrence, optional sprint assignment
 *   Card 2: Alert (separate section)
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  Pressable,
  Switch,
  ScrollView,
  StyleSheet,
  Platform,
  TouchableOpacity,
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
  DateMode,
  ScheduleSprint,
} from '../../types/schedule.types';
import {
  createDefaultScheduleState,
  RECURRENCE_PRESET_LABELS,
  ALERT_BEFORE_LABELS,
  DATE_MODE_LABELS,
} from '../../types/schedule.types';

interface TaskSchedulerProps {
  value: TaskScheduleState;
  onChange: (state: TaskScheduleState) => void;
  sprints?: ScheduleSprint[];
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
      custom.interval === 1 ? custom.unit : `${custom.unit}s`;
    return `Every ${custom.interval} ${unitLabel}`;
  }
  return RECURRENCE_PRESET_LABELS[preset];
}

function formatSprintLabel(sprint: ScheduleSprint, isFirst: boolean): string {
  const start = new Date(sprint.startDate);
  const end = new Date(sprint.endDate);
  const monthName = start.toLocaleDateString('en-US', { month: 'short' });
  return `S${sprint.weekNumber.toString().padStart(2, '0')} • ${monthName} ${start.getDate()}-${end.getDate()}${isFirst ? ' (Current)' : ''}`;
}

// ============================================================================
// Segmented Control (3-way: Sprint | Backlog | Specific Day)
// ============================================================================

interface SegmentedControlProps {
  options: { value: string; label: string }[];
  selectedValue: string;
  onSelect: (value: string) => void;
  accentColor: string;
  surfaceColor: string;
  textSecondaryColor: string;
}

function SegmentedControl({
  options,
  selectedValue,
  onSelect,
  accentColor,
  surfaceColor,
  textSecondaryColor,
}: SegmentedControlProps) {
  return (
    <View style={[segStyles.container, { backgroundColor: surfaceColor + '40' }]}>
      {options.map((opt) => {
        const isActive = opt.value === selectedValue;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onSelect(opt.value)}
            style={[
              segStyles.segment,
              isActive && { backgroundColor: accentColor + '18' },
              isActive && { borderColor: accentColor, borderWidth: 1.5 },
              !isActive && { borderColor: 'transparent', borderWidth: 1.5 },
            ]}
          >
            <Text
              style={[
                segStyles.segmentLabel,
                { color: isActive ? accentColor : textSecondaryColor },
                isActive && { fontWeight: '600' },
              ]}
            >
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const segStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: borderRadius.md,
    padding: 3,
    gap: 4,
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  segmentLabel: {
    fontSize: fontSize.sm,
    fontWeight: '500',
  },
});

// ============================================================================
// Sprint Dropdown (used in sprint mode & specific-day sprint row)
// ============================================================================

interface SprintDropdownProps {
  sprints: ScheduleSprint[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  colors: {
    primary: string;
    text: string;
    textSecondary: string;
    border: string;
  };
}

function SprintDropdown({
  sprints,
  selectedId,
  onSelect,
  colors,
}: SprintDropdownProps) {
  return (
    <ScrollView
      style={dropStyles.container}
      nestedScrollEnabled
      showsVerticalScrollIndicator
    >
      {sprints.map((sprint, idx) => (
        <TouchableOpacity
          key={sprint.id}
          onPress={() => onSelect(sprint.id)}
          style={[
            dropStyles.item,
            {
              backgroundColor:
                selectedId === sprint.id
                  ? colors.primary + '10'
                  : 'transparent',
              borderBottomColor: colors.border,
              borderBottomWidth:
                idx < sprints.length - 1 ? StyleSheet.hairlineWidth : 0,
            },
          ]}
        >
          <View style={dropStyles.itemContent}>
            <AppIcon
              icon={scheduleIcons.sprint}
              size={18}
              color={
                selectedId === sprint.id
                  ? colors.primary
                  : colors.textSecondary
              }
            />
            <Text
              style={[
                dropStyles.itemText,
                {
                  color:
                    selectedId === sprint.id ? colors.primary : colors.text,
                },
              ]}
            >
              {formatSprintLabel(sprint, idx === 0)}
            </Text>
          </View>
          {selectedId === sprint.id && (
            <AppIcon
              icon={scheduleIcons.task}
              size={18}
              color={colors.primary}
            />
          )}
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const dropStyles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    borderRadius: borderRadius.md,
    maxHeight: 300,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  itemText: {
    fontSize: fontSize.sm,
    fontWeight: '500',
  },
});

// ============================================================================
// Main Component
// ============================================================================

function TaskSchedulerComponent({
  value,
  onChange,
  sprints = [],
}: TaskSchedulerProps) {
  const { colors } = useThemeContext();

  // Sheet visibility
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showRecurrencePicker, setShowRecurrencePicker] = useState(false);
  const [showAlertPicker, setShowAlertPicker] = useState(false);
  const [showSprintDropdown, setShowSprintDropdown] = useState(false);

  // ---- Birthday forces specific day, no mode toggle ----
  const isBirthday = value.taskType === 'BIRTHDAY';
  const effectiveDateMode: DateMode = isBirthday ? 'specific' : value.dateMode;

  // ---- Handlers ----

  const handleTaskTypeChange = useCallback(
    (type: TaskType) => {
      const defaults = createDefaultScheduleState(type);
      onChange({
        ...defaults,
        date: value.date,
        // Preserve sprint for non-birthday types; birthday is always specific, no sprint
        sprintId: type === 'BIRTHDAY' ? null : value.sprintId,
        // Birthday is always all-day
        allDay: type === 'BIRTHDAY' ? true : defaults.allDay,
      });
    },
    [value.date, value.sprintId, onChange],
  );

  const handleDateModeChange = useCallback(
    (mode: string) => {
      setShowSprintDropdown(false);
      const dateMode = mode as DateMode;
      let sprintId = value.sprintId;
      // Auto-set sprint context on mode change
      if (dateMode === 'backlog') {
        sprintId = null;
      } else if (dateMode === 'sprint' && !sprintId && sprints.length > 0) {
        sprintId = sprints[0].id;
      }
      onChange({ ...value, dateMode, sprintId });
    },
    [value, onChange, sprints],
  );

  const handleSprintSelect = useCallback(
    (sprintId: string) => {
      setShowSprintDropdown(false);
      onChange({ ...value, sprintId });
    },
    [value, onChange],
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

  // ---- Derived ----
  const recurrenceLabel = useMemo(
    () => getRecurrenceLabel(value.recurrence, value.customRecurrence),
    [value.recurrence, value.customRecurrence],
  );
  const alertLabel = ALERT_BEFORE_LABELS[value.alertBefore];

  // Sprint row in specific-day: only when not recurring and not birthday
  const showSpecificDaySprintRow =
    effectiveDateMode === 'specific' &&
    value.recurrence === 'NONE' &&
    !isBirthday;

  const selectedSprintLabel = useMemo(() => {
    if (!value.sprintId) return null; // null = placeholder
    const match = sprints.find((s) => s.id === value.sprintId);
    if (!match) return null;
    return formatSprintLabel(match, sprints[0]?.id === match.id);
  }, [value.sprintId, sprints]);

  const dateModeOptions = useMemo(
    () => [
      { value: 'sprint' as const, label: DATE_MODE_LABELS.sprint },
      { value: 'backlog' as const, label: DATE_MODE_LABELS.backlog },
      { value: 'specific' as const, label: DATE_MODE_LABELS.specific },
    ],
    [],
  );

  const cardStyle = useMemo(
    () => [
      styles.card,
      { backgroundColor: 'transparent', borderColor: colors.border },
    ],
    [colors.border],
  );

  const dropdownColors = useMemo(
    () => ({
      primary: colors.primary,
      text: colors.text,
      textSecondary: colors.textSecondary,
      border: colors.border,
    }),
    [colors.primary, colors.text, colors.textSecondary, colors.border],
  );

  return (
    <View style={styles.container}>
      {/* ---- TaskTypeGrid ---- */}
      <View style={styles.section}>
        <TaskTypeGrid value={value.taskType} onChange={handleTaskTypeChange} />
      </View>

      {/* ---- Card 1: Scheduling ---- */}
      <View style={cardStyle}>
        {/* Date Mode Toggle — hidden for Birthday (always specific) */}
        {!isBirthday && (
          <View style={styles.segmentRow}>
            <SegmentedControl
              options={dateModeOptions}
              selectedValue={value.dateMode}
              onSelect={handleDateModeChange}
              accentColor={colors.primary}
              surfaceColor={colors.inputBackground}
              textSecondaryColor={colors.textSecondary}
            />
          </View>
        )}

        {/* ---- Sprint mode: sprint picker ---- */}
        {effectiveDateMode === 'sprint' && (
          <>
            {!isBirthday && (
              <View
                style={[styles.divider, { backgroundColor: colors.border }]}
              />
            )}
            <Pressable
              onPress={() => setShowSprintDropdown(!showSprintDropdown)}
              style={styles.row}
              hitSlop={4}
            >
              <AppIcon
                icon={
                  value.sprintId
                    ? scheduleIcons.sprint
                    : scheduleIcons.backlog
                }
                size={22}
                color={colors.primary}
              />
              <Text
                style={[
                  styles.rowLabel,
                  { color: selectedSprintLabel ? colors.text : colors.textTertiary, flex: 1 },
                ]}
              >
                {selectedSprintLabel ?? 'Select sprint'}
              </Text>
              <AppIcon
                icon={
                  showSprintDropdown
                    ? scheduleIcons.chevronUp
                    : scheduleIcons.chevronDown
                }
                size={18}
                color={colors.textTertiary}
              />
            </Pressable>
            {showSprintDropdown && (
              <SprintDropdown
                sprints={sprints}
                selectedId={value.sprintId}
                onSelect={handleSprintSelect}
                colors={dropdownColors}
              />
            )}
          </>
        )}

        {/* ---- Backlog mode: confirmation ---- */}
        {effectiveDateMode === 'backlog' && (
          <>
            <View
              style={[styles.divider, { backgroundColor: colors.border }]}
            />
            <View style={styles.row}>
              <AppIcon
                icon={scheduleIcons.backlog}
                size={22}
                color={colors.primary}
              />
              <Text
                style={[
                  styles.rowLabel,
                  { color: colors.textSecondary, flex: 1 },
                ]}
              >
                Task will be saved to backlog
              </Text>
            </View>
          </>
        )}

        {/* ---- Specific Day mode ---- */}
        {effectiveDateMode === 'specific' && (
          <>
            {/* All-day toggle — hidden for Birthday (always all-day) */}
            {!isBirthday && (
              <>
                <View
                  style={[styles.divider, { backgroundColor: colors.border }]}
                />
                <View style={styles.row}>
                  <AppIcon
                    icon={scheduleIcons.allDay}
                    size={22}
                    color={colors.textSecondary}
                  />
                  <Text style={[styles.rowLabel, { color: colors.text, flex: 1 }]}>
                    All-day
                  </Text>
                  <Switch
                    value={value.allDay}
                    onValueChange={handleAllDayToggle}
                    trackColor={{ false: colors.border, true: colors.primary }}
                    thumbColor={
                      Platform.OS === 'android' ? '#FFFFFF' : undefined
                    }
                  />
                </View>
              </>
            )}

            {/* Date + Time (Birthday: date only, no time) */}
            <View
              style={[styles.divider, { backgroundColor: colors.border }]}
            />
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
              {!isBirthday && !value.allDay && (
                <Pressable
                  onPress={() => setShowTimePicker(true)}
                  style={styles.timeButton}
                  hitSlop={4}
                >
                  <Text
                    style={[styles.timeText, { color: colors.primary }]}
                  >
                    {formatTime(value.time)}
                  </Text>
                </Pressable>
              )}
            </View>

            {/* Recurrence — hidden for Birthday (always yearly) */}
            {!isBirthday && (
              <>
                <View
                  style={[styles.divider, { backgroundColor: colors.border }]}
                />
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
                  <Text
                    style={[styles.rowLabel, { color: colors.text, flex: 1 }]}
                  >
                    {recurrenceLabel}
                  </Text>
                  <AppIcon
                    icon={scheduleIcons.chevron}
                    size={18}
                    color={colors.textTertiary}
                  />
                </Pressable>
              </>
            )}

            {/* Sprint assignment (specific day, not recurring, not birthday) */}
            {showSpecificDaySprintRow && (
              <>
                <View
                  style={[
                    styles.divider,
                    { backgroundColor: colors.border },
                  ]}
                />
                <Pressable
                  onPress={() =>
                    setShowSprintDropdown(!showSprintDropdown)
                  }
                  style={styles.row}
                  hitSlop={4}
                >
                  <AppIcon
                    icon={
                      value.sprintId
                        ? scheduleIcons.sprint
                        : scheduleIcons.backlog
                    }
                    size={22}
                    color={colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.rowLabel,
                      { color: selectedSprintLabel ? colors.text : colors.textTertiary, flex: 1 },
                    ]}
                  >
                    {selectedSprintLabel ?? 'Assign to sprint'}
                  </Text>
                  <AppIcon
                    icon={
                      showSprintDropdown
                        ? scheduleIcons.chevronUp
                        : scheduleIcons.chevronDown
                    }
                    size={18}
                    color={colors.textTertiary}
                  />
                </Pressable>
                {showSprintDropdown && (
                  <SprintDropdown
                    sprints={sprints}
                    selectedId={value.sprintId}
                    onSelect={handleSprintSelect}
                    colors={dropdownColors}
                  />
                )}
              </>
            )}
          </>
        )}
      </View>

      {/* ---- Card 2: Alert (separate section) ---- */}
      <View style={cardStyle}>
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
          <Text
            style={[
              styles.rowLabel,
              {
                color: value.alertBefore === 'NONE' ? colors.textTertiary : colors.text,
                flex: 1,
              },
            ]}
          >
            {value.alertBefore === 'NONE' ? 'Add alert' : alertLabel}
          </Text>
          <AppIcon
            icon={scheduleIcons.chevron}
            size={18}
            color={colors.textTertiary}
          />
        </Pressable>
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
  section: {},
  card: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  segmentRow: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
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

});
