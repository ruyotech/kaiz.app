package app.kaiz.command_center.infrastructure;

import app.kaiz.command_center.domain.ConversationSession;
import app.kaiz.command_center.domain.ConversationSession.ChatMode;
import app.kaiz.command_center.domain.ConversationSession.SessionStatus;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/** Repository for conversation session persistence. */
@Repository
public interface ConversationSessionRepository extends JpaRepository<ConversationSession, UUID> {

  /** Find the active session for a user in a given mode. */
  Optional<ConversationSession> findByUserIdAndModeAndStatus(
      UUID userId, ChatMode mode, SessionStatus status);

  /** Find all active sessions for a user. */
  List<ConversationSession> findByUserIdAndStatusOrderByLastMessageAtDesc(
      UUID userId, SessionStatus status);

  /** Find recent sessions for a user (any status). */
  List<ConversationSession> findTop20ByUserIdOrderByLastMessageAtDesc(UUID userId);

  /** Find sessions linked to a ceremony. */
  Optional<ConversationSession> findByCeremonyIdAndStatus(UUID ceremonyId, SessionStatus status);

  /** Expire stale sessions older than cutoff. */
  @Modifying
  @Query(
      "UPDATE ConversationSession s SET s.status = 'EXPIRED', s.endedAt = :now "
          + "WHERE s.status = 'ACTIVE' AND s.lastMessageAt < :cutoff")
  int expireStaleSessions(@Param("now") Instant now, @Param("cutoff") Instant cutoff);
}
