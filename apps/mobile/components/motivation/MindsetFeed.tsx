/**
 * MindsetFeed — Full-screen vertical pager for mindset quotes
 *
 * Uses FlatList with pagingEnabled for native iOS/Android snapping.
 * The OS handles momentum, deceleration, and snap physics — zero
 * manual gesture math, zero overlap, zero jank.
 *
 * Floating action buttons for share & favorite.
 * All server state via TanStack Query hooks.
 */
import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  useWindowDimensions,
  type ViewToken,
  type LayoutChangeEvent,
} from 'react-native';
import { MindsetCard } from './MindsetCard';
import { useMindsetPreferencesStore } from '../../store/mindsetStore';
import { useToggleMindsetFavorite } from '../../hooks/queries';
import { mindsetIcons } from '../../constants/icons';
import { AppIcon } from '../ui/AppIcon';
import { moduleColors } from '../../constants/theme';
import type { MindsetContent, MindsetTheme } from '../../types/models';

interface MindsetFeedProps {
  feedItems: MindsetContent[];
  themes: MindsetTheme[];
  isLoading?: boolean;
  onLongPress?: (content: MindsetContent) => void;
  onShare?: (content: MindsetContent, cardRef: React.RefObject<View | null>) => void;
}

export const MindsetFeed = React.memo(function MindsetFeed({
  feedItems,
  themes,
  isLoading,
  onLongPress,
  onShare,
}: MindsetFeedProps) {
  const { width: windowWidth } = useWindowDimensions();
  const { selectedThemeId } = useMindsetPreferencesStore();
  const toggleFavorite = useToggleMindsetFavorite();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);
  const cardRef = useRef<View>(null);
  const flatListRef = useRef<FlatList<MindsetContent>>(null);

  // Measure the actual visible container height (accounts for tab bar, safe areas, etc.)
  const handleLayout = useCallback((e: LayoutChangeEvent) => {
    const { height } = e.nativeEvent.layout;
    if (height > 0 && height !== containerHeight) {
      setContainerHeight(height);
    }
  }, [containerHeight]);

  // Resolve active theme
  const activeTheme =
    themes.find((t) => t.id === selectedThemeId) || themes[0];

  const currentContent = feedItems[currentIndex];

  // ── Viewability tracking ────────────────────────────────────────────
  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        setCurrentIndex(viewableItems[0].index);
      }
    },
  ).current;

  // ── Actions ─────────────────────────────────────────────────────────
  const handleFavorite = useCallback(() => {
    if (currentContent) {
      toggleFavorite.mutate(currentContent.id);
    }
  }, [currentContent, toggleFavorite]);

  const handleShare = useCallback(() => {
    if (currentContent && onShare) {
      onShare(currentContent, cardRef);
    }
  }, [currentContent, onShare]);

  // ── Render item ─────────────────────────────────────────────────────
  const renderItem = useCallback(
    ({ item }: { item: MindsetContent }) => (
      <Pressable
        style={{ width: windowWidth, height: containerHeight }}
        onLongPress={() => onLongPress?.(item)}
        delayLongPress={500}
      >
        <View
          ref={item.id === currentContent?.id ? cardRef : undefined}
          collapsable={false}
          style={styles.cardWrapper}
        >
          <MindsetCard content={item} theme={activeTheme} containerHeight={containerHeight} />
        </View>
      </Pressable>
    ),
    [activeTheme, containerHeight, windowWidth, currentContent?.id, onLongPress],
  );

  const keyExtractor = useCallback(
    (item: MindsetContent) => item.id,
    [],
  );

  const getItemLayout = useCallback(
    (_: unknown, index: number) => ({
      length: containerHeight,
      offset: containerHeight * index,
      index,
    }),
    [containerHeight],
  );

  // ── Loading / empty states ──────────────────────────────────────────
  if (isLoading || !currentContent || !activeTheme) {
    return (
      <View style={styles.loadingContainer} onLayout={handleLayout}>
        <ActivityIndicator size="large" color={moduleColors.mindset} />
      </View>
    );
  }

  // Wait for container measurement before rendering the list
  if (containerHeight === 0) {
    return (
      <View style={styles.root} onLayout={handleLayout}>
        <ActivityIndicator size="large" color={moduleColors.mindset} />
      </View>
    );
  }

  return (
    <View style={styles.root} onLayout={handleLayout}>
      <FlatList
        ref={flatListRef}
        data={feedItems}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        getItemLayout={getItemLayout}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        bounces={false}
        decelerationRate="fast"
        snapToAlignment="start"
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        initialNumToRender={2}
        maxToRenderPerBatch={3}
        windowSize={3}
        removeClippedSubviews
      />

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
    backgroundColor: '#000000',
  },
  cardWrapper: {
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
    bottom: 120,
    right: 20,
    gap: 16,
  },
  fabButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
});
