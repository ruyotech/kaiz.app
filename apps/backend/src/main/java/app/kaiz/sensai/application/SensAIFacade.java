package app.kaiz.sensai.application;

import app.kaiz.sensai.application.dto.*;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Thin facade that delegates to focused sub-services. Replaces the original 1118-line
 * SensAIService. The controller still depends on this single bean, keeping API compatibility.
 */
@Service("sensAIFacade")
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class SensAIFacade {

  private final StandupService standupService;
  private final InterventionService interventionService;
  private final VelocityService velocityService;
  private final CeremonyService ceremonyService;
  private final LifeWheelMetricService lifeWheelMetricService;
  private final SettingsService settingsService;

  // ── Settings ──

  public SensAISettingsDto getSettings(UUID userId) {
    return settingsService.getSettings(userId);
  }

  @Transactional
  public SensAISettingsDto updateSettings(
      UUID userId, SensAISettingsDto.UpdateSettingsRequest request) {
    return settingsService.updateSettings(userId, request);
  }

  // ── Standup ──

  public DailyStandupDto getTodayStandup(UUID userId) {
    return standupService.getTodayStandup(userId);
  }

  public DailyStandupDto.GetStandupResponse getTodayStandupWithHealth(UUID userId) {
    DailyStandupDto standup = standupService.getTodayStandup(userId);
    boolean hasCompletedToday =
        standup != null && standup.completedAt() != null && !standup.isSkipped();

    VelocityDto.SprintHealth sprintHealth = velocityService.getSprintHealth(userId, "current");

    return new DailyStandupDto.GetStandupResponse(standup, hasCompletedToday, sprintHealth);
  }

  public List<DailyStandupDto> getStandupHistory(
      UUID userId, LocalDate startDate, LocalDate endDate) {
    return standupService.getStandupHistory(userId, startDate, endDate);
  }

  @Transactional
  public DailyStandupDto completeStandup(
      UUID userId, DailyStandupDto.CompleteStandupRequest request) {
    return standupService.completeStandup(userId, request);
  }

  @Transactional
  public DailyStandupDto skipStandup(UUID userId, DailyStandupDto.SkipStandupRequest request) {
    return standupService.skipStandup(userId, request);
  }

  public DailyStandupDto.StandupSummary getStandupSummary(UUID userId, int days) {
    return standupService.getStandupSummary(userId, days);
  }

  // ── Interventions ──

  public List<InterventionDto> getActiveInterventions(UUID userId) {
    return interventionService.getActiveInterventions(userId);
  }

  public Page<InterventionDto> getInterventionHistory(UUID userId, Pageable pageable) {
    return interventionService.getInterventionHistory(userId, pageable);
  }

  @Transactional
  public InterventionDto acknowledgeIntervention(
      UUID userId, UUID interventionId, InterventionDto.AcknowledgeRequest request) {
    return interventionService.acknowledgeIntervention(userId, interventionId, request);
  }

  @Transactional
  public InterventionDto dismissIntervention(
      UUID userId, UUID interventionId, InterventionDto.DismissRequest request) {
    return interventionService.dismissIntervention(userId, interventionId, request);
  }

  // ── Velocity ──

  public VelocityDto.VelocityMetrics getVelocityMetrics(UUID userId) {
    return velocityService.getVelocityMetrics(userId);
  }

  public VelocityDto.SprintHealth getSprintHealth(UUID userId, String sprintId) {
    return velocityService.getSprintHealth(userId, sprintId);
  }

  public VelocityDto.VelocityHistory getVelocityHistory(UUID userId, int sprintCount) {
    return velocityService.getVelocityHistory(userId, sprintCount);
  }

  // ── Life Wheel ──

  public LifeWheelDto getLifeWheelMetrics(UUID userId) {
    return lifeWheelMetricService.getLifeWheelMetrics(userId);
  }

  // ── Ceremonies ──

  public List<SprintCeremonyDto> getCeremoniesForSprint(UUID userId, String sprintId) {
    return ceremonyService.getCeremoniesForSprint(userId, sprintId);
  }

  @Transactional
  public SprintCeremonyDto startCeremony(
      UUID userId, SprintCeremonyDto.StartCeremonyRequest request) {
    return ceremonyService.startCeremony(userId, request);
  }

  @Transactional
  public SprintCeremonyDto completeCeremony(
      UUID userId, UUID ceremonyId, SprintCeremonyDto.CompleteCeremonyRequest request) {
    return ceremonyService.completeCeremony(userId, ceremonyId, request);
  }

  public List<VelocityDto.BurndownPoint> getBurndownData(UUID userId, String sprintId) {
    return velocityService.getBurndownData(userId, sprintId);
  }

  public SprintCeremonyDto.CeremonyOutcomes getSprintReviewData(UUID userId, String sprintId) {
    return ceremonyService.getSprintReviewData(userId, sprintId);
  }

  public SprintCeremonyDto.CeremonyOutcomes getRetrospectiveData(UUID userId, String sprintId) {
    return ceremonyService.getRetrospectiveData(userId, sprintId);
  }

  // ── Intake ──

  public IntakeDto processIntake(UUID userId, IntakeDto.ProcessIntakeRequest request) {
    return settingsService.processIntake(userId, request);
  }
}
