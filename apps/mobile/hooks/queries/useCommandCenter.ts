/**
 * React Query hooks — Life Wheel & Command Center
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { lifeWheelApi, commandCenterApi } from '../../services/api';
import type { SmartInputAttachment, CommandInputAttachment, CreatePendingFromDraftPayload } from '../../services/api';
import { lifeWheelKeys, commandCenterKeys, taskKeys } from './keys';
import { STALE_TIMES } from '../../providers/QueryProvider';

// ── Life Wheel ──────────────────────────────────────────────────────────────

export function useLifeWheelAreas() {
  return useQuery({
    queryKey: lifeWheelKeys.areas(),
    queryFn: () => lifeWheelApi.getLifeWheelAreas(),
    staleTime: STALE_TIMES.static,
  });
}

export function useEisenhowerQuadrants() {
  return useQuery({
    queryKey: lifeWheelKeys.quadrants(),
    queryFn: () => lifeWheelApi.getEisenhowerQuadrants(),
    staleTime: STALE_TIMES.static,
  });
}

// ── Command Center ──────────────────────────────────────────────────────────

export function usePendingDrafts() {
  return useQuery({
    queryKey: commandCenterKeys.pendingDrafts(),
    queryFn: () => commandCenterApi.getPendingDrafts(),
    staleTime: STALE_TIMES.realtime,
  });
}

export function usePendingApprovalTasks() {
  return useQuery({
    queryKey: commandCenterKeys.pendingTasks(),
    queryFn: () => commandCenterApi.getPendingApprovalTasks(),
    staleTime: STALE_TIMES.realtime,
  });
}

export function useTestAttachments(type?: string) {
  return useQuery({
    queryKey: commandCenterKeys.testAttachments(type),
    queryFn: () => commandCenterApi.getTestAttachments(type),
    staleTime: STALE_TIMES.static,
  });
}

export function useSendMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ text, attachments, sessionId }: { text: string | null; attachments: SmartInputAttachment[]; sessionId?: string }) =>
      commandCenterApi.sendMessage(text, attachments, sessionId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: commandCenterKeys.pendingDrafts() });
      qc.invalidateQueries({ queryKey: commandCenterKeys.pendingTasks() });
    },
  });
}

export function useSendMessageWithFiles() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ text, files, sessionId }: { text: string | null; files: Array<{ uri: string; name?: string; mimeType?: string }>; sessionId?: string }) =>
      commandCenterApi.sendMessageWithFiles(text, files, sessionId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: commandCenterKeys.pendingDrafts() });
      qc.invalidateQueries({ queryKey: commandCenterKeys.pendingTasks() });
    },
  });
}

export function useApproveDraft() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (draftId: string) => commandCenterApi.approveDraft(draftId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: commandCenterKeys.pendingDrafts() });
      qc.invalidateQueries({ queryKey: taskKeys.lists() });
    },
  });
}

export function useRejectDraft() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (draftId: string) => commandCenterApi.rejectDraft(draftId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: commandCenterKeys.pendingDrafts() });
    },
  });
}

export function useCreatePendingFromDraft() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePendingFromDraftPayload) => commandCenterApi.createPendingFromDraft(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: commandCenterKeys.pendingTasks() });
      qc.invalidateQueries({ queryKey: taskKeys.lists() });
    },
  });
}

export function useRejectPendingTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (taskId: string) => commandCenterApi.rejectPendingTask(taskId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: commandCenterKeys.pendingTasks() });
    },
  });
}
