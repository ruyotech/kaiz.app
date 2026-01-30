package app.kaiz.sensai.domain;

import app.kaiz.identity.domain.User;
import app.kaiz.shared.persistence.BaseEntity;
import jakarta.persistence.*;
import java.time.Instant;
import lombok.*;
import lombok.experimental.SuperBuilder;

/**
 * Represents a coach intervention triggered by the AI system. Interventions are proactive guidance
 * based on user behavior and metrics.
 */
@Entity
@Table(name = "sensai_interventions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Intervention extends BaseEntity {

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", nullable = false)
  private User user;

  @Enumerated(EnumType.STRING)
  @Column(name = "intervention_type", nullable = false, length = 30)
  private InterventionType interventionType;

  @Enumerated(EnumType.STRING)
  @Column(name = "urgency", nullable = false, length = 20)
  @Builder.Default
  private InterventionUrgency urgency = InterventionUrgency.MEDIUM;

  @Column(name = "title", nullable = false)
  private String title;

  @Column(name = "message", columnDefinition = "TEXT", nullable = false)
  private String message;

  @Column(name = "action_suggestion", columnDefinition = "TEXT")
  private String actionSuggestion;

  @Column(name = "data_context", columnDefinition = "TEXT")
  private String dataContext; // JSON string with intervention-specific data

  @Column(name = "triggered_at", nullable = false)
  private Instant triggeredAt;

  @Column(name = "acknowledged_at")
  private Instant acknowledgedAt;

  @Column(name = "action_taken", columnDefinition = "TEXT")
  private String actionTaken;

  @Column(name = "dismissed_at")
  private Instant dismissedAt;

  @Column(name = "dismiss_reason")
  private String dismissReason;

  @Column(name = "is_active", nullable = false)
  @Builder.Default
  private boolean isActive = true;

  @Column(name = "related_sprint_id")
  private String relatedSprintId;

  @Column(name = "related_dimension")
  private String relatedDimension;
}
