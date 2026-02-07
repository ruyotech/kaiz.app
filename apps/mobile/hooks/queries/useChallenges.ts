/**
 * React Query hooks — Challenges
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { challengeApi } from '../../services/api';
import { challengeKeys } from './keys';
import { STALE_TIMES } from '../../providers/QueryProvider';
import type { Challenge, ChallengeTemplate } from '../../types/models';

// ── Queries ─────────────────────────────────────────────────────────────────

export function useChallenges(status?: string) {
  return useQuery({
    queryKey: challengeKeys.list(status),
    queryFn: () => challengeApi.getChallenges(status) as Promise<Challenge[]>,
    staleTime: STALE_TIMES.lists,
  });
}

export function useActiveChallenges() {
  return useQuery({
    queryKey: challengeKeys.active(),
    queryFn: () => challengeApi.getActiveChallenges() as Promise<Challenge[]>,
    staleTime: STALE_TIMES.lists,
  });
}

export function useChallenge(id: string) {
  return useQuery({
    queryKey: challengeKeys.detail(id),
    queryFn: () => challengeApi.getChallengeById(id) as Promise<Challenge>,
    enabled: !!id,
  });
}

export function useChallengeEntries(challengeId: string) {
  return useQuery({
    queryKey: challengeKeys.entries(challengeId),
    queryFn: () => challengeApi.getEntries(challengeId),
    enabled: !!challengeId,
    staleTime: STALE_TIMES.lists,
  });
}

export function useChallengeTemplates(lifeWheelAreaId?: string) {
  return useQuery({
    queryKey: challengeKeys.templates(lifeWheelAreaId),
    queryFn: () => challengeApi.getTemplates(lifeWheelAreaId) as Promise<ChallengeTemplate[]>,
    staleTime: STALE_TIMES.static,
  });
}

// ── Mutations ───────────────────────────────────────────────────────────────

export function useCreateChallenge() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => challengeApi.createChallenge(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: challengeKeys.lists() });
      qc.invalidateQueries({ queryKey: challengeKeys.active() });
    },
  });
}

export function useUpdateChallenge() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      challengeApi.updateChallenge(id, data),
    onSuccess: (_d, { id }) => {
      qc.invalidateQueries({ queryKey: challengeKeys.detail(id) });
      qc.invalidateQueries({ queryKey: challengeKeys.lists() });
    },
  });
}

export function useDeleteChallenge() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => challengeApi.deleteChallenge(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: challengeKeys.lists() });
      qc.invalidateQueries({ queryKey: challengeKeys.active() });
    },
  });
}

export function useLogChallengeEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ challengeId, data }: { challengeId: string; data: { value: number | boolean; note?: string; date: string } }) =>
      challengeApi.logEntry(challengeId, data),
    onSuccess: (_d, { challengeId }) => {
      qc.invalidateQueries({ queryKey: challengeKeys.entries(challengeId) });
      qc.invalidateQueries({ queryKey: challengeKeys.detail(challengeId) });
    },
  });
}
