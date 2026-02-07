/**
 * React Query hooks — Family
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  familyApi,
  type FamilyResponse,
  type FamilyMembershipResponse,
  type FamilyMemberResponse,
  type FamilyInviteResponse,
  type CreateFamilyRequest,
  type UpdateFamilyRequest,
  type InviteMemberRequest,
  type JoinFamilyRequest,
} from '../../services/api';
import { familyKeys } from './keys';
import { STALE_TIMES } from '../../providers/QueryProvider';
import type { FamilyRole } from '../../types/family.types';

// ── Queries ─────────────────────────────────────────────────────────────────

export function useMyFamily() {
  return useQuery({
    queryKey: familyKeys.myFamily(),
    queryFn: () => familyApi.getMyFamily() as Promise<FamilyResponse>,
    staleTime: STALE_TIMES.profile,
  });
}

export function useMyMembership() {
  return useQuery({
    queryKey: familyKeys.membership(),
    queryFn: () => familyApi.getMyMembership() as Promise<FamilyMembershipResponse>,
    staleTime: STALE_TIMES.profile,
  });
}

export function useFamily(familyId: string) {
  return useQuery({
    queryKey: familyKeys.detail(familyId),
    queryFn: () => familyApi.getFamily(familyId) as Promise<FamilyResponse>,
    enabled: !!familyId,
  });
}

export function useFamilyMembers(familyId: string) {
  return useQuery({
    queryKey: familyKeys.members(familyId),
    queryFn: () => familyApi.getMembers(familyId) as Promise<FamilyMemberResponse[]>,
    enabled: !!familyId,
    staleTime: STALE_TIMES.lists,
  });
}

export function usePendingInvites(familyId: string) {
  return useQuery({
    queryKey: familyKeys.invites(familyId),
    queryFn: () => familyApi.getPendingInvites(familyId) as Promise<FamilyInviteResponse[]>,
    enabled: !!familyId,
    staleTime: STALE_TIMES.lists,
  });
}

// ── Mutations ───────────────────────────────────────────────────────────────

export function useCreateFamily() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateFamilyRequest) => familyApi.createFamily(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: familyKeys.myFamily() });
      qc.invalidateQueries({ queryKey: familyKeys.membership() });
    },
  });
}

export function useUpdateFamily() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ familyId, data }: { familyId: string; data: UpdateFamilyRequest }) =>
      familyApi.updateFamily(familyId, data),
    onSuccess: (_d, { familyId }) => {
      qc.invalidateQueries({ queryKey: familyKeys.detail(familyId) });
      qc.invalidateQueries({ queryKey: familyKeys.myFamily() });
    },
  });
}

export function useJoinFamily() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: JoinFamilyRequest) => familyApi.joinFamily(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: familyKeys.all });
    },
  });
}

export function useLeaveFamily() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => familyApi.leaveFamily(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: familyKeys.all });
    },
  });
}

export function useInviteFamilyMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ familyId, data }: { familyId: string; data: InviteMemberRequest }) =>
      familyApi.inviteMember(familyId, data),
    onSuccess: (_d, { familyId }) => {
      qc.invalidateQueries({ queryKey: familyKeys.invites(familyId) });
      qc.invalidateQueries({ queryKey: familyKeys.members(familyId) });
    },
  });
}

export function useUpdateMemberRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ familyId, memberId, role }: { familyId: string; memberId: string; role: FamilyRole }) =>
      familyApi.updateMemberRole(familyId, memberId, role),
    onSuccess: (_d, { familyId }) => {
      qc.invalidateQueries({ queryKey: familyKeys.members(familyId) });
    },
  });
}

export function useRemoveFamilyMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ familyId, memberId }: { familyId: string; memberId: string }) =>
      familyApi.removeMember(familyId, memberId),
    onSuccess: (_d, { familyId }) => {
      qc.invalidateQueries({ queryKey: familyKeys.members(familyId) });
    },
  });
}
