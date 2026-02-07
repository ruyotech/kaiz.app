package app.kaiz.command_center.application;

import app.kaiz.command_center.application.AIConversationLogger.AttachmentInfo;
import app.kaiz.command_center.application.AIConversationLogger.ConversationLog;
import app.kaiz.command_center.application.AIConversationLogger.ProviderInfo;
import app.kaiz.command_center.application.dto.CommandCenterAIResponse;
import app.kaiz.command_center.application.dto.CommandCenterAIResponse.AttachmentSummary;
import app.kaiz.command_center.domain.*;
import app.kaiz.command_center.infrastructure.PendingDraftRepository;
import app.kaiz.identity.domain.User;
import app.kaiz.identity.infrastructure.UserRepository;
import app.kaiz.shared.exception.ResourceNotFoundException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.time.Instant;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.content.Media;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.MimeType;
import org.springframework.util.MimeTypeUtils;
import org.springframework.web.multipart.MultipartFile;

/**
 * Core AI service for Command Center using Spring AI with Claude 3.5 Sonnet. Processes user inputs
 * and generates structured entity drafts.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CommandCenterAIService {

  private final ChatModelProvider chatModelProvider;
  private final ObjectMapper objectMapper;
  private final PendingDraftRepository draftRepository;
  private final UserRepository userRepository;
  private final AIConversationLogger aiLogger;
  private final SystemPromptService systemPromptService;
  private final AIResponseParser aiResponseParser;

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

    // Start structured conversation logging
    ConversationLog conversation = aiLogger.startConversation(userId, "SMART_INPUT");

    try {
      // Log user input with structured format
      List<AttachmentInfo> attachmentInfos = null;
      if (attachmentSummaries != null && !attachmentSummaries.isEmpty()) {
        attachmentInfos =
            attachmentSummaries.stream()
                .map(
                    att ->
                        new AttachmentInfo(
                            att.name(),
                            att.type(),
                            att.mimeType(),
                            att.size(),
                            att.extractedText()))
                .toList();
      }
      conversation.logInput(text, voiceTranscription, attachmentInfos);

      // Build the user message combining all inputs
      String userPrompt = buildUserPrompt(text, attachmentSummaries, voiceTranscription);
      conversation.logUserPrompt(userPrompt);

      // Get system prompt from database with current date context
      boolean hasImage =
          attachmentSummaries != null
              && attachmentSummaries.stream()
                  .anyMatch(a -> a.mimeType() != null && a.mimeType().startsWith("image/"));
      boolean hasVoice = voiceTranscription != null && !voiceTranscription.isBlank();
      String systemPrompt = systemPromptService.getPromptForInputType(hasImage, hasVoice);
      conversation.logSystemPrompt(systemPrompt, false); // Preview only, too long for full

      // Log provider info
      conversation.logProviderInfo(ProviderInfo.anthropic());

      // Call Claude AI
      long aiStartTime = System.currentTimeMillis();
      String aiResponse = callClaudeInternal(systemPrompt, userPrompt);
      long aiDuration = System.currentTimeMillis() - aiStartTime;
      conversation.logAIResponse(aiResponse, aiDuration);

      // Parse the AI response
      AIResponseParsed parsed = parseAIResponse(aiResponse);
      conversation.logParsedResult(
          parsed.draft().type().name(), parsed.confidenceScore(), parsed.reasoning());

      // Create and save the draft
      User user =
          userRepository
              .findById(userId)
              .orElseThrow(() -> new ResourceNotFoundException("User", userId.toString()));

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

      // Complete conversation log
      conversation.complete(saved.getId().toString(), parsed.draft().type().name());

      // Determine the response status based on AI's status
      DraftStatus responseStatus =
          switch (parsed.status()) {
            case "NEEDS_CLARIFICATION" -> DraftStatus.NEEDS_CLARIFICATION;
            case "SUGGEST_ALTERNATIVE" ->
                DraftStatus.NEEDS_CLARIFICATION; // Treat similar to clarification
            default -> DraftStatus.PENDING_APPROVAL;
          };

      // Build response with proper status
      return CommandCenterAIResponse.withStatus(
          saved.getId(),
          responseStatus,
          parsed.draft().type(),
          parsed.confidenceScore(),
          parsed.draft(),
          parsed.reasoning(),
          parsed.suggestions(),
          parsed.clarifyingQuestions(),
          text,
          attachmentSummaries,
          voiceTranscription,
          saved.getExpiresAt());

    } catch (Exception e) {
      conversation.logError("PROCESS_INPUT", e.getMessage(), e);
      throw e;
    }
  }

  /** Internal method to call Claude AI - logging is handled by caller. */
  private String callClaudeInternal(String systemPrompt, String userPrompt) {
    try {
      var prompt =
          new Prompt(
              List.of(
                  new org.springframework.ai.chat.messages.SystemMessage(systemPrompt),
                  new UserMessage(userPrompt)));

      var response = chatModelProvider.getChatModel().call(prompt);
      return response.getResult().getOutput().getText();
    } catch (Exception e) {
      throw new AIProcessingException("Failed to process with AI: " + e.getMessage(), e);
    }
  }

  /**
   * Extract text from image bytes using Claude Vision API. Supports handwritten notes, documents,
   * receipts, calendar screenshots, etc.
   *
   * @param imageBytes The image bytes
   * @param contentType The MIME type of the image
   * @return Extracted text from the image
   */
  public String extractTextFromImage(byte[] imageBytes, String contentType) {
    // Start OCR conversation log
    ConversationLog conversation = aiLogger.startConversation(null, "OCR_EXTRACTION");

    try {
      conversation.logOCRRequest(
          "image_bytes", contentType, imageBytes != null ? imageBytes.length : 0);

      MimeType mimeType = getMimeTypeForImage(contentType);
      if (mimeType == null) {
        log.warn("Unsupported image type for OCR: {}", contentType);
        return null;
      }

      conversation.logProviderInfo(ProviderInfo.anthropic());

      var imageResource = new ByteArrayResource(imageBytes);
      var media = new Media(mimeType, imageResource);
      var userMessage = UserMessage.builder().text(OCR_PROMPT).media(media).build();

      long startTime = System.currentTimeMillis();
      var prompt = new Prompt(List.of(userMessage));
      var response = chatModelProvider.getChatModel().call(prompt);
      String extractedText = response.getResult().getOutput().getText();
      long duration = System.currentTimeMillis() - startTime;

      conversation.logOCRResponse(extractedText, duration);
      conversation.complete(null, "OCR_RESULT");

      return extractedText;
    } catch (Exception e) {
      conversation.logError("OCR_EXTRACTION", e.getMessage(), e);
      return null;
    }
  }

  /**
   * Extract text from an image using Claude Vision API. Supports handwritten notes, documents,
   * receipts, calendar screenshots, etc.
   *
   * @param file The image file to analyze
   * @return Extracted text from the image
   * @throws IOException If the file cannot be read
   */
  public String extractTextFromImage(MultipartFile file) throws IOException {
    // Start OCR conversation log
    ConversationLog conversation = aiLogger.startConversation(null, "OCR_FILE_EXTRACTION");

    try {
      conversation.logOCRRequest(file.getOriginalFilename(), file.getContentType(), file.getSize());

      // Determine MIME type
      MimeType mimeType = getMimeTypeForImage(file.getContentType());
      if (mimeType == null) {
        log.warn("Unsupported image type for OCR: {}", file.getContentType());
        return null;
      }

      conversation.logProviderInfo(ProviderInfo.anthropic());

      // Read image bytes and wrap in Resource
      byte[] imageBytes = file.getBytes();
      var imageResource = new ByteArrayResource(imageBytes);

      // Create multimodal message with image using builder
      var media = new Media(mimeType, imageResource);
      var userMessage = UserMessage.builder().text(OCR_PROMPT).media(media).build();

      long startTime = System.currentTimeMillis();
      var prompt = new Prompt(List.of(userMessage));
      var response = chatModelProvider.getChatModel().call(prompt);
      String extractedText = response.getResult().getOutput().getText();
      long duration = System.currentTimeMillis() - startTime;

      conversation.logOCRResponse(extractedText, duration);
      conversation.complete(null, "OCR_FILE_RESULT");

      return extractedText;
    } catch (Exception e) {
      conversation.logError("OCR_FILE_EXTRACTION", e.getMessage(), e);
      return null;
    }
  }

  /** Get the MimeType for supported image formats. */
  private MimeType getMimeTypeForImage(String contentType) {
    if (contentType == null) {
      return null;
    }
    return switch (contentType.toLowerCase()) {
      case "image/jpeg", "image/jpg" -> MimeTypeUtils.IMAGE_JPEG;
      case "image/png" -> MimeTypeUtils.IMAGE_PNG;
      case "image/gif" -> MimeTypeUtils.IMAGE_GIF;
      case "image/webp" -> MimeType.valueOf("image/webp");
      default -> null;
    };
  }

  /** Prompt for extracting text from images, optimized for handwritten notes. */
  private static final String OCR_PROMPT =
      """
            Extract ALL text from this image. Follow these guidelines:

            1. For HANDWRITTEN text:
               - Carefully examine each character
               - Consider context to interpret unclear letters
               - If a word is unclear, provide your best interpretation
               - If completely illegible, mark as [illegible]

            2. For PRINTED text:
               - Extract exactly as shown
               - Preserve any formatting (lists, headers)

            3. For CALENDAR/MEETING screenshots:
               - Extract: event title, date, time, location, attendees
               - Format dates as YYYY-MM-DD
               - Format times as HH:MM

            4. For RECEIPTS/BILLS:
               - Extract: vendor name, total amount, date, items
               - Preserve currency symbols

            5. For INVITATIONS:
               - Extract: occasion type, person's name, date, time, location

            Return ONLY the extracted text, no explanations or markdown formatting.
            Preserve the original structure as much as possible using line breaks.
            """;

  /** Build the user prompt combining all input sources. */
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
    prompt
        .append("\n[CONTEXT]: Today is ")
        .append(LocalDate.now().format(DateTimeFormatter.ofPattern("EEEE, MMMM d, yyyy")));

    return prompt.toString();
  }

  /** Parse the AI response JSON into structured objects. */
  private AIResponseParsed parseAIResponse(String jsonResponse) {
    try {
      // Clean up the response (remove markdown code blocks if present)
      String cleaned = aiResponseParser.cleanJsonResponse(jsonResponse);

      JsonNode root = objectMapper.readTree(cleaned);

      // Parse status - defaults to READY
      String status = root.path("status").asText("READY");
      String intentDetected = root.path("intentDetected").asText("note");
      double confidenceScore = root.path("confidenceScore").asDouble(0.5);
      String reasoning = root.path("reasoning").asText("");

      List<String> suggestions = new ArrayList<>();
      if (root.has("suggestions") && root.get("suggestions").isArray()) {
        for (JsonNode suggestion : root.get("suggestions")) {
          suggestions.add(suggestion.asText());
        }
      }

      // Parse clarifying questions from clarificationFlow
      List<String> clarifyingQuestions = new ArrayList<>();
      if (root.has("clarificationFlow") && !root.get("clarificationFlow").isNull()) {
        JsonNode flowNode = root.get("clarificationFlow");
        // Add title/description as context if available
        String flowTitle = flowNode.path("title").asText("");
        String flowDescription = flowNode.path("description").asText("");
        if (!flowTitle.isBlank()) {
          clarifyingQuestions.add(flowTitle);
        }
        if (!flowDescription.isBlank() && !flowDescription.equals(flowTitle)) {
          clarifyingQuestions.add(flowDescription);
        }
        // Extract questions from the questions array
        if (flowNode.has("questions") && flowNode.get("questions").isArray()) {
          for (JsonNode q : flowNode.get("questions")) {
            String question = q.path("question").asText("");
            if (!question.isBlank()) {
              // Build a descriptive question with options
              StringBuilder questionText = new StringBuilder(question);
              if (q.has("options") && q.get("options").isArray()) {
                List<String> optionLabels = new ArrayList<>();
                for (JsonNode opt : q.get("options")) {
                  String label = opt.path("label").asText("");
                  String icon = opt.path("icon").asText("");
                  if (!label.isBlank()) {
                    optionLabels.add(icon.isBlank() ? label : icon + " " + label);
                  }
                }
                if (!optionLabels.isEmpty()) {
                  questionText.append(" Options: ").append(String.join(", ", optionLabels));
                }
              }
              clarifyingQuestions.add(questionText.toString());
            }
          }
        }
      }

      // Parse the draft based on type (can be null for NEEDS_CLARIFICATION)
      Draft draft;
      JsonNode draftNode = root.path("draft");
      if (draftNode.isNull() || draftNode.isMissingNode()) {
        // For NEEDS_CLARIFICATION with no draft, create a placeholder
        if ("NEEDS_CLARIFICATION".equals(status)) {
          draft =
              new Draft.NoteDraft(
                  "Clarification Needed",
                  "Please provide more details about what you'd like to create.",
                  "lw-4",
                  List.of("clarification"),
                  clarifyingQuestions);
        } else {
          draft = aiResponseParser.parseDraftByTypeName(intentDetected, draftNode);
        }
      } else {
        draft = aiResponseParser.parseDraftByTypeName(intentDetected, draftNode);
      }

      log.info(
          "AI parse result: status={}, intent={}, confidence={}, clarifyQuestions={}",
          status,
          intentDetected,
          confidenceScore,
          clarifyingQuestions.size());

      return new AIResponseParsed(
          status, draft, confidenceScore, reasoning, suggestions, clarifyingQuestions);
    } catch (Exception e) {
      log.error("Error parsing AI response: {}", e.getMessage(), e);
      // Return a fallback note draft
      return new AIResponseParsed(
          "READY",
          new Draft.NoteDraft(
              "Processing Error",
              "Could not parse AI response: " + jsonResponse,
              "lw-4",
              List.of("error"),
              List.of("What would you like to create?", "Can you provide more details?")),
          0.3,
          "Failed to parse AI response, captured as note",
          List.of(),
          List.of("What would you like to create?", "Can you provide more details?"));
    }
  }

  /** Internal record for parsed AI response. */
  private record AIResponseParsed(
      String status,
      Draft draft,
      double confidenceScore,
      String reasoning,
      List<String> suggestions,
      List<String> clarifyingQuestions) {}

  /** Custom exception for AI processing errors. */
  public static class AIProcessingException extends RuntimeException {
    public AIProcessingException(String message, Throwable cause) {
      super(message, cause);
    }
  }
}
