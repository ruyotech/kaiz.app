package app.kaiz.command_center.infrastructure;

import app.kaiz.command_center.domain.DraftFeedbackRecord;
import app.kaiz.command_center.domain.DraftFeedbackRecord.FeedbackAction;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/** Repository for draft feedback records (approve/modify/reject tracking). */
@Repository
public interface DraftFeedbackRecordRepository extends JpaRepository<DraftFeedbackRecord, UUID> {

  /** Get all feedback for a specific draft. */
  List<DraftFeedbackRecord> findByDraftIdOrderByCreatedAtDesc(UUID draftId);

  /** Get recent feedback for a user. */
  List<DraftFeedbackRecord> findTop50ByUserIdOrderByCreatedAtDesc(UUID userId);

  /** Count feedback by action type for a user. */
  long countByUserIdAndAction(UUID userId, FeedbackAction action);

  /** Get feedback within a date range for analytics. */
  @Query(
      "SELECT f FROM DraftFeedbackRecord f WHERE f.user.id = :userId "
          + "AND f.createdAt BETWEEN :from AND :to ORDER BY f.createdAt DESC")
  List<DraftFeedbackRecord> findByUserIdAndDateRange(
      @Param("userId") UUID userId, @Param("from") Instant from, @Param("to") Instant to);

  /** Get modification feedback for learning patterns. */
  @Query(
      "SELECT f FROM DraftFeedbackRecord f WHERE f.user.id = :userId "
          + "AND f.action = 'MODIFIED' ORDER BY f.createdAt DESC")
  List<DraftFeedbackRecord> findModificationsByUser(@Param("userId") UUID userId);
}
