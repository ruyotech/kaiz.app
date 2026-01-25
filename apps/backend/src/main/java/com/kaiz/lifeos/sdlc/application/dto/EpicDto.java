package com.kaiz.lifeos.sdlc.application.dto;

import com.kaiz.lifeos.sdlc.domain.EpicStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record EpicDto(
    UUID id,
    String title,
    String description,
    String lifeWheelAreaId,
    String targetSprintId,
    EpicStatus status,
    int totalPoints,
    int completedPoints,
    String color,
    String icon,
    Instant startDate,
    Instant endDate,
    List<UUID> taskIds,
    Instant createdAt,
    Instant updatedAt) {

  public record CreateEpicRequest(
      @NotBlank @Size(max = 255) String title,
      @Size(max = 2000) String description,
      @NotNull String lifeWheelAreaId,
      String targetSprintId,
      @Size(max = 7) String color,
      @Size(max = 50) String icon) {}

  public record UpdateEpicRequest(
      @Size(max = 255) String title,
      @Size(max = 2000) String description,
      String lifeWheelAreaId,
      String targetSprintId,
      EpicStatus status,
      @Size(max = 7) String color,
      @Size(max = 50) String icon,
      Instant startDate,
      Instant endDate) {}
}
