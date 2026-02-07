/**
 * useShareQuote — Share a mindset quote as an image or text.
 *
 * Uses react-native-view-shot to capture the card as an image,
 * then the built-in Share API (no expo-sharing needed).
 * Requires native build (expo-clipboard needs dev client, not Expo Go).
 */
import { useCallback } from 'react';
import { Share, Platform, Alert } from 'react-native';
import { captureRef } from 'react-native-view-shot';
import * as Clipboard from 'expo-clipboard';
import { logger } from '../utils/logger';
import type { MindsetContent } from '../types/models';
import type { View } from 'react-native';

const TAG = 'useShareQuote';

export function useShareQuote() {
  /** Share the card as an image (requires a ref to the card View) */
  const shareAsImage = useCallback(
    async (content: MindsetContent, cardRef: React.RefObject<View | null>) => {
      if (!cardRef.current) {
        logger.warn(TAG, 'Card ref is null — cannot capture');
        return;
      }

      try {
        const uri = await captureRef(cardRef, {
          format: 'jpg',
          quality: 0.95,
          result: 'tmpfile',
        });

        const text = content.author
          ? `"${content.body}" \u2014 ${content.author}`
          : content.body;

        await Share.share(
          Platform.OS === 'ios'
            ? { url: uri, message: text }
            : { message: `${text}\n${uri}` },
        );
      } catch (error: unknown) {
        logger.error(TAG, 'Failed to share image', error);
      }
    },
    [],
  );

  /** Copy quote text to clipboard */
  const copyText = useCallback(async (content: MindsetContent) => {
    try {
      const text = content.author
        ? `"${content.body}" \u2014 ${content.author}`
        : content.body;
      await Clipboard.setStringAsync(text);
      Alert.alert('Copied', 'Quote copied to clipboard');
    } catch (error: unknown) {
      logger.error(TAG, 'Failed to copy text', error);
    }
  }, []);

  return { shareAsImage, copyText };
}
