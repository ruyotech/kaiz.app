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
 * Fires when the user shows signs of burnout: sustained overcommitment combined with low completion
 * rate. Considers both the current sprint health and velocity trends.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class BurnoutWarningTrigger implements InterventionTrigger {

  private static final double COMPLETION_RATE_THRESHOLD = 60.0;

  private final VelocityService velocityService;

  @Override
  public TriggerResult evaluate(UUID userId, String sprintId) {
    if (sprintId == null) {
      return TriggerResult.skip();
    }

    try {
      VelocityDto.VelocityMetrics metrics = velocityService.getVelocityMetrics(userId);
      VelocityDto.SprintHealth health = velocityService.getSprintHealth(userId, sprintId);

      // Burnout pattern: overcommitted + low completion rate + declining trend
      boolean isOvercommitted = metrics.isOvercommitted();
      boolean lowCompletion = metrics.averageCompletionRate() < COMPLETION_RATE_THRESHOLD;
      boolean decliningTrend = metrics.trendPercentage() < -10;

      if (isOvercommitted && lowCompletion && decliningTrend) {
        log.info(
            "Burnout warning: userId={}, overcommitted={}, completionRate={}, trend={}%",
            userId, isOvercommitted, metrics.averageCompletionRate(), metrics.trendPercentage());

        return TriggerResult.fire(
            InterventionUrgency.HIGH,
            "Burnout Risk Detected",
            String.format(
                "You've been consistently overcommitting with a %.0f%% completion rate "
                    + "and a declining velocity trend (%.0f%%). This pattern suggests burnout risk.",
                metrics.averageCompletionRate(), metrics.trendPercentage()),
            "Take a step back: reduce next sprint's commitment to "
                + metrics.suggestedCommitment()
                + " points, prioritize self-care tasks, and consider taking a recovery day.",
            String.format(
                "{\"completionRate\":%.1f,\"trend\":%.1f,\"suggested\":%d}",
                metrics.averageCompletionRate(),
                metrics.trendPercentage(),
                metrics.suggestedCommitment()),
            null);
      }
    } catch (Exception e) {
      log.warn(
          "Failed to evaluate burnout-warning trigger for userId={}: {}", userId, e.getMessage());
    }

    return TriggerResult.skip();
  }

  @Override
  public InterventionType type() {
    return InterventionType.BURNOUT_WARNING;
  }
}
