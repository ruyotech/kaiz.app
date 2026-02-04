package app.kaiz.command_center.application;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * Structured logger for AI conversations in Command Center.
 *
 * <p>Provides clean, traceable logging for: - Complete conversation tracking with unique IDs -
 * Input/output message pairs - Provider and model information - Timing and performance metrics -
 * Attachment and OCR processing
 *
 * <p>Usage: var conversation = aiLogger.startConversation(userId, "SMART_INPUT");
 * conversation.logInput(...) conversation.logSystemPrompt(...) conversation.logAIResponse(...)
 * conversation.complete(...)
 */
@Component
@Slf4j
public class AIConversationLogger {

  private static final String SEPARATOR =
      "═══════════════════════════════════════════════════════════════════";
  private static final String SUB_SEPARATOR =
      "───────────────────────────────────────────────────────────────────";

  /** AI Provider information for logging */
  public record ProviderInfo(String name, String model, String version) {
    public static ProviderInfo anthropic() {
      return new ProviderInfo("Anthropic", "claude-3-5-sonnet-20241022", "1.0");
    }
  }

  /** Attachment info for structured logging */
  public record AttachmentInfo(
      String name, String type, String mimeType, Long sizeBytes, String extractedText) {}

  /** Start a new conversation log session */
  public ConversationLog startConversation(UUID userId, String conversationType) {
    return new ConversationLog(userId, conversationType);
  }

  /** Conversation log context - tracks a full AI conversation session */
  public static class ConversationLog {
    private final String conversationId;
    private final UUID userId;
    private final String conversationType;
    private final Instant startTime;
    private int messageCount = 0;

    ConversationLog(UUID userId, String conversationType) {
      this.conversationId = UUID.randomUUID().toString().substring(0, 8).toUpperCase();
      this.userId = userId;
      this.conversationType = conversationType;
      this.startTime = Instant.now();

      log.info("\n{}", SEPARATOR);
      log.info("🚀 [CONV:{}] NEW AI CONVERSATION", conversationId);
      log.info("{}", SEPARATOR);
      log.info("📋 Conversation ID: {}", conversationId);
      log.info("👤 User ID: {}", userId);
      log.info("🏷️ Type: {}", conversationType);
      log.info("⏰ Started: {}", startTime);
      log.info("{}", SUB_SEPARATOR);
    }

    /** Log user input (text, voice, attachments) */
    public void logInput(String text, String voiceTranscription, List<AttachmentInfo> attachments) {
      messageCount++;
      log.info("\n📥 [CONV:{}] USER INPUT (Message #{})", conversationId, messageCount);
      log.info("{}", SUB_SEPARATOR);

      // Text input
      if (text != null && !text.isBlank()) {
        log.info("📝 Text Input:");
        log.info("   \"{}\"", text);
      } else {
        log.info("📝 Text Input: (none)");
      }

      // Voice transcription
      if (voiceTranscription != null && !voiceTranscription.isBlank()) {
        log.info("🎤 Voice Transcription:");
        log.info("   \"{}\"", voiceTranscription);
      }

      // Attachments
      if (attachments != null && !attachments.isEmpty()) {
        log.info("📎 Attachments ({}): ", attachments.size());
        for (int i = 0; i < attachments.size(); i++) {
          AttachmentInfo att = attachments.get(i);
          log.info(
              "   [{}] {} ({}, {})", i + 1, att.name(), att.type(), formatBytes(att.sizeBytes()));

          if (att.extractedText() != null && !att.extractedText().isBlank()) {
            String preview = truncate(att.extractedText(), 300);
            log.info("       Extracted Text: \"{}\"", preview);
          }
        }
      } else {
        log.info("📎 Attachments: (none)");
      }
      log.info("{}", SUB_SEPARATOR);
    }

    /** Log the complete user prompt being sent to AI */
    public void logUserPrompt(String userPrompt) {
      log.info("\n📤 [CONV:{}] PROMPT TO AI", conversationId);
      log.info("{}", SUB_SEPARATOR);
      log.info("User Message:\n{}", userPrompt);
      log.info("{}", SUB_SEPARATOR);
    }

    /** Log system prompt (truncated for readability) */
    public void logSystemPrompt(String systemPrompt, boolean showFull) {
      log.info("\n⚙️ [CONV:{}] SYSTEM PROMPT", conversationId);
      log.info("{}", SUB_SEPARATOR);

      if (showFull) {
        log.info("{}", systemPrompt);
      } else {
        log.info("Length: {} characters", systemPrompt.length());
        log.info("Preview (first 500 chars):\n{}", truncate(systemPrompt, 500));
      }
      log.info("{}", SUB_SEPARATOR);
    }

    /** Log AI provider info before making the call */
    public void logProviderInfo(ProviderInfo provider) {
      log.info("\n🤖 [CONV:{}] AI PROVIDER", conversationId);
      log.info("{}", SUB_SEPARATOR);
      log.info("Provider: {}", provider.name());
      log.info("Model: {}", provider.model());
      log.info("Version: {}", provider.version());
      log.info("{}", SUB_SEPARATOR);
    }

    /** Log the raw AI response */
    public void logAIResponse(String rawResponse, long durationMs) {
      log.info("\n📩 [CONV:{}] AI RESPONSE ({}ms)", conversationId, durationMs);
      log.info("{}", SUB_SEPARATOR);
      log.info("Response Length: {} characters", rawResponse != null ? rawResponse.length() : 0);
      log.info("Raw Response:\n{}", rawResponse);
      log.info("{}", SUB_SEPARATOR);
    }

    /** Log parsed/structured result from AI response */
    public void logParsedResult(String intentDetected, double confidence, String reasoning) {
      log.info("\n📊 [CONV:{}] PARSED RESULT", conversationId);
      log.info("{}", SUB_SEPARATOR);
      log.info("Intent Detected: {}", intentDetected);
      log.info("Confidence: {}%", Math.round(confidence * 100));
      log.info("Reasoning: {}", reasoning);
      log.info("{}", SUB_SEPARATOR);
    }

    /** Log OCR/Vision extraction request */
    public void logOCRRequest(String fileName, String mimeType, long sizeBytes) {
      log.info("\n🔍 [CONV:{}] OCR REQUEST", conversationId);
      log.info("{}", SUB_SEPARATOR);
      log.info("File: {}", fileName);
      log.info("MIME Type: {}", mimeType);
      log.info("Size: {}", formatBytes(sizeBytes));
      log.info("{}", SUB_SEPARATOR);
    }

    /** Log OCR/Vision extraction result */
    public void logOCRResponse(String extractedText, long durationMs) {
      log.info("\n🔍 [CONV:{}] OCR RESPONSE ({}ms)", conversationId, durationMs);
      log.info("{}", SUB_SEPARATOR);
      log.info(
          "Extracted Text Length: {} characters",
          extractedText != null ? extractedText.length() : 0);
      log.info("Extracted Text:\n{}", extractedText);
      log.info("{}", SUB_SEPARATOR);
    }

    /** Log an error during conversation */
    public void logError(String phase, String errorMessage, Throwable exception) {
      log.error("\n❌ [CONV:{}] ERROR in {}", conversationId, phase);
      log.error("{}", SUB_SEPARATOR);
      log.error("Message: {}", errorMessage);
      if (exception != null) {
        log.error(
            "Exception: {} - {}", exception.getClass().getSimpleName(), exception.getMessage());
      }
      log.error("{}", SUB_SEPARATOR);
    }

    /** Complete the conversation log */
    public void complete(String draftId, String draftType) {
      long totalDurationMs = Instant.now().toEpochMilli() - startTime.toEpochMilli();

      log.info("\n{}", SEPARATOR);
      log.info("✅ [CONV:{}] CONVERSATION COMPLETE", conversationId);
      log.info("{}", SEPARATOR);
      log.info("Draft ID: {}", draftId);
      log.info("Draft Type: {}", draftType);
      log.info("Total Messages: {}", messageCount);
      log.info("Total Duration: {}ms", totalDurationMs);
      log.info("{}\n", SEPARATOR);
    }

    /** Get the conversation ID for reference */
    public String getConversationId() {
      return conversationId;
    }

    // Helper methods
    private String truncate(String text, int maxLength) {
      if (text == null) return "(null)";
      if (text.length() <= maxLength) return text;
      return text.substring(0, maxLength) + "... (+" + (text.length() - maxLength) + " more chars)";
    }

    private String formatBytes(Long bytes) {
      if (bytes == null) return "unknown size";
      if (bytes < 1024) return bytes + " B";
      if (bytes < 1024 * 1024) return String.format("%.1f KB", bytes / 1024.0);
      return String.format("%.1f MB", bytes / (1024.0 * 1024.0));
    }
  }
}
