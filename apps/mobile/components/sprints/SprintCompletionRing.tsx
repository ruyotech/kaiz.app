/**
 * SprintCompletionRing — Circular progress indicator showing sprint completion %.
 * Uses react-native SVG primitives via react-native's built-in support.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  useAnimatedProps,
  useDerivedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useThemeContext } from '../../providers/ThemeProvider';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface SprintCompletionRingProps {
  /** 0 – 100 */
  percentage: number;
  size?: number;
  strokeWidth?: number;
  /** Accent color for the filled arc */
  color?: string;
  /** Center label (e.g. "85%") — auto-derived from percentage if not provided */
  label?: string;
  /** Sub-label below the main value */
  subLabel?: string;
}

export const SprintCompletionRing = React.memo(function SprintCompletionRing({
  percentage,
  size = 140,
  strokeWidth = 10,
  color,
  label,
  subLabel,
}: SprintCompletionRingProps) {
  const { colors } = useThemeContext();

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedPct = Math.min(100, Math.max(0, percentage));
  const accentColor = color ?? (clampedPct >= 80 ? '#10B981' : clampedPct >= 50 ? '#F59E0B' : '#EF4444');

  const progress = useDerivedValue(() =>
    withTiming(clampedPct / 100, { duration: 900, easing: Easing.out(Easing.cubic) }),
  );

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progress.value),
  }));

  return (
    <View style={styles.wrapper}>
      <Svg width={size} height={size}>
        {/* Background track */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.border}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Animated progress arc */}
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={accentColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={circumference}
          animatedProps={animatedProps}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      {/* Center label */}
      <View style={[styles.center, { width: size, height: size }]}>
        <Text style={[styles.value, { color: accentColor }]}>
          {label ?? `${Math.round(clampedPct)}%`}
        </Text>
        {subLabel ? (
          <Text style={[styles.subLabel, { color: colors.textSecondary }]}>
            {subLabel}
          </Text>
        ) : null}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontSize: 28,
    fontWeight: '800',
  },
  subLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
});
