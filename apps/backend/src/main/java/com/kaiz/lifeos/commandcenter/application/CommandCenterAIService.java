package com.kaiz.lifeos.commandcenter.application;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.kaiz.lifeos.commandcenter.api.dto.CommandCenterAIResponse;
import com.kaiz.lifeos.commandcenter.api.dto.CommandCenterAIResponse.AttachmentSummary;
import com.kaiz.lifeos.commandcenter.domain.*;
import com.kaiz.lifeos.commandcenter.infrastructure.PendingDraftRepository;
import com.kaiz.lifeos.identity.domain.User;
import com.kaiz.lifeos.identity.infrastructure.UserRepository;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.anthropic.AnthropicChatModel;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Core AI service for Command Center using Spring AI with Claude 3.5 Sonnet.
 * Processes user inputs and generates structured entity drafts.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CommandCenterAIService {

    private final AnthropicChatModel chatModel;
    private final ObjectMapper objectMapper;
    private final PendingDraftRepository draftRepository;
    private final UserRepository userRepository;

    // Draft expiration time (24 hours)
    private static final long DRAFT_EXPIRATION_HOURS = 24;

    /**
     * Process user input and generate a structured draft using Claude AI.
     *
     * @param userId The user making the request
     * @param text The text input from the user
     * @param attachmentSummaries Summaries of any attachments
     * @param voiceTranscription Transcription of voice input (if any)
     * @return AI-generated response with draft for approval
     */
    @Transactional
    public CommandCenterAIResponse processInput(
            UUID userId,
            String text,
            List<AttachmentSummary> attachmentSummaries,
            String voiceTranscription) {

        log.info("🤖 [AI] Processing input for user: {}", userId);

        // Build the user message combining all inputs
        String userPrompt = buildUserPrompt(text, attachmentSummaries, voiceTranscription);
        log.debug("🤖 [AI] User prompt: {}", userPrompt);

        // Get system prompt with current date context
        String tomorrowDate = LocalDate.now().plusDays(1).format(DateTimeFormatter.ISO_LOCAL_DATE);
        String systemPrompt = CommandCenterSystemPrompt.getPromptWithDates(tomorrowDate);

        // Call Claude AI
        String aiResponse = callClaude(systemPrompt, userPrompt);
        log.debug("🤖 [AI] Raw response: {}", aiResponse);

        // Parse the AI response
        AIResponseParsed parsed = parseAIResponse(aiResponse);

        // Create and save the draft
        User user =
                userRepository
                        .findById(userId)
                        .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        PendingDraft pendingDraft =
                PendingDraft.builder()
                        .user(user)
                        .draftType(parsed.draft().type())
                        .draftContent(parsed.draft())
                        .confidenceScore(parsed.confidenceScore())
                        .aiReasoning(parsed.reasoning())
                        .originalInputText(text)
                        .voiceTranscription(voiceTranscription)
                        .attachmentCount(attachmentSummaries != null ? attachmentSummaries.size() : 0)
                        .processedAt(Instant.now())
                        .expiresAt(Instant.now().plus(DRAFT_EXPIRATION_HOURS, ChronoUnit.HOURS))
                        .build();

        PendingDraft saved = draftRepository.save(pendingDraft);
        log.info("🤖 [AI] Draft saved with ID: {}, type: {}", saved.getId(), parsed.draft().type());

        // Build response
        return CommandCenterAIResponse.of(
                saved.getId(),
                parsed.draft().type(),
                parsed.confidenceScore(),
                parsed.draft(),
                parsed.reasoning(),
                parsed.suggestions(),
                text,
                attachmentSummaries,
                voiceTranscription,
                saved.getExpiresAt());
    }

    /**
     * Call Claude AI with the given prompts.
     */
    private String callClaude(String systemPrompt, String userPrompt) {
        try {
            var prompt =
                    new Prompt(List.of(new SystemMessage(systemPrompt), new UserMessage(userPrompt)));

            var response = chatModel.call(prompt);
            return response.getResult().getOutput().getText();
        } catch (Exception e) {
            log.error("🤖 [AI] Error calling Claude: {}", e.getMessage(), e);
            throw new AIProcessingException("Failed to process with AI: " + e.getMessage(), e);
        }
    }

    /**
     * Build the user prompt combining all input sources.
     */
    private String buildUserPrompt(
            String text, List<AttachmentSummary> attachments, String voiceTranscription) {

        StringBuilder prompt = new StringBuilder();

        // Add voice transcription if present
        if (voiceTranscription != null && !voiceTranscription.isBlank()) {
            prompt.append("[VOICE INPUT]: ").append(voiceTranscription).append("\n\n");
        }

        // Add text input
        if (text != null && !text.isBlank()) {
            prompt.append("[TEXT INPUT]: ").append(text).append("\n\n");
        }

        // Add attachment information
        if (attachments != null && !attachments.isEmpty()) {
            prompt.append("[ATTACHMENTS]:\n");
            for (var att : attachments) {
                prompt.append("- Type: ").append(att.type());
                prompt.append(", Name: ").append(att.name());
                if (att.extractedText() != null && !att.extractedText().isBlank()) {
                    prompt.append("\n  Extracted content: ").append(att.extractedText());
                }
                prompt.append("\n");
            }
        }

        // If no input provided, create a note
        if (prompt.isEmpty()) {
            prompt.append("[EMPTY INPUT]: User sent empty message");
        }

        // Add context about current date
        prompt.append("\n[CONTEXT]: Today is ")
                .append(LocalDate.now().format(DateTimeFormatter.ofPattern("EEEE, MMMM d, yyyy")));

        return prompt.toString();
    }

    /**
     * Parse the AI response JSON into structured objects.
     */
    private AIResponseParsed parseAIResponse(String jsonResponse) {
        try {
            // Clean up the response (remove markdown code blocks if present)
            String cleaned = cleanJsonResponse(jsonResponse);

            JsonNode root = objectMapper.readTree(cleaned);

            String intentDetected = root.path("intentDetected").asText("note");
            double confidenceScore = root.path("confidenceScore").asDouble(0.5);
            String reasoning = root.path("reasoning").asText("");

            List<String> suggestions = new ArrayList<>();
            if (root.has("suggestions") && root.get("suggestions").isArray()) {
                for (JsonNode suggestion : root.get("suggestions")) {
                    suggestions.add(suggestion.asText());
                }
            }

            // Parse the draft based on type
            JsonNode draftNode = root.path("draft");
            Draft draft = parseDraft(intentDetected, draftNode);

            return new AIResponseParsed(draft, confidenceScore, reasoning, suggestions);
        } catch (Exception e) {
            log.error("🤖 [AI] Error parsing AI response: {}", e.getMessage(), e);
            // Return a fallback note draft
            return new AIResponseParsed(
                    new Draft.NoteDraft(
                            "Processing Error",
                            "Could not parse AI response: " + jsonResponse,
                            "lw-4",
                            List.of("error"),
                            List.of("What would you like to create?", "Can you provide more details?")),
                    0.3,
                    "Failed to parse AI response, captured as note",
                    List.of());
        }
    }

    /**
     * Parse draft JSON based on detected type.
     */
    private Draft parseDraft(String type, JsonNode node) {
        return switch (type.toLowerCase()) {
            case "task" -> parseTaskDraft(node);
            case "epic" -> parseEpicDraft(node);
            case "challenge" -> parseChallengeDraft(node);
            case "event" -> parseEventDraft(node);
            case "bill" -> parseBillDraft(node);
            default -> parseNoteDraft(node);
        };
    }

    private Draft.TaskDraft parseTaskDraft(JsonNode node) {
        return new Draft.TaskDraft(
                node.path("title").asText("Untitled Task"),
                node.path("description").asText(""),
                node.path("lifeWheelAreaId").asText("lw-4"),
                node.path("eisenhowerQuadrantId").asText("q2"),
                node.path("storyPoints").asInt(3),
                nullIfEmpty(node.path("suggestedEpicId").asText(null)),
                nullIfEmpty(node.path("suggestedSprintId").asText(null)),
                parseLocalDate(node.path("dueDate").asText(null)),
                node.path("isRecurring").asBoolean(false),
                parseRecurrencePattern(node.path("recurrencePattern")));
    }

    private Draft.EpicDraft parseEpicDraft(JsonNode node) {
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

    private Draft.ChallengeDraft parseChallengeDraft(JsonNode node) {
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

    private Draft.EventDraft parseEventDraft(JsonNode node) {
        List<String> attendees = new ArrayList<>();
        if (node.has("attendees") && node.get("attendees").isArray()) {
            for (JsonNode attendee : node.get("attendees")) {
                attendees.add(attendee.asText());
            }
        }

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
                attendees);
    }

    private Draft.BillDraft parseBillDraft(JsonNode node) {
        return new Draft.BillDraft(
                node.path("vendorName").asText("Unknown Vendor"),
                parseDecimal(node.path("amount")),
                node.path("currency").asText("USD"),
                parseLocalDate(node.path("dueDate").asText(null)),
                nullIfEmpty(node.path("category").asText(null)),
                "lw-3", // Bills always go to Finance
                node.path("isRecurring").asBoolean(false),
                node.path("recurrence").asText(null),
                nullIfEmpty(node.path("notes").asText(null)));
    }

    private Draft.NoteDraft parseNoteDraft(JsonNode node) {
        List<String> tags = new ArrayList<>();
        if (node.has("tags") && node.get("tags").isArray()) {
            for (JsonNode tag : node.get("tags")) {
                tags.add(tag.asText());
            }
        }

        List<String> questions = new ArrayList<>();
        if (node.has("clarifyingQuestions") && node.get("clarifyingQuestions").isArray()) {
            for (JsonNode q : node.get("clarifyingQuestions")) {
                questions.add(q.asText());
            }
        }

        return new Draft.NoteDraft(
                node.path("title").asText("Quick Note"),
                node.path("content").asText(""),
                node.path("lifeWheelAreaId").asText("lw-4"),
                tags,
                questions);
    }

    private Draft.RecurrencePattern parseRecurrencePattern(JsonNode node) {
        if (node == null || node.isNull() || node.isMissingNode()) {
            return null;
        }
        return new Draft.RecurrencePattern(
                node.path("frequency").asText("daily"),
                node.path("interval").asInt(1),
                parseLocalDate(node.path("endDate").asText(null)));
    }

    // Helper methods
    private String cleanJsonResponse(String response) {
        String cleaned = response.trim();
        // Remove markdown code blocks
        if (cleaned.startsWith("```json")) {
            cleaned = cleaned.substring(7);
        } else if (cleaned.startsWith("```")) {
            cleaned = cleaned.substring(3);
        }
        if (cleaned.endsWith("```")) {
            cleaned = cleaned.substring(0, cleaned.length() - 3);
        }
        return cleaned.trim();
    }

    private LocalDate parseLocalDate(String value) {
        if (value == null || value.isBlank() || "null".equals(value)) {
            return null;
        }
        try {
            return LocalDate.parse(value);
        } catch (Exception e) {
            return null;
        }
    }

    private LocalTime parseLocalTime(String value) {
        if (value == null || value.isBlank() || "null".equals(value)) {
            return null;
        }
        try {
            return LocalTime.parse(value);
        } catch (Exception e) {
            return null;
        }
    }

    private BigDecimal parseDecimal(JsonNode node) {
        if (node == null || node.isNull() || node.isMissingNode()) {
            return null;
        }
        try {
            return new BigDecimal(node.asText("0"));
        } catch (Exception e) {
            return null;
        }
    }

    private String nullIfEmpty(String value) {
        return (value == null || value.isBlank() || "null".equals(value)) ? null : value;
    }

    /**
     * Internal record for parsed AI response.
     */
    private record AIResponseParsed(
            Draft draft, double confidenceScore, String reasoning, List<String> suggestions) {}

    /**
     * Custom exception for AI processing errors.
     */
    public static class AIProcessingException extends RuntimeException {
        public AIProcessingException(String message, Throwable cause) {
            super(message, cause);
        }
    }
}
