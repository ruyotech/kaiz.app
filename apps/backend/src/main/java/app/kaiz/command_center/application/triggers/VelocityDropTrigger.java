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
 * Fires when the user's velocity has dropped more than 25% compared to their 4-sprint average.
 * Early warning for declining productivity trends.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class VelocityDropTrigger implements InterventionTrigger {

  private static final double DROP_THRESHOLD_PERCENT = -25.0;

  private final VelocityService velocityService;

  @Override
  public TriggerResult evaluate(UUID userId, String sprintId) {
    try {
      VelocityDto.VelocityMetrics metrics = velocityService.getVelocityMetrics(userId);

      if (metrics.averageCompleted() <= 0 || metrics.currentSprintCompleted() <= 0) {
        return TriggerResult.skip(); // Not enough data
      }

      // trendPercentage from VelocityService = (latest - previous) / previous * 100
      if (metrics.trendPercentage() <= DROP_THRESHOLD_PERCENT) {
        log.info(
            "Velocity drop detected: userId={}, trend={}%, current={}, avg={}",
            userId,
            metrics.trendPercentage(),
            metrics.currentSprintCompleted(),
            metrics.averageCompleted());

        return TriggerResult.fire(
            InterventionUrgency.MEDIUM,
            "Velocity Declining",
            String.format(
                "Your velocity has dropped %.0f%% compared to recent sprints. "
                    + "Current: %d points, average: %.0f points.",
                Math.abs(metrics.trendPercentage()),
                metrics.currentSprintCompleted(),
                metrics.averageCompleted()),
            "Review if tasks are properly sized. Consider whether external factors are "
                + "affecting your productivity, and adjust your sprint commitment accordingly.",
            String.format(
                "{\"trend\":%.1f,\"current\":%d,\"average\":%.1f}",
                metrics.trendPercentage(),
                metrics.currentSprintCompleted(),
                metrics.averageCompleted()),
            null);
      }
    } catch (Exception e) {
      log.warn(
          "Failed to evaluate velocity-drop trigger for userId={}: {}", userId, e.getMessage());
    }

    return TriggerResult.skip();
  }

  @Override
  public InterventionType type() {
    return InterventionType.VELOCITY_DROP;
  }
}
