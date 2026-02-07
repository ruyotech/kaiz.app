/**
 * MindsetFeed — TikTok-style vertical swipe feed for mindset quotes
 *
 * Uses react-native-reanimated + gesture-handler for swipe navigation.
 * Floating action buttons for share & favorite.
 * All server state via TanStack Query hooks.
 */
import React, { useCallback, useRef, useState } from 'react';
import { View, Dimensions, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { MindsetCard } from './MindsetCard';
import { useMindsetPreferencesStore } from '../../store/mindsetStore';
import { useToggleMindsetFavorite } from '../../hooks/queries';
import { mindsetIcons } from '../../constants/icons';
import { AppIcon } from '../ui/AppIcon';
import { moduleColors } from '../../constants/theme';
import type { MindsetContent, MindsetTheme } from '../../types/models';
import { logger } from '../../utils/logger';

interface MindsetFeedProps {
  feedItems: MindsetContent[];
  themes: MindsetTheme[];
  isLoading?: boolean;
  onLongPress?: (content: MindsetContent) => void;
  onShare?: (content: MindsetContent, cardRef: React.RefObject<View | null>) => void;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_HEIGHT * 0.2;

export const MindsetFeed = React.memo(function MindsetFeed({
  feedItems,
  themes,
  isLoading,
  onLongPress,
  onShare,
}: MindsetFeedProps) {
  const { selectedThemeId } = useMindsetPreferencesStore();
  const toggleFavorite = useToggleMindsetFavorite();

  const translateY = useSharedValue(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const cardRef = useRef<View>(null);

  // Resolve active theme
  const activeTheme =
    themes.find((t) => t.id === selectedThemeId) || themes[0];

  const currentContent = feedItems[currentIndex];
  const nextContentItem = feedItems[currentIndex + 1];

  // ── Navigation callbacks ────────────────────────────────────────────
  const goNext = useCallback(() => {
    setCurrentIndex((prev) => {
      if (prev < feedItems.length - 1) return prev + 1;
      return 0; // loop back
    });
  }, [feedItems.length]);

  const goPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : prev));
  }, []);

  const handleFavorite = useCallback(() => {
    if (currentContent) {
      toggleFavorite.mutate(currentContent.id);
    }
  }, [currentContent, toggleFavorite]);

  const handleLongPress = useCallback(() => {
    if (currentContent && onLongPress) {
      onLongPress(currentContent);
    }
  }, [currentContent, onLongPress]);

  const handleShare = useCallback(() => {
    if (currentContent && onShare) {
      onShare(currentContent, cardRef);
    }
  }, [currentContent, onShare]);

  // ── Gesture ─────────────────────────────────────────────────────────
  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      if (event.translationY < 0) {
        translateY.value = event.translationY;
      } else if (currentIndex > 0) {
        translateY.value = event.translationY * 0.3;
      }
    })
    .onEnd((event) => {
      const velocity = event.velocityY;

      // Swipe up → next
      if (event.translationY < -SWIPE_THRESHOLD || velocity < -800) {
        translateY.value = withTiming(-SCREEN_HEIGHT, { duration: 250 }, (finished) => {
          if (finished) {
            runOnJS(goNext)();
            translateY.value = 0;
          }
        });
      }
      // Swipe down → previous
      else if (
        (event.translationY > SWIPE_THRESHOLD * 0.5 || velocity > 800) &&
        currentIndex > 0
      ) {
        translateY.value = withTiming(SCREEN_HEIGHT, { duration: 250 }, (finished) => {
          if (finished) {
            runOnJS(goPrevious)();
            translateY.value = 0;
          }
        });
      }
      // Snap back
      else {
        translateY.value = withSpring(0, {
          damping: 20,
          stiffness: 300,
          overshootClamping: true,
        });
      }
    });

  const longPressGesture = Gesture.LongPress()
    .minDuration(500)
    .onStart(() => {
      runOnJS(handleLongPress)();
    });

  const composedGesture = Gesture.Race(longPressGesture, panGesture);

  // ── Animated styles ─────────────────────────────────────────────────
  const currentCardStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      Math.abs(translateY.value),
      [0, SWIPE_THRESHOLD],
      [1, 0.95],
      Extrapolation.CLAMP,
    );
    const opacity = interpolate(
      Math.abs(translateY.value),
      [0, SWIPE_THRESHOLD * 2],
      [1, 0],
      Extrapolation.CLAMP,
    );
    return {
      transform: [{ translateY: translateY.value }, { scale }],
      opacity,
    };
  });

  const nextCardStyle = useAnimatedStyle(() => {
    const ty = interpolate(
      translateY.value,
      [-SCREEN_HEIGHT, 0],
      [0, SCREEN_HEIGHT * 0.1],
      Extrapolation.CLAMP,
    );
    const scale = interpolate(
      translateY.value,
      [-SWIPE_THRESHOLD, 0],
      [1, 0.9],
      Extrapolation.CLAMP,
    );
    const opacity = interpolate(
      translateY.value,
      [-SWIPE_THRESHOLD, 0],
      [1, 0.3],
      Extrapolation.CLAMP,
    );
    return {
      transform: [{ translateY: ty }, { scale }],
      opacity,
    };
  });

  // ── Loading / empty states ──────────────────────────────────────────
  if (isLoading || !currentContent || !activeTheme) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={moduleColors.mindset} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      {/* Next card (underneath) */}
      {nextContentItem && (
        <Animated.View style={[StyleSheet.absoluteFill, nextCardStyle]}>
          <MindsetCard content={nextContentItem} theme={activeTheme} />
        </Animated.View>
      )}

      {/* Current card */}
      <GestureDetector gesture={composedGesture}>
        <Animated.View
          style={[styles.flex1, currentCardStyle]}
          ref={cardRef}
          collapsable={false}
        >
          <MindsetCard content={currentContent} theme={activeTheme} />
        </Animated.View>
      </GestureDetector>

      {/* Floating actions */}
      <View style={styles.fab}>
        <Pressable onPress={handleShare} style={styles.fabButton}>
          <AppIcon icon={mindsetIcons.share} size={24} color="#FFFFFF" />
        </Pressable>

        <Pressable onPress={handleFavorite} style={styles.fabButton}>
          <AppIcon
            icon={
              currentContent.isFavorite
                ? mindsetIcons.favorite
                : mindsetIcons.favoriteOutline
            }
            size={24}
            color={currentContent.isFavorite ? '#EF4444' : '#FFFFFF'}
          />
        </Pressable>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  flex1: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#111827',
  },
  fab: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    gap: 16,
  },
  fabButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
});
