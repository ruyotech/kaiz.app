package app.kaiz.sensai.domain;

import app.kaiz.identity.domain.User;
import app.kaiz.shared.persistence.BaseEntity;
import jakarta.persistence.*;
import java.time.OffsetDateTime;
import lombok.*;
import lombok.experimental.SuperBuilder;

/**
 * Tracks Life Wheel metrics per dimension for a user. Stores score, trend, and activity data for
 * each life wheel area.
 */
@Entity
@Table(
    name = "sensai_lifewheel_metrics",
    uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "life_wheel_area_id"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class LifeWheelMetric extends BaseEntity {

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", nullable = false)
  private User user;

  @Column(name = "life_wheel_area_id", nullable = false, length = 10)
  private String lifeWheelAreaId;

  @Column(name = "score", nullable = false)
  @Builder.Default
  private int score = 5;

  @Column(name = "trend", length = 10)
  @Builder.Default
  private String trend = "stable";

  @Column(name = "last_activity_at")
  private OffsetDateTime lastActivityAt;

  @Column(name = "tasks_completed")
  @Builder.Default
  private int tasksCompleted = 0;

  @Column(name = "points_earned")
  @Builder.Default
  private int pointsEarned = 0;

  /** Check if this dimension is neglected (score below 3 or no recent activity) */
  public boolean isNeglected() {
    if (score < 3) return true;
    if (lastActivityAt == null) return true;
    // Neglected if no activity in last 14 days
    return lastActivityAt.isBefore(OffsetDateTime.now().minusDays(14));
  }

  /** Update the score and recalculate trend */
  public void updateScore(int newScore, String newTrend) {
    this.score = Math.max(0, Math.min(10, newScore));
    this.trend = newTrend;
  }

  /** Record activity in this dimension */
  public void recordActivity(int points) {
    this.tasksCompleted++;
    this.pointsEarned += points;
    this.lastActivityAt = OffsetDateTime.now();
  }
}
