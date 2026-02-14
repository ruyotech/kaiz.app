package app.kaiz.command_center.application;

import app.kaiz.command_center.domain.UserCoachPreference;
import app.kaiz.command_center.infrastructure.UserCoachPreferenceRepository;
import app.kaiz.sensai.application.CeremonyService;
import app.kaiz.sensai.application.StandupService;
import app.kaiz.sensai.application.VelocityService;
import app.kaiz.tasks.application.SprintService;
import app.kaiz.tasks.application.TaskService;
import app.kaiz.tasks.application.dto.SprintDto;
import app.kaiz.tasks.application.dto.TaskDto;
import app.kaiz.tasks.domain.TaskStatus;
import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * Assembles per-mode context that gets injected into the AI prompt. Each mode has its own builder
 * method that pulls only the data the LLM needs for that conversation type.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class ContextAssembler {

  private final SprintService sprintService;
  private final TaskService taskService;
  private final VelocityService velocityService;
  private final StandupService standupService;
  private final CeremonyService ceremonyService;
  private final UserPreferenceLearner preferenceLearner;
  private final UserCoachPreferenceRepository coachPreferenceRepository;

  /**
   * Build a context map for the given mode and user.
   *
   * @param mode the detected chat mode
   * @param userId the current user
   * @param activeSprintId the current sprint ID (may be null)
   * @return a key-value map of context to inject into the prompt
   */
  public Map<String, String> assemble(String mode, UUID userId, String activeSprintId) {
    Map<String, String> ctx =
        switch (mode) {
          case "CAPTURE" -> assembleCapture(userId, activeSprintId);
          case "PLANNING" -> assemblePlanning(userId, activeSprintId);
          case "STANDUP" -> assembleStandup(userId, activeSprintId);
          case "RETROSPECTIVE", "REVIEW" -> assembleRetrospective(userId, activeSprintId);
          case "REFINEMENT" -> assembleRefinement(userId, activeSprintId);
          default -> assembleFreeform(userId, activeSprintId);
        };

    // Inject user coaching preferences (correction patterns + preferred tone)
    addUserPreferences(ctx, userId);

    return ctx;
  }

  // ── Mode-specific context builders ──

  private Map<String, String> assembleCapture(UUID userId, String activeSprintId) {
    Map<String, String> ctx = newContext();
    ctx.put("today", LocalDate.now().toString());

    if (activeSprintId != null) {
      addSprintSummary(ctx, userId, activeSprintId);
    }

    log.debug("Assembled CAPTURE context: {} keys for userId={}", ctx.size(), userId);
    return ctx;
  }

  private Map<String, String> assemblePlanning(UUID userId, String activeSprintId) {
    Map<String, String> ctx = newContext();
    ctx.put("today", LocalDate.now().toString());

    if (activeSprintId != null) {
      addSprintSummary(ctx, userId, activeSprintId);
      addVelocityContext(ctx, userId, activeSprintId);
    }

    // Add in-progress tasks as carryover candidates
    try {
      List<TaskDto> inProgressTasks = taskService.getTasksByStatus(userId, TaskStatus.IN_PROGRESS);
      if (!inProgressTasks.isEmpty()) {
        StringBuilder sb = new StringBuilder();
        inProgressTasks.stream()
            .limit(10)
            .forEach(
                t ->
                    sb.append("- ")
                        .append(t.title())
                        .append(" (")
                        .append(t.storyPoints())
                        .append(" pts)\n"));
        ctx.put("carryover_tasks", sb.toString());
      }
    } catch (Exception e) {
      log.warn("Could not fetch in-progress tasks for planning context: {}", e.getMessage());
    }

    log.debug("Assembled PLANNING context: {} keys for userId={}", ctx.size(), userId);
    return ctx;
  }

  private Map<String, String> assembleStandup(UUID userId, String activeSprintId) {
    Map<String, String> ctx = newContext();
    ctx.put("today", LocalDate.now().toString());

    if (activeSprintId != null) {
      addSprintSummary(ctx, userId, activeSprintId);

      // Add standup streak for motivation
      try {
        LocalDate weekAgo = LocalDate.now().minusDays(7);
        var standupHistory = standupService.getStandupHistory(userId, weekAgo, LocalDate.now());
        ctx.put("standup_count", String.valueOf(standupHistory.size()));
      } catch (Exception e) {
        log.warn("Could not fetch standup history: {}", e.getMessage());
      }
    }

    log.debug("Assembled STANDUP context: {} keys for userId={}", ctx.size(), userId);
    return ctx;
  }

  private Map<String, String> assembleRetrospective(UUID userId, String activeSprintId) {
    Map<String, String> ctx = newContext();

    if (activeSprintId != null) {
      addSprintSummary(ctx, userId, activeSprintId);
      addVelocityContext(ctx, userId, activeSprintId);

      // Add ceremony-specific data
      try {
        var reviewData = ceremonyService.getSprintReviewData(userId, activeSprintId);
        if (reviewData != null) {
          ctx.put("completed_tasks", String.valueOf(reviewData.tasksCompleted()));
          ctx.put("total_points_done", String.valueOf(reviewData.pointsDelivered()));
          ctx.put("total_tasks", String.valueOf(reviewData.tasksSelected()));
        }
      } catch (Exception e) {
        log.warn("Could not fetch sprint review data: {}", e.getMessage());
      }
    }

    log.debug("Assembled RETROSPECTIVE context: {} keys for userId={}", ctx.size(), userId);
    return ctx;
  }

  private Map<String, String> assembleRefinement(UUID userId, String activeSprintId) {
    Map<String, String> ctx = newContext();

    if (activeSprintId != null) {
      addSprintSummary(ctx, userId, activeSprintId);
    }

    log.debug("Assembled REFINEMENT context: {} keys for userId={}", ctx.size(), userId);
    return ctx;
  }

  private Map<String, String> assembleFreeform(UUID userId, String activeSprintId) {
    Map<String, String> ctx = newContext();
    ctx.put("today", LocalDate.now().toString());

    if (activeSprintId != null) {
      addSprintSummary(ctx, userId, activeSprintId);
    }

    log.debug("Assembled FREEFORM context: {} keys for userId={}", ctx.size(), userId);
    return ctx;
  }

  // ── Shared helpers ──

  private void addSprintSummary(Map<String, String> ctx, UUID userId, String sprintId) {
    try {
      SprintDto sprint = sprintService.getSprintById(sprintId);
      if (sprint != null) {
        ctx.put("sprint_name", "Week " + sprint.weekNumber() + " (" + sprint.year() + ")");
        ctx.put("sprint_goal", sprint.sprintGoal() != null ? sprint.sprintGoal() : "No goal set");
        ctx.put("sprint_dates", sprint.startDate() + " → " + sprint.endDate());
      }
    } catch (Exception e) {
      log.warn("Could not fetch sprint summary for context: {}", e.getMessage());
    }
  }

  private void addVelocityContext(Map<String, String> ctx, UUID userId, String sprintId) {
    try {
      var metrics = velocityService.getVelocityMetrics(userId);
      if (metrics != null) {
        ctx.put("current_velocity", String.valueOf(metrics.currentSprintCompleted()));
        ctx.put("average_velocity", String.valueOf(metrics.averageCompleted()));
        ctx.put("completion_rate", metrics.averageCompletionRate() + "%");
      }
    } catch (Exception e) {
      log.warn("Could not fetch velocity context: {}", e.getMessage());
    }
  }

  private void addUserPreferences(Map<String, String> ctx, UUID userId) {
    try {
      // Inject correction patterns learned from past modifications
      String patterns = preferenceLearner.getCorrectionPatternsText(userId);
      if (!patterns.isBlank()) {
        ctx.put("userCorrectionPatterns", patterns);
      }

      // Inject preferred tone
      Optional<UserCoachPreference> prefOpt = coachPreferenceRepository.findByUserId(userId);
      prefOpt.ifPresent(
          pref -> {
            ctx.put("preferredTone", pref.getPreferredTone().name());
            ctx.put("totalInteractions", String.valueOf(pref.getTotalInteractions()));
          });
    } catch (Exception e) {
      log.warn("Could not fetch user coaching preferences for context: {}", e.getMessage());
    }
  }

  private Map<String, String> newContext() {
    return new LinkedHashMap<>();
  }
}
