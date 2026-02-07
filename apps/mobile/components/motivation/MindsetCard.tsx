/**
 * MindsetCard — Full-screen motivational quote card
 *
 * Uses expo-image for background images, expo-linear-gradient for gradients.
 * Dynamic font sizing based on quote length. Life wheel area badge.
 * Wrapped in React.memo for FlashList / feed performance.
 */
import React from 'react';
import { View, Text, Dimensions, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import type { MindsetContent, MindsetTheme } from '../../types/models';
import { mindsetIcons } from '../../constants/icons';
import { AppIcon } from '../ui/AppIcon';

interface MindsetCardProps {
  content: MindsetContent;
  theme: MindsetTheme;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

/** Map life-wheel area IDs to emoji + label */
function getDimensionLabel(areaId: string | null, areaName: string | null): string {
  if (!areaId || !areaName) return '';
  const emojiMap: Record<string, string> = {
    'lw-1': '\u{1F4AA}',
    'lw-2': '\u{1F4BC}',
    'lw-3': '\u{1F4B0}',
    'lw-4': '\u{1F4DA}',
    'lw-5': '\u{2764}\u{FE0F}',
    'lw-6': '\u{1F465}',
    'lw-7': '\u{1F3AE}',
    'lw-8': '\u{1F3E1}',
  };
  return `${emojiMap[areaId] ?? '\u{2728}'} ${areaName}`;
}

/** Dynamically scale font size based on quote length */
function getDynamicFontSize(text: string): number {
  const len = text.length;
  if (len < 60) return 34;
  if (len < 100) return 30;
  if (len < 140) return 26;
  if (len < 200) return 23;
  if (len < 260) return 21;
  return 19;
}

export const MindsetCard = React.memo(function MindsetCard({
  content,
  theme,
}: MindsetCardProps) {
  const dynamicFontSize = getDynamicFontSize(content.body);
  const hasBackgroundImage = content.backgroundImageUrl || theme.defaultAsset;
  const hasGradient = theme.gradientColors.length >= 2;

  return (
    <View style={styles.container}>
      {/* Background layer */}
      {hasBackgroundImage ? (
        <>
          <Image
            source={{ uri: content.backgroundImageUrl ?? theme.defaultAsset ?? '' }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            cachePolicy="memory-disk"
            transition={300}
          />
          <View style={[StyleSheet.absoluteFill, styles.imageOverlay]} />
        </>
      ) : hasGradient ? (
        <LinearGradient
          colors={theme.gradientColors as [string, string, ...string[]]}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      ) : (
        <View
          style={[StyleSheet.absoluteFill, { backgroundColor: theme.backgroundColor }]}
        />
      )}

      {/* Content */}
      <View style={styles.contentContainer}>
        <Text
          style={[
            styles.body,
            {
              color: hasBackgroundImage ? '#FFFFFF' : theme.textColor,
              fontSize: dynamicFontSize,
              lineHeight: dynamicFontSize * 1.4,
            },
          ]}
        >
          {content.body}
        </Text>

        {content.author ? (
          <Text
            style={[
              styles.author,
              { color: hasBackgroundImage ? 'rgba(255,255,255,0.85)' : theme.textColor },
            ]}
          >
            \u2014 {content.author}
          </Text>
        ) : null}

        {content.lifeWheelAreaId ? (
          <View
            style={[
              styles.areaBadge,
              {
                backgroundColor: content.lifeWheelAreaColor
                  ? `${content.lifeWheelAreaColor}30`
                  : 'rgba(255,255,255,0.2)',
              },
            ]}
          >
            <Text
              style={[
                styles.areaText,
                {
                  color: hasBackgroundImage
                    ? '#FFFFFF'
                    : content.lifeWheelAreaColor ?? theme.accentColor,
                },
              ]}
            >
              {getDimensionLabel(content.lifeWheelAreaId, content.lifeWheelAreaName)}
            </Text>
          </View>
        ) : null}
      </View>

      {/* Swipe hint */}
      <View style={styles.swipeHint}>
        <AppIcon
          icon={mindsetIcons.swipeUp}
          size={20}
          color={hasBackgroundImage ? 'rgba(255,255,255,0.4)' : `${theme.textColor}40`}
        />
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageOverlay: {
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  contentContainer: {
    paddingHorizontal: 32,
    maxWidth: SCREEN_WIDTH - 48,
    alignItems: 'center',
  },
  body: {
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: -0.5,
  },
  author: {
    fontSize: 16,
    fontWeight: '500',
    opacity: 0.85,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  areaBadge: {
    marginTop: 28,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  areaText: {
    fontSize: 13,
    fontWeight: '600',
  },
  swipeHint: {
    position: 'absolute',
    bottom: 50,
    alignSelf: 'center',
  },
});
