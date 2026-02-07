package app.kaiz.command_center.application;

import app.kaiz.admin.domain.TestAttachment;
import app.kaiz.admin.infrastructure.TestAttachmentRepository;
import app.kaiz.command_center.application.ConversationSessionStore.ConversationSession;
import app.kaiz.command_center.application.SmartInputResponseParser.ParsedAIResponse;
import app.kaiz.command_center.application.dto.ClarificationAnswersRequest;
import app.kaiz.command_center.application.dto.SmartInputRequest;
import app.kaiz.command_center.application.dto.SmartInputResponse;
import app.kaiz.command_center.application.dto.SmartInputResponse.*;
import app.kaiz.command_center.domain.*;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Orchestrator for the Smart Input AI pipeline. Coordinates session management, AI calls, response
 * parsing, clarification flows, and draft persistence — delegating each concern to a focused
 * service.
 */
@Slf4j
@Service
public class SmartInputAIService {

  private static final int MAX_QUESTIONS = 5;

  private final ChatModelProvider chatModelProvider;
  private final ConversationSessionStore sessionStore;
  private final SmartInputResponseParser responseParser;
  private final DraftPersistenceService draftPersistenceService;
  private final CommandCenterAIService commandCenterAIService;
  private final TestAttachmentRepository testAttachmentRepository;
  private final SystemPromptService systemPromptService;
  private final Duration draftExpirationDuration;

  public SmartInputAIService(
      ChatModelProvider chatModelProvider,
      ConversationSessionStore sessionStore,
      SmartInputResponseParser responseParser,
      DraftPersistenceService draftPersistenceService,
      CommandCenterAIService commandCenterAIService,
      TestAttachmentRepository testAttachmentRepository,
      SystemPromptService systemPromptService,
      @Value("${kaiz.command-center.draft-expiration-hours:24}") int expirationHours) {

    this.chatModelProvider = chatModelProvider;
    this.sessionStore = sessionStore;
    this.responseParser = responseParser;
    this.draftPersistenceService = draftPersistenceService;
    this.commandCenterAIService = commandCenterAIService;
    this.testAttachmentRepository = testAttachmentRepository;
    this.systemPromptService = systemPromptService;
    this.draftExpirationDuration = Duration.ofHours(expirationHours);
  }

  /** Process new user input through the AI pipeline. */
  public SmartInputResponse processInput(UUID userId, SmartInputRequest request) {
    UUID sessionId = UUID.randomUUID();
    OriginalInput originalInput = captureOriginalInput(request);

    String userPrompt = buildUserPrompt(userId, request);

    boolean hasImage =
        request.attachments() != null
            && request.attachments().stream()
                .anyMatch(a -> a.type() != null && a.type().toLowerCase().contains("image"));
    boolean hasVoice =
        request.attachments() != null
            && request.attachments().stream()
                .anyMatch(
                    a ->
                        a.type() != null
                            && (a.type().toLowerCase().contains("audio")
                                || a.type().toLowerCase().contains("voice")));

    String currentSystemPrompt = systemPromptService.getPromptForInputType(hasImage, hasVoice);
    log.debug("Using prompt for input type - hasImage: {}, hasVoice: {}", hasImage, hasVoice);

    List<Message> messages =
        List.of(new SystemMessage(currentSystemPrompt), new UserMessage(userPrompt));

    try {
      ChatResponse response = chatModelProvider.getChatModel().call(new Prompt(messages));
      String aiContent = response.getResult().getOutput().getText();

      return handleParsedResponse(sessionId, userId, aiContent, originalInput);

    } catch (Exception e) {
      log.error("AI processing failed", e);
      return createErrorResponse(sessionId, originalInput);
    }
  }

  /** Submit answers to clarification questions. */
  public SmartInputResponse submitClarificationAnswers(
      UUID userId, ClarificationAnswersRequest request) {
    ConversationSession session = sessionStore.get(request.sessionId());
    if (session == null) {
      throw new IllegalStateException("Session not found or expired: " + request.sessionId());
    }

    Draft updatedDraft =
        responseParser.applyAnswersToDraft(session.partialDraft(), request.answers());

    List<String> missingFields = responseParser.findMissingCriticalFields(updatedDraft);
    if (!missingFields.isEmpty() && session.questionCount() < MAX_QUESTIONS) {
      AIInterpretation.ClarificationFlow followUp =
          responseParser.generateFollowUpQuestions(
              updatedDraft, missingFields, session.questionCount());

      session.questionCount(session.questionCount() + followUp.questions().size());
      session.partialDraft(updatedDraft);

      return SmartInputResponse.needsClarification(
          request.sessionId(),
          session.intentType(),
          updatedDraft,
          "Please answer a few more questions to complete your "
              + session.intentType().name().toLowerCase(),
          ClarificationFlowDTO.from(followUp),
          null,
          session.originalInput());
    }

    sessionStore.remove(request.sessionId());
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

  /** Confirm alternative suggestion (e.g., Task → Challenge). */
  public SmartInputResponse confirmAlternative(UUID sessionId, boolean accepted) {
    ConversationSession session = sessionStore.get(sessionId);
    if (session == null) {
      throw new IllegalStateException("Session not found or expired");
    }

    if (accepted) {
      sessionStore.remove(sessionId);
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
      sessionStore.remove(sessionId);
      return createBasicDraftFromSession(session);
    }
  }

  /** Save the draft from a session directly as a Task with PENDING_APPROVAL status. */
  @Transactional
  public UUID saveToPending(UUID userId, UUID sessionId) {
    ConversationSession session = sessionStore.get(sessionId);
    if (session == null) {
      throw new IllegalStateException("Session not found or expired: " + sessionId);
    }

    Draft draft = session.partialDraft();
    if (draft == null) {
      throw new IllegalStateException("No draft found in session: " + sessionId);
    }

    log.info("Converting draft to task for user: {}, session: {}", userId, sessionId);

    UUID taskId = draftPersistenceService.saveDraftAsTask(userId, sessionId, draft);
    sessionStore.remove(sessionId);
    return taskId;
  }

  /** Create a Task entity directly from draft data (bypasses session lookup). */
  @Transactional
  public UUID createPendingFromDraft(
      UUID userId, app.kaiz.command_center.application.dto.CreatePendingDraftRequest request) {
    return draftPersistenceService.createFromRequest(userId, request);
  }

  // =========================================================================
  // Internal orchestration
  // =========================================================================

  private SmartInputResponse handleParsedResponse(
      UUID sessionId, UUID userId, String aiContent, OriginalInput originalInput) {
    try {
      ParsedAIResponse parsed = responseParser.parseAIResponse(aiContent);

      log.debug(
          "Parsed status='{}', intentDetected='{}'", parsed.status(), parsed.draftType().name());

      return switch (parsed.status()) {
        case "READY" ->
            SmartInputResponse.ready(
                sessionId,
                parsed.draftType(),
                parsed.confidence(),
                parsed.draft(),
                parsed.reasoning(),
                parsed.suggestions(),
                originalInput,
                Instant.now().plus(draftExpirationDuration));

        case "NEEDS_CLARIFICATION" -> {
          sessionStore.put(
              sessionId,
              new ConversationSession(
                  sessionId,
                  userId,
                  parsed.draftType(),
                  parsed.draft(),
                  originalInput,
                  parsed.clarificationFlow() != null
                      ? parsed.clarificationFlow().questions().size()
                      : 0,
                  Instant.now().plus(Duration.ofHours(1))));

          yield SmartInputResponse.needsClarification(
              sessionId,
              parsed.draftType(),
              parsed.draft(),
              parsed.reasoning(),
              parsed.clarificationFlowDTO(),
              parsed.imageAnalysis(),
              originalInput);
        }

        case "SUGGEST_ALTERNATIVE" -> {
          AIInterpretation.ClarificationFlow confirmFlow =
              responseParser.createConfirmationFlow(parsed.draftType(), parsed.alternativeReason());

          sessionStore.put(
              sessionId,
              new ConversationSession(
                  sessionId,
                  userId,
                  parsed.draftType(),
                  parsed.draft(),
                  originalInput,
                  1,
                  Instant.now().plus(Duration.ofHours(1))));

          yield SmartInputResponse.suggestAlternative(
              sessionId,
              parsed.draftType(),
              parsed.draft(),
              parsed.reasoning(),
              parsed.suggestions(),
              ClarificationFlowDTO.from(confirmFlow),
              originalInput);
        }

        default ->
            SmartInputResponse.ready(
                sessionId,
                parsed.draftType(),
                parsed.confidence(),
                parsed.draft(),
                parsed.reasoning(),
                parsed.suggestions(),
                originalInput,
                Instant.now().plus(draftExpirationDuration));
      };

    } catch (Exception e) {
      log.error("Failed to parse AI response: {}", aiContent, e);
      return createErrorResponse(sessionId, originalInput);
    }
  }

  private String buildUserPrompt(UUID userId, SmartInputRequest request) {
    StringBuilder prompt = new StringBuilder();
    prompt.append("User input: \"").append(request.text()).append("\"");

    if (request.attachments() != null && !request.attachments().isEmpty()) {
      prompt.append("\n\nAttachments:");
      for (var attachment : request.attachments()) {
        prompt.append("\n- Type: ").append(attachment.mimeType());

        String extractedText = attachment.extractedText();

        if (attachment.isTestAttachment()) {
          try {
            TestAttachment testAttachment =
                testAttachmentRepository.findById(attachment.testAttachmentId()).orElse(null);
            if (testAttachment != null && testAttachment.getFileData() != null) {
              log.info(
                  "Processing test attachment image via OCR: {}",
                  testAttachment.getAttachmentName());
              extractedText =
                  commandCenterAIService.extractTextFromImage(
                      testAttachment.getFileData(), testAttachment.getMimeType());
              log.info("OCR extracted text: {}", extractedText);
            }
          } catch (Exception e) {
            log.error("Failed to process test attachment for OCR", e);
          }
        }

        if (extractedText != null) {
          prompt.append(", Extracted text: \"").append(extractedText).append("\"");
        }
        if (attachment.metadata() != null) {
          prompt.append(", Metadata: ").append(attachment.metadata());
        }
      }
    }

    if (request.voiceTranscription() != null) {
      prompt
          .append("\n\nVoice transcription: \"")
          .append(request.voiceTranscription())
          .append("\"");
    }

    prompt.append("\n\nContext: User ID=").append(userId);
    prompt.append(", Current time=").append(Instant.now());
    prompt.append(", Timezone=").append(java.time.ZoneId.systemDefault());

    return prompt.toString();
  }

  private OriginalInput captureOriginalInput(SmartInputRequest request) {
    List<OriginalInput.AttachmentSummary> attachments =
        request.attachments() == null
            ? List.of()
            : request.attachments().stream()
                .map(
                    a ->
                        new OriginalInput.AttachmentSummary(
                            a.name(), a.type(), a.mimeType(), a.size(), a.extractedText()))
                .toList();

    return new OriginalInput(request.text(), attachments, request.voiceTranscription());
  }

  private SmartInputResponse createBasicDraftFromSession(ConversationSession session) {
    return SmartInputResponse.ready(
        session.sessionId(),
        DraftType.TASK,
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
        new Draft.NoteDraft("Quick Note", originalInput.text(), "lw-4", List.of(), List.of()),
        "I couldn't fully understand your request, but I've saved it as a note. You can edit or convert it.",
        List.of("Edit to add more details", "Convert to a different type"),
        originalInput,
        Instant.now().plus(draftExpirationDuration));
  }
}
