/**
 * React Query hooks — Tasks
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taskApi, commandCenterApi } from '../../services/api';
import { taskKeys, epicKeys, sprintKeys } from './keys';
import { STALE_TIMES } from '../../providers/QueryProvider';
import type { Task, BulkCreateTaskResponse, SprintQuickAddResponse } from '../../types/models';

// ── Queries ─────────────────────────────────────────────────────────────────

export function useTasks(filters?: { sprintId?: string; status?: string; epicId?: string }) {
  return useQuery({
    queryKey: taskKeys.list(filters as Record<string, unknown>),
    queryFn: () => taskApi.getAll(filters) as Promise<Task[]>,
    staleTime: STALE_TIMES.lists,
  });
}

export function useTasksBySprint(sprintId: string) {
  return useQuery({
    queryKey: taskKeys.bySprint(sprintId),
    queryFn: () => taskApi.getTasksBySprint(sprintId) as Promise<Task[]>,
    staleTime: STALE_TIMES.lists,
    enabled: !!sprintId,
  });
}

export function useTasksByEpic(epicId: string) {
  return useQuery({
    queryKey: taskKeys.byEpic(epicId),
    queryFn: () => taskApi.getTasksByEpic(epicId) as Promise<Task[]>,
    staleTime: STALE_TIMES.lists,
    enabled: !!epicId,
  });
}

export function useTasksByStatus(status: string) {
  return useQuery({
    queryKey: taskKeys.byStatus(status),
    queryFn: () => taskApi.getTasksByStatus(status) as Promise<Task[]>,
    staleTime: STALE_TIMES.lists,
    enabled: !!status,
  });
}

export function useBacklogTasks() {
  return useQuery({
    queryKey: taskKeys.backlog(),
    queryFn: () => taskApi.getBacklogTasks() as Promise<Task[]>,
    staleTime: STALE_TIMES.lists,
  });
}

export function useDraftTasks() {
  return useQuery({
    queryKey: taskKeys.drafts(),
    queryFn: () => taskApi.getDraftTasks() as Promise<Task[]>,
    staleTime: STALE_TIMES.lists,
  });
}

export function useTask(id: string) {
  return useQuery({
    queryKey: taskKeys.detail(id),
    queryFn: () => taskApi.getTaskById(id) as Promise<Task>,
    enabled: !!id,
  });
}

export function useTaskHistory(taskId: string) {
  return useQuery({
    queryKey: taskKeys.history(taskId),
    queryFn: () => taskApi.getTaskHistory(taskId),
    enabled: !!taskId,
  });
}

export function useTaskComments(taskId: string) {
  return useQuery({
    queryKey: taskKeys.comments(taskId),
    queryFn: () => taskApi.getTaskComments(taskId),
    enabled: !!taskId,
  });
}

// ── Mutations ───────────────────────────────────────────────────────────────

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => taskApi.createTask(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: taskKeys.lists() });
      qc.invalidateQueries({ queryKey: taskKeys.backlog() });
      qc.invalidateQueries({ queryKey: epicKeys.all });
      qc.invalidateQueries({ queryKey: sprintKeys.all });
    },
  });
}

export function useUpdateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      taskApi.updateTask(id, data),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: taskKeys.detail(id) });
      qc.invalidateQueries({ queryKey: taskKeys.lists() });
    },
  });
}

export function useUpdateTaskStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      taskApi.updateTaskStatus(id, status),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: taskKeys.detail(id) });
      qc.invalidateQueries({ queryKey: taskKeys.lists() });
      qc.invalidateQueries({ queryKey: sprintKeys.all });
    },
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => taskApi.deleteTask(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: taskKeys.lists() });
      qc.invalidateQueries({ queryKey: taskKeys.backlog() });
      qc.invalidateQueries({ queryKey: taskKeys.deleted() });
    },
  });
}

export function useDeletedTasks() {
  return useQuery({
    queryKey: taskKeys.deleted(),
    queryFn: () => taskApi.getDeletedTasks() as Promise<Task[]>,
    staleTime: STALE_TIMES.lists,
  });
}

export function useHardDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => taskApi.hardDeleteTask(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: taskKeys.deleted() });
    },
  });
}

export function useRestoreTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => taskApi.restoreTask(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: taskKeys.lists() });
      qc.invalidateQueries({ queryKey: taskKeys.backlog() });
      qc.invalidateQueries({ queryKey: taskKeys.deleted() });
    },
  });
}

export function useAddComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      taskId,
      data,
    }: {
      taskId: string;
      data: { commentText: string; isAiGenerated?: boolean; attachments?: Array<{ filename: string; fileUrl: string; fileType: string; fileSize: number | null }> };
    }) => taskApi.addComment(taskId, data),
    onSuccess: (_data, { taskId }) => {
      qc.invalidateQueries({ queryKey: taskKeys.comments(taskId) });
    },
  });
}

// ─── Bulk Operations ─────────────────────────────────────────────────

export function useBulkCreateTasks() {
  const qc = useQueryClient();
  return useMutation<
    BulkCreateTaskResponse,
    Error,
    { tasks: Array<Record<string, unknown>> }
  >({
    mutationFn: (data) => taskApi.bulkCreateTasks(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: taskKeys.all });
      qc.invalidateQueries({ queryKey: sprintKeys.all });
      qc.invalidateQueries({ queryKey: epicKeys.all });
    },
  });
}

export function useSprintQuickAddAI() {
  return useMutation<
    SprintQuickAddResponse,
    Error,
    { lines: string[]; sprintContext?: string }
  >({
    mutationFn: (data) => commandCenterApi.sprintQuickAddAI(data),
  });
}
