package app.kaiz.command_center.application;

import app.kaiz.command_center.domain.Draft;
import app.kaiz.command_center.domain.DraftType;
import com.fasterxml.jackson.databind.JsonNode;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * Parses structured draft blocks from LLM output. Supports two extraction strategies:
 *
 * <ol>
 *   <li><strong>Fenced blocks</strong>: {@code >>>DRAFT ... <<<DRAFT} delimiters
 *   <li><strong>JSON fallback</strong>: raw JSON objects with {@code "type"} field
 * </ol>
 *
 * <p>Delegates actual JSON → Draft conversion to the shared {@link AIResponseParser}.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DraftExtractor {

  private static final Pattern DRAFT_BLOCK_PATTERN =
      Pattern.compile(">>>DRAFT\\s*\\n(.*?)<<<DRAFT", Pattern.DOTALL);

  private static final Pattern JSON_OBJECT_PATTERN =
      Pattern.compile("\\{[^{}]*\"type\"\\s*:\\s*\"\\w+\"[^{}]*}", Pattern.DOTALL);

  private final AIResponseParser aiResponseParser;

  /**
   * Result of draft extraction: contains drafts and the conversational text (non-draft portion).
   */
  public record ExtractionResult(List<ExtractedDraft> drafts, String conversationalText) {

    public boolean hasDrafts() {
      return drafts != null && !drafts.isEmpty();
    }
  }

  /** A single extracted draft with its type and parsed content. */
  public record ExtractedDraft(DraftType type, Draft draft, double confidence, String reasoning) {}

  /**
   * Extract drafts from an LLM response string.
   *
   * @param llmOutput the raw LLM response
   * @return extraction result with drafts and conversational text
   */
  public ExtractionResult extract(String llmOutput) {
    if (llmOutput == null || llmOutput.isBlank()) {
      log.debug("Empty LLM output, no drafts to extract");
      return new ExtractionResult(List.of(), "");
    }

    // Strategy 1: fenced >>>DRAFT ... <<<DRAFT blocks
    List<ExtractedDraft> drafts = extractFencedBlocks(llmOutput);
    String conversationalText = removeFencedBlocks(llmOutput);

    // Strategy 2: fallback to JSON object detection
    if (drafts.isEmpty()) {
      drafts = extractJsonObjects(llmOutput);
      if (!drafts.isEmpty()) {
        conversationalText = removeJsonObjects(llmOutput);
      }
    }

    log.info(
        "Draft extraction: found {} drafts from {} chars of LLM output",
        drafts.size(),
        llmOutput.length());
    return new ExtractionResult(drafts, conversationalText.trim());
  }

  // ── Fenced block extraction ──

  private List<ExtractedDraft> extractFencedBlocks(String output) {
    List<ExtractedDraft> drafts = new ArrayList<>();
    Matcher matcher = DRAFT_BLOCK_PATTERN.matcher(output);

    while (matcher.find()) {
      String blockContent = matcher.group(1).trim();
      try {
        ExtractedDraft draft = parseDraftBlock(blockContent);
        if (draft != null) {
          drafts.add(draft);
        }
      } catch (Exception e) {
        log.warn("Failed to parse fenced draft block: {}", e.getMessage());
      }
    }
    return drafts;
  }

  private String removeFencedBlocks(String output) {
    return DRAFT_BLOCK_PATTERN.matcher(output).replaceAll("").trim();
  }

  // ── JSON object extraction ──

  private List<ExtractedDraft> extractJsonObjects(String output) {
    List<ExtractedDraft> drafts = new ArrayList<>();

    // Look for JSON that contains a "type" field
    String cleaned = aiResponseParser.cleanJsonResponse(output);
    try {
      JsonNode root = aiResponseParser.parseJson(cleaned);
      if (root != null) {
        ExtractedDraft draft = parseDraftFromJson(root);
        if (draft != null) {
          drafts.add(draft);
        }
      }
    } catch (Exception e) {
      log.debug("No valid JSON in LLM output: {}", e.getMessage());
    }
    return drafts;
  }

  private String removeJsonObjects(String output) {
    return JSON_OBJECT_PATTERN.matcher(output).replaceAll("").trim();
  }

  // ── Parsing helpers ──

  private ExtractedDraft parseDraftBlock(String blockContent) {
    try {
      // Clean and parse JSON
      String cleanedJson = aiResponseParser.cleanJsonResponse(blockContent);
      JsonNode node = aiResponseParser.parseJson(cleanedJson);
      if (node == null) {
        return null;
      }
      return parseDraftFromJson(node);
    } catch (Exception e) {
      log.warn("Failed to parse draft block content: {}", e.getMessage());
      return null;
    }
  }

  private ExtractedDraft parseDraftFromJson(JsonNode node) {
    // Extract type
    String typeName = node.has("type") ? node.get("type").asText() : null;
    if (typeName == null || typeName.isBlank()) {
      log.debug("Draft JSON missing 'type' field");
      return null;
    }

    // Extract confidence and reasoning (optional)
    double confidence = node.has("confidence") ? node.get("confidence").asDouble(0.7) : 0.7;
    String reasoning = node.has("reasoning") ? node.get("reasoning").asText("") : "";

    // Parse the draft via shared parser
    try {
      Draft draft = aiResponseParser.parseDraftByTypeName(typeName, node);
      if (draft == null) {
        log.warn("AIResponseParser returned null for draft type: {}", typeName);
        return null;
      }
      DraftType draftType = draft.type();
      return new ExtractedDraft(draftType, draft, confidence, reasoning);
    } catch (Exception e) {
      log.warn("Failed to parse draft of type '{}': {}", typeName, e.getMessage());
      return null;
    }
  }
}
