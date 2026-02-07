/**
 * React Query hooks — Mindset content, feed, themes & favorites
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mindsetApi } from '../../services/api';
import { mindsetKeys } from './keys';
import { STALE_TIMES } from '../../providers/QueryProvider';
import type { MindsetContent } from '../../types/models';

// ── Queries ─────────────────────────────────────────────────────────────────

/** Curated feed — personalized ~20 items with contextual injection */
export function useMindsetFeed(weakDimensions?: string[]) {
  return useQuery({
    queryKey: mindsetKeys.feed(),
    queryFn: () => mindsetApi.getFeed(weakDimensions),
    staleTime: STALE_TIMES.lists,
  });
}

/** Paginated content list */
export function useMindsetContent(page = 0, size = 20) {
  return useQuery({
    queryKey: [...mindsetKeys.content(), { page, size }],
    queryFn: () => mindsetApi.getAllContent(page, size),
    staleTime: STALE_TIMES.static,
  });
}

export function useMindsetContentById(id: string) {
  return useQuery({
    queryKey: mindsetKeys.contentDetail(id),
    queryFn: () => mindsetApi.getContentById(id),
    enabled: !!id,
    staleTime: STALE_TIMES.static,
  });
}

export function useMindsetByDimension(tag: string) {
  return useQuery({
    queryKey: mindsetKeys.byDimension(tag),
    queryFn: () => mindsetApi.getContentByDimension(tag),
    enabled: !!tag,
    staleTime: STALE_TIMES.static,
  });
}

/** User's favorited content */
export function useMindsetFavorites() {
  return useQuery({
    queryKey: mindsetKeys.favorites(),
    queryFn: () => mindsetApi.getFavorites(),
    staleTime: STALE_TIMES.lists,
  });
}

/** All available themes */
export function useMindsetThemes() {
  return useQuery({
    queryKey: mindsetKeys.themes(),
    queryFn: () => mindsetApi.getAllThemes(),
    staleTime: STALE_TIMES.static,
  });
}

export function useMindsetTheme(id: string) {
  return useQuery({
    queryKey: mindsetKeys.themeDetail(id),
    queryFn: () => mindsetApi.getThemeById(id),
    enabled: !!id,
    staleTime: STALE_TIMES.static,
  });
}

// ── Mutations ───────────────────────────────────────────────────────────────

/** Toggle favorite with optimistic update on feed + favorites cache */
export function useToggleMindsetFavorite() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => mindsetApi.toggleFavorite(id),

    onMutate: async (id: string) => {
      // Cancel in-flight queries
      await qc.cancelQueries({ queryKey: mindsetKeys.feed() });
      await qc.cancelQueries({ queryKey: mindsetKeys.favorites() });

      // Snapshot previous values
      const previousFeed = qc.getQueryData<MindsetContent[]>(mindsetKeys.feed());
      const previousFavorites = qc.getQueryData<MindsetContent[]>(mindsetKeys.favorites());

      // Optimistic toggle in feed cache
      if (previousFeed) {
        qc.setQueryData<MindsetContent[]>(mindsetKeys.feed(), (old) =>
          old?.map((item) =>
            item.id === id
              ? {
                  ...item,
                  isFavorite: !item.isFavorite,
                  favoriteCount: item.isFavorite
                    ? item.favoriteCount - 1
                    : item.favoriteCount + 1,
                }
              : item,
          ),
        );
      }

      return { previousFeed, previousFavorites };
    },

    onError: (_err, _id, context) => {
      // Rollback on error
      if (context?.previousFeed) {
        qc.setQueryData(mindsetKeys.feed(), context.previousFeed);
      }
      if (context?.previousFavorites) {
        qc.setQueryData(mindsetKeys.favorites(), context.previousFavorites);
      }
    },

    onSettled: () => {
      // Refetch to ensure server sync
      qc.invalidateQueries({ queryKey: mindsetKeys.feed() });
      qc.invalidateQueries({ queryKey: mindsetKeys.favorites() });
    },
  });
}

