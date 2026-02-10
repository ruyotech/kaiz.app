/**
 * BurndownChart — Renders a simple burndown chart with ideal + actual lines.
 * Uses react-native-svg for lightweight, dependency-free charting.
 */
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Polyline, Circle, Line, Text as SvgText } from 'react-native-svg';
import { useThemeContext } from '../../providers/ThemeProvider';
import { borderRadius, spacing, fontSize } from '../../constants/theme';
import type { BurndownPoint } from '../../types/sensai.types';

interface BurndownChartProps {
  data: BurndownPoint[];
  /** Card title */
  title?: string;
  /** Total width override (defaults to screen width - 48) */
  width?: number;
  height?: number;
}

export const BurndownChart = React.memo(function BurndownChart({
  data,
  title = 'Sprint Burndown',
  width: widthOverride,
  height = 200,
}: BurndownChartProps) {
  const { colors } = useThemeContext();
  const screenWidth = Dimensions.get('window').width;
  const chartWidth = widthOverride ?? screenWidth - 48;

  const padding = { top: 16, right: 16, bottom: 28, left: 36 };
  const innerW = chartWidth - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;

  // Filter only known (non-future) actual points
  const knownActual = useMemo(
    () => data.filter((d) => d.remainingPoints >= 0),
    [data],
  );

  const maxPoints = useMemo(() => {
    if (data.length === 0) return 1;
    return Math.max(
      ...data.map((d) => d.idealRemaining),
      ...knownActual.map((d) => d.remainingPoints),
    );
  }, [data, knownActual]);

  // helpers
  const x = (i: number) => padding.left + (i / Math.max(data.length - 1, 1)) * innerW;
  const y = (val: number) => padding.top + (1 - val / maxPoints) * innerH;

  const idealPoints = data.map((d, i) => `${x(i)},${y(d.idealRemaining)}`).join(' ');
  const actualPoints = knownActual
    .map((d) => {
      const idx = data.indexOf(d);
      return `${x(idx)},${y(d.remainingPoints)}`;
    })
    .join(' ');

  // X-axis labels — show first, middle, last dates
  const xLabels = useMemo(() => {
    if (data.length === 0) return [];
    const indices = [0, Math.floor(data.length / 2), data.length - 1];
    return [...new Set(indices)].map((i) => ({
      x: x(i),
      label: data[i].date.slice(5), // "MM-DD"
    }));
  }, [data]);

  if (data.length === 0) {
    return (
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.empty, { color: colors.textSecondary }]}>No burndown data yet</Text>
      </View>
    );
  }

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      <View className="flex-row items-center mb-2" style={{ gap: 12 }}>
        <Legend color="#3B82F6" label="Ideal" />
        <Legend color="#10B981" label="Actual" />
      </View>
      <Svg width={chartWidth} height={height}>
        {/* Y grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((frac) => (
          <Line
            key={frac}
            x1={padding.left}
            y1={y(frac * maxPoints)}
            x2={padding.left + innerW}
            y2={y(frac * maxPoints)}
            stroke={colors.border}
            strokeWidth={0.5}
          />
        ))}

        {/* Y-axis labels */}
        {[0, 0.5, 1].map((frac) => (
          <SvgText
            key={`y-${frac}`}
            x={padding.left - 6}
            y={y(frac * maxPoints) + 4}
            fontSize={9}
            fill={colors.textTertiary}
            textAnchor="end"
          >
            {Math.round(frac * maxPoints)}
          </SvgText>
        ))}

        {/* Ideal line */}
        <Polyline
          points={idealPoints}
          fill="none"
          stroke="#3B82F6"
          strokeWidth={2}
          strokeDasharray="6,3"
        />

        {/* Actual line */}
        {knownActual.length > 1 && (
          <Polyline
            points={actualPoints}
            fill="none"
            stroke="#10B981"
            strokeWidth={2.5}
          />
        )}

        {/* Actual dots */}
        {knownActual.map((d) => {
          const idx = data.indexOf(d);
          return (
            <Circle
              key={idx}
              cx={x(idx)}
              cy={y(d.remainingPoints)}
              r={3}
              fill="#10B981"
            />
          );
        })}

        {/* X-axis labels */}
        {xLabels.map((lbl, i) => (
          <SvgText
            key={i}
            x={lbl.x}
            y={height - 4}
            fontSize={9}
            fill={colors.textTertiary}
            textAnchor="middle"
          >
            {lbl.label}
          </SvgText>
        ))}
      </Svg>
    </View>
  );
});

/** Small inline legend dot + label */
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
