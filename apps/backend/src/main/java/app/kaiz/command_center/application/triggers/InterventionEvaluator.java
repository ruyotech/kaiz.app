package app.kaiz.command_center.application.triggers;

import app.kaiz.command_center.application.triggers.InterventionTrigger.TriggerResult;
import app.kaiz.sensai.application.InterventionService;
import app.kaiz.tasks.domain.Sprint;
import app.kaiz.tasks.domain.SprintStatus;
import app.kaiz.tasks.infrastructure.SprintRepository;
import app.kaiz.tasks.infrastructure.TaskRepository;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

/**
 * Periodically evaluates all intervention triggers for users with active sprints. Runs every 2
 * hours. Each trigger is evaluated independently — failures in one trigger do not block others.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class InterventionEvaluator {

  private final List<InterventionTrigger> triggers;
  private final InterventionService interventionService;
  private final SprintRepository sprintRepository;
  private final TaskRepository taskRepository;

  /**
   * Evaluate all triggers for all users with tasks in the active sprint. Runs every 2 hours (start
   * delay 5 minutes to let app fully boot).
   */
  @Scheduled(fixedRate = 7_200_000, initialDelay = 300_000)
  public void evaluateAll() {
    Sprint activeSprint = sprintRepository.findByStatus(SprintStatus.ACTIVE).orElse(null);
    if (activeSprint == null) {
      log.debug("No active sprint found, skipping intervention evaluation");
      return;
    }

    String sprintId = activeSprint.getId();
    Set<UUID> activeUserIds = findUsersWithTasksInSprint(sprintId);

    if (activeUserIds.isEmpty()) {
      log.debug("No users with tasks in active sprint {}", sprintId);
      return;
    }

    log.info(
        "Evaluating {} triggers for {} users in sprint {}",
        triggers.size(),
        activeUserIds.size(),
        sprintId);

    int totalFired = 0;

    for (UUID userId : activeUserIds) {
      for (InterventionTrigger trigger : triggers) {
        try {
          TriggerResult result = trigger.evaluate(userId, sprintId);
          if (result.shouldFire()) {
            interventionService.triggerIntervention(
                userId,
                trigger.type(),
                result.urgency(),
                result.title(),
                result.message(),
                result.actionSuggestion(),
                result.dataContext(),
                sprintId,
                result.relatedDimension());
            totalFired++;
          }
        } catch (Exception e) {
          log.error(
              "Trigger {} failed for userId={}: {}", trigger.type(), userId, e.getMessage(), e);
        }
      }
    }

    log.info(
        "Intervention evaluation complete: {} triggers fired across {} users",
        totalFired,
        activeUserIds.size());
  }

  /**
   * Manual evaluation for a single user (called on-demand, e.g., after standup or sprint commit).
   */
  public int evaluateForUser(UUID userId, String sprintId) {
    int fired = 0;
    for (InterventionTrigger trigger : triggers) {
      try {
        TriggerResult result = trigger.evaluate(userId, sprintId);
        if (result.shouldFire()) {
          interventionService.triggerIntervention(
              userId,
              trigger.type(),
              result.urgency(),
              result.title(),
              result.message(),
              result.actionSuggestion(),
              result.dataContext(),
              sprintId,
              result.relatedDimension());
          fired++;
        }
      } catch (Exception e) {
        log.error("Trigger {} failed for userId={}: {}", trigger.type(), userId, e.getMessage(), e);
      }
    }
    return fired;
  }

  private Set<UUID> findUsersWithTasksInSprint(String sprintId) {
    return taskRepository.findDistinctUserIdsBySprintId(sprintId);
  }
}
