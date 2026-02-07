/**
 * React Query hooks — Notifications
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationApi } from '../../services/api';
import type { NotificationPageResponse, UnreadCountResponse, GroupedNotificationsResponse, NotificationPreferencesResponse, UpdatePreferencesRequest } from '../../services/api';
import { notificationKeys } from './keys';
import { STALE_TIMES } from '../../providers/QueryProvider';

// ── Queries ─────────────────────────────────────────────────────────────────

export function useNotifications(page = 0, size = 20) {
  return useQuery({
    queryKey: notificationKeys.list(page),
    queryFn: () => notificationApi.getNotifications(page, size) as Promise<NotificationPageResponse>,
    staleTime: STALE_TIMES.realtime,
  });
}

export function useGroupedNotifications() {
  return useQuery({
    queryKey: notificationKeys.grouped(),
    queryFn: () => notificationApi.getGroupedNotifications() as Promise<GroupedNotificationsResponse>,
    staleTime: STALE_TIMES.realtime,
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: () => notificationApi.getUnreadCount() as Promise<UnreadCountResponse>,
    staleTime: STALE_TIMES.realtime,
    refetchInterval: 30_000, // poll every 30s
  });
}

export function useNotificationPreferences() {
  return useQuery({
    queryKey: notificationKeys.preferences(),
    queryFn: () => notificationApi.getPreferences() as Promise<NotificationPreferencesResponse>,
    staleTime: STALE_TIMES.profile,
  });
}

// ── Mutations ───────────────────────────────────────────────────────────────

export function useMarkAsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationApi.markAsRead(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}

export function useMarkAllAsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => notificationApi.markAllAsRead(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}

export function useTogglePinned() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationApi.togglePinned(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}

export function useArchiveNotification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationApi.archiveNotification(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}

export function useDeleteNotification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationApi.deleteNotification(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}

export function useUpdateNotificationPreferences() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdatePreferencesRequest) => notificationApi.updatePreferences(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: notificationKeys.preferences() });
    },
  });
}
