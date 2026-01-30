package app.kaiz.sensai.application;

import app.kaiz.identity.domain.User;
import app.kaiz.identity.infrastructure.UserRepository;
import app.kaiz.life_wheel.domain.LifeWheelArea;
import app.kaiz.life_wheel.infrastructure.LifeWheelAreaRepository;
import app.kaiz.sensai.application.dto.*;
import app.kaiz.sensai.domain.*;
import app.kaiz.sensai.infrastructure.*;
import app.kaiz.shared.exception.ResourceNotFoundException;
import app.kaiz.tasks.infrastructure.TaskRepository;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Core service for SensAI - the AI Scrum Master functionality. Implements the Three Prime
 * Directives: Protect Capacity, Enforce Balance, Remove Friction.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class SensAIService {

  private final DailyStandupRepository standupRepository;
  private final InterventionRepository interventionRepository;
  private final SprintCeremonyRepository ceremonyRepository;
  private final VelocityRecordRepository velocityRepository;
  private final SensAISettingsRepository settingsRepository;
  private final LifeWheelMetricRepository lifeWheelMetricRepository;
  private final LifeWheelAreaRepository lifeWheelAreaRepository;
  private final UserRepository userRepository;
  private final TaskRepository taskRepository;
  private final SensAIMapper mapper;

  // ============ SETTINGS ============

  public SensAISettingsDto getSettings(UUID userId) {
    SensAISettings settings =
        settingsRepository.findByUserId(userId).orElseGet(() -> createDefaultSettings(userId));
    return mapper.toDto(settings);
  }

  @Transactional
  public SensAISettingsDto updateSettings(
      UUID userId, SensAISettingsDto.UpdateSettingsRequest request) {
    SensAISettings settings =
        settingsRepository.findByUserId(userId).orElseGet(() -> createDefaultSettings(userId));

    if (request.coachTone() != null) settings.setCoachTone(request.coachTone());
    if (request.interventionsEnabled() != null)
      settings.setInterventionsEnabled(request.interventionsEnabled());
    if (request.dailyStandupTime() != null)
      settings.setDailyStandupTime(request.dailyStandupTime());
    if (request.sprintLengthDays() != null)
      settings.setSprintLengthDays(request.sprintLengthDays());
    if (request.maxDailyCapacity() != null)
      settings.setMaxDailyCapacity(request.maxDailyCapacity());
    if (request.overcommitThreshold() != null)
      settings.setOvercommitThreshold(request.overcommitThreshold());
    if (request.dimensionAlertThreshold() != null)
      settings.setDimensionAlertThreshold(request.dimensionAlertThreshold());
    if (request.dimensionPriorities() != null)
      settings.setDimensionPriorities(mapper.toJson(request.dimensionPriorities()));
    if (request.standupRemindersEnabled() != null)
      settings.setStandupRemindersEnabled(request.standupRemindersEnabled());
    if (request.ceremonyRemindersEnabled() != null)
      settings.setCeremonyRemindersEnabled(request.ceremonyRemindersEnabled());
    if (request.weeklyDigestEnabled() != null)
      settings.setWeeklyDigestEnabled(request.weeklyDigestEnabled());

    return mapper.toDto(settingsRepository.save(settings));
  }

  private SensAISettings createDefaultSettings(UUID userId) {
    User user =
        userRepository
            .findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

    SensAISettings settings =
        SensAISettings.builder()
            .user(user)
            .coachTone(CoachTone.DIRECT)
            .interventionsEnabled(true)
            .dailyStandupTime("09:00")
            .sprintLengthDays(14)
            .maxDailyCapacity(8)
            .overcommitThreshold(new BigDecimal("0.15"))
            .dimensionAlertThreshold(5)
            .standupRemindersEnabled(true)
            .ceremonyRemindersEnabled(true)
            .weeklyDigestEnabled(true)
            .build();

    return settingsRepository.save(settings);
  }

  // ============ DAILY STANDUP ============

  public DailyStandupDto getTodayStandup(UUID userId) {
    return standupRepository
        .findByUserIdAndStandupDate(userId, LocalDate.now())
        .map(mapper::toDto)
        .orElse(null);
  }

  public List<DailyStandupDto> getStandupHistory(
      UUID userId, LocalDate startDate, LocalDate endDate) {
    return mapper.toStandupDtos(
        standupRepository.findByUserIdAndStandupDateBetweenOrderByStandupDateDesc(
            userId, startDate, endDate));
  }

  @Transactional
  public DailyStandupDto completeStandup(
      UUID userId, DailyStandupDto.CompleteStandupRequest request) {
    User user =
        userRepository
            .findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

    DailyStandup standup =
        standupRepository
            .findByUserIdAndStandupDate(userId, request.standupDate())
            .orElseGet(
                () -> DailyStandup.builder().user(user).standupDate(request.standupDate()).build());

    standup.setYesterdaySummary(request.yesterdaySummary());
    standup.setTodayPlan(request.todayPlan());
    standup.setBlockers(request.blockers());
    standup.setMoodScore(request.moodScore());
    standup.setEnergyLevel(request.energyLevel());
    standup.setCompletedAt(Instant.now());
    standup.setSkipped(false);

    // Generate coach response based on standup content
    standup.setCoachResponse(generateCoachResponse(standup, user));

    // Check for potential interventions based on standup
    checkStandupInterventions(userId, standup);

    return mapper.toDto(standupRepository.save(standup));
  }

  @Transactional
  public DailyStandupDto skipStandup(UUID userId, DailyStandupDto.SkipStandupRequest request) {
    User user =
        userRepository
            .findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

    DailyStandup standup =
        standupRepository
            .findByUserIdAndStandupDate(userId, request.standupDate())
            .orElseGet(
                () -> DailyStandup.builder().user(user).standupDate(request.standupDate()).build());

    standup.setSkipped(true);
    standup.setSkipReason(request.skipReason());
    standup.setCompletedAt(Instant.now());

    return mapper.toDto(standupRepository.save(standup));
  }

  public DailyStandupDto.StandupSummary getStandupSummary(UUID userId, int days) {
    LocalDate endDate = LocalDate.now();
    LocalDate startDate = endDate.minusDays(days);

    int completedCount = standupRepository.countCompletedStandups(userId, startDate, endDate);
    Double avgMood = standupRepository.getAverageMoodScore(userId, startDate, endDate);
    Double avgEnergy = standupRepository.getAverageEnergyLevel(userId, startDate, endDate);

    List<DailyStandup> recent =
        standupRepository.findByUserIdAndStandupDateBetweenOrderByStandupDateDesc(
            userId, startDate, endDate);

    int skippedCount = (int) recent.stream().filter(DailyStandup::isSkipped).count();
    int missedCount = days - completedCount - skippedCount;
    int currentStreak = calculateStandupStreak(recent);

    return new DailyStandupDto.StandupSummary(
        days,
        completedCount,
        skippedCount,
        Math.max(0, missedCount),
        days > 0 ? (double) completedCount / days * 100 : 0,
        avgMood != null ? avgMood : 0,
        avgEnergy != null ? avgEnergy : 0,
        currentStreak);
  }

  // ============ INTERVENTIONS ============

  public List<InterventionDto> getActiveInterventions(UUID userId) {
    return mapper.toInterventionDtos(
        interventionRepository.findByUserIdAndIsActiveTrueOrderByTriggeredAtDesc(userId));
  }

  public Page<InterventionDto> getInterventionHistory(UUID userId, Pageable pageable) {
    return interventionRepository
        .findByUserIdOrderByTriggeredAtDesc(userId, pageable)
        .map(mapper::toDto);
  }

  @Transactional
  public InterventionDto acknowledgeIntervention(
      UUID userId, UUID interventionId, InterventionDto.AcknowledgeRequest request) {
    Intervention intervention =
        interventionRepository
            .findById(interventionId)
            .orElseThrow(() -> new ResourceNotFoundException("Intervention not found"));

    if (!intervention.getUser().getId().equals(userId)) {
      throw new ResourceNotFoundException("Intervention not found");
    }

    intervention.setAcknowledgedAt(Instant.now());
    intervention.setActionTaken(request.actionTaken());
    intervention.setActive(false);

    return mapper.toDto(interventionRepository.save(intervention));
  }

  @Transactional
  public InterventionDto dismissIntervention(
      UUID userId, UUID interventionId, InterventionDto.DismissRequest request) {
    Intervention intervention =
        interventionRepository
            .findById(interventionId)
            .orElseThrow(() -> new ResourceNotFoundException("Intervention not found"));

    if (!intervention.getUser().getId().equals(userId)) {
      throw new ResourceNotFoundException("Intervention not found");
    }

    intervention.setDismissedAt(Instant.now());
    intervention.setDismissReason(request.dismissReason());
    intervention.setActive(false);

    return mapper.toDto(interventionRepository.save(intervention));
  }

  @Transactional
  public Intervention triggerIntervention(
      UUID userId,
      InterventionType type,
      InterventionUrgency urgency,
      String title,
      String message,
      String actionSuggestion,
      String dataContext,
      String relatedSprintId,
      String relatedDimension) {
    // Check if similar active intervention already exists
    if (interventionRepository.existsByUserIdAndInterventionTypeAndIsActiveTrue(userId, type)) {
      log.debug("Skipping duplicate intervention of type {} for user {}", type, userId);
      return null;
    }

    User user =
        userRepository
            .findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

    Intervention intervention =
        Intervention.builder()
            .user(user)
            .interventionType(type)
            .urgency(urgency)
            .title(title)
            .message(message)
            .actionSuggestion(actionSuggestion)
            .dataContext(dataContext)
            .triggeredAt(Instant.now())
            .isActive(true)
            .relatedSprintId(relatedSprintId)
            .relatedDimension(relatedDimension)
            .build();

    return interventionRepository.save(intervention);
  }

  // ============ VELOCITY ============

  public VelocityDto.VelocityMetrics getVelocityMetrics(UUID userId) {
    List<VelocityRecord> recent =
        velocityRepository.findRecentVelocityRecords(userId, PageRequest.of(0, 10));

    Double avgCompleted = velocityRepository.getAverageCompletedPoints(userId);
    Double avgCompletionRate = velocityRepository.getAverageCompletionRate(userId);
    Integer bestSprint = velocityRepository.getBestSprintPoints(userId);

    // Calculate current sprint info (mock - would integrate with sprint service)
    int currentCommitted = recent.isEmpty() ? 0 : recent.get(0).getCommittedPoints();
    int currentCompleted = recent.isEmpty() ? 0 : recent.get(0).getCompletedPoints();
    boolean isOvercommitted = recent.isEmpty() ? false : recent.get(0).isOvercommitted();

    // Calculate trend
    double trend = 0;
    if (recent.size() >= 2) {
      int latest = recent.get(0).getCompletedPoints();
      int previous = recent.get(1).getCompletedPoints();
      trend = previous > 0 ? ((double) (latest - previous) / previous) * 100 : 0;
    }

    // Suggested commitment based on rolling average
    int suggested = avgCompleted != null ? (int) Math.round(avgCompleted * 0.9) : 35;

    return new VelocityDto.VelocityMetrics(
        avgCompleted != null ? avgCompleted : 0,
        currentCommitted,
        currentCompleted,
        Math.round(trend * 100) / 100.0,
        isOvercommitted,
        avgCompletionRate != null ? avgCompletionRate.doubleValue() : 0,
        bestSprint != null ? bestSprint : 0,
        suggested);
  }

  public VelocityDto.SprintHealth getSprintHealth(UUID userId, String sprintId) {
    // This would integrate with the sprint service to get actual data
    // For now, calculating based on velocity records and tasks

    VelocityRecord record =
        velocityRepository.findByUserIdAndSprintId(userId, sprintId).orElse(null);

    if (record == null) {
      return new VelocityDto.SprintHealth(
          sprintId, 0, 14, 14, 0, 0, 0, 0, 0, 100, "low", List.of(), "Sprint not started yet.");
    }

    int totalDays =
        (int)
            java.time.temporal.ChronoUnit.DAYS.between(
                record.getSprintStartDate(), record.getSprintEndDate());
    int daysElapsed =
        (int)
            java.time.temporal.ChronoUnit.DAYS.between(
                record.getSprintStartDate(), LocalDate.now());
    int daysRemaining = Math.max(0, totalDays - daysElapsed);

    int remainingPoints = record.getCommittedPoints() - record.getCompletedPoints();

    // Calculate projected completion
    double dailyRate = daysElapsed > 0 ? (double) record.getCompletedPoints() / daysElapsed : 0;
    double projectedCompletion =
        record.getCommittedPoints() > 0
            ? Math.min(
                100,
                ((record.getCompletedPoints() + (dailyRate * daysRemaining))
                        / record.getCommittedPoints())
                    * 100)
            : 100;

    // Calculate health score
    int healthScore = calculateHealthScore(record, daysElapsed, totalDays, projectedCompletion);
    String riskLevel = healthScore >= 70 ? "low" : healthScore >= 40 ? "medium" : "high";

    List<String> riskFactors =
        identifyRiskFactors(record, daysElapsed, totalDays, projectedCompletion);
    String assessment = generateHealthAssessment(healthScore, riskFactors, record);

    return new VelocityDto.SprintHealth(
        sprintId,
        daysElapsed,
        daysRemaining,
        totalDays,
        record.getCommittedPoints(),
        record.getCompletedPoints(),
        remainingPoints,
        0, // in progress points - would come from task service
        Math.round(projectedCompletion * 10) / 10.0,
        healthScore,
        riskLevel,
        riskFactors,
        assessment);
  }

  public VelocityDto.VelocityHistory getVelocityHistory(UUID userId, int sprintCount) {
    List<VelocityRecord> records =
        velocityRepository.findRecentVelocityRecords(userId, PageRequest.of(0, sprintCount));

    List<VelocityDto> sprints = mapper.toVelocityDtos(records);

    double avgCommitted =
        records.stream().mapToInt(VelocityRecord::getCommittedPoints).average().orElse(0);
    double avgCompleted =
        records.stream().mapToInt(VelocityRecord::getCompletedPoints).average().orElse(0);
    int totalDelivered = records.stream().mapToInt(VelocityRecord::getCompletedPoints).sum();
    double overallRate = avgCommitted > 0 ? (avgCompleted / avgCommitted) * 100 : 0;

    return new VelocityDto.VelocityHistory(
        sprints,
        Math.round(avgCommitted * 10) / 10.0,
        Math.round(avgCompleted * 10) / 10.0,
        Math.round(overallRate * 10) / 10.0,
        totalDelivered,
        records.size());
  }

  // ============ LIFE WHEEL METRICS ============

  public LifeWheelDto getLifeWheelMetrics(UUID userId) {
    // Get all life wheel areas
    List<LifeWheelArea> areas = lifeWheelAreaRepository.findAllOrderByDisplayOrder();

    // Get existing metrics for user
    List<LifeWheelMetric> existingMetrics = lifeWheelMetricRepository.findByUserId(userId);
    Map<String, LifeWheelMetric> metricsMap = new HashMap<>();
    for (LifeWheelMetric metric : existingMetrics) {
      metricsMap.put(metric.getLifeWheelAreaId(), metric);
    }

    // Build dimension metrics for all areas
    List<LifeWheelDto.DimensionMetric> dimensions = new ArrayList<>();
    double totalScore = 0;
    String lowestDimension = null;
    String highestDimension = null;
    double lowestScore = 11;
    double highestScore = -1;

    for (LifeWheelArea area : areas) {
      LifeWheelMetric metric = metricsMap.get(area.getId());

      double score = metric != null ? metric.getScore() : 5.0;
      String trend = metric != null ? metric.getTrend() : "stable";
      int tasksCompleted = metric != null ? metric.getTasksCompleted() : 0;
      int pointsDelivered = metric != null ? metric.getPointsEarned() : 0;

      // Calculate trend delta
      double trendDelta = "up".equals(trend) ? 0.5 : "down".equals(trend) ? -0.5 : 0;

      // Check if needs attention
      boolean needsAttention = score < 4 || (metric != null && metric.isNeglected());
      int sprintsNeglected = needsAttention ? 1 : 0;

      // Build suggested recovery tasks
      List<String> recoveryTasks =
          needsAttention
              ? List.of("Schedule focused time for " + area.getName().toLowerCase())
              : List.of();

      dimensions.add(
          new LifeWheelDto.DimensionMetric(
              area.getId(),
              area.getName(),
              area.getIcon(),
              area.getColor(),
              score,
              score - trendDelta, // previous score approximation
              trendDelta,
              tasksCompleted,
              pointsDelivered,
              sprintsNeglected,
              needsAttention,
              recoveryTasks));

      totalScore += score;

      if (score < lowestScore) {
        lowestScore = score;
        lowestDimension = area.getId();
      }
      if (score > highestScore) {
        highestScore = score;
        highestDimension = area.getId();
      }
    }

    // Calculate overall balance and variance
    double overallBalance = areas.isEmpty() ? 5.0 : totalScore / areas.size();
    double variance = 0;
    for (LifeWheelDto.DimensionMetric dim : dimensions) {
      variance += Math.pow(dim.currentScore() - overallBalance, 2);
    }
    variance = areas.isEmpty() ? 0 : Math.sqrt(variance / areas.size());

    return new LifeWheelDto(
        Math.round(overallBalance * 10) / 10.0,
        dimensions,
        lowestDimension,
        highestDimension,
        Math.round(variance * 100) / 100.0,
        "Current Sprint");
  }

  // ============ CEREMONIES ============

  public List<SprintCeremonyDto> getCeremoniesForSprint(UUID userId, String sprintId) {
    return mapper.toCeremonyDtos(
        ceremonyRepository.findByUserIdAndSprintIdOrderByScheduledAt(userId, sprintId));
  }

  @Transactional
  public SprintCeremonyDto startCeremony(
      UUID userId, SprintCeremonyDto.StartCeremonyRequest request) {
    User user =
        userRepository
            .findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

    SprintCeremony ceremony =
        ceremonyRepository
            .findByUserIdAndSprintIdAndCeremonyType(
                userId, request.sprintId(), request.ceremonyType())
            .orElseGet(
                () ->
                    SprintCeremony.builder()
                        .user(user)
                        .sprintId(request.sprintId())
                        .ceremonyType(request.ceremonyType())
                        .build());

    ceremony.setStatus(CeremonyStatus.IN_PROGRESS);
    ceremony.setStartedAt(Instant.now());

    return mapper.toDto(ceremonyRepository.save(ceremony));
  }

  @Transactional
  public SprintCeremonyDto completeCeremony(
      UUID userId, UUID ceremonyId, SprintCeremonyDto.CompleteCeremonyRequest request) {
    SprintCeremony ceremony =
        ceremonyRepository
            .findById(ceremonyId)
            .orElseThrow(() -> new ResourceNotFoundException("Ceremony not found"));

    if (!ceremony.getUser().getId().equals(userId)) {
      throw new ResourceNotFoundException("Ceremony not found");
    }

    ceremony.setStatus(CeremonyStatus.COMPLETED);
    ceremony.setCompletedAt(Instant.now());
    ceremony.setNotes(request.notes());

    if (request.outcomes() != null) {
      ceremony.setOutcomes(mapper.toJson(request.outcomes()));
    }
    if (request.actionItems() != null) {
      ceremony.setActionItems(mapper.toJson(request.actionItems()));
    }

    if (ceremony.getStartedAt() != null) {
      long minutes =
          java.time.Duration.between(ceremony.getStartedAt(), ceremony.getCompletedAt())
              .toMinutes();
      ceremony.setDurationMinutes((int) minutes);
    }

    // Generate coach summary
    ceremony.setCoachSummary(generateCeremonySummary(ceremony));

    return mapper.toDto(ceremonyRepository.save(ceremony));
  }

  // ============ INTAKE PROCESSING ============

  public IntakeDto processIntake(UUID userId, IntakeDto.ProcessIntakeRequest request) {
    // AI-powered parsing would go here - for now, basic implementation
    String input = request.input().trim();
    String type = request.intakeType();

    // Parse the input to extract task details
    IntakeDto.ParsedTask parsedTask = parseTaskFromInput(input);

    // Suggest dimension based on content
    String suggestedDimension = suggestDimension(input);

    // Check for scheduling conflicts
    List<String> conflicts = checkSchedulingConflicts(userId, parsedTask);

    // Generate scheduling suggestion
    IntakeDto.ScheduleSuggestion schedule = generateScheduleSuggestion(userId, parsedTask);

    // Generate coach message
    String coachMessage = generateIntakeCoachMessage(parsedTask, suggestedDimension, conflicts);

    return new IntakeDto(
        input,
        type,
        parsedTask,
        suggestedDimension,
        schedule,
        conflicts,
        coachMessage,
        0.85 // confidence score
        );
  }

  // ============ HELPER METHODS ============

  private String generateCoachResponse(DailyStandup standup, User user) {
    StringBuilder response = new StringBuilder();

    if (standup.getBlockers() != null && !standup.getBlockers().isEmpty()) {
      response.append("I noticed you have blockers. Let's work on removing them. ");
    }

    if (standup.getMoodScore() != null && standup.getMoodScore() <= 2) {
      response.append("It sounds like a tough day. Remember, progress over perfection. ");
    }

    if (standup.getEnergyLevel() != null && standup.getEnergyLevel() <= 2) {
      response.append("Low energy noted. Consider tackling easier tasks today. ");
    }

    if (response.length() == 0) {
      response.append("Great standup! You've got a clear plan. Let's make it happen.");
    }

    return response.toString();
  }

  private void checkStandupInterventions(UUID userId, DailyStandup standup) {
    // Check for burnout warning based on mood/energy trends
    if (standup.getMoodScore() != null && standup.getEnergyLevel() != null) {
      if (standup.getMoodScore() <= 2 && standup.getEnergyLevel() <= 2) {
        triggerIntervention(
            userId,
            InterventionType.BURNOUT_WARNING,
            InterventionUrgency.MEDIUM,
            "Energy Check",
            "Your mood and energy are both low today. Consider taking it easier.",
            "Reduce your task load for today and take breaks",
            null,
            null,
            null);
      }
    }

    // Check for blocker alert
    if (standup.getBlockers() != null && !standup.getBlockers().isEmpty()) {
      triggerIntervention(
          userId,
          InterventionType.BLOCKER_ALERT,
          InterventionUrgency.MEDIUM,
          "Blocker Detected",
          "You've reported blockers in your standup. Let's address them.",
          "Break down the blocker into smaller actionable items",
          null,
          null,
          null);
    }
  }

  private int calculateStandupStreak(List<DailyStandup> standups) {
    int streak = 0;
    LocalDate expected = LocalDate.now();

    for (DailyStandup standup : standups) {
      if (standup.getStandupDate().equals(expected)
          && standup.getCompletedAt() != null
          && !standup.isSkipped()) {
        streak++;
        expected = expected.minusDays(1);
      } else {
        break;
      }
    }

    return streak;
  }

  private int calculateHealthScore(
      VelocityRecord record, int daysElapsed, int totalDays, double projectedCompletion) {
    int score = 100;

    // Deduct for low projected completion
    if (projectedCompletion < 100) {
      score -= (int) ((100 - projectedCompletion) * 0.5);
    }

    // Deduct for overcommitment
    if (record.isOvercommitted()) {
      score -= 15;
    }

    // Deduct for being behind schedule
    double expectedProgress = totalDays > 0 ? (double) daysElapsed / totalDays : 0;
    double actualProgress =
        record.getCommittedPoints() > 0
            ? (double) record.getCompletedPoints() / record.getCommittedPoints()
            : 0;

    if (actualProgress < expectedProgress - 0.1) {
      score -= 20;
    }

    return Math.max(0, Math.min(100, score));
  }

  private List<String> identifyRiskFactors(
      VelocityRecord record, int daysElapsed, int totalDays, double projectedCompletion) {
    List<String> risks = new ArrayList<>();

    if (projectedCompletion < 80) {
      risks.add("Low projected completion rate");
    }

    if (record.isOvercommitted()) {
      risks.add("Sprint is overcommitted");
    }

    if (record.getCarriedOverPoints() > record.getCommittedPoints() * 0.2) {
      risks.add("High carryover from previous sprint");
    }

    double expectedProgress = totalDays > 0 ? (double) daysElapsed / totalDays : 0;
    double actualProgress =
        record.getCommittedPoints() > 0
            ? (double) record.getCompletedPoints() / record.getCommittedPoints()
            : 0;

    if (actualProgress < expectedProgress - 0.15) {
      risks.add("Behind expected progress");
    }

    return risks;
  }

  private String generateHealthAssessment(
      int healthScore, List<String> riskFactors, VelocityRecord record) {
    if (healthScore >= 80) {
      return "Sprint is on track! Keep up the good work.";
    } else if (healthScore >= 60) {
      return "Sprint health is moderate. "
          + (riskFactors.isEmpty() ? "" : "Watch out for: " + riskFactors.get(0));
    } else if (healthScore >= 40) {
      return "Sprint needs attention. Consider reducing scope or addressing blockers.";
    } else {
      return "Sprint is at risk. Immediate action recommended - consider emergency scope reduction.";
    }
  }

  private String generateCeremonySummary(SprintCeremony ceremony) {
    return switch (ceremony.getCeremonyType()) {
      case PLANNING -> "Planning complete. Remember to focus on high-priority items first.";
      case REVIEW -> "Great review session! Celebrate your accomplishments.";
      case RETROSPECTIVE -> "Valuable insights gathered. Follow through on your action items.";
      case STANDUP -> "Daily check-in recorded.";
      case REFINEMENT -> "Backlog refined and ready for the next sprint.";
    };
  }

  private IntakeDto.ParsedTask parseTaskFromInput(String input) {
    // Basic parsing - would be AI-powered in production
    String title = input.length() > 100 ? input.substring(0, 100) : input;
    String description = input.length() > 100 ? input : null;

    // Estimate points based on keywords
    int points = 3;
    if (input.toLowerCase().contains("quick") || input.toLowerCase().contains("small")) {
      points = 1;
    } else if (input.toLowerCase().contains("large") || input.toLowerCase().contains("complex")) {
      points = 8;
    }

    String priority = "medium";
    if (input.toLowerCase().contains("urgent") || input.toLowerCase().contains("asap")) {
      priority = "high";
    }

    return new IntakeDto.ParsedTask(
        title,
        description,
        points,
        priority,
        "do_first", // default eisenhower quadrant
        List.of(),
        null);
  }

  private String suggestDimension(String input) {
    String lower = input.toLowerCase();

    if (lower.contains("work") || lower.contains("project") || lower.contains("meeting")) {
      return "career";
    } else if (lower.contains("exercise") || lower.contains("gym") || lower.contains("health")) {
      return "health";
    } else if (lower.contains("family") || lower.contains("kid") || lower.contains("parent")) {
      return "family";
    } else if (lower.contains("money") || lower.contains("budget") || lower.contains("invest")) {
      return "finance";
    } else if (lower.contains("learn") || lower.contains("read") || lower.contains("course")) {
      return "growth";
    } else if (lower.contains("friend") || lower.contains("social") || lower.contains("party")) {
      return "social";
    } else if (lower.contains("meditat") || lower.contains("pray") || lower.contains("spirit")) {
      return "spirit";
    } else if (lower.contains("creat") || lower.contains("art") || lower.contains("music")) {
      return "creativity";
    } else if (lower.contains("clean") || lower.contains("home") || lower.contains("organize")) {
      return "environment";
    }

    return "career"; // default
  }

  private List<String> checkSchedulingConflicts(UUID userId, IntakeDto.ParsedTask task) {
    // Would check calendar and existing tasks
    return List.of();
  }

  private IntakeDto.ScheduleSuggestion generateScheduleSuggestion(
      UUID userId, IntakeDto.ParsedTask task) {
    return new IntakeDto.ScheduleSuggestion(
        "This week", "Based on your current capacity and priorities", true, task.estimatedPoints());
  }

  private String generateIntakeCoachMessage(
      IntakeDto.ParsedTask task, String dimension, List<String> conflicts) {
    StringBuilder message = new StringBuilder();
    message.append("Got it! I've categorized this as a ").append(dimension).append(" task. ");

    if (task.estimatedPoints() >= 5) {
      message.append("This seems like a substantial task - consider breaking it down. ");
    }

    if (!conflicts.isEmpty()) {
      message.append("Note: There may be scheduling conflicts to review. ");
    }

    return message.toString();
  }
}
