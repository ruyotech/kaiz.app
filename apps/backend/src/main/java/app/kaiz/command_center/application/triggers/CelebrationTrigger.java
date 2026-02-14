package app.kaiz.command_center.application.triggers;

import app.kaiz.sensai.application.VelocityService;
import app.kaiz.sensai.application.dto.VelocityDto;
import app.kaiz.sensai.domain.InterventionType;
import app.kaiz.sensai.domain.InterventionUrgency;
import app.kaiz.tasks.infrastructure.TaskRepository;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * Fires positive interventions for achievements: 100% sprint completion, streaks, and milestones.
 * Celebrates progress to maintain motivation.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class CelebrationTrigger implements InterventionTrigger {

  private final VelocityService velocityService;
  private final TaskRepository taskRepository;

  @Override
  public TriggerResult evaluate(UUID userId, String sprintId) {
    if (sprintId == null) {
      return TriggerResult.skip();
    }

    try {
      VelocityDto.SprintHealth health = velocityService.getSprintHealth(userId, sprintId);
      VelocityDto.VelocityMetrics metrics = velocityService.getVelocityMetrics(userId);

      // Check for 100% sprint completion
      if (health.committedPoints() > 0
          && health.completedPoints() >= health.committedPoints()
          && health.daysRemaining() > 0) {
        log.info(
            "Celebration: 100% sprint completion! userId={}, points={}/{}",
            userId, health.completedPoints(), health.committedPoints());

        return TriggerResult.fire(
            InterventionUrgency.LOW,
            "Sprint Goals Achieved! 🎉",
            String.format(
                "Amazing! You've completed all %d committed points with %d days still remaining! "
                    + "You're ahead of schedule.",
                health.committedPoints(), health.daysRemaining()),
            "Consider pulling in stretch goals from the backlog, or use the extra time for "
                + "learning and self-care.");
      }

      // Check for personal best sprint
      if (health.completedPoints() > 0
          && health.completedPoints() > metrics.bestSprintPoints()
          && health.daysRemaining() <= 1) {
        log.info(
            "Celebration: new personal best! userId={}, points={}, previousBest={}",
            userId,
            health.completedPoints(),
            metrics.bestSprintPoints());

        return TriggerResult.fire(
            InterventionUrgency.LOW,
            "New Personal Best! 🏆",
            String.format(
                "You've delivered %d points this sprint — a new personal record! "
                    + "Your previous best was %d points.",
                health.completedPoints(), metrics.bestSprintPoints()),
            "Great momentum! Keep the pace sustainable for long-term growth.");
      }

      // Check for positive velocity trend
      if (metrics.trendPercentage() > 20 && metrics.currentSprintCompleted() > 0) {
        return TriggerResult.fire(
            InterventionUrgency.LOW,
            "Velocity Surge! 📈",
            String.format(
                "Your velocity is up %.0f%% compared to last sprint. You're delivering "
                    + "%d points vs your average of %.0f.",
                metrics.trendPercentage(),
                metrics.currentSprintCompleted(),
                metrics.averageCompleted()),
            "Awesome progress! Make sure this pace is sustainable and celebrate your wins.");
      }
    } catch (Exception e) {
      log.warn("Failed to evaluate celebration trigger for userId={}: {}", userId, e.getMessage());
    }

    return TriggerResult.skip();
  }

  @Override
  public InterventionType type() {
    return InterventionType.CELEBRATION;
  }
}
