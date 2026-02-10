package app.kaiz.tasks.application.dto;

import java.util.List;

public record CompleteSprintRequest(String nextSprintId, List<CarryOverItem> carryOverItems) {

  /**
   * Represents a task the user wants to carry over with optional re-estimation. If newStoryPoints
   * is null, original points are preserved.
   */
  public record CarryOverItem(String taskId, Integer newStoryPoints) {}
}
