package app.kaiz.command_center.infrastructure;

import app.kaiz.command_center.domain.DraftStatus;
import app.kaiz.command_center.domain.PendingDraft;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface PendingDraftRepository extends JpaRepository<PendingDraft, UUID> {

    /**
     * Find all pending drafts for a user.
     */
    List<PendingDraft> findByUserIdAndStatusOrderByCreatedAtDesc(UUID userId, DraftStatus status);

    /**
     * Find all pending drafts for a user (not expired).
     */
    @Query("""
        SELECT pd FROM PendingDraft pd
        WHERE pd.user.id = :userId
        AND pd.status = :status
        AND (pd.expiresAt IS NULL OR pd.expiresAt > :now)
        ORDER BY pd.createdAt DESC
        """)
    List<PendingDraft> findActivePendingDrafts(
            @Param("userId") UUID userId,
            @Param("status") DraftStatus status,
            @Param("now") Instant now);

    /**
     * Find a specific draft by ID and user.
     */
    Optional<PendingDraft> findByIdAndUserId(UUID id, UUID userId);

    /**
     * Count pending drafts for a user.
     */
    long countByUserIdAndStatus(UUID userId, DraftStatus status);

    /**
     * Expire old drafts.
     */
    @Modifying
    @Query("""
        UPDATE PendingDraft pd
        SET pd.status = 'EXPIRED'
        WHERE pd.status = 'PENDING_APPROVAL'
        AND pd.expiresAt < :now
        """)
    int expireOldDrafts(@Param("now") Instant now);

    /**
     * Delete old processed drafts (cleanup).
     */
    @Modifying
    @Query("""
        DELETE FROM PendingDraft pd
        WHERE pd.status IN ('APPROVED', 'REJECTED', 'EXPIRED')
        AND pd.createdAt < :cutoffDate
        """)
    int deleteOldProcessedDrafts(@Param("cutoffDate") Instant cutoffDate);
}
