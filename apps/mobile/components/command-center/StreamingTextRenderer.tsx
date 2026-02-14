/**
 * StreamingTextRenderer — Renders AI text token-by-token with a blinking cursor.
 *
 * Uses react-native-reanimated for the cursor blink animation.
 * Accepts either a complete text string (renders instantly) or an
 * isStreaming flag that shows the cursor while tokens arrive.
 */

import React, { useEffect } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  cancelAnimation,
} from 'react-native-reanimated';
import { useTheme } from '../../hooks/useTheme';

// ── Props ───────────────────────────────────────────────────────────────────

interface StreamingTextRendererProps {
  /** The text to render (may grow incrementally while streaming). */
  text: string;
  /** Whether tokens are still arriving — shows a blinking cursor. */
  isStreaming?: boolean;
  /** Optional text style overrides. */
  textClassName?: string;
  /** Optional color override for the text. */
  textColor?: string;
}

// ── Component ───────────────────────────────────────────────────────────────

export const StreamingTextRenderer = React.memo(function StreamingTextRenderer({
  text,
  isStreaming = false,
  textClassName = 'text-sm',
  textColor,
}: StreamingTextRendererProps) {
  const { colors, isDark } = useTheme();
  const cursorOpacity = useSharedValue(1);

  // Animate cursor blink while streaming
  useEffect(() => {
    if (isStreaming) {
      cursorOpacity.value = withRepeat(
        withSequence(
          withTiming(0, { duration: 400 }),
          withTiming(1, { duration: 400 }),
        ),
        -1, // infinite
        false,
      );
    } else {
      cancelAnimation(cursorOpacity);
      cursorOpacity.value = 0;
    }
  }, [isStreaming, cursorOpacity]);

  const cursorStyle = useAnimatedStyle(() => ({
    opacity: cursorOpacity.value,
  }));

  const resolvedColor = textColor ?? colors.text;

  return (
    <View style={styles.container}>
      <Text className={textClassName} style={{ color: resolvedColor }}>
        {text}
        {isStreaming && (
          <Animated.Text
            style={[
              styles.cursor,
              cursorStyle,
              { color: isDark ? '#93C5FD' : '#3B82F6' },
            ]}
          >
            {'▎'}
          </Animated.Text>
        )}
      </Text>
    </View>
  );
});

// ── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cursor: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default StreamingTextRenderer;
