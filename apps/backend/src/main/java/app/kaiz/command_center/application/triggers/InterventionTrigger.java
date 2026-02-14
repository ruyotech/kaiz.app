package app.kaiz.command_center.application.triggers;

import app.kaiz.sensai.domain.InterventionType;
import app.kaiz.sensai.domain.InterventionUrgency;
import java.util.UUID;

/**
 * Common interface for all intervention triggers. Each trigger evaluates a specific condition and
 * returns a result indicating whether an intervention should be fired.
 */
public interface InterventionTrigger {

  /** Evaluate whether this trigger should fire for the given user and sprint. */
  TriggerResult evaluate(UUID userId, String sprintId);

  /** The intervention type this trigger produces. */
  InterventionType type();

  /** Result of a trigger evaluation. */
  record TriggerResult(
      boolean shouldFire,
      InterventionUrgency urgency,
      String title,
      String message,
      String actionSuggestion,
      String dataContext,
      String relatedDimension) {

    /** No intervention needed. */
    public static TriggerResult skip() {
      return new TriggerResult(false, null, null, null, null, null, null);
    }

    /** Fire an intervention. */
    public static TriggerResult fire(
        InterventionUrgency urgency,
        String title,
        String message,
        String actionSuggestion,
        String dataContext,
        String relatedDimension) {
      return new TriggerResult(
          true, urgency, title, message, actionSuggestion, dataContext, relatedDimension);
    }

    public static TriggerResult fire(
        InterventionUrgency urgency, String title, String message, String actionSuggestion) {
      return fire(urgency, title, message, actionSuggestion, null, null);
    }
  }
}
