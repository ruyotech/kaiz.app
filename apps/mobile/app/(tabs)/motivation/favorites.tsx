/**
 * Favorites Screen — saved mindset quotes as a scrollable list
 *
 * Uses useMindsetFavorites() from TanStack Query.
 * FlashList for performance. Pull-to-refresh. Unfavorite via swipe or tap.
 */
import { useCallback } from 'react';
import { View, Text, Alert, StyleSheet, Pressable } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Container } from '../../../components/layout/Container';
import { ScreenHeader } from '../../../components/layout/ScreenHeader';
import { Card } from '../../../components/ui/Card';
import { EmptyState } from '../../../components/ui/EmptyState';
import { AppIcon } from '../../../components/ui/AppIcon';
import { mindsetIcons } from '../../../constants/icons';
import { useMindsetFavorites, useToggleMindsetFavorite } from '../../../hooks/queries';
import { useThemeContext } from '../../../providers/ThemeProvider';
import type { MindsetContent } from '../../../types/models';

export default function FavoritesScreen() {
  const { colors } = useThemeContext();
  const { data: favorites = [], isLoading, refetch } = useMindsetFavorites();
  const toggleFavorite = useToggleMindsetFavorite();

  const handleRemove = useCallback(
    (contentId: string) => {
      Alert.alert(
        'Remove from Favorites',
        'Are you sure you want to remove this from your collection?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Remove',
            style: 'destructive',
            onPress: () => toggleFavorite.mutate(contentId),
          },
        ],
      );
    },
    [toggleFavorite],
  );

  const renderItem = useCallback(
    ({ item }: { item: MindsetContent }) => (
      <Card style={styles.card}>
        {/* Header row */}
        <View style={styles.cardHeader}>
          <View style={styles.cardBody}>
            {item.lifeWheelAreaName ? (
              <Text style={[styles.dimension, { color: item.lifeWheelAreaColor ?? colors.textSecondary }]}>
                {item.lifeWheelAreaName}
              </Text>
            ) : null}
            <Text style={[styles.quote, { color: colors.text }]}>{item.body}</Text>
            {item.author ? (
              <Text style={[styles.author, { color: colors.textSecondary }]}>
                {"\u2014"} {item.author}
              </Text>
            ) : null}
          </View>
          <Pressable onPress={() => handleRemove(item.id)} hitSlop={8}>
            <AppIcon icon={mindsetIcons.favorite} size={24} color="#EF4444" />
          </Pressable>
        </View>

        {/* Metadata badges */}
        <View style={[styles.meta, { borderTopColor: colors.border }]}>
          {item.emotionalTone ? (
            <View style={[styles.badge, { backgroundColor: colors.primaryLight }]}>
              <Text style={[styles.badgeText, { color: colors.primary }]}>
                {item.emotionalTone}
              </Text>
            </View>
          ) : null}
          <Text style={[styles.countText, { color: colors.textTertiary }]}>
            {item.favoriteCount} saves
          </Text>
        </View>
      </Card>
    ),
    [colors, handleRemove],
  );

  return (
    <Container>
      <ScreenHeader
        title="Favorites"
        subtitle={`${favorites.length} saved`}
        showBack
        showNotifications={false}
      />

      <FlashList
        data={favorites}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          isLoading ? null : (
            <EmptyState
              icon="❤️"
              title="No Favorites Yet"
              message="Tap the heart on any quote to save it here"
            />
          )
        }
        refreshing={isLoading}
        onRefresh={refetch}
      />
    </Container>
  );
}

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 32,
  },
  card: {
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  cardBody: {
    flex: 1,
  },
  dimension: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  quote: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 22,
  },
  author: {
    fontSize: 14,
    fontStyle: 'italic',
    marginTop: 6,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  countText: {
    fontSize: 12,
  },
});
