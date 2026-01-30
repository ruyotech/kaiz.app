package app.kaiz.sensai.domain;

import app.kaiz.identity.domain.User;
import app.kaiz.shared.persistence.BaseEntity;
import jakarta.persistence.*;
import java.time.Instant;
import java.time.LocalDate;
import lombok.*;
import lombok.experimental.SuperBuilder;

/**
 * Represents a daily standup record for a user. Tracks what was done yesterday, planned for today,
 * and any blockers.
 */
@Entity
@Table(name = "sensai_standups")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class DailyStandup extends BaseEntity {

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", nullable = false)
  private User user;

  @Column(name = "standup_date", nullable = false)
  private LocalDate standupDate;

  @Column(name = "yesterday_summary", columnDefinition = "TEXT")
  private String yesterdaySummary;

  @Column(name = "today_plan", columnDefinition = "TEXT")
  private String todayPlan;

  @Column(name = "blockers", columnDefinition = "TEXT")
  private String blockers;

  @Column(name = "mood_score")
  private Integer moodScore;

  @Column(name = "energy_level")
  private Integer energyLevel;

  @Column(name = "completed_at")
  private Instant completedAt;

  @Column(name = "coach_response", columnDefinition = "TEXT")
  private String coachResponse;

  @Column(name = "is_skipped", nullable = false)
  @Builder.Default
  private boolean isSkipped = false;

  @Column(name = "skip_reason")
  private String skipReason;
}
