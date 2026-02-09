package app.kaiz.command_center.application.dto;

import java.math.BigDecimal;
import java.util.List;

/**
 * Response from the AI sprint quick-add endpoint. Contains a list of AI-inferred task suggestions
 * that the user can review, edit, and approve before creation.
 */
public record SprintQuickAddResponse(List<TaskDraftSuggestion> suggestions) {

  /**
   * A single AI-inferred task draft. Contains all fields needed to create a task via the bulk
   * create endpoint. The user can tweak any field before approving.
   */
  public record TaskDraftSuggestion(
      String originalLine,
      String title,
      String description,
      String lifeWheelAreaId,
      String eisenhowerQuadrantId,
      int storyPoints,
      List<String> tags,
      BigDecimal aiConfidence) {}
}
