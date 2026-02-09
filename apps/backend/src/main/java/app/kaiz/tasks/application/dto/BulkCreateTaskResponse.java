package app.kaiz.tasks.application.dto;

import java.util.List;

/**
 * Response for bulk task creation. Supports partial success — if 8 of 10 tasks succeed, the
 * response contains 8 created tasks and 2 error entries so the UI can show which failed.
 */
public record BulkCreateTaskResponse(
    List<TaskDto> created, List<BulkTaskError> errors, int totalRequested) {

  /** Describes a single failure within a bulk creation batch. */
  public record BulkTaskError(int index, String title, String message) {}
}
