package app.kaiz.command_center.application.triggers;

import app.kaiz.sensai.application.VelocityService;
import app.kaiz.sensai.application.dto.VelocityDto;
import app.kaiz.sensai.domain.InterventionType;
import app.kaiz.sensai.domain.InterventionUrgency;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * Fires when committed sprint points exceed the user's average velocity by more than 15%. Helps
 * prevent burnout by catching overcommitment early.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class OvercommitTrigger implements InterventionTrigger {

  private static final double OVERCOMMIT_FACTOR = 1.15;

  private final VelocityService velocityService;

  @Override
  public TriggerResult evaluate(UUID userId, String sprintId) {
    if (sprintId == null) {
      return TriggerResult.skip();
    }

    try {
      VelocityDto.VelocityMetrics metrics = velocityService.getVelocityMetrics(userId);

      if (metrics.averageCompleted() <= 0) {
        return TriggerResult.skip(); // Not enough history
      }

      double threshold = metrics.averageCompleted() * OVERCOMMIT_FACTOR;
      int committed = metrics.currentSprintCommitted();

      if (committed > threshold) {
        double overcommitPercent =
            ((committed - metrics.averageCompleted()) / metrics.averageCompleted()) * 100;

        log.info(
            "Overcommit detected: userId={}, committed={}, avgVelocity={}, overcommit={:.0f}%",
            userId, committed, metrics.averageCompleted(), overcommitPercent);

        return TriggerResult.fire(
            InterventionUrgency.MEDIUM,
            "Sprint Overcommitted",
            String.format(
                "You've committed %d points this sprint, but your average velocity is %.0f. "
                    + "That's %.0f%% over your usual capacity.",
                committed, metrics.averageCompleted(), overcommitPercent),
            String.format(
                "Consider moving %d points of lower-priority tasks to the backlog.",
                committed - metrics.suggestedCommitment()),
            String.format(
                "{\"committed\":%d,\"avgVelocity\":%.1f,\"suggested\":%d}",
                committed, metrics.averageCompleted(), metrics.suggestedCommitment()),
            null);
      }
    } catch (Exception e) {
      log.warn("Failed to evaluate overcommit trigger for userId={}: {}", userId, e.getMessage());
    }

    return TriggerResult.skip();
  }

  @Override
  public InterventionType type() {
    return InterventionType.OVERCOMMIT;
  }
}
