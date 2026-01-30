package app.kaiz.tasks.application.dto;

import app.kaiz.tasks.domain.RecurrenceFrequency;
import app.kaiz.tasks.domain.TaskStatus;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

public record TaskDto(
    UUID id,
    String title,
    String description,
    UUID epicId,
    String epicTitle,
    String lifeWheelAreaId,
    String eisenhowerQuadrantId,
    String sprintId,
    int storyPoints,
    TaskStatus status,
    boolean isDraft,
    BigDecimal aiConfidence,
    UUID createdFromTemplateId,
    Instant completedAt,
    Instant targetDate,
    boolean isRecurring,
    RecurrenceDto recurrence,
    boolean isEvent,
    String location,
    boolean isAllDay,
    Instant eventStartTime,
    Instant eventEndTime,
    List<TagDto> tags,
    List<AttachmentDto> attachments,
    Instant createdAt,
    Instant updatedAt,
    List<TaskCommentDto> comments,
    List<TaskHistoryDto> history) {

  // Nested DTO for recurrence
  public record RecurrenceDto(
      UUID id,
      RecurrenceFrequency frequency,
      int intervalValue,
      LocalDate startDate,
      LocalDate endDate,
      Integer dayOfWeek,
      Integer dayOfMonth,
      LocalDate yearlyDate,
      LocalTime scheduledTime,
      LocalTime scheduledEndTime,
      boolean isActive) {}

  // Nested DTO for tags
  public record TagDto(UUID id, String name, String color) {}

  // Nested DTO for attachments
  public record AttachmentDto(
      UUID id,
      String filename,
      String fileUrl,
      String fileType,
      Long fileSize,
      Instant createdAt) {}

  // Request DTO for recurrence when creating a task
  public record RecurrenceRequest(
      @NotNull RecurrenceFrequency frequency,
      @Min(1) Integer intervalValue,
      @NotNull LocalDate startDate,
      LocalDate endDate,
      Integer dayOfWeek,
      Integer dayOfMonth,
      LocalDate yearlyDate,
      LocalTime scheduledTime,
      LocalTime scheduledEndTime) {}

  // Request DTO for attachments when creating a task
  public record AttachmentRequest(
      @NotBlank String filename, @NotBlank String fileUrl, String fileType, Long fileSize) {}

  public record CreateTaskRequest(
      @NotBlank @Size(max = 255) String title,
      @Size(max = 2000) String description,
      UUID epicId,
      @NotNull String lifeWheelAreaId,
      @NotNull String eisenhowerQuadrantId,
      String sprintId,
      @Min(1) @Max(21) Integer storyPoints,
      TaskStatus status,
      BigDecimal aiConfidence,
      UUID createdFromTemplateId,
      // Target date for non-recurring tasks
      Instant targetDate,
      // Recurrence settings
      boolean isRecurring,
      RecurrenceRequest recurrence,
      // Event settings
      boolean isEvent,
      @Size(max = 500) String location,
      boolean isAllDay,
      Instant eventStartTime,
      Instant eventEndTime,
      // Tags (list of tag names - will create if not exists)
      List<String> tags,
      // Attachments
      List<AttachmentRequest> attachments,
      // Initial comment
      @Size(max = 2000) String comment) {}

  public record UpdateTaskRequest(
      @Size(max = 255) String title,
      @Size(max = 2000) String description,
      UUID epicId,
      String lifeWheelAreaId,
      String eisenhowerQuadrantId,
      String sprintId,
      @Min(1) @Max(21) Integer storyPoints,
      TaskStatus status,
      Instant targetDate,
      // Event settings
      @Size(max = 500) String location,
      boolean isAllDay,
      Instant eventStartTime,
      Instant eventEndTime,
      // Tags (list of tag names)
      List<String> tags) {}

  public record UpdateTaskStatusRequest(@NotNull TaskStatus status) {}
}
