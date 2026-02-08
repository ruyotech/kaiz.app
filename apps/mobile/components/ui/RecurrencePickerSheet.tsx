/**
 * RecurrencePickerSheet — Bottom sheet with recurrence presets and custom option.
 *
 * Preset options: Does not repeat / Every day / Every week / Every month / Every year / Custom...
 * Selecting "Custom..." opens a sub-view with interval picker and end-date selector.
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Modal,
  ScrollView,
  Platform,
} from 'react-native';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { WheelPicker } from './WheelPicker';
import { AppIcon } from './AppIcon';
import { actionIcons, scheduleIcons, navIcons } from '../../constants/icons';
import { useThemeContext } from '../../providers/ThemeProvider';
import { spacing, borderRadius, fontSize } from '../../constants/theme';
import type {
  RecurrencePreset,
  CustomRecurrence,
  RecurrenceUnit,
} from '../../types/schedule.types';
import {
  RECURRENCE_PRESET_LABELS,
  RECURRENCE_UNIT_LABELS,
} from '../../types/schedule.types';

interface RecurrencePickerSheetProps {
  visible: boolean;
  value: RecurrencePreset;
  customRecurrence: CustomRecurrence | null;
  onSelect: (preset: RecurrencePreset, custom?: CustomRecurrence) => void;
  onCancel: () => void;
}

const PRESETS: RecurrencePreset[] = [
  'NONE',
  'DAILY',
  'WEEKLY',
  'MONTHLY',
  'YEARLY',
  'CUSTOM',
];

const RECURRENCE_UNITS: RecurrenceUnit[] = ['day', 'week', 'month', 'year'];

function RecurrencePickerSheetComponent({
  visible,
  value,
  customRecurrence,
  onSelect,
  onCancel,
}: RecurrencePickerSheetProps) {
  const { colors, isDark } = useThemeContext();
  const [showCustom, setShowCustom] = useState(false);
  const [customInterval, setCustomInterval] = useState(
    customRecurrence?.interval ?? 1,
  );
  const [customUnit, setCustomUnit] = useState<RecurrenceUnit>(
    customRecurrence?.unit ?? 'day',
  );
  const [customEndDate, setCustomEndDate] = useState<Date | null>(
    customRecurrence?.endDate ?? null,
  );
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  const handlePresetSelect = useCallback(
    (preset: RecurrencePreset) => {
      if (preset === 'CUSTOM') {
        setShowCustom(true);
        return;
      }
      setShowCustom(false);
      onSelect(preset);
    },
    [onSelect],
  );

  const handleCustomDone = useCallback(() => {
    onSelect('CUSTOM', {
      interval: customInterval,
      unit: customUnit,
      endDate: customEndDate,
    });
    setShowCustom(false);
  }, [customInterval, customUnit, customEndDate, onSelect]);

  const handleBack = useCallback(() => {
    setShowCustom(false);
  }, []);

  const handleEndDateChange = useCallback(
    (_event: DateTimePickerEvent, selectedDate?: Date) => {
      if (Platform.OS === 'android') {
        setShowEndDatePicker(false);
        if (_event.type === 'set' && selectedDate) {
          setCustomEndDate(selectedDate);
        }
        return;
      }
      if (selectedDate) {
        setCustomEndDate(selectedDate);
      }
    },
    [],
  );

  const summaryLabel =
    customInterval === 1
      ? `Every ${customUnit}`
      : `Every ${customInterval} ${customUnit}s`;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onCancel}
    >
      <Pressable style={styles.backdrop} onPress={onCancel}>
        <Pressable
          style={[styles.sheetContainer, { backgroundColor: colors.card }]}
          onPress={() => {}}
        >
          {showCustom ? (
            /* ============ Custom Recurrence Sub-View ============ */
            <>
              <View
                style={[styles.header, { borderBottomColor: colors.border }]}
              >
                <Pressable onPress={handleBack} hitSlop={8}>
                  <View style={styles.backRow}>
                    <AppIcon
                      icon={navIcons.chevronLeft}
                      size={20}
                      color={colors.primary}
                    />
                    <Text
                      style={[styles.headerButton, { color: colors.primary }]}
                    >
                      Back
                    </Text>
                  </View>
                </Pressable>
                <Text style={[styles.headerTitle, { color: colors.text }]}>
                  Custom recurrence
                </Text>
                <Pressable onPress={handleCustomDone} hitSlop={8}>
                  <Text
                    style={[
                      styles.headerButton,
                      { color: colors.primary, fontWeight: '600' },
                    ]}
                  >
                    Done
                  </Text>
                </Pressable>
              </View>

              {/* Summary label */}
              <View
                style={[
                  styles.summaryRow,
                  { borderBottomColor: colors.border },
                ]}
              >
                <AppIcon
                  icon={scheduleIcons.recurrence}
                  size={22}
                  color={colors.textSecondary}
                />
                <Text style={[styles.summaryText, { color: colors.text }]}>
                  {summaryLabel}
                </Text>
              </View>

              {/* Interval + Unit pickers */}
              <View style={styles.pickerRow}>
                <View style={styles.pickerColumn}>
                  <WheelPicker
                    items={Array.from({ length: 99 }, (_, i) => ({
                      label: String(i + 1),
                      value: i + 1,
                    }))}
                    selectedValue={customInterval}
                    onValueChange={(val) => setCustomInterval(val as number)}
                  />
                </View>
                <View style={styles.pickerColumn}>
                  <WheelPicker
                    items={RECURRENCE_UNITS.map((unit) => ({
                      label: RECURRENCE_UNIT_LABELS[unit],
                      value: unit,
                    }))}
                    selectedValue={customUnit}
                    onValueChange={(val) =>
                      setCustomUnit(val as RecurrenceUnit)
                    }
                  />
                </View>
              </View>

              {/* End date row */}
              <Pressable
                onPress={() => {
                  if (customEndDate) {
                    setCustomEndDate(null);
                  } else {
                    setShowEndDatePicker(true);
                  }
                }}
                style={[
                  styles.endDateRow,
                  { borderTopColor: colors.border },
                ]}
              >
                <AppIcon
                  icon={
                    customEndDate
                      ? scheduleIcons.endDate
                      : scheduleIcons.noEnd
                  }
                  size={22}
                  color={colors.textSecondary}
                />
                <Text
                  style={[styles.endDateText, { color: colors.text }]}
                >
                  {customEndDate
                    ? `Ends ${customEndDate.toLocaleDateString(undefined, {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}`
                    : 'Does not end'}
                </Text>
                <AppIcon
                  icon={scheduleIcons.chevron}
                  size={20}
                  color={colors.textTertiary}
                />
              </Pressable>

              {/* End date picker (Android) */}
              {showEndDatePicker && Platform.OS === 'android' && (
                <DateTimePicker
                  value={customEndDate ?? new Date()}
                  mode="date"
                  display="default"
                  onChange={handleEndDateChange}
                  minimumDate={new Date()}
                  themeVariant={isDark ? 'dark' : 'light'}
                />
              )}

              {/* End date picker (iOS inline) */}
              {showEndDatePicker && Platform.OS === 'ios' && (
                <View style={styles.inlineDatePicker}>
                  <DateTimePicker
                    value={customEndDate ?? new Date()}
                    mode="date"
                    display="inline"
                    onChange={handleEndDateChange}
                    minimumDate={new Date()}
                    themeVariant={isDark ? 'dark' : 'light'}
                    style={{ width: '100%', height: 340 }}
                  />
                  <Pressable
                    onPress={() => setShowEndDatePicker(false)}
                    style={[
                      styles.closeDatePicker,
                      { backgroundColor: colors.primary },
                    ]}
                  >
                    <Text style={styles.closeDatePickerText}>Select</Text>
                  </Pressable>
                </View>
              )}
            </>
          ) : (
            /* ============ Presets List ============ */
            <>
              <View
                style={[styles.header, { borderBottomColor: colors.border }]}
              >
                <Pressable onPress={onCancel} hitSlop={8}>
                  <Text
                    style={[styles.headerButton, { color: colors.primary }]}
                  >
                    Cancel
                  </Text>
                </Pressable>
                <Text style={[styles.headerTitle, { color: colors.text }]}>
                  Repeat
                </Text>
                <View style={styles.headerSpacer} />
              </View>

              <ScrollView
                style={styles.optionsList}
                bounces={false}
                showsVerticalScrollIndicator={false}
              >
                {PRESETS.map((preset) => {
                  const isSelected =
                    value === preset ||
                    (preset === 'CUSTOM' && value === 'CUSTOM');

                  return (
                    <Pressable
                      key={preset}
                      onPress={() => handlePresetSelect(preset)}
                      style={[
                        styles.optionRow,
                        { borderBottomColor: colors.border },
                      ]}
                    >
                      <View style={styles.checkContainer}>
                        {isSelected && (
                          <AppIcon
                            icon={actionIcons.check}
                            size={18}
                            color={colors.primary}
                          />
                        )}
                      </View>
                      <Text
                        style={[
                          styles.optionText,
                          {
                            color: isSelected
                              ? colors.text
                              : colors.textSecondary,
                            fontWeight: isSelected ? '600' : '400',
                          },
                        ]}
                      >
                        {RECURRENCE_PRESET_LABELS[preset]}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export const RecurrencePickerSheet = React.memo(RecurrencePickerSheetComponent);

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheetContainer: {
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: '80%',
    paddingBottom: spacing['5xl'],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
  },
  headerButton: {
    fontSize: fontSize.md,
  },
  headerSpacer: {
    width: 50,
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  optionsList: {
    paddingHorizontal: spacing.lg,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md + 2,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  checkContainer: {
    width: 28,
    alignItems: 'center',
  },
  optionText: {
    fontSize: fontSize.md,
    flex: 1,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  summaryText: {
    fontSize: fontSize.md,
    fontWeight: '500',
  },
  pickerRow: {
    flexDirection: 'row',
    height: 200,
    paddingHorizontal: spacing.lg,
  },
  pickerColumn: {
    flex: 1,
  },
  endDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md + 2,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  endDateText: {
    fontSize: fontSize.md,
    flex: 1,
  },
  inlineDatePicker: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    alignItems: 'center',
  },
  closeDatePicker: {
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    marginTop: spacing.sm,
  },
  closeDatePickerText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: fontSize.md,
  },
});
