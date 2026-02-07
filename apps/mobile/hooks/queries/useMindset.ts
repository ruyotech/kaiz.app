/**
 * React Query hooks — Mindset content & themes
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mindsetApi } from '../../services/api';
import { mindsetKeys } from './keys';
import { STALE_TIMES } from '../../providers/QueryProvider';

// ── Queries ─────────────────────────────────────────────────────────────────

export function useMindsetContent() {
  return useQuery({
    queryKey: mindsetKeys.content(),
    queryFn: () => mindsetApi.getAllContent(),
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

export function useMindsetFavorites() {
  return useQuery({
    queryKey: mindsetKeys.favorites(),
    queryFn: () => mindsetApi.getFavorites(),
    staleTime: STALE_TIMES.lists,
  });
}

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

export function useToggleMindsetFavorite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => mindsetApi.toggleFavorite(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: mindsetKeys.favorites() });
      qc.invalidateQueries({ queryKey: mindsetKeys.content() });
    },
  });
}
