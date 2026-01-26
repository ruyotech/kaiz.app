package app.kaiz.command_center.application;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import app.kaiz.command_center.api.dto.ClarificationAnswersRequest;
import app.kaiz.command_center.api.dto.SmartInputRequest;
import app.kaiz.command_center.api.dto.SmartInputResponse;
import app.kaiz.command_center.api.dto.SmartInputResponse.*;
import app.kaiz.command_center.domain.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.anthropic.AnthropicChatModel;
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.*;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Enhanced AI service with smart clarification flow.
 * Handles multi-turn conversations with a maximum of 3-5 questions.
 */
@Service
public class SmartInputAIService {

    private static final Logger log = LoggerFactory.getLogger(SmartInputAIService.class);
    private static final int MAX_QUESTIONS = 5;

    private final AnthropicChatModel chatModel;
    private final ObjectMapper objectMapper;
    private final String systemPrompt;
    private final Duration draftExpirationDuration;

    // In-memory session storage (use Redis in production)
    private final Map<UUID, ConversationSession> sessions = new ConcurrentHashMap<>();

    public SmartInputAIService(
            AnthropicChatModel chatModel,
            ObjectMapper objectMapper,
            @Value("${kaiz.command-center.draft-expiration-hours:24}") int expirationHours) {

        this.chatModel = chatModel;
        this.objectMapper = objectMapper;
        this.systemPrompt = CommandCenterSystemPrompt.SYSTEM_PROMPT;
        this.draftExpirationDuration = Duration.ofHours(expirationHours);
    }

    /**
     * Process new user input.
     */
    public SmartInputResponse processInput(UUID userId, SmartInputRequest request) {
        UUID sessionId = UUID.randomUUID();
        OriginalInput originalInput = captureOriginalInput(request);

        String userPrompt = buildUserPrompt(request);
        List<Message> messages = List.of(
                new SystemMessage(systemPrompt),
                new UserMessage(userPrompt));

        try {
            ChatResponse response = chatModel.call(new Prompt(messages));
            String aiContent = response.getResult().getOutput().getText();

            return parseAIResponse(sessionId, userId, aiContent, originalInput);

        } catch (Exception e) {
            log.error("AI processing failed", e);
            return createErrorResponse(sessionId, originalInput);
        }
    }

    /**
     * Submit answers to clarification questions.
     */
    public SmartInputResponse submitClarificationAnswers(UUID userId, ClarificationAnswersRequest request) {
        ConversationSession session = sessions.get(request.sessionId());
        if (session == null) {
            throw new IllegalStateException("Session not found or expired: " + request.sessionId());
        }

        // Merge answers into partial draft
        Draft updatedDraft = applyAnswersToDraft(session.partialDraft(), request.answers());

        // Check if we need more clarification
        List<String> missingFields = findMissingCriticalFields(updatedDraft);
        if (!missingFields.isEmpty() && session.questionCount() < MAX_QUESTIONS) {
            // Generate follow-up questions
            AIInterpretation.ClarificationFlow followUp = generateFollowUpQuestions(
                    updatedDraft, missingFields, session.questionCount());

            session.questionCount(session.questionCount() + followUp.questions().size());
            session.partialDraft(updatedDraft);

            return SmartInputResponse.needsClarification(
                    request.sessionId(),
                    session.intentType(),
                    updatedDraft,
                    "Please answer a few more questions to complete your " + session.intentType().name().toLowerCase(),
                    ClarificationFlowDTO.from(followUp),
                    null,
                    session.originalInput());
        }

        // Draft is ready
        sessions.remove(request.sessionId());
        return SmartInputResponse.ready(
                request.sessionId(),
                session.intentType(),
                0.95,
                updatedDraft,
                "Great! Your " + session.intentType().name().toLowerCase() + " is ready for review.",
                List.of(),
                session.originalInput(),
                Instant.now().plus(draftExpirationDuration));
    }

    /**
     * Confirm alternative suggestion (e.g., Task → Challenge).
     */
    public SmartInputResponse confirmAlternative(UUID sessionId, boolean accepted) {
        ConversationSession session = sessions.get(sessionId);
        if (session == null) {
            throw new IllegalStateException("Session not found or expired");
        }

        if (accepted) {
            sessions.remove(sessionId);
            return SmartInputResponse.ready(
                    sessionId,
                    session.intentType(),
                    0.9,
                    session.partialDraft(),
                    "Confirmed! Your " + session.intentType().name().toLowerCase() + " has been created.",
                    List.of(),
                    session.originalInput(),
                    Instant.now().plus(draftExpirationDuration));
        } else {
            // User wants original type - offer to create basic version
            sessions.remove(sessionId);
            return createBasicDraftFromSession(session);
        }
    }

    // =========================================================================
    // Internal methods
    // =========================================================================

    private String buildUserPrompt(SmartInputRequest request) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("User input: \"").append(request.text()).append("\"");

        if (request.attachments() != null && !request.attachments().isEmpty()) {
            prompt.append("\n\nAttachments:");
            for (var attachment : request.attachments()) {
                prompt.append("\n- Type: ").append(attachment.mimeType());
                if (attachment.extractedText() != null) {
                    prompt.append(", Extracted text: \"").append(attachment.extractedText()).append("\"");
                }
                if (attachment.metadata() != null) {
                    prompt.append(", Metadata: ").append(attachment.metadata());
                }
            }
        }

        if (request.voiceTranscription() != null) {
            prompt.append("\n\nVoice transcription: \"").append(request.voiceTranscription()).append("\"");
        }

        prompt.append("\n\nContext: User ID=").append(request.userId());
        prompt.append(", Current time=").append(Instant.now());
        prompt.append(", Timezone=").append(ZoneId.systemDefault());

        return prompt.toString();
    }

    private SmartInputResponse parseAIResponse(
            UUID sessionId, UUID userId, String aiContent, OriginalInput originalInput) {

        try {
            JsonNode root = objectMapper.readTree(aiContent);

            String status = root.path("status").asText("READY");
            String intentType = root.path("intentType").asText("TASK");
            double confidence = root.path("confidence").asDouble(0.8);
            String reasoning = root.path("reasoning").asText("");

            DraftType draftType = DraftType.valueOf(intentType);
            Draft draft = parseDraft(root.path("draft"), draftType);

            // Get suggestions
            List<String> suggestions = new ArrayList<>();
            root.path("suggestions").forEach(s -> suggestions.add(s.asText()));

            return switch (status) {
                case "READY" -> SmartInputResponse.ready(
                        sessionId,
                        draftType,
                        confidence,
                        draft,
                        reasoning,
                        suggestions,
                        originalInput,
                        Instant.now().plus(draftExpirationDuration));

                case "NEEDS_CLARIFICATION" -> {
                    AIInterpretation.ClarificationFlow flow = parseClarificationFlow(root.path("clarification"));
                    ImageAnalysisDTO imageAnalysis = parseImageAnalysis(root.path("imageAnalysis"));

                    // Store session
                    sessions.put(sessionId, new ConversationSession(
                            sessionId, userId, draftType, draft, originalInput,
                            flow.questions().size(), Instant.now().plus(Duration.ofHours(1))));

                    yield SmartInputResponse.needsClarification(
                            sessionId, draftType, draft, reasoning,
                            ClarificationFlowDTO.from(flow), imageAnalysis, originalInput);
                }

                case "SUGGEST_ALTERNATIVE" -> {
                    AIInterpretation.ClarificationFlow confirmFlow = createConfirmationFlow(
                            draftType, root.path("alternativeReason").asText());

                    sessions.put(sessionId, new ConversationSession(
                            sessionId, userId, draftType, draft, originalInput, 1, 
                            Instant.now().plus(Duration.ofHours(1))));

                    yield SmartInputResponse.suggestAlternative(
                            sessionId, draftType, draft, reasoning, suggestions,
                            ClarificationFlowDTO.from(confirmFlow), originalInput);
                }

                default -> SmartInputResponse.ready(
                        sessionId, draftType, confidence, draft, reasoning, suggestions,
                        originalInput, Instant.now().plus(draftExpirationDuration));
            };

        } catch (JsonProcessingException e) {
            log.error("Failed to parse AI response: {}", aiContent, e);
            return createErrorResponse(sessionId, originalInput);
        }
    }

    private Draft parseDraft(JsonNode draftNode, DraftType type) {
        return switch (type) {
            case TASK -> new Draft.TaskDraft(
                    draftNode.path("title").asText(""),
                    draftNode.path("description").asText(""),
                    draftNode.path("lifeWheelAreaId").asText("lw-4"),
                    draftNode.path("eisenhowerQuadrantId").asText("q2"),
                    draftNode.path("storyPoints").asInt(3),
                    draftNode.path("suggestedEpicId").asText(null),
                    draftNode.path("suggestedSprintId").asText(null),
                    parseDate(draftNode.path("dueDate").asText(null)),
                    draftNode.path("isRecurring").asBoolean(false),
                    parseRecurrencePattern(draftNode.path("recurrencePattern")));

            case EPIC -> new Draft.EpicDraft(
                    draftNode.path("title").asText(""),
                    draftNode.path("description").asText(""),
                    draftNode.path("lifeWheelAreaId").asText("lw-4"),
                    List.of(),  // suggestedTasks - can be parsed separately if needed
                    draftNode.path("color").asText("#3B82F6"),
                    draftNode.path("icon").asText(null),
                    parseDate(draftNode.path("startDate").asText(null)),
                    parseDate(draftNode.path("endDate").asText(null)));

            case CHALLENGE -> new Draft.ChallengeDraft(
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

            case EVENT -> new Draft.EventDraft(
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

            case BILL -> new Draft.BillDraft(
                    draftNode.path("vendorName").asText(""),
                    draftNode.path("amount").decimalValue(),
                    draftNode.path("currency").asText("USD"),
                    parseDate(draftNode.path("dueDate").asText(null)),
                    draftNode.path("category").asText(null),
                    draftNode.path("lifeWheelAreaId").asText("lw-3"),
                    draftNode.path("isRecurring").asBoolean(false),
                    draftNode.path("recurrence").asText(null),
                    draftNode.path("notes").asText(null));

            case NOTE -> new Draft.NoteDraft(
                    draftNode.path("title").asText("Quick Note"),
                    draftNode.path("content").asText(""),
                    draftNode.path("lifeWheelAreaId").asText("lw-4"),
                    parseLabels(draftNode.path("tags")),
                    parseLabels(draftNode.path("clarifyingQuestions")));

            case CLARIFICATION_NEEDED -> new Draft.NoteDraft(
                    "Clarification Needed",
                    draftNode.path("content").asText(""),
                    "lw-4",
                    List.of(),
                    List.of());
        };
    }

    private Draft.RecurrencePattern parseRecurrencePattern(JsonNode node) {
        if (node == null || node.isMissingNode()) return null;
        return new Draft.RecurrencePattern(
                node.path("frequency").asText("daily"),
                node.path("interval").asInt(1),
                parseDate(node.path("endDate").asText(null)));
    }

    private LocalTime parseTime(String value) {
        if (value == null || value.isBlank()) return null;
        try {
            return LocalTime.parse(value);
        } catch (Exception e) {
            return null;
        }
    }

    private AIInterpretation.ClarificationFlow parseClarificationFlow(JsonNode flowNode) {
        List<ClarificationQuestion> questions = new ArrayList<>();
        flowNode.path("questions").forEach(q -> {
            List<ClarificationQuestion.QuestionOption> options = new ArrayList<>();
            q.path("options").forEach(o -> options.add(new ClarificationQuestion.QuestionOption(
                    o.path("value").asText(),
                    o.path("label").asText(),
                    o.path("icon").asText(null),
                    o.path("description").asText(null))));

            questions.add(new ClarificationQuestion(
                    q.path("id").asText(),
                    q.path("question").asText(),
                    ClarificationQuestion.QuestionType.valueOf(q.path("type").asText("SINGLE_CHOICE")),
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

    private ImageAnalysisDTO parseImageAnalysis(JsonNode imageNode) {
        if (imageNode.isMissingNode()) return null;

        JsonNode dataNode = imageNode.path("extractedData");
        ImageAnalysisDTO.ExtractedDataDTO extractedData = new ImageAnalysisDTO.ExtractedDataDTO(
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

    private AIInterpretation.ClarificationFlow createConfirmationFlow(DraftType suggestedType, String reason) {
        return new AIInterpretation.ClarificationFlow(
                UUID.randomUUID().toString(),
                "Quick Suggestion",
                reason,
                List.of(new ClarificationQuestion(
                        "confirm",
                        "Would you like to create a " + suggestedType.name().toLowerCase() + " instead?",
                        ClarificationQuestion.QuestionType.YES_NO,
                        List.of(
                                ClarificationQuestion.QuestionOption.of("yes", "Yes, sounds good!", "👍"),
                                ClarificationQuestion.QuestionOption.of("no", "No, keep my original idea", "↩️")),
                        "confirmation",
                        true,
                        null)),
                0,
                1);
    }

    private AIInterpretation.ClarificationFlow generateFollowUpQuestions(
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

    private List<String> findMissingCriticalFields(Draft draft) {
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

    private Draft applyAnswersToDraft(Draft draft, List<ClarificationAnswersRequest.Answer> answers) {
        // Create a map of field -> value
        Map<String, String> updates = new HashMap<>();
        for (var answer : answers) {
            updates.put(answer.questionId(), answer.value());
        }

        // Apply updates based on draft type
        return switch (draft) {
            case Draft.TaskDraft t -> new Draft.TaskDraft(
                    updates.getOrDefault("title", t.title()),
                    updates.getOrDefault("description", t.description()),
                    updates.getOrDefault("lifeWheelAreaId", t.lifeWheelAreaId()),
                    updates.getOrDefault("eisenhowerQuadrantId", t.eisenhowerQuadrantId()),
                    updates.containsKey("storyPoints") ? Integer.parseInt(updates.get("storyPoints")) : t.storyPoints(),
                    updates.getOrDefault("suggestedEpicId", t.suggestedEpicId()),
                    updates.getOrDefault("suggestedSprintId", t.suggestedSprintId()),
                    updates.containsKey("dueDate") ? parseDate(updates.get("dueDate")) : t.dueDate(),
                    t.isRecurring(),
                    t.recurrencePattern());

            case Draft.ChallengeDraft c -> new Draft.ChallengeDraft(
                    updates.getOrDefault("name", c.name()),
                    updates.getOrDefault("description", c.description()),
                    updates.getOrDefault("lifeWheelAreaId", c.lifeWheelAreaId()),
                    updates.getOrDefault("metricType", c.metricType()),
                    c.targetValue(),
                    c.unit(),
                    updates.containsKey("duration") ? Integer.parseInt(updates.get("duration")) : c.duration(),
                    updates.getOrDefault("recurrence", c.recurrence()),
                    updates.getOrDefault("whyStatement", c.whyStatement()),
                    updates.getOrDefault("rewardDescription", c.rewardDescription()),
                    c.graceDays(),
                    c.reminderTime());

            case Draft.EventDraft e -> new Draft.EventDraft(
                    updates.getOrDefault("title", e.title()),
                    updates.getOrDefault("description", e.description()),
                    updates.getOrDefault("lifeWheelAreaId", e.lifeWheelAreaId()),
                    updates.containsKey("date") ? parseDate(updates.get("date")) : e.date(),
                    updates.containsKey("startTime") ? parseTime(updates.get("startTime")) : e.startTime(),
                    updates.containsKey("endTime") ? parseTime(updates.get("endTime")) : e.endTime(),
                    updates.getOrDefault("location", e.location()),
                    e.isAllDay(),
                    updates.getOrDefault("recurrence", e.recurrence()),
                    e.attendees());

            case Draft.BillDraft b -> new Draft.BillDraft(
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

    private SmartInputResponse createBasicDraftFromSession(ConversationSession session) {
        return SmartInputResponse.ready(
                session.sessionId(),
                DraftType.TASK,  // Default to task
                0.6,
                session.partialDraft(),
                "Created as originally requested. You can edit the details.",
                List.of(),
                session.originalInput(),
                Instant.now().plus(draftExpirationDuration));
    }

    private SmartInputResponse createErrorResponse(UUID sessionId, OriginalInput originalInput) {
        return SmartInputResponse.ready(
                sessionId,
                DraftType.NOTE,
                0.3,
                new Draft.NoteDraft(
                        "Quick Note",
                        originalInput.text(),
                        "lw-4",
                        List.of(),
                        List.of()),
                "I couldn't fully understand your request, but I've saved it as a note. You can edit or convert it.",
                List.of("Edit to add more details", "Convert to a different type"),
                originalInput,
                Instant.now().plus(draftExpirationDuration));
    }

    private OriginalInput captureOriginalInput(SmartInputRequest request) {
        List<OriginalInput.AttachmentSummary> attachments = request.attachments() == null
                ? List.of()
                : request.attachments().stream()
                        .map(a -> new OriginalInput.AttachmentSummary(
                                a.name(), a.type(), a.mimeType(), a.size(), a.extractedText()))
                        .toList();

        return new OriginalInput(
                request.text(),
                attachments,
                request.voiceTranscription());
    }

    // =========================================================================
    // Parsing helpers
    // =========================================================================

    private LocalDate parseDate(String value) {
        if (value == null || value.isBlank()) return null;
        try {
            return LocalDate.parse(value);
        } catch (Exception e) {
            return null;
        }
    }

    private List<String> parseLabels(JsonNode node) {
        List<String> labels = new ArrayList<>();
        if (node != null && node.isArray()) {
            node.forEach(n -> labels.add(n.asText()));
        }
        return labels;
    }

    private List<String> parseAttendees(JsonNode node) {
        return parseLabels(node);  // Same logic
    }

    private List<String> parseStringList(JsonNode node) {
        return parseLabels(node);  // Same logic
    }

    // =========================================================================
    // Session management
    // =========================================================================

    private static class ConversationSession {
        private final UUID sessionId;
        private final UUID userId;
        private DraftType intentType;
        private Draft partialDraft;
        private final OriginalInput originalInput;
        private int questionCount;
        private final Instant expiresAt;

        ConversationSession(UUID sessionId, UUID userId, DraftType intentType, 
                           Draft partialDraft, OriginalInput originalInput, 
                           int questionCount, Instant expiresAt) {
            this.sessionId = sessionId;
            this.userId = userId;
            this.intentType = intentType;
            this.partialDraft = partialDraft;
            this.originalInput = originalInput;
            this.questionCount = questionCount;
            this.expiresAt = expiresAt;
        }

        UUID sessionId() { return sessionId; }
        UUID userId() { return userId; }
        DraftType intentType() { return intentType; }
        Draft partialDraft() { return partialDraft; }
        OriginalInput originalInput() { return originalInput; }
        int questionCount() { return questionCount; }
        Instant expiresAt() { return expiresAt; }

        void intentType(DraftType type) { this.intentType = type; }
        void partialDraft(Draft draft) { this.partialDraft = draft; }
        void questionCount(int count) { this.questionCount = count; }
    }
}
