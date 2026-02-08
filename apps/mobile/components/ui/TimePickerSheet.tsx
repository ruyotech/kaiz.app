/**
 * TimePickerSheet — Bottom sheet with native iOS/Android time picker.
 *
 * Uses @react-native-community/datetimepicker:
 * - iOS: display="spinner" for hour/minute/AM-PM wheels
 * - Android: native time dialog
 */

import React, { useState, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet, Platform, Modal } from 'react-native';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { useThemeContext } from '../../providers/ThemeProvider';
import { spacing, borderRadius, fontSize } from '../../constants/theme';

interface TimePickerSheetProps {
  visible: boolean;
  value: Date;
  onConfirm: (date: Date) => void;
  onCancel: () => void;
}

function TimePickerSheetComponent({
  visible,
  value,
  onConfirm,
  onCancel,
}: TimePickerSheetProps) {
  const { colors, isDark } = useThemeContext();
  const [tempTime, setTempTime] = useState(value);

  React.useEffect(() => {
    setTempTime(value);
  }, [value]);

  const handleChange = useCallback(
    (_event: DateTimePickerEvent, selectedDate?: Date) => {
      if (Platform.OS === 'android') {
        if (_event.type === 'set' && selectedDate) {
          onConfirm(selectedDate);
        } else {
          onCancel();
        }
        return;
      }
      if (selectedDate) {
        setTempTime(selectedDate);
      }
    },
    [onConfirm, onCancel],
  );

  const handleDone = useCallback(() => {
    onConfirm(tempTime);
  }, [tempTime, onConfirm]);

  // Android native dialog
  if (Platform.OS === 'android') {
    if (!visible) return null;
    return (
      <DateTimePicker
        value={tempTime}
        mode="time"
        display="default"
        onChange={handleChange}
        themeVariant={isDark ? 'dark' : 'light'}
      />
    );
  }

  // iOS — modal with spinner
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
              Select Time
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

          {/* Native time spinner */}
          <View style={styles.pickerContainer}>
            <DateTimePicker
              value={tempTime}
              mode="time"
              display="spinner"
              onChange={handleChange}
              themeVariant={isDark ? 'dark' : 'light'}
              style={styles.picker}
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export const TimePickerSheet = React.memo(TimePickerSheetComponent);

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
    paddingVertical: spacing.lg,
  },
  picker: {
    width: '100%',
    height: 200,
  },
});
