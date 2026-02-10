/**
 * React Query hooks — Sprint Ceremonies
 * Backed by /api/v1/sensai/* endpoints (backend module stays as-is).
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sensaiApi } from '../../services/api';
import { sprintCeremonyKeys, sprintKeys, taskKeys } from './keys';
import { STALE_TIMES } from '../../providers/QueryProvider';
import type {
  VelocityMetrics,
  SprintHealth,
  DailyStandup,
  Intervention,
  SprintCeremony,
  LifeWheelMetrics,
  CoachMessage,
  SensAISettings,
  SensAIAnalytics,
  CompleteStandupRequest,
  AcknowledgeInterventionRequest,
  ProcessIntakeRequest,
  RecoveryTask,
  SprintCeremonyType,
  BurndownPoint,
  CeremonyOutcomes,
  VelocityHistory,
} from '../../types/sensai.types';

// ── Queries ─────────────────────────────────────────────────────────────────

export function useVelocityMetrics() {
  return useQuery({
    queryKey: sprintCeremonyKeys.velocity(),
    queryFn: () => sensaiApi.getVelocityMetrics() as Promise<VelocityMetrics>,
    staleTime: STALE_TIMES.lists,
  });
}

export function useVelocityHistory(sprintCount = 10) {
  return useQuery({
    queryKey: sprintCeremonyKeys.velocityHistory(sprintCount),
    queryFn: () => sensaiApi.getVelocityHistory(sprintCount) as Promise<VelocityHistory>,
    staleTime: STALE_TIMES.lists,
  });
}

export function useBurndownData(sprintId: string) {
  return useQuery({
    queryKey: sprintCeremonyKeys.burndown(sprintId),
    queryFn: () => sensaiApi.getBurndownData(sprintId) as Promise<BurndownPoint[]>,
    enabled: !!sprintId,
    staleTime: STALE_TIMES.lists,
  });
}

export function useSprintReviewData(sprintId: string) {
  return useQuery({
    queryKey: sprintCeremonyKeys.reviewData(sprintId),
    queryFn: () => sensaiApi.getSprintReviewData(sprintId) as Promise<CeremonyOutcomes>,
    enabled: !!sprintId,
    staleTime: STALE_TIMES.lists,
  });
}

export function useRetrospectiveData(sprintId: string) {
  return useQuery({
    queryKey: sprintCeremonyKeys.retroData(sprintId),
    queryFn: () => sensaiApi.getRetrospectiveData(sprintId) as Promise<CeremonyOutcomes>,
    enabled: !!sprintId,
    staleTime: STALE_TIMES.lists,
  });
}

export function useSprintHealth(sprintId: string) {
  return useQuery({
    queryKey: sprintCeremonyKeys.sprintHealth(sprintId),
    queryFn: () => sensaiApi.getSprintHealth(sprintId) as Promise<SprintHealth>,
    enabled: !!sprintId,
    staleTime: STALE_TIMES.lists,
  });
}

export function useCurrentSprintHealth() {
  return useQuery({
    queryKey: sprintCeremonyKeys.currentHealth(),
    queryFn: () => sensaiApi.getCurrentSprintHealth() as Promise<SprintHealth>,
    staleTime: STALE_TIMES.lists,
  });
}

export function useAdjustedCapacity() {
  return useQuery({
    queryKey: sprintCeremonyKeys.capacity(),
    queryFn: () => sensaiApi.getAdjustedCapacity(),
    staleTime: STALE_TIMES.lists,
  });
}

export function useTodayStandup() {
  return useQuery({
    queryKey: sprintCeremonyKeys.standup(),
    queryFn: () => sensaiApi.getTodayStandup(),
    staleTime: STALE_TIMES.realtime,
  });
}

export function useStandupHistory(startDate: string, endDate: string) {
  return useQuery({
    queryKey: sprintCeremonyKeys.standupHistory(startDate, endDate),
    queryFn: () => sensaiApi.getStandupHistory(startDate, endDate) as Promise<DailyStandup[]>,
    enabled: !!startDate && !!endDate,
  });
}

export function useActiveInterventions() {
  return useQuery({
    queryKey: sprintCeremonyKeys.interventions(),
    queryFn: () => sensaiApi.getActiveInterventions() as Promise<Intervention[]>,
    staleTime: STALE_TIMES.realtime,
  });
}

export function useCeremoniesForSprint(sprintId: string) {
  return useQuery({
    queryKey: sprintCeremonyKeys.ceremoniesForSprint(sprintId),
    queryFn: () => sensaiApi.getCeremoniesForSprint(sprintId) as Promise<SprintCeremony[]>,
    enabled: !!sprintId,
    staleTime: STALE_TIMES.lists,
  });
}

export function useLifeWheelMetrics() {
  return useQuery({
    queryKey: sprintCeremonyKeys.lifeWheel(),
    queryFn: () => sensaiApi.getLifeWheelMetrics() as Promise<LifeWheelMetrics>,
    staleTime: STALE_TIMES.lists,
  });
}

export function useDimensionHistory(dimension: string, sprints = 4) {
  return useQuery({
    queryKey: sprintCeremonyKeys.dimensionHistory(dimension),
    queryFn: () => sensaiApi.getDimensionHistory(dimension, sprints),
    enabled: !!dimension,
  });
}

export function useCoachMessages(unreadOnly = false) {
  return useQuery({
    queryKey: sprintCeremonyKeys.messages(unreadOnly),
    queryFn: () => sensaiApi.getCoachMessages(unreadOnly) as Promise<CoachMessage[]>,
    staleTime: STALE_TIMES.realtime,
  });
}

export function useSprintPreferences() {
  return useQuery({
    queryKey: sprintCeremonyKeys.settings(),
    queryFn: () => sensaiApi.getSettings() as Promise<SensAISettings>,
    staleTime: STALE_TIMES.profile,
  });
}

export function useSprintAnalytics(period: string) {
  return useQuery({
    queryKey: sprintCeremonyKeys.analytics(period),
    queryFn: () => sensaiApi.getAnalytics(period) as Promise<SensAIAnalytics>,
    enabled: !!period,
    staleTime: STALE_TIMES.lists,
  });
}

export function usePatternInsights() {
  return useQuery({
    queryKey: sprintCeremonyKeys.patterns(),
    queryFn: () => sensaiApi.getPatternInsights(),
    staleTime: STALE_TIMES.static,
  });
}

export function useMotivationContent() {
  return useQuery({
    queryKey: sprintCeremonyKeys.motivation(),
    queryFn: () => sensaiApi.getMotivationContent(),
    staleTime: STALE_TIMES.lists,
  });
}

export function useMicroChallenges() {
  return useQuery({
    queryKey: sprintCeremonyKeys.microChallenges(),
    queryFn: () => sensaiApi.getMicroChallenges(),
    staleTime: STALE_TIMES.lists,
  });
}

// ── Mutations ───────────────────────────────────────────────────────────────

export function useCompleteStandup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CompleteStandupRequest) => sensaiApi.completeStandup(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: sprintCeremonyKeys.standup() });
      qc.invalidateQueries({ queryKey: sprintCeremonyKeys.velocity() });
    },
  });
}

export function useSkipStandup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (reason?: string) => sensaiApi.skipStandup(reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: sprintCeremonyKeys.standup() });
    },
  });
}

export function useAcknowledgeIntervention() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: AcknowledgeInterventionRequest) => sensaiApi.acknowledgeIntervention(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: sprintCeremonyKeys.interventions() });
    },
  });
}

export function useStartCeremony() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: { type: SprintCeremonyType; sprintId: string }) =>
      sensaiApi.startCeremony(params.type, params.sprintId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: sprintCeremonyKeys.ceremonies() });
    },
  });
}

export function useCompleteCeremony() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: { ceremonyId: string; data: { notes?: string; outcomes?: unknown; actionItems?: string[] } }) =>
      sensaiApi.completeCeremony(params.ceremonyId, params.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: sprintCeremonyKeys.ceremonies() });
      qc.invalidateQueries({ queryKey: sprintCeremonyKeys.velocity() });
    },
  });
}

export function useProcessIntake() {
  return useMutation({
    mutationFn: (data: ProcessIntakeRequest) => sensaiApi.processIntake(data),
  });
}

export function useAddRecoveryTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (task: RecoveryTask) => sensaiApi.addRecoveryTask(task),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: sprintCeremonyKeys.lifeWheel() });
    },
  });
}

export function useUpdateSprintPreferences() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (settings: Partial<SensAISettings>) => sensaiApi.updateSettings(settings),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: sprintCeremonyKeys.settings() });
    },
  });
}
