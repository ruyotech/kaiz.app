/**
 * VelocityBarChart — Horizontal bars showing velocity across sprints.
 * Uses react-native-svg for lightweight rendering.
 */
import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Rect, Text as SvgText } from 'react-native-svg';
import { useThemeContext } from '../../providers/ThemeProvider';
import { borderRadius, spacing, fontSize } from '../../constants/theme';
import type { VelocitySprintRecord } from '../../types/sensai.types';

interface VelocityBarChartProps {
  sprints: VelocitySprintRecord[];
  title?: string;
  /** Bar color — defaults to brand primary blue */
  barColor?: string;
  height?: number;
}

export const VelocityBarChart = React.memo(function VelocityBarChart({
  sprints,
  title = 'Velocity Trend',
  barColor = '#3B82F6',
  height = 200,
}: VelocityBarChartProps) {
  const { colors } = useThemeContext();

  const maxPoints = useMemo(
    () => (sprints.length > 0 ? Math.max(...sprints.map((s) => s.committedPoints || s.completedPoints), 1) : 1),
    [sprints],
  );

  const barWidth = 28;
  const gap = 12;
  const padding = { top: 20, bottom: 36, left: 8, right: 8 };
  const chartWidth = sprints.length * (barWidth + gap) + padding.left + padding.right;
  const innerH = height - padding.top - padding.bottom;

  if (sprints.length === 0) {
    return (
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.empty, { color: colors.textSecondary }]}>
          Complete a sprint to see velocity
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      <View className="flex-row items-center mb-2" style={{ gap: 12 }}>
        <Legend color={barColor} label="Completed" />
        <Legend color={`${barColor}40`} label="Committed" />
      </View>
      <Svg width={chartWidth} height={height}>
        {sprints.map((s, i) => {
          const cx = padding.left + i * (barWidth + gap) + barWidth / 2;
          const committedH = (s.committedPoints / maxPoints) * innerH;
          const completedH = (s.completedPoints / maxPoints) * innerH;

          return (
            <React.Fragment key={s.sprintId ?? i}>
              {/* Committed bar (lighter background) */}
              <Rect
                x={cx - barWidth / 2}
                y={padding.top + innerH - committedH}
                width={barWidth}
                height={committedH}
                rx={4}
                fill={`${barColor}25`}
              />
              {/* Completed bar (solid foreground) */}
              <Rect
                x={cx - barWidth / 2}
                y={padding.top + innerH - completedH}
                width={barWidth}
                height={completedH}
                rx={4}
                fill={barColor}
              />
              {/* Value label on top */}
              <SvgText
                x={cx}
                y={padding.top + innerH - completedH - 4}
                fontSize={10}
                fontWeight="600"
                fill={colors.text}
                textAnchor="middle"
              >
                {s.completedPoints}
              </SvgText>
              {/* Sprint name at bottom */}
              <SvgText
                x={cx}
                y={height - 6}
                fontSize={9}
                fill={colors.textTertiary}
                textAnchor="middle"
              >
                {s.sprintName ? s.sprintName.replace('Sprint ', 'S') : `S${i + 1}`}
              </SvgText>
            </React.Fragment>
          );
        })}
      </Svg>
    </View>
  );
});

function Legend({ color, label }: { color: string; label: string }) {
  const { colors } = useThemeContext();
  return (
    <View className="flex-row items-center">
      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color, marginRight: 4 }} />
      <Text style={{ fontSize: 11, color: colors.textSecondary }}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    padding: spacing.lg,
  },
  title: {
    fontSize: fontSize.md,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  empty: {
    fontSize: fontSize.sm,
    textAlign: 'center',
    paddingVertical: spacing['3xl'],
  },
});
