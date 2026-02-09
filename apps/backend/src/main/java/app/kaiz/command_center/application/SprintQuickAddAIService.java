package app.kaiz.command_center.application;

import app.kaiz.command_center.application.AIConversationLogger.ConversationLog;
import app.kaiz.command_center.application.AIConversationLogger.ProviderInfo;
import app.kaiz.command_center.application.dto.SprintQuickAddRequest;
import app.kaiz.command_center.application.dto.SprintQuickAddResponse;
import app.kaiz.command_center.application.dto.SprintQuickAddResponse.TaskDraftSuggestion;
import com.fasterxml.jackson.databind.JsonNode;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.stereotype.Service;

/**
 * AI service for sprint planning quick-add. Parses multiple short text lines into structured task
 * drafts with life wheel areas, Eisenhower quadrants, and Fibonacci story points. Separate from
 * CommandCenterAIService to keep each service under ~400 lines (facade pattern per project rules).
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class SprintQuickAddAIService {

  public static final String SPRINT_QUICK_ADD_PROMPT_KEY = "sprint_quick_add";

  private final ChatModelProvider chatModelProvider;
  private final AIResponseParser aiResponseParser;
  private final AIConversationLogger aiLogger;
  private final SystemPromptService systemPromptService;

  /**
   * Process a list of short text lines into AI-inferred task draft suggestions.
   *
   * @param userId the user requesting the quick-add
   * @param request the request with lines and optional sprint context
   * @return response with task draft suggestions for each line
   */
  public SprintQuickAddResponse processQuickAdd(UUID userId, SprintQuickAddRequest request) {
    log.info("Sprint quick-add: userId={}, lineCount={}", userId, request.lines().size());

    ConversationLog conversation = aiLogger.startConversation(userId, "SPRINT_QUICK_ADD");

    try {
      // Build user prompt with numbered lines
      String userPrompt = buildUserPrompt(request);
      conversation.logUserPrompt(userPrompt);

      // Get system prompt from DB
      String systemPrompt =
          systemPromptService.getPromptByKey(SPRINT_QUICK_ADD_PROMPT_KEY, "sprint quick-add");
      conversation.logSystemPrompt(systemPrompt, false);
      conversation.logProviderInfo(ProviderInfo.anthropic());

      // Call Claude
      long startTime = System.currentTimeMillis();
      String aiResponse = callClaude(systemPrompt, userPrompt);
      long duration = System.currentTimeMillis() - startTime;
      conversation.logAIResponse(aiResponse, duration);

      // Parse the JSON array of task drafts
      List<TaskDraftSuggestion> suggestions = parseResponse(aiResponse, request.lines());

      log.info(
          "Sprint quick-add complete: userId={}, lines={}, suggestions={}",
          userId,
          request.lines().size(),
          suggestions.size());

      conversation.complete(null, "SPRINT_QUICK_ADD");
      return new SprintQuickAddResponse(suggestions);

    } catch (Exception e) {
      conversation.logError("SPRINT_QUICK_ADD", e.getMessage(), e);
      log.error("Sprint quick-add failed: userId={}, error={}", userId, e.getMessage(), e);

      // Return a fallback with basic suggestions derived from the raw lines
      List<TaskDraftSuggestion> fallbacks = buildFallbackSuggestions(request.lines());
      return new SprintQuickAddResponse(fallbacks);
    }
  }

  private String buildUserPrompt(SprintQuickAddRequest request) {
    StringBuilder sb = new StringBuilder();
    sb.append("Parse these task lines into structured tasks:\n\n");
    for (int i = 0; i < request.lines().size(); i++) {
      sb.append(i + 1).append(". ").append(request.lines().get(i)).append("\n");
    }
    if (request.sprintContext() != null && !request.sprintContext().isBlank()) {
      sb.append("\nSprint context: ").append(request.sprintContext());
    }
    return sb.toString();
  }

  private String callClaude(String systemPrompt, String userPrompt) {
    var prompt = new Prompt(List.of(new SystemMessage(systemPrompt), new UserMessage(userPrompt)));
    var response = chatModelProvider.getChatModel().call(prompt);
    return response.getResult().getOutput().getText();
  }

  private List<TaskDraftSuggestion> parseResponse(String aiResponse, List<String> originalLines) {
    List<TaskDraftSuggestion> suggestions = new ArrayList<>();

    try {
      JsonNode root = aiResponseParser.parseJson(aiResponse);

      // Handle both direct array and object with "tasks" array
      JsonNode tasksNode;
      if (root.isArray()) {
        tasksNode = root;
      } else if (root.has("tasks") && root.get("tasks").isArray()) {
        tasksNode = root.get("tasks");
      } else {
        log.warn("Unexpected AI response structure, building fallback suggestions");
        return buildFallbackSuggestions(originalLines);
      }

      for (int i = 0; i < tasksNode.size(); i++) {
        JsonNode node = tasksNode.get(i);
        String originalLine = i < originalLines.size() ? originalLines.get(i) : "";

        suggestions.add(
            new TaskDraftSuggestion(
                originalLine,
                node.path("title").asText(originalLine),
                node.path("description").asText(""),
                node.path("lifeWheelAreaId").asText("lw-4"),
                node.path("eisenhowerQuadrantId").asText("eq-2"),
                clampStoryPoints(node.path("storyPoints").asInt(2)),
                aiResponseParser.parseStringList(node.path("tags")),
                new BigDecimal(
                    node.path("confidence").asText(node.path("confidenceScore").asText("0.75")))));
      }
    } catch (Exception e) {
      log.warn("Failed to parse AI quick-add response: {}", e.getMessage());
      return buildFallbackSuggestions(originalLines);
    }

    return suggestions;
  }

  private List<TaskDraftSuggestion> buildFallbackSuggestions(List<String> lines) {
    return lines.stream()
        .map(
            line ->
                new TaskDraftSuggestion(
                    line,
                    capitalize(line.trim()),
                    "",
                    "lw-4", // Growth as default
                    "eq-2", // Not Urgent & Important as default
                    2,
                    List.of(),
                    new BigDecimal("0.5")))
        .collect(Collectors.toList());
  }

  /** Clamp story points to valid Fibonacci values: 1, 2, 3, 5, 8, 13, 21 */
  private int clampStoryPoints(int points) {
    int[] fibonacci = {1, 2, 3, 5, 8, 13, 21};
    int closest = fibonacci[0];
    int minDiff = Math.abs(points - closest);
    for (int fib : fibonacci) {
      int diff = Math.abs(points - fib);
      if (diff < minDiff) {
        minDiff = diff;
        closest = fib;
      }
    }
    return closest;
  }

  private String capitalize(String s) {
    if (s == null || s.isEmpty()) return s;
    return Character.toUpperCase(s.charAt(0)) + s.substring(1);
  }
}
