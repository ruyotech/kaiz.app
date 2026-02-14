package app.kaiz.command_center.application;

import app.kaiz.command_center.domain.ConversationMessage;
import app.kaiz.command_center.domain.ConversationMessage.MessageRole;
import app.kaiz.command_center.domain.ConversationSession;
import app.kaiz.command_center.domain.ConversationSession.ChatMode;
import app.kaiz.command_center.domain.ConversationSession.SessionStatus;
import app.kaiz.command_center.infrastructure.ConversationMessageRepository;
import app.kaiz.command_center.infrastructure.ConversationSessionRepository;
import app.kaiz.identity.domain.User;
import app.kaiz.identity.infrastructure.UserRepository;
import app.kaiz.shared.exception.ResourceNotFoundException;
import java.time.DayOfWeek;
import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Manages persistent conversation sessions backed by PostgreSQL. Enforces conversation rules:
 *
 * <ul>
 *   <li>One planning session per Sunday
 *   <li>One standup per day
 *   <li>20-message window for freeform conversations (auto-rotates)
 *   <li>Ceremony-mode sessions auto-close when ceremony ends
 * </ul>
 *
 * <p>Migrated from in-memory ConcurrentHashMap to DB-backed persistence in Phase 7.
 */
@Component
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class ConversationManager {

  private static final int MAX_FREEFORM_MESSAGES = 20;

  private final ConversationSessionRepository sessionRepository;
  private final ConversationMessageRepository messageRepository;
  private final UserRepository userRepository;

  /**
   * Get or create a session for the given user and mode.
   *
   * @param userId the current user
   * @param mode the detected chat mode (uppercase string matching ChatMode enum)
   * @return an existing or new session
   */
  @Transactional
  public ConversationSession getOrCreateSession(UUID userId, String mode) {
    ChatMode chatMode = ChatMode.valueOf(mode);

    // Look for existing active session of this mode
    Optional<ConversationSession> activeSession =
        sessionRepository.findByUserIdAndModeAndStatus(userId, chatMode, SessionStatus.ACTIVE);

    if (activeSession.isPresent()) {
      ConversationSession existing = activeSession.get();

      // Check message limit for freeform — auto-rotate
      if (chatMode == ChatMode.FREEFORM && existing.getMessageCount() >= MAX_FREEFORM_MESSAGES) {
        log.info(
            "Freeform session hit {}-message limit for userId={}, rotating",
            MAX_FREEFORM_MESSAGES,
            userId);
        existing.close();
        sessionRepository.save(existing);
        return createNewSession(userId, chatMode);
      }

      return existing;
    }

    log.info("Creating new {} session for userId={}", mode, userId);
    return createNewSession(userId, chatMode);
  }

  /**
   * Check if a session can accept a new message (enforces rules).
   *
   * @param userId the current user
   * @param mode the requested mode
   * @return null if allowed, or a human-readable denial reason
   */
  public String checkSessionRules(UUID userId, String mode) {
    return switch (mode) {
      case "STANDUP" -> checkStandupRule(userId);
      case "PLANNING" -> checkPlanningRule(userId);
      default -> null;
    };
  }

  /** Close a session (e.g., when a ceremony ends). */
  @Transactional
  public void closeSession(UUID userId, String mode) {
    ChatMode chatMode = ChatMode.valueOf(mode);
    sessionRepository
        .findByUserIdAndModeAndStatus(userId, chatMode, SessionStatus.ACTIVE)
        .ifPresent(
            session -> {
              session.close();
              sessionRepository.save(session);
              log.info("Closed {} session for userId={}", mode, userId);
            });
  }

  /**
   * Record a conversation turn: saves user message and AI response as separate
   * ConversationMessages.
   */
  @Transactional
  public void addTurn(
      ConversationSession session, String userMessage, String aiResponse, String intent) {
    int nextSeq = messageRepository.findMaxSequenceNumber(session.getId()) + 1;

    // Save user message
    ConversationMessage userMsg =
        ConversationMessage.builder()
            .session(session)
            .role(MessageRole.USER)
            .content(userMessage)
            .intent(intent)
            .sequenceNumber(nextSeq)
            .build();
    messageRepository.save(userMsg);

    // Save assistant response
    ConversationMessage assistantMsg =
        ConversationMessage.builder()
            .session(session)
            .role(MessageRole.ASSISTANT)
            .content(aiResponse)
            .sequenceNumber(nextSeq + 1)
            .build();
    messageRepository.save(assistantMsg);

    // Update session counters
    session.addMessage();
    session.addMessage();
    sessionRepository.save(session);
  }

  /**
   * Get the recent conversation history for prompt injection.
   *
   * @param sessionId the session ID
   * @param limit max number of messages to return
   * @return recent messages (oldest first)
   */
  public List<ConversationMessage> getRecentHistory(UUID sessionId, int limit) {
    List<ConversationMessage> recent =
        messageRepository.findRecentMessages(sessionId, PageRequest.of(0, limit));
    // Reverse to get oldest-first order
    return recent.reversed();
  }

  /** Expire stale sessions every 30 minutes. */
  @Scheduled(fixedRate = 1_800_000, zone = "UTC")
  @Transactional
  public void cleanupExpiredSessions() {
    Instant now = Instant.now();
    Instant cutoff = now.minusSeconds(2 * 3600); // 2-hour TTL
    int expired = sessionRepository.expireStaleSessions(now, cutoff);
    if (expired > 0) {
      log.info("Expired {} stale conversation sessions", expired);
    }
  }

  // ── Helpers ──

  private ConversationSession createNewSession(UUID userId, ChatMode mode) {
    User user =
        userRepository
            .findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User", userId.toString()));

    ConversationSession session =
        ConversationSession.builder().user(user).mode(mode).status(SessionStatus.ACTIVE).build();

    return sessionRepository.save(session);
  }

  private String checkStandupRule(UUID userId) {
    // Check for any closed standup session today
    List<ConversationSession> recentSessions =
        sessionRepository.findTop20ByUserIdOrderByLastMessageAtDesc(userId);

    LocalDate today = LocalDate.now();
    boolean alreadyCompleted =
        recentSessions.stream()
            .filter(s -> s.getMode() == ChatMode.STANDUP)
            .filter(s -> s.getStatus() == SessionStatus.CLOSED)
            .anyMatch(
                s ->
                    s.getStartedAt() != null
                        && s.getStartedAt()
                            .atZone(java.time.ZoneId.systemDefault())
                            .toLocalDate()
                            .equals(today));

    if (alreadyCompleted) {
      return "You've already completed today's standup. Come back tomorrow morning!";
    }
    return null;
  }

  private String checkPlanningRule(UUID userId) {
    if (LocalDate.now().getDayOfWeek() != DayOfWeek.SUNDAY) {
      log.debug("Planning session started on non-Sunday for userId={}", userId);
    }

    // Check for any closed planning session this week
    List<ConversationSession> recentSessions =
        sessionRepository.findTop20ByUserIdOrderByLastMessageAtDesc(userId);

    LocalDate thisSunday =
        LocalDate.now().getDayOfWeek() == DayOfWeek.SUNDAY
            ? LocalDate.now()
            : LocalDate.now().with(TemporalAdjusters.nextOrSame(DayOfWeek.SUNDAY));

    LocalDate weekStart = thisSunday.minusDays(6);

    boolean alreadyCompleted =
        recentSessions.stream()
            .filter(s -> s.getMode() == ChatMode.PLANNING)
            .filter(s -> s.getStatus() == SessionStatus.CLOSED)
            .anyMatch(
                s ->
                    s.getStartedAt() != null
                        && !s.getStartedAt()
                            .atZone(java.time.ZoneId.systemDefault())
                            .toLocalDate()
                            .isBefore(weekStart));

    if (alreadyCompleted) {
      return "You've already completed this week's planning session.";
    }
    return null;
  }
}
