/**
 * CeremonyBanner — Shows the active sprint ceremony context at the top of chat.
 *
 * Displayed when the user enters a ceremony mode (standup, planning, review, retro).
 * Shows ceremony name, sprint info, and an exit button.
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import type { CeremonyContext } from '../../types/commandCenter';

// ── Props ───────────────────────────────────────────────────────────────────

interface CeremonyBannerProps {
  ceremony: CeremonyContext;
  /** Called when user taps the close/exit button. */
  onExit: () => void;
}

// ── Component ───────────────────────────────────────────────────────────────

export const CeremonyBanner = React.memo(function CeremonyBanner({
  ceremony,
  onExit,
}: CeremonyBannerProps) {
  const { isDark } = useTheme();
  const modeKey = ceremony.mode.toLowerCase();
  const cfg = ceremonyConfig[modeKey] ?? ceremonyConfig.standup;

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? cfg.darkBg : cfg.lightBg, borderColor: isDark ? cfg.darkBorder : cfg.lightBorder },
      ]}
    >
      <View style={styles.left}>
        <View style={[styles.iconCircle, { backgroundColor: cfg.iconBg }]}>
          <MaterialCommunityIcons name={cfg.icon as never} size={18} color={cfg.iconColor} />
        </View>
        <View style={styles.textWrap}>
          <Text style={[styles.title, { color: isDark ? cfg.darkText : cfg.lightText }]}>
            {cfg.label}
          </Text>
          {ceremony.sprintId ? (
            <Text style={[styles.subtitle, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              Sprint {ceremony.sprintId.slice(0, 8)}
            </Text>
          ) : null}
        </View>
      </View>

      <TouchableOpacity onPress={onExit} style={styles.exitBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <MaterialCommunityIcons name="close" size={18} color={isDark ? '#9CA3AF' : '#6B7280'} />
      </TouchableOpacity>
    </View>
  );
});

// ── Ceremony config lookup ──────────────────────────────────────────────────

interface CeremonyStyle {
  label: string;
  icon: string;
  iconBg: string;
  iconColor: string;
  lightBg: string;
  darkBg: string;
  lightBorder: string;
  darkBorder: string;
  lightText: string;
  darkText: string;
}

const ceremonyConfig: Record<string, CeremonyStyle> = {
  standup: {
    label: 'Daily Standup',
    icon: 'weather-sunny',
    iconBg: '#FEF3C7',
    iconColor: '#F59E0B',
    lightBg: '#FFFBEB',
    darkBg: '#451A03',
    lightBorder: '#FDE68A',
    darkBorder: '#78350F',
    lightText: '#92400E',
    darkText: '#FDE68A',
  },
  planning: {
    label: 'Sprint Planning',
    icon: 'clipboard-list-outline',
    iconBg: '#DBEAFE',
    iconColor: '#3B82F6',
    lightBg: '#EFF6FF',
    darkBg: '#1E3A5F',
    lightBorder: '#BFDBFE',
    darkBorder: '#1E40AF',
    lightText: '#1E40AF',
    darkText: '#93C5FD',
  },
  review: {
    label: 'Sprint Review',
    icon: 'chart-timeline-variant',
    iconBg: '#D1FAE5',
    iconColor: '#10B981',
    lightBg: '#ECFDF5',
    darkBg: '#064E3B',
    lightBorder: '#A7F3D0',
    darkBorder: '#065F46',
    lightText: '#065F46',
    darkText: '#6EE7B7',
  },
  retro: {
    label: 'Sprint Retrospective',
    icon: 'lightbulb-on-outline',
    iconBg: '#EDE9FE',
    iconColor: '#8B5CF6',
    lightBg: '#F5F3FF',
    darkBg: '#2E1065',
    lightBorder: '#DDD6FE',
    darkBorder: '#5B21B6',
    lightText: '#5B21B6',
    darkText: '#C4B5FD',
  },
};

// ── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
  },
  left: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  iconCircle: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  textWrap: { marginLeft: 10, flex: 1 },
  title: { fontSize: 14, fontWeight: '600' },
  subtitle: { fontSize: 12, marginTop: 1 },
  exitBtn: { padding: 4 },
});

export default CeremonyBanner;
