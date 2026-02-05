package app.kaiz.command_center.application;

import app.kaiz.admin.domain.SystemPrompt;
import app.kaiz.admin.repository.SystemPromptRepository;
import java.time.LocalDate;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

/**
 * Service to fetch system prompts from the database. Falls back to hardcoded prompts if database
 * prompts are not available.
 */
@Service
public class SystemPromptService {

  private static final Logger log = LoggerFactory.getLogger(SystemPromptService.class);

  // Prompt keys
  public static final String SMART_INPUT_MAIN = "smart_input_main";
  public static final String IMAGE_ANALYSIS_MAIN = "image_analysis_main";
  public static final String VOICE_TRANSCRIPTION_MAIN = "voice_transcription_main";
  public static final String CLARIFICATION_MAIN = "clarification_main";

  private final SystemPromptRepository systemPromptRepository;

  public SystemPromptService(SystemPromptRepository systemPromptRepository) {
    this.systemPromptRepository = systemPromptRepository;
  }

  /**
   * Get the appropriate prompt based on input type.
   *
   * @param hasImage whether the input contains an image
   * @param hasVoice whether the input contains voice/audio
   * @return the system prompt content with date variables replaced
   */
  public String getPromptForInputType(boolean hasImage, boolean hasVoice) {
    String promptKey;
    String fallbackDescription;

    if (hasImage) {
      promptKey = IMAGE_ANALYSIS_MAIN;
      fallbackDescription = "image analysis";
    } else if (hasVoice) {
      promptKey = VOICE_TRANSCRIPTION_MAIN;
      fallbackDescription = "voice transcription";
    } else {
      promptKey = SMART_INPUT_MAIN;
      fallbackDescription = "smart input";
    }

    return getPromptByKey(promptKey, fallbackDescription);
  }

  /**
   * Get a specific prompt by key.
   *
   * @param promptKey the prompt key
   * @param fallbackDescription description for logging if fallback is used
   * @return the prompt content with date variables replaced
   */
  public String getPromptByKey(String promptKey, String fallbackDescription) {
    try {
      Optional<SystemPrompt> promptOpt = systemPromptRepository.findByPromptKey(promptKey);

      if (promptOpt.isPresent() && promptOpt.get().isActive()) {
        String content = promptOpt.get().getPromptContent();
        log.info(
            "✅ Using DATABASE prompt: {} (version {}, length={})", 
            promptKey, 
            promptOpt.get().getVersion(),
            content.length());
        return replaceDateVariables(content);
      } else {
        log.warn(
            "⚠️ Prompt '{}' not found or inactive in database, using HARDCODED fallback for {}",
            promptKey,
            fallbackDescription);
        return getFallbackPrompt(promptKey);
      }
    } catch (Exception e) {
      log.error("❌ Error fetching prompt '{}' from database: {}", promptKey, e.getMessage());
      return getFallbackPrompt(promptKey);
    }
  }

  /**
   * Get the clarification prompt.
   *
   * @return the clarification prompt content
   */
  public String getClarificationPrompt() {
    return getPromptByKey(CLARIFICATION_MAIN, "clarification");
  }

  /**
   * Replace date variables in the prompt content.
   *
   * @param content the prompt content
   * @return content with date variables replaced
   */
  private String replaceDateVariables(String content) {
    if (content == null) return "";

    String tomorrowDate = LocalDate.now().plusDays(1).toString();
    String todayDate = LocalDate.now().toString();
    String currentYear = String.valueOf(LocalDate.now().getYear());

    return content
        .replace("{{TOMORROW_DATE}}", tomorrowDate)
        .replace("{{TODAY_DATE}}", todayDate)
        .replace("{{CURRENT_YEAR}}", currentYear);
  }

  /**
   * Get fallback hardcoded prompt if database is unavailable.
   *
   * @param promptKey the prompt key
   * @return hardcoded prompt content
   */
  private String getFallbackPrompt(String promptKey) {
    String tomorrowDate = LocalDate.now().plusDays(1).toString();

    // Minimal fallback prompts - database prompts should be preferred
    return switch (promptKey) {
      case SMART_INPUT_MAIN -> getFallbackSmartInputPrompt(tomorrowDate);
      case IMAGE_ANALYSIS_MAIN -> getFallbackImageAnalysisPrompt();
      case VOICE_TRANSCRIPTION_MAIN -> getFallbackVoicePrompt();
      case CLARIFICATION_MAIN -> getFallbackClarificationPrompt();
      default -> getFallbackSmartInputPrompt(tomorrowDate);
    };
  }

  private String getFallbackSmartInputPrompt(String tomorrowDate) {
    return """
        You are Kaiz AI, a productivity assistant. Transform user inputs into structured entities.

        CRITICAL RULES:
        1. For greetings like "hi", "hello" → Return status="NEEDS_CLARIFICATION" and ask what to create
        2. NEVER create NOTE for vague inputs
        3. Always output valid JSON

        ENTITY TYPES: TASK, EVENT, CHALLENGE, EPIC, BILL (avoid NOTE)

        LIFE WHEEL AREAS: lw-1 (Health), lw-2 (Career), lw-3 (Finance), lw-4 (Growth),
                          lw-5 (Relationships), lw-6 (Social), lw-7 (Fun), lw-8 (Home)

        JSON FORMAT:
        {
          "status": "READY | NEEDS_CLARIFICATION",
          "intentDetected": "task | event | challenge | epic | bill",
          "confidenceScore": 0.0-1.0,
          "draft": { "title": "...", "lifeWheelAreaId": "lw-X", ... },
          "reasoning": "...",
          "clarificationFlow": null | { "questions": [...] }
        }

        Tomorrow's date: %s
        """
        .formatted(tomorrowDate);
  }

  private String getFallbackImageAnalysisPrompt() {
    return """
        You are Kaiz AI analyzing an image.

        RULES:
        1. Calendar screenshots → Create EVENT with date, startTime, endTime
        2. Receipts/Bills → Create BILL with amount, vendor, dueDate
        3. Always include lifeWheelAreaId

        JSON FORMAT:
        {
          "status": "READY",
          "intentDetected": "event | bill | task",
          "confidenceScore": 0.0-1.0,
          "draft": { ... },
          "reasoning": "What I detected in the image"
        }
        """;
  }

  private String getFallbackVoicePrompt() {
    return """
        You are Kaiz AI processing voice input.

        RULES:
        1. Extract core intent, ignore filler words
        2. "Remind me to..." → TASK
        3. "Schedule a..." → EVENT
        4. Never create NOTE for voice input

        JSON FORMAT:
        {
          "status": "READY | NEEDS_CLARIFICATION",
          "intentDetected": "task | event | challenge | bill",
          "confidenceScore": 0.0-1.0,
          "draft": { ... },
          "reasoning": "..."
        }
        """;
  }

  private String getFallbackClarificationPrompt() {
    return """
        Generate clarifying questions for ambiguous input.

        Question types: SINGLE_CHOICE, YES_NO, DATE_PICKER, TIME_PICKER, NUMBER_INPUT
        Maximum 5 questions. Keep them short and clear.
        """;
  }
}
