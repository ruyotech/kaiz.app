package com.kaiz.lifeos.commandcenter.domain;

import com.kaiz.lifeos.identity.domain.User;
import com.kaiz.lifeos.shared.persistence.BaseEntity;
import jakarta.persistence.*;
import java.time.Instant;
import lombok.*;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

/**
 * Entity to persist AI-generated drafts pending user approval.
 * Uses JSON column to store the draft content polymorphically.
 */
@Entity
@Table(name = "command_center_drafts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class PendingDraft extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "draft_type", nullable = false, length = 30)
    private DraftType draftType;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    @Builder.Default
    private DraftStatus status = DraftStatus.PENDING_APPROVAL;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "draft_content", nullable = false, columnDefinition = "jsonb")
    private Draft draftContent;

    @Column(name = "confidence_score", nullable = false)
    private double confidenceScore;

    @Column(name = "ai_reasoning", columnDefinition = "TEXT")
    private String aiReasoning;

    @Column(name = "original_input_text", columnDefinition = "TEXT")
    private String originalInputText;

    @Column(name = "voice_transcription", columnDefinition = "TEXT")
    private String voiceTranscription;

    @Column(name = "attachment_count")
    @Builder.Default
    private int attachmentCount = 0;

    @Column(name = "processed_at")
    private Instant processedAt;

    @Column(name = "approved_at")
    private Instant approvedAt;

    @Column(name = "created_entity_id")
    private String createdEntityId;

    @Column(name = "expires_at")
    private Instant expiresAt;

    /**
     * Mark this draft as approved and record the created entity ID.
     */
    public void approve(String entityId) {
        this.status = DraftStatus.APPROVED;
        this.approvedAt = Instant.now();
        this.createdEntityId = entityId;
    }

    /**
     * Mark this draft as rejected.
     */
    public void reject() {
        this.status = DraftStatus.REJECTED;
    }

    /**
     * Mark this draft as modified (user edited before accepting).
     */
    public void markModified(String entityId) {
        this.status = DraftStatus.MODIFIED;
        this.approvedAt = Instant.now();
        this.createdEntityId = entityId;
    }

    /**
     * Check if this draft has expired.
     */
    public boolean isExpired() {
        return expiresAt != null && Instant.now().isAfter(expiresAt);
    }
}
