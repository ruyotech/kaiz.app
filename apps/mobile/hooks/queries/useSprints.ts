/**
 * React Query hooks — Sprints
 */
import { useQuery } from '@tanstack/react-query';
import { sprintApi } from '../../services/api';
import { sprintKeys } from './keys';
import { STALE_TIMES } from '../../providers/QueryProvider';

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
