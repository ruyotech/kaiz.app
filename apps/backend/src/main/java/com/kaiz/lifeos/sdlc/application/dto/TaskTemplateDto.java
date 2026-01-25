package com.kaiz.lifeos.sdlc.application.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.Instant;
import java.util.UUID;

public record TaskTemplateDto(
    UUID id,
    String name,
    String description,
    int defaultStoryPoints,
    String defaultLifeWheelAreaId,
    String defaultEisenhowerQuadrantId,
    Instant createdAt,
    Instant updatedAt) {

  public record CreateTaskTemplateRequest(
      @NotBlank @Size(max = 255) String name,
      @Size(max = 2000) String description,
      @Min(1) @Max(21) Integer defaultStoryPoints,
      String defaultLifeWheelAreaId,
      String defaultEisenhowerQuadrantId) {}

  public record UpdateTaskTemplateRequest(
      @Size(max = 255) String name,
      @Size(max = 2000) String description,
      @Min(1) @Max(21) Integer defaultStoryPoints,
      String defaultLifeWheelAreaId,
      String defaultEisenhowerQuadrantId) {}
}
