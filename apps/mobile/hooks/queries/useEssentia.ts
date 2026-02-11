/**
 * React Query hooks — Essentia (Books & Progress)
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { essentiaApi } from '../../services/api';
import { essentiaKeys } from './keys';
import { STALE_TIMES } from '../../providers/QueryProvider';

// ── Queries ─────────────────────────────────────────────────────────────────

export function useAllBooks() {
  return useQuery({
    queryKey: essentiaKeys.books(),
    queryFn: () => essentiaApi.getAllBooks(),
    staleTime: STALE_TIMES.static,
  });
}

export function useBook(id: string) {
  return useQuery({
    queryKey: essentiaKeys.bookDetail(id),
    queryFn: () => essentiaApi.getBookById(id),
    enabled: !!id,
  });
}

export function useBooksByCategory(category: string) {
  return useQuery({
    queryKey: essentiaKeys.booksByCategory(category),
    queryFn: () => essentiaApi.getBooksByCategory(category),
    enabled: !!category,
    staleTime: STALE_TIMES.static,
  });
}

export function useBooksByLifeWheelArea(areaId: string) {
  return useQuery({
    queryKey: essentiaKeys.booksByLifeWheelArea(areaId),
    queryFn: () => essentiaApi.getBooksByLifeWheelArea(areaId),
    enabled: !!areaId,
    staleTime: STALE_TIMES.static,
  });
}

export function useFeaturedBooks() {
  return useQuery({
    queryKey: essentiaKeys.featured(),
    queryFn: () => essentiaApi.getFeaturedBooks(),
    staleTime: STALE_TIMES.static,
  });
}

export function useTopRatedBooks() {
  return useQuery({
    queryKey: essentiaKeys.topRated(),
    queryFn: () => essentiaApi.getTopRatedBooks(),
    staleTime: STALE_TIMES.static,
  });
}

export function usePopularBooks() {
  return useQuery({
    queryKey: essentiaKeys.popular(),
    queryFn: () => essentiaApi.getPopularBooks(),
    staleTime: STALE_TIMES.static,
  });
}

export function useEssentiaCategories() {
  return useQuery({
    queryKey: essentiaKeys.categories(),
    queryFn: () => essentiaApi.getAllCategories(),
    staleTime: STALE_TIMES.static,
  });
}

export function useUserProgress() {
  return useQuery({
    queryKey: essentiaKeys.progress(),
    queryFn: () => essentiaApi.getUserProgress(),
    staleTime: STALE_TIMES.lists,
  });
}

export function useBookProgress(bookId: string) {
  return useQuery({
    queryKey: essentiaKeys.progressForBook(bookId),
    queryFn: () => essentiaApi.getProgressForBook(bookId),
    enabled: !!bookId,
    staleTime: STALE_TIMES.lists,
  });
}

export function useCompletedBooks() {
  return useQuery({
    queryKey: essentiaKeys.completed(),
    queryFn: () => essentiaApi.getCompletedBooks(),
    staleTime: STALE_TIMES.lists,
  });
}

export function useFavoriteBooks() {
  return useQuery({
    queryKey: essentiaKeys.favorites(),
    queryFn: () => essentiaApi.getFavoriteBooks(),
    staleTime: STALE_TIMES.lists,
  });
}

export function useInProgressBooks() {
  return useQuery({
    queryKey: essentiaKeys.inProgress(),
    queryFn: () => essentiaApi.getInProgressBooks(),
    staleTime: STALE_TIMES.lists,
  });
}

// ── Mutations ───────────────────────────────────────────────────────────────

export function useStartBook() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (bookId: string) => essentiaApi.startBook(bookId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: essentiaKeys.progress() });
      qc.invalidateQueries({ queryKey: essentiaKeys.inProgress() });
    },
  });
}

export function useUpdateBookProgress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ bookId, cardIndex }: { bookId: string; cardIndex: number }) =>
      essentiaApi.updateProgress(bookId, cardIndex),
    onSuccess: (_d, { bookId }) => {
      qc.invalidateQueries({ queryKey: essentiaKeys.progressForBook(bookId) });
      qc.invalidateQueries({ queryKey: essentiaKeys.progress() });
    },
  });
}

export function useToggleBookFavorite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (bookId: string) => essentiaApi.toggleFavorite(bookId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: essentiaKeys.favorites() });
      qc.invalidateQueries({ queryKey: essentiaKeys.books() });
    },
  });
}
