/**
 * React Query hooks — Auth / Profile
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../../services/api';
import { authKeys } from './keys';
import { STALE_TIMES } from '../../providers/QueryProvider';
import type { User } from '../../types/models';

// ── Queries ─────────────────────────────────────────────────────────────────

export function useCurrentUser() {
  return useQuery({
    queryKey: authKeys.me(),
    queryFn: () => authApi.getCurrentUser() as Promise<User>,
    staleTime: STALE_TIMES.profile,
  });
}

export function useHasValidSession() {
  return useQuery({
    queryKey: authKeys.session(),
    queryFn: () => authApi.hasValidSession(),
    staleTime: STALE_TIMES.profile,
  });
}

// ── Mutations ───────────────────────────────────────────────────────────────

export function useLogin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authApi.login(email, password),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: authKeys.me() });
      qc.invalidateQueries({ queryKey: authKeys.session() });
    },
  });
}

export function useLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      qc.clear(); // Wipe all cached data on logout
    },
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (email: string) => authApi.forgotPassword(email),
  });
}

export function useVerifyEmail() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (code: string) => authApi.verifyEmail(code),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: authKeys.me() });
    },
  });
}
