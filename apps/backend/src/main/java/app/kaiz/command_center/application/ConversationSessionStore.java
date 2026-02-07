package app.kaiz.command_center.application;

import app.kaiz.command_center.application.dto.SmartInputResponse.OriginalInput;
import app.kaiz.command_center.domain.Draft;
import app.kaiz.command_center.domain.DraftType;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Thread-safe in-memory session storage for multi-turn AI conversations. Isolates mutable state
 * from business logic. Ready to swap to Redis for horizontal scaling.
 */
@Component
@Slf4j
public class ConversationSessionStore {

  private final Map<UUID, ConversationSession> sessions = new ConcurrentHashMap<>();

  /** Cleanup expired sessions every 15 minutes. Prevents memory leak from abandoned sessions. */
  @Scheduled(fixedRate = 900_000, zone = "UTC")
  public void cleanupExpiredSessions() {
    int before = sessions.size();
    Instant now = Instant.now();
    sessions.entrySet().removeIf(entry -> entry.getValue().expiresAt().isBefore(now));
    int removed = before - sessions.size();
    if (removed > 0) {
      log.info("Cleaned up {} expired AI sessions, {} remaining", removed, sessions.size());
    }
  }

  public ConversationSession get(UUID sessionId) {
    return sessions.get(sessionId);
  }

  public void put(UUID sessionId, ConversationSession session) {
    sessions.put(sessionId, session);
  }

  public void remove(UUID sessionId) {
    sessions.remove(sessionId);
  }

  public int size() {
    return sessions.size();
  }

  /** Mutable session state for multi-turn AI conversations. */
  public static class ConversationSession {
    private final UUID sessionId;
    private final UUID userId;
    private DraftType intentType;
    private Draft partialDraft;
    private final OriginalInput originalInput;
    private int questionCount;
    private final Instant expiresAt;

    public ConversationSession(
        UUID sessionId,
        UUID userId,
        DraftType intentType,
        Draft partialDraft,
        OriginalInput originalInput,
        int questionCount,
        Instant expiresAt) {
      this.sessionId = sessionId;
      this.userId = userId;
      this.intentType = intentType;
      this.partialDraft = partialDraft;
      this.originalInput = originalInput;
      this.questionCount = questionCount;
      this.expiresAt = expiresAt;
    }

    public UUID sessionId() {
      return sessionId;
    }

    public UUID userId() {
      return userId;
    }

    public DraftType intentType() {
      return intentType;
    }

    public Draft partialDraft() {
      return partialDraft;
    }

    public OriginalInput originalInput() {
      return originalInput;
    }

    public int questionCount() {
      return questionCount;
    }

    public Instant expiresAt() {
      return expiresAt;
    }

    public void intentType(DraftType type) {
      this.intentType = type;
    }

    public void partialDraft(Draft draft) {
      this.partialDraft = draft;
    }

    public void questionCount(int count) {
      this.questionCount = count;
    }
  }
}
