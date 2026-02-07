/**
 * Motivation Screen — TikTok-style mindset feed
 *
 * Server state from TanStack Query. Swipe feed, action sheet, share.
 */
import { useCallback, useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import BottomSheet from '@gorhom/bottom-sheet';
import { MindsetFeed } from '../../../components/motivation/MindsetFeed';
import { MindsetActionSheet } from '../../../components/motivation/MindsetActionSheet';
import { useMindsetFeed, useMindsetThemes, useToggleMindsetFavorite } from '../../../hooks/queries';
import { useShareQuote } from '../../../hooks/useShareQuote';
import type { MindsetContent } from '../../../types/models';
import { logger } from '../../../utils/logger';

export default function MotivationScreen() {
  const { data: feedItems = [], isLoading: feedLoading } = useMindsetFeed();
  const { data: themes = [], isLoading: themesLoading } = useMindsetThemes();
  const toggleFavorite = useToggleMindsetFavorite();
  const { shareAsImage, copyText } = useShareQuote();

  const sheetRef = useRef<BottomSheet>(null);
  const [selectedContent, setSelectedContent] = useState<MindsetContent | null>(null);
  const cardRefForShare = useRef<View>(null);

  // ── Handlers ────────────────────────────────────────────────────────
  const handleLongPress = useCallback((content: MindsetContent) => {
    setSelectedContent(content);
    sheetRef.current?.snapToIndex(0);
  }, []);

  const handleShare = useCallback(
    (content: MindsetContent, cardRef: React.RefObject<View | null>) => {
      cardRefForShare.current = cardRef.current;
      shareAsImage(content, cardRef);
    },
    [shareAsImage],
  );

  const handleSheetFavorite = useCallback(() => {
    if (selectedContent) {
      toggleFavorite.mutate(selectedContent.id);
    }
    sheetRef.current?.close();
  }, [selectedContent, toggleFavorite]);

  const handleSheetShare = useCallback(() => {
    if (selectedContent) {
      shareAsImage(selectedContent, cardRefForShare);
    }
    sheetRef.current?.close();
  }, [selectedContent, shareAsImage]);

  const handleSheetCopy = useCallback(() => {
    if (selectedContent) {
      copyText(selectedContent);
    }
    sheetRef.current?.close();
  }, [selectedContent, copyText]);

  const handleSheetClose = useCallback(() => {
    setSelectedContent(null);
  }, []);

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      <MindsetFeed
        feedItems={feedItems}
        themes={themes}
        isLoading={feedLoading || themesLoading}
        onLongPress={handleLongPress}
        onShare={handleShare}
      />

      <MindsetActionSheet
        sheetRef={sheetRef}
        content={selectedContent}
        onToggleFavorite={handleSheetFavorite}
        onShare={handleSheetShare}
        onCopy={handleSheetCopy}
        onClose={handleSheetClose}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000000',
  },
});
