package app.kaiz.command_center.api.dto;

import jakarta.validation.constraints.NotBlank;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Request DTO for Command Center smart input processing. Supports text, voice, and file
 * attachments.
 */
public record SmartInputRequest(
    String text, // Optional - can be null if only attachments are provided
    String voiceTranscription,
    List<Attachment> attachments,
    String sessionId, // For multi-turn conversations
    Context context) {

  /** Attachment (image, file, etc.) */
  public record Attachment(
      @NotBlank String name,
      @NotBlank String type,
      @NotBlank String mimeType,
      long size,
      String base64Data,
      String extractedText,
      Map<String, Object> metadata) {

    /** Check if this is an image attachment. */
    public boolean isImage() {
      return mimeType != null && mimeType.startsWith("image/");
    }

    /** Check if this is a document attachment. */
    public boolean isDocument() {
      return mimeType != null
          && (mimeType.contains("pdf")
              || mimeType.contains("document")
              || mimeType.contains("text/"));
    }
  }

  /** Additional context for the AI. */
  public record Context(
      String timezone,
      String locale,
      UUID currentEpicId,
      String currentScreen,
      List<String> recentLabels,
      Map<String, Object> userPreferences) {}
}
