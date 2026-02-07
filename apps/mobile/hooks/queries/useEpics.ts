/**
 * React Query hooks — Epics
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { epicApi } from '../../services/api';
import { epicKeys, taskKeys } from './keys';
import { STALE_TIMES } from '../../providers/QueryProvider';

export function useEpics(status?: string) {
  return useQuery({
    queryKey: epicKeys.list(status),
    queryFn: () => epicApi.getEpics(status),
    staleTime: STALE_TIMES.lists,
  });
}

export function useEpic(id: string) {
  return useQuery({
    queryKey: epicKeys.detail(id),
    queryFn: () => epicApi.getEpicById(id),
    enabled: !!id,
  });
}

export function useCreateEpic() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { title: string; description?: string; lifeWheelAreaId: string; targetSprintId?: string; color?: string; icon?: string }) =>
      epicApi.createEpic(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: epicKeys.lists() });
    },
  });
}

export function useUpdateEpic() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      epicApi.updateEpic(id, data),
    onSuccess: (_d, { id }) => {
      qc.invalidateQueries({ queryKey: epicKeys.detail(id) });
      qc.invalidateQueries({ queryKey: epicKeys.lists() });
      qc.invalidateQueries({ queryKey: taskKeys.lists() });
    },
  });
}

export function useDeleteEpic() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => epicApi.deleteEpic(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: epicKeys.lists() });
      qc.invalidateQueries({ queryKey: taskKeys.lists() });
    },
  });
}
