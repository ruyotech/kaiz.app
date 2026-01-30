package app.kaiz.tasks.application.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record TaskCommentDto(
    UUID id,
    UUID taskId,
    UUID userId,
    String userName,
    String commentText,
    boolean isAiGenerated,
    List<AttachmentDto> attachments,
    Instant createdAt) {

  /** DTO for comment attachments */
  public record AttachmentDto(
      UUID id,
      String filename,
      String fileUrl,
      String fileType,
      Long fileSize,
      Instant createdAt) {}

  /** Request DTO for creating attachment */
  public record AttachmentRequest(
      @NotBlank String filename, @NotBlank String fileUrl, String fileType, Long fileSize) {}

  public record CreateTaskCommentRequest(
      @NotBlank @Size(max = 5000) String commentText,
      boolean isAiGenerated,
      List<AttachmentRequest> attachments) {}
}
