package app.kaiz.command_center.application;

import app.kaiz.command_center.application.DraftExtractor.ExtractionResult;
import app.kaiz.command_center.application.InputNormalizer.NormalizedInput;
import app.kaiz.command_center.application.IntentClassifier.Intent;
import app.kaiz.command_center.domain.ConversationMessage;
import app.kaiz.command_center.domain.ConversationSession;
import app.kaiz.command_center.domain.DraftStatus;
import app.kaiz.command_center.domain.DraftType;
import app.kaiz.command_center.domain.PendingDraft;
import app.kaiz.command_center.infrastructure.PendingDraftRepository;
import app.kaiz.identity.domain.User;
import app.kaiz.identity.infrastructure.UserRepository;
import app.kaiz.shared.exception.BadRequestException;
import app.kaiz.shared.exception.ResourceNotFoundException;
import app.kaiz.tasks.application.SprintService;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.messages.Message;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * The main orchestrator for the Donyor Scrum Master chat pipeline. Wires together all Phase 5
 * components in a deterministic pipeline:
 *
 * <pre>
 * Input → Normalize → Detect Mode → Check Rules → Classify Intent
 *       → Assemble Context → Assemble Prompt → LLM Call → Extract Drafts
 *       → Save Drafts → Return Response
 * </pre>
 *
 * <p>This service replaces the ad-hoc processing in {@code CommandCenterAIService} with a
 * structured pipeline. The existing services continue to work for backward compatibility.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class CommandCenterOrchestrator {

  private final InputNormalizer inputNormalizer;
  private final ModeDetector modeDetector;
  private final IntentClassifier intentClassifier;
  private final ContextAssembler contextAssembler;
  private final PromptAssembler promptAssembler;
  private final LlmGateway llmGateway;
  private final DraftExtractor draftExtractor;
  private final ConversationManager conversationManager;
  private final PendingDraftRepository draftRepository;
  private final UserRepository userRepository;
  private final SprintService sprintService;

  /** Response from the orchestrated pipeline. */
  public record OrchestratedResponse(
      String sessionId,
      String mode,
      String intent,
      String conversationalText,
      List<DraftSummary> drafts,
      boolean sessionClosed,
      String denialReason) {

    public static OrchestratedResponse denied(String reason) {
      return new OrchestratedResponse(null, null, null, reason, List.of(), false, reason);
    }
  }

  /** Summary of a saved draft for the response. */
  public record DraftSummary(UUID draftId, DraftType type, double confidence, String reasoning) {}

  /**
   * Process a user message through the full pipeline.
   *
   * @param userId the authenticated user
   * @param rawInput the raw text input
   * @param explicitMode optional explicit mode override (may be null)
   * @return the orchestrated response
   */
  @Transactional
  public OrchestratedResponse process(UUID userId, String rawInput, String explicitMode) {
    long startTime = System.currentTimeMillis();
    log.info(
        "Pipeline start: userId={}, inputLength={}",
        userId,
        rawInput != null ? rawInput.length() : 0);

    // 1. Normalize input
    NormalizedInput normalized = inputNormalizer.normalizeText(rawInput);
    if (normalized.text().isBlank()) {
      throw new BadRequestException("Message cannot be empty");
    }

    // 2. Resolve active sprint
    String activeSprintId = resolveActiveSprintId(userId);

    // 3. Detect mode
    String mode = modeDetector.detect(userId, normalized.text(), explicitMode, activeSprintId);

    // 4. Check session rules (standup limit, planning limit, etc.)
    String denial = conversationManager.checkSessionRules(userId, mode);
    if (denial != null) {
      log.info("Session rule denied: mode={}, userId={}, reason={}", mode, userId, denial);
      return OrchestratedResponse.denied(denial);
    }

    // 5. Classify intent
    Intent intent = intentClassifier.classify(normalized.text(), mode);

    // 6. Get or create conversation session
    ConversationSession session = conversationManager.getOrCreateSession(userId, mode);

    // 7. Assemble context
    Map<String, String> context = contextAssembler.assemble(mode, userId, activeSprintId);

    // Inject recent conversation history into context
    List<ConversationMessage> history = conversationManager.getRecentHistory(session.getId(), 10);
    if (!history.isEmpty()) {
      StringBuilder historyText = new StringBuilder();
      for (ConversationMessage msg : history) {
        String role = msg.getRole() == ConversationMessage.MessageRole.USER ? "User" : "Assistant";
        historyText.append(role).append(": ").append(msg.getContent()).append("\n");
      }
      context.put("conversation_history", historyText.toString());
    }

    // 8. Assemble prompt
    Message systemMessage = promptAssembler.assembleSystemMessage(mode, context);
    Message userMessage =
        promptAssembler.assembleUserMessage(normalized.text(), normalized.attachmentInfo());

    // 9. Call LLM
    String llmResponse = llmGateway.call(systemMessage, userMessage);

    // 10. Extract drafts
    ExtractionResult extraction = draftExtractor.extract(llmResponse);

    // 11. Save drafts to DB
    User user =
        userRepository
            .findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User", userId.toString()));
    List<DraftSummary> savedDrafts = saveDrafts(user, extraction, normalized.text());

    // 12. Record conversation turn
    conversationManager.addTurn(
        session, normalized.text(), extraction.conversationalText(), intent.name());

    long elapsed = System.currentTimeMillis() - startTime;
    log.info(
        "Pipeline complete: userId={}, mode={}, intent={}, drafts={}, elapsed={}ms",
        userId,
        mode,
        intent,
        savedDrafts.size(),
        elapsed);

    return new OrchestratedResponse(
        session.getId().toString(),
        mode,
        intent.name(),
        extraction.conversationalText(),
        savedDrafts,
        false,
        null);
  }

  /** Close a session (e.g., user explicitly ends a ceremony). */
  public void closeSession(UUID userId, String mode) {
    conversationManager.closeSession(userId, mode);
  }

  // ── Helpers ──

  private String resolveActiveSprintId(UUID userId) {
    try {
      var activeSprint = sprintService.getCurrentSprint();
      return activeSprint != null ? activeSprint.id() : null;
    } catch (Exception e) {
      log.warn("Could not resolve active sprint: {}", e.getMessage());
      return null;
    }
  }

  private List<DraftSummary> saveDrafts(
      User user, ExtractionResult extraction, String originalInput) {
    if (!extraction.hasDrafts()) {
      return List.of();
    }

    return extraction.drafts().stream()
        .map(
            extracted -> {
              PendingDraft draft =
                  PendingDraft.builder()
                      .user(user)
                      .draftType(extracted.type())
                      .status(DraftStatus.PENDING_APPROVAL)
                      .draftContent(extracted.draft())
                      .confidenceScore(extracted.confidence())
                      .aiReasoning(extracted.reasoning())
                      .originalInputText(originalInput)
                      .expiresAt(Instant.now().plus(24, ChronoUnit.HOURS))
                      .build();
              PendingDraft saved = draftRepository.save(draft);
              log.info(
                  "Saved draft: id={}, type={}, confidence={}",
                  saved.getId(),
                  saved.getDraftType(),
                  saved.getConfidenceScore());
              return new DraftSummary(
                  saved.getId(),
                  saved.getDraftType(),
                  saved.getConfidenceScore(),
                  saved.getAiReasoning());
            })
        .toList();
  }
}
