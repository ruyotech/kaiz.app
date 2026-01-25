package com.kaiz.lifeos.challenge.domain;

import com.kaiz.lifeos.identity.domain.User;
import com.kaiz.lifeos.lifewheel.domain.LifeWheelArea;
import com.kaiz.lifeos.shared.persistence.BaseEntity;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "challenges")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Challenge extends BaseEntity {

  @Column(name = "name", nullable = false)
  private String name;

  @Column(name = "description", columnDefinition = "TEXT")
  private String description;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", nullable = false)
  private User user;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "life_wheel_area_id", nullable = false)
  private LifeWheelArea lifeWheelArea;

  @Enumerated(EnumType.STRING)
  @Column(name = "metric_type", nullable = false, length = 20)
  private MetricType metricType;

  @Column(name = "target_value", nullable = false, precision = 10, scale = 2)
  private BigDecimal targetValue;

  @Column(name = "unit", length = 50)
  private String unit;

  @Column(name = "duration", nullable = false)
  @Builder.Default
  private int duration = 30;

  @Enumerated(EnumType.STRING)
  @Column(name = "recurrence", nullable = false, length = 20)
  @Builder.Default
  private Recurrence recurrence = Recurrence.DAILY;

  @Enumerated(EnumType.STRING)
  @Column(name = "status", nullable = false, length = 20)
  @Builder.Default
  private ChallengeStatus status = ChallengeStatus.DRAFT;

  @Column(name = "start_date")
  private Instant startDate;

  @Column(name = "end_date")
  private Instant endDate;

  @Column(name = "why_statement", columnDefinition = "TEXT")
  private String whyStatement;

  @Column(name = "reward_description", columnDefinition = "TEXT")
  private String rewardDescription;

  @Column(name = "grace_days", nullable = false)
  @Builder.Default
  private int graceDays = 0;

  @Column(name = "current_streak", nullable = false)
  @Builder.Default
  private int currentStreak = 0;

  @Column(name = "best_streak", nullable = false)
  @Builder.Default
  private int bestStreak = 0;

  @Enumerated(EnumType.STRING)
  @Column(name = "challenge_type", nullable = false, length = 20)
  @Builder.Default
  private ChallengeType challengeType = ChallengeType.SOLO;

  @Enumerated(EnumType.STRING)
  @Column(name = "visibility", nullable = false, length = 20)
  @Builder.Default
  private Visibility visibility = Visibility.PRIVATE;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "created_from_template_id")
  private ChallengeTemplate createdFromTemplate;

  @OneToMany(mappedBy = "challenge", cascade = CascadeType.ALL, orphanRemoval = true)
  @Builder.Default
  private List<ChallengeParticipant> participants = new ArrayList<>();

  @OneToMany(mappedBy = "challenge", cascade = CascadeType.ALL, orphanRemoval = true)
  @Builder.Default
  private List<ChallengeEntry> entries = new ArrayList<>();
}
