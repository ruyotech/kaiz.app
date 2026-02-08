/**
 * AlertPickerSheet — Bottom sheet with predefined alert-before options.
 *
 * Matches the iOS Calendar alert picker:
 * None / At time of event / 5 min / 10 min / 15 min / 30 min /
 * 1 hour / 2 hours / 1 day / 2 days / 1 week
 */

import React, { useCallback } from 'react';
import { View, Text, Pressable, StyleSheet, Modal, ScrollView } from 'react-native';
import { AppIcon } from './AppIcon';
import { actionIcons } from '../../constants/icons';
import { useThemeContext } from '../../providers/ThemeProvider';
import { spacing, borderRadius, fontSize } from '../../constants/theme';
import type { AlertBefore } from '../../types/schedule.types';
import { ALERT_BEFORE_LABELS, ALERT_OPTIONS } from '../../types/schedule.types';

interface AlertPickerSheetProps {
  visible: boolean;
  value: AlertBefore;
  onSelect: (alert: AlertBefore) => void;
  onCancel: () => void;
}

function AlertPickerSheetComponent({
  visible,
  value,
  onSelect,
  onCancel,
}: AlertPickerSheetProps) {
  const { colors } = useThemeContext();

  const handleSelect = useCallback(
    (option: AlertBefore) => {
      onSelect(option);
    },
    [onSelect],
  );

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
            <Text style={[styles.headerTitle, { color: colors.text }]}>Alert</Text>
            <View style={styles.headerSpacer} />
          </View>

          {/* Options list */}
          <ScrollView
            style={styles.optionsList}
            bounces={false}
            showsVerticalScrollIndicator={false}
          >
            {ALERT_OPTIONS.map((option) => {
              const isSelected = value === option;

              return (
                <Pressable
                  key={option}
                  onPress={() => handleSelect(option)}
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
                        color: isSelected ? colors.text : colors.textSecondary,
                        fontWeight: isSelected ? '600' : '400',
                      },
                    ]}
                  >
                    {ALERT_BEFORE_LABELS[option]}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export const AlertPickerSheet = React.memo(AlertPickerSheetComponent);

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheetContainer: {
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: '65%',
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
});
