package app.kaiz.command_center.infrastructure;

import app.kaiz.command_center.domain.ConversationMessage;
import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/** Repository for conversation messages. */
@Repository
public interface ConversationMessageRepository extends JpaRepository<ConversationMessage, UUID> {

  /** Get all messages for a session ordered by sequence. */
  List<ConversationMessage> findBySessionIdOrderBySequenceNumber(UUID sessionId);

  /** Get the last N messages for a session (for prompt context). */
  @Query(
      "SELECT m FROM ConversationMessage m WHERE m.session.id = :sessionId "
          + "ORDER BY m.sequenceNumber DESC")
  List<ConversationMessage> findRecentMessages(
      @Param("sessionId") UUID sessionId, Pageable pageable);

  /** Count messages in a session. */
  long countBySessionId(UUID sessionId);

  /** Get the max sequence number in a session. */
  @Query(
      "SELECT COALESCE(MAX(m.sequenceNumber), 0) FROM ConversationMessage m "
          + "WHERE m.session.id = :sessionId")
  int findMaxSequenceNumber(@Param("sessionId") UUID sessionId);
}
