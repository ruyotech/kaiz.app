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
      return new ProviderInfo("Anthropic", "claude-sonnet-4-20250514", "1.0");
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

      log.info(
          "[CONV:{}] Started {} conversation for user {}",
          conversationId,
          conversationType,
          userId);
    }

    /** Log user input (text, voice, attachments) */
    public void logInput(String text, String voiceTranscription, List<AttachmentInfo> attachments) {
      messageCount++;
      log.debug(
          "[CONV:{}] User input #{}: text={} chars, voice={}, attachments={}",
          conversationId,
          messageCount,
          text != null ? text.length() : 0,
          voiceTranscription != null,
          attachments != null ? attachments.size() : 0);

      if (log.isTraceEnabled()) {
        if (text != null && !text.isBlank()) {
          log.trace("[CONV:{}] Text: \"{}\"", conversationId, text);
        }
        if (voiceTranscription != null) {
          log.trace("[CONV:{}] Voice: \"{}\"", conversationId, voiceTranscription);
        }
        if (attachments != null) {
          for (AttachmentInfo att : attachments) {
            log.trace(
                "[CONV:{}] Attachment: {} ({}, {})",
                conversationId,
                att.name(),
                att.type(),
                formatBytes(att.sizeBytes()));
          }
        }
      }
    }

    /** Log the complete user prompt being sent to AI */
    public void logUserPrompt(String userPrompt) {
      log.debug(
          "[CONV:{}] User prompt: {} chars",
          conversationId,
          userPrompt != null ? userPrompt.length() : 0);
      log.trace("[CONV:{}] Full prompt:\n{}", conversationId, userPrompt);
    }

    /** Log system prompt (truncated for readability) */
    public void logSystemPrompt(String systemPrompt, boolean showFull) {
      log.debug(
          "[CONV:{}] System prompt: {} chars",
          conversationId,
          systemPrompt != null ? systemPrompt.length() : 0);
      if (showFull) {
        log.trace("[CONV:{}] Full system prompt:\n{}", conversationId, systemPrompt);
      }
    }

    /** Log AI provider info before making the call */
    public void logProviderInfo(ProviderInfo provider) {
      log.debug("[CONV:{}] Provider: {} / {}", conversationId, provider.name(), provider.model());
    }

    /** Log the raw AI response */
    public void logAIResponse(String rawResponse, long durationMs) {
      log.info(
          "[CONV:{}] AI response received in {}ms ({} chars)",
          conversationId,
          durationMs,
          rawResponse != null ? rawResponse.length() : 0);
      log.trace("[CONV:{}] Raw response:\n{}", conversationId, rawResponse);
    }

    /** Log parsed/structured result from AI response */
    public void logParsedResult(String intentDetected, double confidence, String reasoning) {
      log.info(
          "[CONV:{}] Parsed: intent={}, confidence={}%",
          conversationId, intentDetected, Math.round(confidence * 100));
      log.debug("[CONV:{}] Reasoning: {}", conversationId, reasoning);
    }

    /** Log OCR/Vision extraction request */
    public void logOCRRequest(String fileName, String mimeType, long sizeBytes) {
      log.debug(
          "[CONV:{}] OCR request: {} ({}, {})",
          conversationId,
          fileName,
          mimeType,
          formatBytes(sizeBytes));
    }

    /** Log OCR/Vision extraction result */
    public void logOCRResponse(String extractedText, long durationMs) {
      log.info(
          "[CONV:{}] OCR completed in {}ms ({} chars)",
          conversationId,
          durationMs,
          extractedText != null ? extractedText.length() : 0);
      log.trace("[CONV:{}] OCR text:\n{}", conversationId, extractedText);
    }

    /** Log an error during conversation */
    public void logError(String phase, String errorMessage, Throwable exception) {
      log.error("[CONV:{}] Error in {}: {}", conversationId, phase, errorMessage);
      if (exception != null) {
        log.error(
            "[CONV:{}] Exception: {} - {}",
            conversationId,
            exception.getClass().getSimpleName(),
            exception.getMessage());
      }
    }

    /** Complete the conversation log */
    public void complete(String draftId, String draftType) {
      long totalDurationMs = Instant.now().toEpochMilli() - startTime.toEpochMilli();
      log.info(
          "[CONV:{}] Completed: type={}, draftId={}, messages={}, duration={}ms",
          conversationId,
          draftType,
          draftId,
          messageCount,
          totalDurationMs);
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
