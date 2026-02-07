package app.kaiz.command_center.application.dto;

import app.kaiz.command_center.domain.Draft;
import app.kaiz.command_center.domain.DraftStatus;
import app.kaiz.command_center.domain.DraftType;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * Response DTO for Command Center AI processing.
 *
 * @param id Unique identifier for this draft (use for approval/rejection)
 * @param status Current status (always PENDING_APPROVAL for new responses)
 * @param intentDetected The type of entity the AI detected from the input
 * @param confidenceScore AI confidence in the interpretation (0.0 - 1.0)
 * @param draft The structured draft entity
 * @param reasoning AI's explanation of how it interpreted the input
 * @param suggestions Alternative interpretations or suggestions
 * @param clarifyingQuestions Questions to ask if intent was unclear
 * @param originalInput The preserved original input
 * @param timestamp When this was processed
 * @param expiresAt When this draft will expire if not acted upon
 */
public record CommandCenterAIResponse(
    UUID id,
    DraftStatus status,
    DraftType intentDetected,
    double confidenceScore,
    Draft draft,
    String reasoning,
    List<String> suggestions,
    List<String> clarifyingQuestions,
    OriginalInput originalInput,
    Instant timestamp,
    Instant expiresAt) {

  /** Original input data preserved for reference. */
  public record OriginalInput(
      String text, List<AttachmentSummary> attachments, String voiceTranscription) {}

  /** Summary of an attachment that was processed. */
  public record AttachmentSummary(
      String name, String type, String mimeType, long size, String extractedText) {}

  /** Builder for convenience. */
  public static CommandCenterAIResponse of(
      UUID id,
      DraftType intentDetected,
      double confidenceScore,
      Draft draft,
      String reasoning,
      List<String> suggestions,
      String originalText,
      List<AttachmentSummary> attachments,
      String voiceTranscription,
      Instant expiresAt) {

    return new CommandCenterAIResponse(
        id,
        DraftStatus.PENDING_APPROVAL,
        intentDetected,
        confidenceScore,
        draft,
        reasoning,
        suggestions,
        draft instanceof Draft.NoteDraft note ? note.clarifyingQuestions() : List.of(),
        new OriginalInput(originalText, attachments, voiceTranscription),
        Instant.now(),
        expiresAt);
  }

  /** Builder with explicit status and clarifying questions. */
  public static CommandCenterAIResponse withStatus(
      UUID id,
      DraftStatus status,
      DraftType intentDetected,
      double confidenceScore,
      Draft draft,
      String reasoning,
      List<String> suggestions,
      List<String> clarifyingQuestions,
      String originalText,
      List<AttachmentSummary> attachments,
      String voiceTranscription,
      Instant expiresAt) {

    return new CommandCenterAIResponse(
        id,
        status,
        intentDetected,
        confidenceScore,
        draft,
        reasoning,
        suggestions,
        clarifyingQuestions != null && !clarifyingQuestions.isEmpty()
            ? clarifyingQuestions
            : (draft instanceof Draft.NoteDraft note ? note.clarifyingQuestions() : List.of()),
        new OriginalInput(originalText, attachments, voiceTranscription),
        Instant.now(),
        expiresAt);
  }
}
