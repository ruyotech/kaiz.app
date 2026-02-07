package app.kaiz.command_center.application;

import app.kaiz.command_center.application.dto.ClarificationAnswersRequest;
import app.kaiz.command_center.application.dto.SmartInputResponse.ClarificationFlowDTO;
import app.kaiz.command_center.application.dto.SmartInputResponse.ImageAnalysisDTO;
import app.kaiz.command_center.domain.*;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * Stateless parser: raw AI JSON string → typed domain objects. Handles draft parsing, clarification
 * flow parsing, image analysis parsing, and answer merging.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class SmartInputResponseParser {

  private static final int MAX_QUESTIONS = 5;
  private final ObjectMapper objectMapper;

  // =========================================================================
  // Top-level parsing
  // =========================================================================

  /** Parse the full AI response JSON into its components. */
  public ParsedAIResponse parseAIResponse(String aiContent) throws JsonProcessingException {
    String cleaned = cleanJsonResponse(aiContent);
    log.debug("Cleaned AI response: {}", cleaned);

    JsonNode root = objectMapper.readTree(cleaned);

    String status = root.path("status").asText("READY");
    String intentType =
        root.has("intentDetected")
            ? root.path("intentDetected").asText("TASK").toUpperCase()
            : root.path("intentType").asText("TASK").toUpperCase();
    double confidence =
        root.has("confidenceScore")
            ? root.path("confidenceScore").asDouble(0.8)
            : root.path("confidence").asDouble(0.8);
    String reasoning = root.path("reasoning").asText("");

    DraftType draftType = DraftType.valueOf(intentType);
    Draft draft = parseDraft(root.path("draft"), draftType);

    List<String> suggestions = new ArrayList<>();
    root.path("suggestions").forEach(s -> suggestions.add(s.asText()));

    // Parse optional sections
    JsonNode clarificationNode =
        root.has("clarificationFlow") ? root.path("clarificationFlow") : root.path("clarification");
    AIInterpretation.ClarificationFlow clarificationFlow =
        clarificationNode.isMissingNode() ? null : parseClarificationFlow(clarificationNode);
    ClarificationFlowDTO clarificationFlowDTO =
        clarificationFlow != null ? ClarificationFlowDTO.from(clarificationFlow) : null;

    ImageAnalysisDTO imageAnalysis = parseImageAnalysis(root.path("imageAnalysis"));

    String alternativeReason = root.path("alternativeReason").asText(null);

    return new ParsedAIResponse(
        status,
        draftType,
        confidence,
        reasoning,
        draft,
        suggestions,
        clarificationFlow,
        clarificationFlowDTO,
        imageAnalysis,
        alternativeReason);
  }

  // =========================================================================
  // Draft parsing
  // =========================================================================

  public Draft parseDraft(JsonNode draftNode, DraftType type) {
    return switch (type) {
      case TASK ->
          new Draft.TaskDraft(
              draftNode.path("title").asText(""),
              draftNode.path("description").asText(""),
              draftNode.path("lifeWheelAreaId").asText("lw-4"),
              draftNode.path("eisenhowerQuadrantId").asText("eq-2"),
              draftNode.path("storyPoints").asInt(3),
              draftNode.path("suggestedEpicId").asText(null),
              draftNode.path("suggestedSprintId").asText(null),
              parseDate(draftNode.path("dueDate").asText(null)),
              draftNode.path("isRecurring").asBoolean(false),
              parseRecurrencePattern(draftNode.path("recurrencePattern")));

      case EPIC ->
          new Draft.EpicDraft(
              draftNode.path("title").asText(""),
              draftNode.path("description").asText(""),
              draftNode.path("lifeWheelAreaId").asText("lw-4"),
              List.of(),
              draftNode.path("color").asText("#3B82F6"),
              draftNode.path("icon").asText(null),
              parseDate(draftNode.path("startDate").asText(null)),
              parseDate(draftNode.path("endDate").asText(null)));

      case CHALLENGE ->
          new Draft.ChallengeDraft(
              draftNode.path("name").asText(""),
              draftNode.path("description").asText(""),
              draftNode.path("lifeWheelAreaId").asText("lw-4"),
              draftNode.path("metricType").asText("yesno"),
              draftNode.path("targetValue").decimalValue(),
              draftNode.path("unit").asText(null),
              draftNode.path("duration").asInt(30),
              draftNode.path("recurrence").asText("daily"),
              draftNode.path("whyStatement").asText(null),
              draftNode.path("rewardDescription").asText(null),
              draftNode.path("graceDays").asInt(2),
              parseTime(draftNode.path("reminderTime").asText(null)));

      case EVENT ->
          new Draft.EventDraft(
              draftNode.path("title").asText(""),
              draftNode.path("description").asText(""),
              draftNode.path("lifeWheelAreaId").asText("lw-4"),
              parseDate(draftNode.path("date").asText(null)),
              parseTime(draftNode.path("startTime").asText(null)),
              parseTime(draftNode.path("endTime").asText(null)),
              draftNode.path("location").asText(null),
              draftNode.path("isAllDay").asBoolean(false),
              draftNode.path("recurrence").asText(null),
              parseAttendees(draftNode.path("attendees")));

      case BILL ->
          new Draft.BillDraft(
              draftNode.path("vendorName").asText(""),
              draftNode.path("amount").decimalValue(),
              draftNode.path("currency").asText("USD"),
              parseDate(draftNode.path("dueDate").asText(null)),
              draftNode.path("category").asText(null),
              draftNode.path("lifeWheelAreaId").asText("lw-3"),
              draftNode.path("isRecurring").asBoolean(false),
              draftNode.path("recurrence").asText(null),
              draftNode.path("notes").asText(null));

      case NOTE ->
          new Draft.NoteDraft(
              draftNode.path("title").asText("Quick Note"),
              draftNode.path("content").asText(""),
              draftNode.path("lifeWheelAreaId").asText("lw-4"),
              parseLabels(draftNode.path("tags")),
              parseLabels(draftNode.path("clarifyingQuestions")));

      case CLARIFICATION_NEEDED ->
          new Draft.NoteDraft(
              "Clarification Needed",
              draftNode.path("content").asText(""),
              "lw-4",
              List.of(),
              List.of());
    };
  }

  // =========================================================================
  // Clarification flow
  // =========================================================================

  public AIInterpretation.ClarificationFlow parseClarificationFlow(JsonNode flowNode) {
    List<ClarificationQuestion> questions = new ArrayList<>();
    flowNode
        .path("questions")
        .forEach(
            q -> {
              List<ClarificationQuestion.QuestionOption> options = new ArrayList<>();
              q.path("options")
                  .forEach(
                      o ->
                          options.add(
                              new ClarificationQuestion.QuestionOption(
                                  o.path("value").asText(),
                                  o.path("label").asText(),
                                  o.path("icon").asText(null),
                                  o.path("description").asText(null))));

              questions.add(
                  new ClarificationQuestion(
                      q.path("id").asText(),
                      q.path("question").asText(),
                      ClarificationQuestion.QuestionType.valueOf(
                          q.path("type").asText("SINGLE_CHOICE")),
                      options,
                      q.path("fieldToPopulate").asText(),
                      q.path("required").asBoolean(true),
                      q.path("defaultValue").asText(null)));
            });

    return new AIInterpretation.ClarificationFlow(
        UUID.randomUUID().toString(),
        flowNode.path("title").asText("Quick Questions"),
        flowNode.path("description").asText("Help us understand your request better"),
        questions,
        0,
        MAX_QUESTIONS);
  }

  public AIInterpretation.ClarificationFlow createConfirmationFlow(
      DraftType suggestedType, String reason) {
    return new AIInterpretation.ClarificationFlow(
        UUID.randomUUID().toString(),
        "Quick Suggestion",
        reason,
        List.of(
            new ClarificationQuestion(
                "confirm",
                "Would you like to create a " + suggestedType.name().toLowerCase() + " instead?",
                ClarificationQuestion.QuestionType.YES_NO,
                List.of(
                    ClarificationQuestion.QuestionOption.of("yes", "Yes, sounds good!", "👍"),
                    ClarificationQuestion.QuestionOption.of(
                        "no", "No, keep my original idea", "↩️")),
                "confirmation",
                true,
                null)),
        0,
        1);
  }

  public AIInterpretation.ClarificationFlow generateFollowUpQuestions(
      Draft draft, List<String> missingFields, int currentCount) {
    List<ClarificationQuestion> questions = new ArrayList<>();
    int remaining = MAX_QUESTIONS - currentCount;

    for (int i = 0; i < Math.min(missingFields.size(), remaining); i++) {
      String field = missingFields.get(i);
      questions.add(ClarificationQuestion.forField(field));
    }

    return new AIInterpretation.ClarificationFlow(
        UUID.randomUUID().toString(),
        "Almost there!",
        "Just " + questions.size() + " more question" + (questions.size() > 1 ? "s" : ""),
        questions,
        0,
        MAX_QUESTIONS);
  }

  // =========================================================================
  // Draft validation & answer merging
  // =========================================================================

  public List<String> findMissingCriticalFields(Draft draft) {
    List<String> missing = new ArrayList<>();

    switch (draft) {
      case Draft.TaskDraft t -> {
        if (t.title() == null || t.title().isBlank()) missing.add("title");
        if (t.lifeWheelAreaId() == null) missing.add("lifeWheelAreaId");
      }
      case Draft.ChallengeDraft c -> {
        if (c.name() == null || c.name().isBlank()) missing.add("name");
        if (c.lifeWheelAreaId() == null) missing.add("lifeWheelAreaId");
        if (c.duration() <= 0) missing.add("duration");
      }
      case Draft.EventDraft e -> {
        if (e.title() == null || e.title().isBlank()) missing.add("title");
        if (e.date() == null) missing.add("date");
      }
      case Draft.BillDraft b -> {
        if (b.vendorName() == null || b.vendorName().isBlank()) missing.add("vendorName");
        if (b.dueDate() == null) missing.add("dueDate");
      }
      default -> {
        // EpicDraft and NoteDraft have fewer required fields
      }
    }

    return missing;
  }

  public Draft applyAnswersToDraft(Draft draft, List<ClarificationAnswersRequest.Answer> answers) {
    Map<String, String> updates = new HashMap<>();
    for (var answer : answers) {
      updates.put(answer.questionId(), answer.value());
    }

    return switch (draft) {
      case Draft.TaskDraft t ->
          new Draft.TaskDraft(
              updates.getOrDefault("title", t.title()),
              updates.getOrDefault("description", t.description()),
              updates.getOrDefault("lifeWheelAreaId", t.lifeWheelAreaId()),
              updates.getOrDefault("eisenhowerQuadrantId", t.eisenhowerQuadrantId()),
              updates.containsKey("storyPoints")
                  ? Integer.parseInt(updates.get("storyPoints"))
                  : t.storyPoints(),
              updates.getOrDefault("suggestedEpicId", t.suggestedEpicId()),
              updates.getOrDefault("suggestedSprintId", t.suggestedSprintId()),
              updates.containsKey("dueDate") ? parseDate(updates.get("dueDate")) : t.dueDate(),
              t.isRecurring(),
              t.recurrencePattern());

      case Draft.ChallengeDraft c ->
          new Draft.ChallengeDraft(
              updates.getOrDefault("name", c.name()),
              updates.getOrDefault("description", c.description()),
              updates.getOrDefault("lifeWheelAreaId", c.lifeWheelAreaId()),
              updates.getOrDefault("metricType", c.metricType()),
              c.targetValue(),
              c.unit(),
              updates.containsKey("duration")
                  ? Integer.parseInt(updates.get("duration"))
                  : c.duration(),
              updates.getOrDefault("recurrence", c.recurrence()),
              updates.getOrDefault("whyStatement", c.whyStatement()),
              updates.getOrDefault("rewardDescription", c.rewardDescription()),
              c.graceDays(),
              c.reminderTime());

      case Draft.EventDraft e ->
          new Draft.EventDraft(
              updates.getOrDefault("title", e.title()),
              updates.getOrDefault("description", e.description()),
              updates.getOrDefault("lifeWheelAreaId", e.lifeWheelAreaId()),
              updates.containsKey("date") ? parseDate(updates.get("date")) : e.date(),
              updates.containsKey("startTime")
                  ? parseTime(updates.get("startTime"))
                  : e.startTime(),
              updates.containsKey("endTime") ? parseTime(updates.get("endTime")) : e.endTime(),
              updates.getOrDefault("location", e.location()),
              e.isAllDay(),
              updates.getOrDefault("recurrence", e.recurrence()),
              e.attendees());

      case Draft.BillDraft b ->
          new Draft.BillDraft(
              updates.getOrDefault("vendorName", b.vendorName()),
              b.amount(),
              b.currency(),
              updates.containsKey("dueDate") ? parseDate(updates.get("dueDate")) : b.dueDate(),
              updates.getOrDefault("category", b.category()),
              updates.getOrDefault("lifeWheelAreaId", b.lifeWheelAreaId()),
              b.isRecurring(),
              updates.getOrDefault("recurrence", b.recurrence()),
              updates.getOrDefault("notes", b.notes()));

      default -> draft;
    };
  }

  // =========================================================================
  // Image analysis parsing
  // =========================================================================

  public ImageAnalysisDTO parseImageAnalysis(JsonNode imageNode) {
    if (imageNode.isMissingNode()) return null;

    JsonNode dataNode = imageNode.path("extractedData");
    ImageAnalysisDTO.ExtractedDataDTO extractedData =
        new ImageAnalysisDTO.ExtractedDataDTO(
            dataNode.path("eventTitle").asText(null),
            dataNode.path("eventDate").asText(null),
            dataNode.path("eventTime").asText(null),
            dataNode.path("eventLocation").asText(null),
            parseStringList(dataNode.path("attendees")),
            dataNode.path("vendorName").asText(null),
            dataNode.path("amount").asText(null),
            dataNode.path("currency").asText(null),
            dataNode.path("dueDate").asText(null),
            dataNode.path("occasionType").asText(null),
            dataNode.path("personName").asText(null),
            dataNode.path("rawText").asText(null));

    return new ImageAnalysisDTO(
        imageNode.path("detectedType").asText("UNKNOWN"),
        imageNode.path("extractedText").asText(null),
        extractedData,
        imageNode.path("confidence").asDouble(0.8));
  }

  // =========================================================================
  // Parsing helpers
  // =========================================================================

  LocalDate parseDate(String value) {
    if (value == null || value.isBlank()) return null;
    try {
      return LocalDate.parse(value);
    } catch (Exception e) {
      return null;
    }
  }

  LocalTime parseTime(String value) {
    if (value == null || value.isBlank()) return null;
    try {
      return LocalTime.parse(value);
    } catch (Exception e) {
      return null;
    }
  }

  private Draft.RecurrencePattern parseRecurrencePattern(JsonNode node) {
    if (node == null || node.isMissingNode()) return null;
    return new Draft.RecurrencePattern(
        node.path("frequency").asText("daily"),
        node.path("interval").asInt(1),
        parseDate(node.path("endDate").asText(null)));
  }

  private List<String> parseLabels(JsonNode node) {
    List<String> labels = new ArrayList<>();
    if (node != null && node.isArray()) {
      node.forEach(n -> labels.add(n.asText()));
    }
    return labels;
  }

  private List<String> parseAttendees(JsonNode node) {
    return parseLabels(node);
  }

  private List<String> parseStringList(JsonNode node) {
    return parseLabels(node);
  }

  /** Clean JSON response by removing markdown code blocks and extracting JSON. */
  String cleanJsonResponse(String response) {
    String cleaned = response.trim();

    if (cleaned.startsWith("```json")) {
      cleaned = cleaned.substring(7);
    } else if (cleaned.startsWith("```JSON")) {
      cleaned = cleaned.substring(7);
    } else if (cleaned.startsWith("```")) {
      cleaned = cleaned.substring(3);
    }

    if (cleaned.endsWith("```")) {
      cleaned = cleaned.substring(0, cleaned.length() - 3);
    }

    cleaned = cleaned.trim();

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

  // =========================================================================
  // Parsed response record
  // =========================================================================

  /** Structured result of parsing an AI response. */
  public record ParsedAIResponse(
      String status,
      DraftType draftType,
      double confidence,
      String reasoning,
      Draft draft,
      List<String> suggestions,
      AIInterpretation.ClarificationFlow clarificationFlow,
      ClarificationFlowDTO clarificationFlowDTO,
      ImageAnalysisDTO imageAnalysis,
      String alternativeReason) {}
}
