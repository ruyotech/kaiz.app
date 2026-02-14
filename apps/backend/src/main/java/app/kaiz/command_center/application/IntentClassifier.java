package app.kaiz.command_center.application;

import java.util.Map;
import java.util.regex.Pattern;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * Classifies user intent from raw input text using keyword/regex heuristics. This is a fast,
 * deterministic classification — NOT an LLM call. The LLM handles nuances; this provides routing
 * hints for prompt selection and context assembly.
 */
@Component
@Slf4j
public class IntentClassifier {

  /** Known intents ordered by specificity (most specific first). */
  public enum Intent {
    CREATE_TASK,
    CREATE_EPIC,
    CREATE_CHALLENGE,
    CREATE_EVENT,
    CREATE_BILL,
    CREATE_NOTE,
    UPDATE_TASK,
    COMPLETE_TASK,
    START_CEREMONY,
    END_CEREMONY,
    STANDUP_REPORT,
    SPRINT_STATUS,
    VELOCITY_CHECK,
    ASK_QUESTION,
    GENERAL_CHAT
  }

  // Patterns ordered by specificity
  private static final Map<Intent, Pattern> INTENT_PATTERNS =
      Map.ofEntries(
          Map.entry(
              Intent.CREATE_TASK,
              Pattern.compile(
                  "\\b(add|create|new|make)\\s+(a\\s+)?task\\b|\\btask:\\s|\\btodo:\\s",
                  Pattern.CASE_INSENSITIVE)),
          Map.entry(
              Intent.CREATE_EPIC,
              Pattern.compile(
                  "\\b(add|create|new|make)\\s+(a\\s+|an\\s+)?epic\\b|\\bepic:\\s",
                  Pattern.CASE_INSENSITIVE)),
          Map.entry(
              Intent.CREATE_CHALLENGE,
              Pattern.compile(
                  "\\b(add|create|new|start)\\s+(a\\s+)?challenge\\b|\\bchallenge:\\s",
                  Pattern.CASE_INSENSITIVE)),
          Map.entry(
              Intent.CREATE_EVENT,
              Pattern.compile(
                  "\\b(add|create|schedule|new)\\s+(a\\s+|an\\s+)?event\\b|\\bevent:\\s|\\bmeeting:\\s",
                  Pattern.CASE_INSENSITIVE)),
          Map.entry(
              Intent.CREATE_BILL,
              Pattern.compile(
                  "\\b(add|create|new|log)\\s+(a\\s+)?bill\\b|\\bbill:\\s|\\bexpense:\\s",
                  Pattern.CASE_INSENSITIVE)),
          Map.entry(
              Intent.CREATE_NOTE,
              Pattern.compile(
                  "\\b(add|create|write|new)\\s+(a\\s+)?note\\b|\\bnote:\\s|\\bjot\\b",
                  Pattern.CASE_INSENSITIVE)),
          Map.entry(
              Intent.UPDATE_TASK,
              Pattern.compile(
                  "\\b(update|edit|change|modify|move)\\s+(the\\s+)?task\\b",
                  Pattern.CASE_INSENSITIVE)),
          Map.entry(
              Intent.COMPLETE_TASK,
              Pattern.compile(
                  "\\b(complete|finish|done|close|check.?off)\\s+(the\\s+)?task\\b|\\bmark.*(done|complete)",
                  Pattern.CASE_INSENSITIVE)),
          Map.entry(
              Intent.START_CEREMONY,
              Pattern.compile(
                  "\\b(start|begin|kick.?off|open)\\s+(the\\s+)?(retro|planning|review|standup|refinement|ceremony)\\b",
                  Pattern.CASE_INSENSITIVE)),
          Map.entry(
              Intent.END_CEREMONY,
              Pattern.compile(
                  "\\b(end|finish|close|wrap.?up|complete)\\s+(the\\s+)?(retro|planning|review|standup|refinement|ceremony)\\b",
                  Pattern.CASE_INSENSITIVE)),
          Map.entry(
              Intent.STANDUP_REPORT,
              Pattern.compile(
                  "\\b(standup|stand.?up|daily|check.?in)\\b|\\byesterday.*today|\\bwhat.*(did|done)",
                  Pattern.CASE_INSENSITIVE)),
          Map.entry(
              Intent.SPRINT_STATUS,
              Pattern.compile(
                  "\\b(sprint|iteration)\\s+(status|progress|health|report)\\b|\\bhow.*sprint",
                  Pattern.CASE_INSENSITIVE)),
          Map.entry(
              Intent.VELOCITY_CHECK,
              Pattern.compile(
                  "\\b(velocity|burndown|throughput|capacity|story.?points?)\\b",
                  Pattern.CASE_INSENSITIVE)),
          Map.entry(
              Intent.ASK_QUESTION,
              Pattern.compile(
                  "\\b(what|how|why|when|where|should|can|could|would|is|are|do|does)\\b.*\\?",
                  Pattern.CASE_INSENSITIVE)));

  /**
   * Classify user input into an intent.
   *
   * @param input the raw user text
   * @param mode the detected chat mode (provides context)
   * @return the classified intent
   */
  public Intent classify(String input, String mode) {
    if (input == null || input.isBlank()) {
      log.debug("Empty input, defaulting to GENERAL_CHAT");
      return Intent.GENERAL_CHAT;
    }

    // Mode-specific bias: if we're in STANDUP mode, bias toward STANDUP_REPORT
    if ("STANDUP".equals(mode) && !isExplicitCreate(input)) {
      log.debug("Intent classified as STANDUP_REPORT (mode bias)");
      return Intent.STANDUP_REPORT;
    }

    // Scan patterns in order of specificity
    for (var entry : INTENT_PATTERNS.entrySet()) {
      if (entry.getValue().matcher(input).find()) {
        log.debug("Intent classified as {} via keyword match", entry.getKey());
        return entry.getKey();
      }
    }

    log.debug("No keyword match, defaulting to GENERAL_CHAT");
    return Intent.GENERAL_CHAT;
  }

  /** Check if the intent is a creation intent (any CREATE_* variant). */
  public boolean isCreationIntent(Intent intent) {
    return intent.name().startsWith("CREATE_");
  }

  /** Map a creation intent to a DraftType name (e.g., CREATE_TASK → "TASK"). */
  public String toDraftTypeName(Intent intent) {
    if (!isCreationIntent(intent)) {
      return null;
    }
    return intent.name().substring("CREATE_".length());
  }

  private boolean isExplicitCreate(String input) {
    return Pattern.compile(
            "\\b(add|create|new|make|schedule|log|write)\\b", Pattern.CASE_INSENSITIVE)
        .matcher(input)
        .find();
  }
}
