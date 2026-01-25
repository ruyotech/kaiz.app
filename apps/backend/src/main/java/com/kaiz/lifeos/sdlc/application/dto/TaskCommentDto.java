package com.kaiz.lifeos.sdlc.application.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.Instant;
import java.util.UUID;

public record TaskCommentDto(
    UUID id,
    UUID taskId,
    UUID userId,
    String userName,
    String commentText,
    boolean isAiGenerated,
    Instant createdAt) {

  public record CreateTaskCommentRequest(
      @NotBlank @Size(max = 5000) String commentText, boolean isAiGenerated) {}
}
