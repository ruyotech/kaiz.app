/**
 * DatePickerSheet — Bottom sheet with native iOS/Android date picker.
 *
 * Uses @react-native-community/datetimepicker:
 * - iOS: display="inline" renders the native calendar grid
 * - Android: native date dialog
 */

import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, Pressable, StyleSheet, Platform, Modal } from 'react-native';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { useThemeContext } from '../../providers/ThemeProvider';
import { spacing, borderRadius, fontSize } from '../../constants/theme';

interface DatePickerSheetProps {
  visible: boolean;
  value: Date;
  onConfirm: (date: Date) => void;
  onCancel: () => void;
  minimumDate?: Date;
}

function DatePickerSheetComponent({
  visible,
  value,
  onConfirm,
  onCancel,
  minimumDate,
}: DatePickerSheetProps) {
  const { colors, isDark } = useThemeContext();
  const [tempDate, setTempDate] = useState(value);

  // Sync temp date when value changes from outside
  React.useEffect(() => {
    setTempDate(value);
  }, [value]);

  const handleChange = useCallback(
    (_event: DateTimePickerEvent, selectedDate?: Date) => {
      if (Platform.OS === 'android') {
        // Android fires change on selection and dismiss
        if (_event.type === 'set' && selectedDate) {
          onConfirm(selectedDate);
        } else {
          onCancel();
        }
        return;
      }
      // iOS — update local state, wait for Done press
      if (selectedDate) {
        setTempDate(selectedDate);
      }
    },
    [onConfirm, onCancel],
  );

  const handleDone = useCallback(() => {
    onConfirm(tempDate);
  }, [tempDate, onConfirm]);

  // Android shows its own native dialog
  if (Platform.OS === 'android') {
    if (!visible) return null;
    return (
      <DateTimePicker
        value={tempDate}
        mode="date"
        display="default"
        onChange={handleChange}
        minimumDate={minimumDate}
        themeVariant={isDark ? 'dark' : 'light'}
      />
    );
  }

  // iOS — wrap in a modal with Done/Cancel buttons
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
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <Pressable onPress={onCancel} hitSlop={8}>
              <Text style={[styles.headerButton, { color: colors.primary }]}>
                Cancel
              </Text>
            </Pressable>
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              Select Date
            </Text>
            <Pressable onPress={handleDone} hitSlop={8}>
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

          {/* Native date picker — inline calendar grid on iOS */}
          <View style={styles.pickerContainer}>
            <DateTimePicker
              value={tempDate}
              mode="date"
              display="inline"
              onChange={handleChange}
              minimumDate={minimumDate}
              themeVariant={isDark ? 'dark' : 'light'}
              style={styles.picker}
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export const DatePickerSheet = React.memo(DatePickerSheetComponent);

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheetContainer: {
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
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
  pickerContainer: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  picker: {
    width: '100%',
    height: 340,
  },
});
