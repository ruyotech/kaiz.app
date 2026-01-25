package com.kaiz.lifeos.sdlc.application.dto;

import com.kaiz.lifeos.sdlc.domain.TaskStatus;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.Instant;
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
    Instant createdAt,
    Instant updatedAt,
    List<TaskCommentDto> comments,
    List<TaskHistoryDto> history) {

  public record CreateTaskRequest(
      @NotBlank @Size(max = 255) String title,
      @Size(max = 2000) String description,
      UUID epicId,
      @NotNull String lifeWheelAreaId,
      @NotNull String eisenhowerQuadrantId,
      String sprintId,
      @Min(1) @Max(21) Integer storyPoints,
      boolean isDraft,
      BigDecimal aiConfidence,
      UUID createdFromTemplateId) {}

  public record UpdateTaskRequest(
      @Size(max = 255) String title,
      @Size(max = 2000) String description,
      UUID epicId,
      String lifeWheelAreaId,
      String eisenhowerQuadrantId,
      String sprintId,
      @Min(1) @Max(21) Integer storyPoints,
      TaskStatus status,
      boolean isDraft) {}

  public record UpdateTaskStatusRequest(@NotNull TaskStatus status) {}
}
