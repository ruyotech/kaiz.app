package app.kaiz.sensai.domain;

import app.kaiz.identity.domain.User;
import app.kaiz.shared.persistence.BaseEntity;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import lombok.*;
import lombok.experimental.SuperBuilder;

/**
 * Tracks velocity metrics per sprint for a user. Stores committed points, completed points, and
 * related calculations.
 */
@Entity
@Table(name = "sensai_velocity_records")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class VelocityRecord extends BaseEntity {

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", nullable = false)
  private User user;

  @Column(name = "sprint_id", nullable = false)
  private String sprintId;

  @Column(name = "sprint_start_date", nullable = false)
  private LocalDate sprintStartDate;

  @Column(name = "sprint_end_date", nullable = false)
  private LocalDate sprintEndDate;

  @Column(name = "committed_points", nullable = false)
  @Builder.Default
  private int committedPoints = 0;

  @Column(name = "completed_points", nullable = false)
  @Builder.Default
  private int completedPoints = 0;

  @Column(name = "carried_over_points", nullable = false)
  @Builder.Default
  private int carriedOverPoints = 0;

  @Column(name = "added_mid_sprint", nullable = false)
  @Builder.Default
  private int addedMidSprint = 0;

  @Column(name = "completion_rate", precision = 5, scale = 2)
  private BigDecimal completionRate;

  @Column(name = "focus_factor", precision = 5, scale = 2)
  private BigDecimal focusFactor;

  @Column(name = "is_overcommitted", nullable = false)
  @Builder.Default
  private boolean isOvercommitted = false;

  @Column(name = "overcommit_percentage", precision = 5, scale = 2)
  private BigDecimal overcommitPercentage;

  @Column(name = "dimension_distribution", columnDefinition = "TEXT")
  private String dimensionDistribution; // JSON object with points per dimension

  @Column(name = "committed_at")
  private Instant committedAt;

  @Column(name = "sprint_goal", columnDefinition = "TEXT")
  private String sprintGoal;
}
