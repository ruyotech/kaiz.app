package app.kaiz.command_center.domain;

import app.kaiz.identity.domain.User;
import app.kaiz.shared.persistence.BaseEntity;
import jakarta.persistence.*;
import java.time.LocalTime;
import lombok.*;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

/** User-specific coaching preferences, learned from feedback and explicit settings. */
@Entity
@Table(name = "user_coach_preferences")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class UserCoachPreference extends BaseEntity {

  @OneToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", nullable = false, unique = true)
  private User user;

  @Enumerated(EnumType.STRING)
  @Column(name = "preferred_tone", nullable = false, length = 20)
  @Builder.Default
  private CoachTone preferredTone = CoachTone.DIRECT;

  @Enumerated(EnumType.STRING)
  @Column(name = "default_mode", nullable = false, length = 30)
  @Builder.Default
  private ConversationSession.ChatMode defaultMode = ConversationSession.ChatMode.FREEFORM;

  @JdbcTypeCode(SqlTypes.JSON)
  @Column(name = "correction_patterns", columnDefinition = "jsonb")
  @Builder.Default
  private String correctionPatterns = "[]";

  @JdbcTypeCode(SqlTypes.JSON)
  @Column(name = "preferred_categories", columnDefinition = "jsonb")
  @Builder.Default
  private String preferredCategories = "[]";

  @Column(name = "auto_approve_above")
  @Builder.Default
  private double autoApproveAbove = 0.95;

  @Column(name = "morning_standup_time")
  @Builder.Default
  private LocalTime morningStandupTime = LocalTime.of(9, 0);

  @Column(name = "planning_day", length = 10)
  @Builder.Default
  private String planningDay = "SUNDAY";

  @Column(name = "total_interactions", nullable = false)
  @Builder.Default
  private int totalInteractions = 0;

  @Column(name = "total_drafts_approved", nullable = false)
  @Builder.Default
  private int totalDraftsApproved = 0;

  @Column(name = "total_drafts_modified", nullable = false)
  @Builder.Default
  private int totalDraftsModified = 0;

  @Column(name = "total_drafts_rejected", nullable = false)
  @Builder.Default
  private int totalDraftsRejected = 0;

  // ── Business methods ──

  public void recordApproval() {
    this.totalDraftsApproved++;
    this.totalInteractions++;
  }

  public void recordModification() {
    this.totalDraftsModified++;
    this.totalInteractions++;
  }

  public void recordRejection() {
    this.totalDraftsRejected++;
    this.totalInteractions++;
  }

  // ── Enums ──

  public enum CoachTone {
    SUPPORTIVE,
    DIRECT,
    CHALLENGING
  }
}
