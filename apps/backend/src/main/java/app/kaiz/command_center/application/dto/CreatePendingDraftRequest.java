package app.kaiz.command_center.application.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

/**
 * Request to create a pending task/event directly from draft data. This bypasses the session lookup
 * and accepts the draft fields directly, allowing users to edit fields before confirming.
 */
@Schema(description = "Create pending task/event from draft data")
public record CreatePendingDraftRequest(
    @Schema(description = "Draft type", example = "TASK") @NotBlank String draftType,
    @Schema(description = "Title of the task/event", example = "Team meeting") @NotBlank
        String title,
    @Schema(description = "Description", example = "Weekly sync with the team") String description,

    // Task-specific fields
    @Schema(description = "Due date for tasks") @JsonFormat(pattern = "yyyy-MM-dd")
        LocalDate dueDate,
    @Schema(description = "Priority level", example = "MEDIUM") String priority,
    @Schema(description = "Story points (1-13 Fibonacci)", example = "5") Integer storyPoints,
    @Schema(description = "Estimated time in minutes", example = "60") Integer estimatedMinutes,
    @Schema(description = "Eisenhower Quadrant ID", example = "eq-2") String eisenhowerQuadrantId,
    @Schema(description = "Life Wheel Area ID", example = "lw-4") String lifeWheelAreaId,
    @Schema(description = "Category", example = "Work") String category,
    @Schema(description = "Tags", example = "[\"meeting\", \"team\"]") List<String> tags,
    @Schema(description = "Is recurring", example = "false") Boolean isRecurring,

    // Event-specific fields
    @Schema(description = "Event date") @JsonFormat(pattern = "yyyy-MM-dd") LocalDate date,
    @Schema(description = "Event start time") @JsonFormat(pattern = "HH:mm") LocalTime startTime,
    @Schema(description = "Event end time") @JsonFormat(pattern = "HH:mm") LocalTime endTime,
    @Schema(description = "Location", example = "Conference Room A") String location,
    @Schema(description = "Is all day event", example = "false") Boolean isAllDay,
    @Schema(description = "Attendees", example = "[\"john@example.com\"]") List<String> attendees) {
  /** Determines if this draft represents an event based on the type or presence of event fields. */
  public boolean isEvent() {
    return "EVENT".equalsIgnoreCase(draftType)
        || "MEETING".equalsIgnoreCase(draftType)
        || startTime != null
        || location != null
        || (attendees != null && !attendees.isEmpty());
  }

  /** Gets the effective date - uses date for events, dueDate for tasks. */
  public LocalDate getEffectiveDate() {
    return date != null ? date : dueDate;
  }
}
