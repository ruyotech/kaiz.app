package app.kaiz.command_center.application.triggers;

import app.kaiz.sensai.domain.InterventionType;
import app.kaiz.sensai.domain.InterventionUrgency;
import app.kaiz.tasks.domain.Task;
import app.kaiz.tasks.infrastructure.TaskRepository;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * Fires when a task has been in BLOCKED status for more than 3 days. Helps surface stuck items that
 * need attention.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class BlockerAlertTrigger implements InterventionTrigger {

  private static final int BLOCKED_DAYS_THRESHOLD = 3;

  private final TaskRepository taskRepository;

  @Override
  public TriggerResult evaluate(UUID userId, String sprintId) {
    if (sprintId == null) {
      return TriggerResult.skip();
    }

    try {
      List<Task> blockedTasks = taskRepository.findBlockedByUserIdAndSprintId(userId, sprintId);

      if (blockedTasks.isEmpty()) {
        return TriggerResult.skip();
      }

      // Filter to tasks blocked for more than threshold days
      Instant threshold = Instant.now().minus(BLOCKED_DAYS_THRESHOLD, ChronoUnit.DAYS);
      List<Task> longBlockedTasks =
          blockedTasks.stream()
              .filter(t -> t.getUpdatedAt() != null && t.getUpdatedAt().isBefore(threshold))
              .toList();

      if (!longBlockedTasks.isEmpty()) {
        String taskNames =
            longBlockedTasks.stream()
                .map(t -> t.getTitle() + " (" + t.getStoryPoints() + " pts)")
                .reduce((a, b) -> a + ", " + b)
                .orElse("");
        int totalBlockedPoints = longBlockedTasks.stream().mapToInt(Task::getStoryPoints).sum();

        log.info(
            "Long-blocked tasks: userId={}, count={}, points={}, tasks=[{}]",
            userId,
            longBlockedTasks.size(),
            totalBlockedPoints,
            taskNames);

        return TriggerResult.fire(
            InterventionUrgency.HIGH,
            "Blocked Tasks Need Attention",
            String.format(
                "%d task(s) have been blocked for over %d days, totaling %d points: %s",
                longBlockedTasks.size(), BLOCKED_DAYS_THRESHOLD, totalBlockedPoints, taskNames),
            "Break down blockers into smaller actionable items, ask for help, or consider "
                + "descoping blocked tasks from the sprint.",
            String.format(
                "{\"blockedCount\":%d,\"blockedPoints\":%d}",
                longBlockedTasks.size(), totalBlockedPoints),
            null);
      }
    } catch (Exception e) {
      log.warn(
          "Failed to evaluate blocker-alert trigger for userId={}: {}", userId, e.getMessage());
    }

    return TriggerResult.skip();
  }

  @Override
  public InterventionType type() {
    return InterventionType.BLOCKER_ALERT;
  }
}
