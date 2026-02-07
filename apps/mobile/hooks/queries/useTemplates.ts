/**
 * React Query hooks — Task Templates
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taskTemplateApi } from '../../services/api';
import { templateKeys } from './keys';
import { STALE_TIMES } from '../../providers/QueryProvider';
import type { TaskTemplate } from '../../types/models';

// ── Queries ─────────────────────────────────────────────────────────────────

export function useAllTemplates() {
  return useQuery({
    queryKey: templateKeys.lists(),
    queryFn: () => taskTemplateApi.getAllTemplates() as Promise<TaskTemplate[]>,
    staleTime: STALE_TIMES.static,
  });
}

export function useGlobalTemplates() {
  return useQuery({
    queryKey: templateKeys.global(),
    queryFn: () => taskTemplateApi.getGlobalTemplates() as Promise<TaskTemplate[]>,
    staleTime: STALE_TIMES.static,
  });
}

export function useUserTemplates() {
  return useQuery({
    queryKey: templateKeys.user(),
    queryFn: () => taskTemplateApi.getUserTemplates() as Promise<TaskTemplate[]>,
    staleTime: STALE_TIMES.lists,
  });
}

export function useFavoriteTemplates() {
  return useQuery({
    queryKey: templateKeys.favorites(),
    queryFn: () => taskTemplateApi.getFavoriteTemplates() as Promise<TaskTemplate[]>,
    staleTime: STALE_TIMES.lists,
  });
}

export function useTemplate(id: string) {
  return useQuery({
    queryKey: templateKeys.detail(id),
    queryFn: () => taskTemplateApi.getTemplateById(id) as Promise<TaskTemplate>,
    enabled: !!id,
  });
}

export function useSearchTemplates(query: string) {
  return useQuery({
    queryKey: templateKeys.search(query),
    queryFn: () => taskTemplateApi.searchTemplates(query) as Promise<TaskTemplate[]>,
    enabled: query.length >= 2,
    staleTime: STALE_TIMES.lists,
  });
}

// ── Mutations ───────────────────────────────────────────────────────────────

export function useToggleTemplateFavorite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => taskTemplateApi.toggleFavorite(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: templateKeys.lists() });
      qc.invalidateQueries({ queryKey: templateKeys.favorites() });
    },
  });
}

export function useRateTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, rating }: { id: string; rating: number }) =>
      taskTemplateApi.rateTemplate(id, rating),
    onSuccess: (_d, { id }) => {
      qc.invalidateQueries({ queryKey: templateKeys.detail(id) });
    },
  });
}

export function useCloneTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => taskTemplateApi.cloneTemplate(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: templateKeys.user() });
    },
  });
}

export function useDeleteTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => taskTemplateApi.deleteTemplate(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: templateKeys.lists() });
      qc.invalidateQueries({ queryKey: templateKeys.user() });
    },
  });
}
