package app.kaiz.command_center.application;

import app.kaiz.command_center.domain.Draft;
import app.kaiz.command_center.domain.DraftType;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * Shared utility for parsing AI JSON responses into domain objects. Eliminates duplication between
 * CommandCenterAIService and SmartInputAIService.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class AIResponseParser {

  private final ObjectMapper objectMapper;

  /**
   * Clean JSON response by removing markdown code blocks and extracting JSON object.
   *
   * @param response raw AI response text
   * @return cleaned JSON string
   */
  public String cleanJsonResponse(String response) {
    if (response == null || response.isBlank()) {
      return "{}";
    }

    String cleaned = response.trim();

    // Remove markdown code blocks - handle various formats
    if (cleaned.startsWith("```json") || cleaned.startsWith("```JSON")) {
      cleaned = cleaned.substring(7);
    } else if (cleaned.startsWith("```")) {
      cleaned = cleaned.substring(3);
    }

    if (cleaned.endsWith("```")) {
      cleaned = cleaned.substring(0, cleaned.length() - 3);
    }

    cleaned = cleaned.trim();

    // If the response doesn't start with { or [, try to extract JSON from the middle
    if (!cleaned.startsWith("{") && !cleaned.startsWith("[")) {
      int jsonStart = cleaned.indexOf("{");
      int jsonEnd = cleaned.lastIndexOf("}");
      if (jsonStart >= 0 && jsonEnd > jsonStart) {
        cleaned = cleaned.substring(jsonStart, jsonEnd + 1);
        log.debug("Extracted JSON from position {} to {}", jsonStart, jsonEnd);
      }
    }

    return cleaned.trim();
  }

  /**
   * Parse a JSON tree into a Draft based on intent/type string.
   *
   * @param type the intent type as lowercase string (task, epic, challenge, event, bill, note)
   * @param node the draft JSON node
   * @return parsed Draft
   */
  public Draft parseDraftByTypeName(String type, JsonNode node) {
    return switch (type.toLowerCase()) {
      case "task" -> parseTaskDraft(node);
      case "epic" -> parseEpicDraft(node);
      case "challenge" -> parseChallengeDraft(node);
      case "event" -> parseEventDraft(node);
      case "bill" -> parseBillDraft(node);
      default -> parseNoteDraft(node);
    };
  }

  /**
   * Parse a JSON tree into a Draft based on DraftType enum.
   *
   * @param node the draft JSON node
   * @param type the DraftType enum
   * @return parsed Draft
   */
  public Draft parseDraftByEnum(JsonNode node, DraftType type) {
    return switch (type) {
      case TASK -> parseTaskDraft(node);
      case EPIC -> parseEpicDraft(node);
      case CHALLENGE -> parseChallengeDraft(node);
      case EVENT -> parseEventDraft(node);
      case BILL -> parseBillDraft(node);
      case NOTE -> parseNoteDraft(node);
      case CLARIFICATION_NEEDED ->
          new Draft.NoteDraft(
              "Clarification Needed",
              node.path("content").asText(""),
              "lw-4",
              List.of(),
              List.of());
    };
  }

  public Draft.TaskDraft parseTaskDraft(JsonNode node) {
    return new Draft.TaskDraft(
        node.path("title").asText("Untitled Task"),
        node.path("description").asText(""),
        node.path("lifeWheelAreaId").asText("lw-4"),
        node.path("eisenhowerQuadrantId").asText("eq-2"),
        node.path("storyPoints").asInt(3),
        nullIfEmpty(node.path("suggestedEpicId").asText(null)),
        nullIfEmpty(node.path("suggestedSprintId").asText(null)),
        parseLocalDate(node.path("dueDate").asText(null)),
        node.path("isRecurring").asBoolean(false),
        parseRecurrencePattern(node.path("recurrencePattern")));
  }

  public Draft.EpicDraft parseEpicDraft(JsonNode node) {
    List<Draft.TaskDraft> suggestedTasks = new ArrayList<>();
    if (node.has("suggestedTasks") && node.get("suggestedTasks").isArray()) {
      for (JsonNode taskNode : node.get("suggestedTasks")) {
        suggestedTasks.add(parseTaskDraft(taskNode));
      }
    }

    return new Draft.EpicDraft(
        node.path("title").asText("Untitled Epic"),
        node.path("description").asText(""),
        node.path("lifeWheelAreaId").asText("lw-4"),
        suggestedTasks,
        node.path("color").asText("#3B82F6"),
        node.path("icon").asText(null),
        parseLocalDate(node.path("startDate").asText(null)),
        parseLocalDate(node.path("endDate").asText(null)));
  }

  public Draft.ChallengeDraft parseChallengeDraft(JsonNode node) {
    return new Draft.ChallengeDraft(
        node.path("name").asText("Untitled Challenge"),
        node.path("description").asText(""),
        node.path("lifeWheelAreaId").asText("lw-4"),
        node.path("metricType").asText("yesno"),
        parseDecimal(node.path("targetValue")),
        nullIfEmpty(node.path("unit").asText(null)),
        node.path("duration").asInt(30),
        node.path("recurrence").asText("daily"),
        nullIfEmpty(node.path("whyStatement").asText(null)),
        nullIfEmpty(node.path("rewardDescription").asText(null)),
        node.path("graceDays").asInt(2),
        parseLocalTime(node.path("reminderTime").asText(null)));
  }

  public Draft.EventDraft parseEventDraft(JsonNode node) {
    return new Draft.EventDraft(
        node.path("title").asText("Untitled Event"),
        node.path("description").asText(""),
        node.path("lifeWheelAreaId").asText("lw-4"),
        parseLocalDate(node.path("date").asText(null)),
        parseLocalTime(node.path("startTime").asText(null)),
        parseLocalTime(node.path("endTime").asText(null)),
        nullIfEmpty(node.path("location").asText(null)),
        node.path("isAllDay").asBoolean(false),
        node.path("recurrence").asText(null),
        parseStringList(node.path("attendees")));
  }

  public Draft.BillDraft parseBillDraft(JsonNode node) {
    return new Draft.BillDraft(
        node.path("vendorName").asText("Unknown Vendor"),
        parseDecimal(node.path("amount")),
        node.path("currency").asText("USD"),
        parseLocalDate(node.path("dueDate").asText(null)),
        nullIfEmpty(node.path("category").asText(null)),
        node.path("lifeWheelAreaId").asText("lw-3"),
        node.path("isRecurring").asBoolean(false),
        node.path("recurrence").asText(null),
        nullIfEmpty(node.path("notes").asText(null)));
  }

  public Draft.NoteDraft parseNoteDraft(JsonNode node) {
    return new Draft.NoteDraft(
        node.path("title").asText("Quick Note"),
        node.path("content").asText(""),
        node.path("lifeWheelAreaId").asText("lw-4"),
        parseStringList(node.path("tags")),
        parseStringList(node.path("clarifyingQuestions")));
  }

  public Draft.RecurrencePattern parseRecurrencePattern(JsonNode node) {
    if (node == null || node.isNull() || node.isMissingNode()) {
      return null;
    }
    return new Draft.RecurrencePattern(
        node.path("frequency").asText("daily"),
        node.path("interval").asInt(1),
        parseLocalDate(node.path("endDate").asText(null)));
  }

  // =========================================================================
  // Parsing helpers
  // =========================================================================

  public LocalDate parseLocalDate(String value) {
    if (value == null || value.isBlank() || "null".equals(value)) {
      return null;
    }
    try {
      return LocalDate.parse(value);
    } catch (Exception e) {
      log.debug("Failed to parse date: {}", value);
      return null;
    }
  }

  public LocalTime parseLocalTime(String value) {
    if (value == null || value.isBlank() || "null".equals(value)) {
      return null;
    }
    try {
      return LocalTime.parse(value);
    } catch (Exception e) {
      log.debug("Failed to parse time: {}", value);
      return null;
    }
  }

  public BigDecimal parseDecimal(JsonNode node) {
    if (node == null || node.isNull() || node.isMissingNode()) {
      return null;
    }
    try {
      return new BigDecimal(node.asText("0"));
    } catch (Exception e) {
      return null;
    }
  }

  public String nullIfEmpty(String value) {
    return (value == null || value.isBlank() || "null".equals(value)) ? null : value;
  }

  public List<String> parseStringList(JsonNode node) {
    List<String> result = new ArrayList<>();
    if (node != null && node.isArray()) {
      node.forEach(n -> result.add(n.asText()));
    }
    return result;
  }

  /**
   * Parse a JSON string into a JsonNode tree.
   *
   * @param json raw JSON string (will be cleaned first)
   * @return parsed JsonNode root
   */
  public JsonNode parseJson(String json) {
    try {
      return objectMapper.readTree(cleanJsonResponse(json));
    } catch (Exception e) {
      log.error("Failed to parse JSON: {}", e.getMessage());
      return objectMapper.createObjectNode();
    }
  }
}
