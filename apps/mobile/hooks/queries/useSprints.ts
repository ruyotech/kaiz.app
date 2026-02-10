/**
 * React Query hooks — Sprints
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sprintApi } from '../../services/api';
import { sprintKeys, taskKeys, sprintCeremonyKeys } from './keys';
import { STALE_TIMES } from '../../providers/QueryProvider';
import type { SprintCommitResponse, CompleteSprintRequest, CompleteSprintResponse } from '../../types/models';

export function useSprints(year?: number) {
  return useQuery({
    queryKey: sprintKeys.list(year),
    queryFn: () => sprintApi.getSprints(year),
    staleTime: STALE_TIMES.lists,
  });
}

export function useCurrentSprint() {
  return useQuery({
    queryKey: sprintKeys.current(),
    queryFn: () => sprintApi.getCurrentSprint(),
    staleTime: STALE_TIMES.lists,
  });
}

export function useUpcomingSprints(limit = 4) {
  return useQuery({
    queryKey: sprintKeys.upcoming(limit),
    queryFn: () => sprintApi.getUpcomingSprints(limit),
    staleTime: STALE_TIMES.lists,
  });
}

export function useSprint(id: string) {
  return useQuery({
    queryKey: sprintKeys.detail(id),
    queryFn: () => sprintApi.getSprintById(id),
    enabled: !!id,
  });
}

export function useSprintTasks(sprintId: string) {
  return useQuery({
    queryKey: [...sprintKeys.detail(sprintId), 'tasks'],
    queryFn: () => sprintApi.getSprintTasks(sprintId),
    enabled: !!sprintId,
    staleTime: STALE_TIMES.lists,
  });
}

export function useCommitSprint() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ sprintId, data }: { sprintId: string; data: { taskIds: string[]; sprintGoal?: string } }) =>
      sprintApi.commitSprint(sprintId, data),
    onSuccess: (_result: unknown, variables) => {
      queryClient.invalidateQueries({ queryKey: sprintKeys.detail(variables.sprintId) });
      queryClient.invalidateQueries({ queryKey: sprintKeys.current() });
      queryClient.invalidateQueries({ queryKey: sprintKeys.lists() });
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
    },
  });
}

export function useActivateSprint() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sprintId: string) => sprintApi.activateSprint(sprintId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sprintKeys.lists() });
      queryClient.invalidateQueries({ queryKey: sprintKeys.current() });
    },
  });
}

export function useCompleteSprint() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ sprintId, data }: { sprintId: string; data: CompleteSprintRequest }) =>
      sprintApi.completeSprint(sprintId, data) as Promise<CompleteSprintResponse>,
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: sprintKeys.detail(variables.sprintId) });
      queryClient.invalidateQueries({ queryKey: sprintKeys.current() });
      queryClient.invalidateQueries({ queryKey: sprintKeys.lists() });
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
      queryClient.invalidateQueries({ queryKey: sprintCeremonyKeys.velocity() });
    },
  });
}
