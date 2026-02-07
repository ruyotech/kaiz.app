/**
 * MindsetActionSheet — Bottom-sheet with quote actions
 *
 * Actions: Save/Remove Favorite, Share as Image, Copy Text.
 * Uses @gorhom/bottom-sheet for smooth native-feel sheet.
 */
import React, { useCallback, useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import { mindsetIcons, actionIcons } from '../../constants/icons';
import { AppIcon } from '../ui/AppIcon';
import { useThemeContext } from '../../providers/ThemeProvider';
import type { MindsetContent } from '../../types/models';

interface MindsetActionSheetProps {
  sheetRef: React.RefObject<BottomSheet | null>;
  content: MindsetContent | null;
  onToggleFavorite: () => void;
  onShare: () => void;
  onCopy: () => void;
  onClose: () => void;
}

export const MindsetActionSheet = React.memo(function MindsetActionSheet({
  sheetRef,
  content,
  onToggleFavorite,
  onShare,
  onCopy,
  onClose,
}: MindsetActionSheetProps) {
  const { colors } = useThemeContext();
  const snapPoints = useMemo(() => ['35%'], []);

  const renderBackdrop = useCallback(
    (props: Record<string, unknown>) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
      />
    ),
    [],
  );

  if (!content) return null;

  return (
    <BottomSheet
      ref={sheetRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      onClose={onClose}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: colors.card }}
      handleIndicatorStyle={{ backgroundColor: colors.border }}
    >
      <BottomSheetView style={styles.sheetContent}>
        {/* Quote preview */}
        <View style={[styles.preview, { backgroundColor: colors.backgroundTertiary }]}>
          <Text
            style={[styles.previewText, { color: colors.textSecondary }]}
            numberOfLines={2}
          >
            &ldquo;{content.body}&rdquo;
          </Text>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <ActionRow
            icon={
              content.isFavorite ? mindsetIcons.favorite : mindsetIcons.favoriteOutline
            }
            iconColor={content.isFavorite ? '#EF4444' : colors.text}
            label={content.isFavorite ? 'Remove from Favorites' : 'Save to Favorites'}
            textColor={colors.text}
            onPress={onToggleFavorite}
          />

          <ActionRow
            icon={mindsetIcons.share}
            iconColor={colors.text}
            label="Share as Image"
            textColor={colors.text}
            onPress={onShare}
          />

          <ActionRow
            icon={actionIcons.copy}
            iconColor={colors.text}
            label="Copy Text"
            textColor={colors.text}
            onPress={onCopy}
          />
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
});

// ── ActionRow sub-component ─────────────────────────────────────────────────

interface ActionRowProps {
  icon: { name: string; source: string };
  iconColor: string;
  label: string;
  textColor: string;
  onPress: () => void;
}

function ActionRow({ icon, iconColor, label, textColor, onPress }: ActionRowProps) {
  return (
    <Pressable style={styles.actionRow} onPress={onPress}>
      <AppIcon icon={icon as any} size={22} color={iconColor} />
      <Text style={[styles.actionLabel, { color: textColor }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  sheetContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  preview: {
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
  },
  previewText: {
    fontSize: 14,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  actions: {
    gap: 4,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 8,
    gap: 14,
    borderRadius: 10,
  },
  actionLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
});
