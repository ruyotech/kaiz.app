package app.kaiz.sensai.domain;

import app.kaiz.identity.domain.User;
import app.kaiz.shared.persistence.BaseEntity;
import jakarta.persistence.*;
import java.time.Instant;
import lombok.*;
import lombok.experimental.SuperBuilder;

/** Represents a sprint ceremony instance. Tracks planning, review, and retrospective sessions. */
@Entity
@Table(name = "sensai_ceremonies")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class SprintCeremony extends BaseEntity {

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", nullable = false)
  private User user;

  @Column(name = "sprint_id", nullable = false)
  private String sprintId;

  @Enumerated(EnumType.STRING)
  @Column(name = "ceremony_type", nullable = false, length = 20)
  private CeremonyType ceremonyType;

  @Enumerated(EnumType.STRING)
  @Column(name = "status", nullable = false, length = 20)
  @Builder.Default
  private CeremonyStatus status = CeremonyStatus.SCHEDULED;

  @Column(name = "scheduled_at")
  private Instant scheduledAt;

  @Column(name = "started_at")
  private Instant startedAt;

  @Column(name = "completed_at")
  private Instant completedAt;

  @Column(name = "duration_minutes")
  private Integer durationMinutes;

  @Column(name = "notes", columnDefinition = "TEXT")
  private String notes;

  @Column(name = "outcomes", columnDefinition = "TEXT")
  private String outcomes; // JSON string with ceremony outcomes

  @Column(name = "action_items", columnDefinition = "TEXT")
  private String actionItems; // JSON array of action items

  @Column(name = "coach_summary", columnDefinition = "TEXT")
  private String coachSummary;
}
