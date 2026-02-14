package app.kaiz.command_center.application;

import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.stereotype.Component;

/**
 * Composes a layered prompt for the AI call:
 *
 * <ol>
 *   <li><strong>Base persona</strong> — loaded from DB via {@link SystemPromptService}
 *   <li><strong>Mode-specific instructions</strong> — per chat mode (STANDUP, PLANNING, etc.)
 *   <li><strong>User context</strong> — injected from {@link ContextAssembler}
 *   <li><strong>User message</strong> — the raw input
 * </ol>
 *
 * Supports {@code {{variable}}} placeholder substitution in prompt templates.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class PromptAssembler {

  // Prompt keys (match DB system_prompts.prompt_key)
  public static final String KEY_BASE_PERSONA = "scrum_master_persona";
  public static final String KEY_CAPTURE = "scrum_master_capture";
  public static final String KEY_PLANNING = "scrum_master_planning";
  public static final String KEY_STANDUP = "scrum_master_standup";
  public static final String KEY_RETRO = "scrum_master_retro";
  public static final String KEY_REVIEW = "scrum_master_review";
  public static final String KEY_REFINEMENT = "scrum_master_refinement";
  public static final String KEY_FREEFORM = "scrum_master_freeform";

  private final SystemPromptService systemPromptService;

  /**
   * Assemble the system message combining persona + mode instructions + context.
   *
   * @param mode the detected chat mode
   * @param context context key-value pairs from {@link ContextAssembler}
   * @return a Spring AI SystemMessage
   */
  public Message assembleSystemMessage(String mode, Map<String, String> context) {
    // 1. Base persona
    String persona =
        systemPromptService.getPromptByKey(KEY_BASE_PERSONA, "Scrum Master AI persona");

    // 2. Mode-specific instructions
    String modeKey = getModePromptKey(mode);
    String modeInstructions =
        systemPromptService.getPromptByKey(modeKey, mode + " mode instructions");

    // 3. Compose layered prompt
    StringBuilder systemPrompt = new StringBuilder();
    systemPrompt.append(persona).append("\n\n");
    systemPrompt.append("--- MODE: ").append(mode).append(" ---\n");
    systemPrompt.append(modeInstructions).append("\n\n");

    // 4. Inject context variables
    if (context != null && !context.isEmpty()) {
      systemPrompt.append("--- CONTEXT ---\n");
      for (var entry : context.entrySet()) {
        systemPrompt.append(entry.getKey()).append(": ").append(entry.getValue()).append("\n");
      }
      systemPrompt.append("--- END CONTEXT ---\n");
    }

    // 5. Replace any remaining {{placeholders}}
    String finalPrompt = replacePlaceholders(systemPrompt.toString(), context);

    log.debug("Assembled system prompt: mode={}, length={}", mode, finalPrompt.length());
    return new SystemMessage(finalPrompt);
  }

  /**
   * Assemble the user message (raw input, optionally with attachments context).
   *
   * @param input the user's raw text
   * @param attachmentInfo optional attachment description (may be null)
   * @return a Spring AI UserMessage
   */
  public Message assembleUserMessage(String input, String attachmentInfo) {
    StringBuilder userMsg = new StringBuilder();

    if (attachmentInfo != null && !attachmentInfo.isBlank()) {
      userMsg.append("[Attachments: ").append(attachmentInfo).append("]\n\n");
    }

    userMsg.append(input);
    return new UserMessage(userMsg.toString());
  }

  // ── Helpers ──

  private String getModePromptKey(String mode) {
    return switch (mode) {
      case "CAPTURE" -> KEY_CAPTURE;
      case "PLANNING" -> KEY_PLANNING;
      case "STANDUP" -> KEY_STANDUP;
      case "RETROSPECTIVE" -> KEY_RETRO;
      case "REVIEW" -> KEY_REVIEW;
      case "REFINEMENT" -> KEY_REFINEMENT;
      default -> KEY_FREEFORM;
    };
  }

  private String replacePlaceholders(String template, Map<String, String> context) {
    if (context == null || template == null) {
      return template;
    }
    String result = template;
    for (var entry : context.entrySet()) {
      String placeholder = "{{" + entry.getKey() + "}}";
      if (result.contains(placeholder)) {
        result = result.replace(placeholder, entry.getValue());
      }
    }
    return result;
  }
}
