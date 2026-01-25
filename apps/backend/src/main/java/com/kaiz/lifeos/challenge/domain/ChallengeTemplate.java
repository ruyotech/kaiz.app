package com.kaiz.lifeos.challenge.domain;

import com.kaiz.lifeos.lifewheel.domain.LifeWheelArea;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import lombok.*;

@Entity
@Table(name = "challenge_templates")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChallengeTemplate {

  @Id
  @Column(name = "id", length = 50)
  private String id;

  @Column(name = "name", nullable = false)
  private String name;

  @Column(name = "description", columnDefinition = "TEXT")
  private String description;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "life_wheel_area_id")
  private LifeWheelArea lifeWheelArea;

  @Enumerated(EnumType.STRING)
  @Column(name = "metric_type", nullable = false, length = 20)
  private MetricType metricType;

  @Column(name = "target_value", nullable = false, precision = 10, scale = 2)
  private BigDecimal targetValue;

  @Column(name = "unit", length = 50)
  private String unit;

  @Column(name = "suggested_duration", nullable = false)
  @Builder.Default
  private int suggestedDuration = 30;

  @Enumerated(EnumType.STRING)
  @Column(name = "recurrence", nullable = false, length = 20)
  @Builder.Default
  private Recurrence recurrence = Recurrence.DAILY;

  @Enumerated(EnumType.STRING)
  @Column(name = "difficulty", nullable = false, length = 20)
  @Builder.Default
  private Difficulty difficulty = Difficulty.MEDIUM;

  @Column(name = "popularity_score", nullable = false)
  @Builder.Default
  private int popularityScore = 0;

  @Column(name = "created_at", nullable = false, updatable = false)
  private Instant createdAt;

  @PrePersist
  protected void onCreate() {
    createdAt = Instant.now();
  }
}
