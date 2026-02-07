/**
 * React Query hooks — SensAI
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sensaiApi } from '../../services/api';
import { sensaiKeys } from './keys';
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
} from '../../types/sensai.types';

// ── Queries ─────────────────────────────────────────────────────────────────

export function useVelocityMetrics() {
  return useQuery({
    queryKey: sensaiKeys.velocity(),
    queryFn: () => sensaiApi.getVelocityMetrics() as Promise<VelocityMetrics>,
    staleTime: STALE_TIMES.lists,
  });
}

export function useSprintHealth(sprintId: string) {
  return useQuery({
    queryKey: sensaiKeys.sprintHealth(sprintId),
    queryFn: () => sensaiApi.getSprintHealth(sprintId) as Promise<SprintHealth>,
    enabled: !!sprintId,
    staleTime: STALE_TIMES.lists,
  });
}

export function useCurrentSprintHealth() {
  return useQuery({
    queryKey: sensaiKeys.currentHealth(),
    queryFn: () => sensaiApi.getCurrentSprintHealth() as Promise<SprintHealth>,
    staleTime: STALE_TIMES.lists,
  });
}

export function useAdjustedCapacity() {
  return useQuery({
    queryKey: sensaiKeys.capacity(),
    queryFn: () => sensaiApi.getAdjustedCapacity(),
    staleTime: STALE_TIMES.lists,
  });
}

export function useTodayStandup() {
  return useQuery({
    queryKey: sensaiKeys.standup(),
    queryFn: () => sensaiApi.getTodayStandup(),
    staleTime: STALE_TIMES.realtime,
  });
}

export function useStandupHistory(startDate: string, endDate: string) {
  return useQuery({
    queryKey: sensaiKeys.standupHistory(startDate, endDate),
    queryFn: () => sensaiApi.getStandupHistory(startDate, endDate) as Promise<DailyStandup[]>,
    enabled: !!startDate && !!endDate,
  });
}

export function useActiveInterventions() {
  return useQuery({
    queryKey: sensaiKeys.interventions(),
    queryFn: () => sensaiApi.getActiveInterventions() as Promise<Intervention[]>,
    staleTime: STALE_TIMES.realtime,
  });
}

export function useUpcomingCeremonies() {
  return useQuery({
    queryKey: sensaiKeys.ceremonies(),
    queryFn: () => sensaiApi.getUpcomingCeremonies() as Promise<SprintCeremony[]>,
    staleTime: STALE_TIMES.lists,
  });
}

export function useLifeWheelMetrics() {
  return useQuery({
    queryKey: sensaiKeys.lifeWheel(),
    queryFn: () => sensaiApi.getLifeWheelMetrics() as Promise<LifeWheelMetrics>,
    staleTime: STALE_TIMES.lists,
  });
}

export function useDimensionHistory(dimension: string, sprints = 4) {
  return useQuery({
    queryKey: sensaiKeys.dimensionHistory(dimension),
    queryFn: () => sensaiApi.getDimensionHistory(dimension, sprints),
    enabled: !!dimension,
  });
}

export function useCoachMessages(unreadOnly = false) {
  return useQuery({
    queryKey: sensaiKeys.messages(unreadOnly),
    queryFn: () => sensaiApi.getCoachMessages(unreadOnly) as Promise<CoachMessage[]>,
    staleTime: STALE_TIMES.realtime,
  });
}

export function useSensAISettings() {
  return useQuery({
    queryKey: sensaiKeys.settings(),
    queryFn: () => sensaiApi.getSettings() as Promise<SensAISettings>,
    staleTime: STALE_TIMES.profile,
  });
}

export function useSensAIAnalytics(period: string) {
  return useQuery({
    queryKey: sensaiKeys.analytics(period),
    queryFn: () => sensaiApi.getAnalytics(period) as Promise<SensAIAnalytics>,
    enabled: !!period,
    staleTime: STALE_TIMES.lists,
  });
}

export function usePatternInsights() {
  return useQuery({
    queryKey: sensaiKeys.patterns(),
    queryFn: () => sensaiApi.getPatternInsights(),
    staleTime: STALE_TIMES.static,
  });
}

export function useMotivationContent() {
  return useQuery({
    queryKey: sensaiKeys.motivation(),
    queryFn: () => sensaiApi.getMotivationContent(),
    staleTime: STALE_TIMES.lists,
  });
}

export function useMicroChallenges() {
  return useQuery({
    queryKey: sensaiKeys.microChallenges(),
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
      qc.invalidateQueries({ queryKey: sensaiKeys.standup() });
      qc.invalidateQueries({ queryKey: sensaiKeys.velocity() });
    },
  });
}

export function useSkipStandup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (reason?: string) => sensaiApi.skipStandup(reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: sensaiKeys.standup() });
    },
  });
}

export function useAcknowledgeIntervention() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: AcknowledgeInterventionRequest) => sensaiApi.acknowledgeIntervention(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: sensaiKeys.interventions() });
    },
  });
}

export function useStartCeremony() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (type: SprintCeremonyType) => sensaiApi.startCeremony(type),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: sensaiKeys.ceremonies() });
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
      qc.invalidateQueries({ queryKey: sensaiKeys.lifeWheel() });
    },
  });
}

export function useUpdateSensAISettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (settings: Partial<SensAISettings>) => sensaiApi.updateSettings(settings),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: sensaiKeys.settings() });
    },
  });
}
