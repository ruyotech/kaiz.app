package app.kaiz.command_center.domain;

import app.kaiz.identity.domain.User;
import app.kaiz.shared.persistence.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

/** Records user feedback on AI-generated drafts (approve/modify/reject). */
@Entity
@Table(name = "draft_feedback_records")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class DraftFeedbackRecord extends BaseEntity {

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "draft_id", nullable = false)
  private PendingDraft draft;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", nullable = false)
  private User user;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "session_id")
  private ConversationSession session;

  @Enumerated(EnumType.STRING)
  @Column(name = "action", nullable = false, length = 20)
  private FeedbackAction action;

  @JdbcTypeCode(SqlTypes.JSON)
  @Column(name = "original_draft_json", columnDefinition = "jsonb")
  private String originalDraftJson;

  @JdbcTypeCode(SqlTypes.JSON)
  @Column(name = "modified_draft_json", columnDefinition = "jsonb")
  private String modifiedDraftJson;

  @Column(name = "user_comment", columnDefinition = "TEXT")
  private String userComment;

  @Column(name = "time_to_decide_ms")
  private Long timeToDecideMs;

  // ── Enums ──

  public enum FeedbackAction {
    APPROVED,
    MODIFIED,
    REJECTED
  }
}
