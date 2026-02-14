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
 * Fires when sprint completion pace is behind by more than 20%. Uses sprint health data from
 * VelocityService to assess projected completion rate.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class SprintAtRiskTrigger implements InterventionTrigger {

  private static final double RISK_THRESHOLD = 80.0; // projected < 80% = behind >20%

  private final VelocityService velocityService;

  @Override
  public TriggerResult evaluate(UUID userId, String sprintId) {
    if (sprintId == null) {
      return TriggerResult.skip();
    }

    try {
      VelocityDto.SprintHealth health = velocityService.getSprintHealth(userId, sprintId);

      if (health.projectedCompletion() < RISK_THRESHOLD && health.daysElapsed() >= 3) {
        String urgencyLevel = health.projectedCompletion() < 50 ? "CRITICAL" : "HIGH";
        InterventionUrgency urgency =
            health.projectedCompletion() < 50
                ? InterventionUrgency.CRITICAL
                : InterventionUrgency.HIGH;

        log.info(
            "Sprint at risk: userId={}, sprintId={}, projected={}%, health={}",
            userId, sprintId, health.projectedCompletion(), health.healthScore());

        return TriggerResult.fire(
            urgency,
            "Sprint At Risk",
            String.format(
                "Your sprint is projected to complete at %.0f%%. You have %d points remaining "
                    + "with %d days left.",
                health.projectedCompletion(), health.remainingPoints(), health.daysRemaining()),
            "Consider reprioritizing tasks, reducing scope, or breaking down large tasks into "
                + "smaller deliverables.",
            String.format(
                "{\"projected\":%.1f,\"healthScore\":%d,\"remaining\":%d}",
                health.projectedCompletion(), health.healthScore(), health.remainingPoints()),
            null);
      }
    } catch (Exception e) {
      log.warn(
          "Failed to evaluate sprint-at-risk trigger for userId={}: {}", userId, e.getMessage());
    }

    return TriggerResult.skip();
  }

  @Override
  public InterventionType type() {
    return InterventionType.SPRINT_AT_RISK;
  }
}
