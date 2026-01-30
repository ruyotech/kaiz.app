package app.kaiz.sensai.domain;

import app.kaiz.identity.domain.User;
import app.kaiz.shared.persistence.BaseEntity;
import jakarta.persistence.*;
import java.math.BigDecimal;
import lombok.*;
import lombok.experimental.SuperBuilder;

/** User-specific settings for SensAI coach. */
@Entity
@Table(name = "sensai_settings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class SensAISettings extends BaseEntity {

  @OneToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", nullable = false, unique = true)
  private User user;

  @Enumerated(EnumType.STRING)
  @Column(name = "coach_tone", nullable = false, length = 20)
  @Builder.Default
  private CoachTone coachTone = CoachTone.DIRECT;

  @Column(name = "interventions_enabled", nullable = false)
  @Builder.Default
  private boolean interventionsEnabled = true;

  @Column(name = "daily_standup_time", length = 5)
  @Builder.Default
  private String dailyStandupTime = "09:00"; // HH:mm format

  @Column(name = "sprint_length_days", nullable = false)
  @Builder.Default
  private int sprintLengthDays = 14;

  @Column(name = "max_daily_capacity", nullable = false)
  @Builder.Default
  private int maxDailyCapacity = 8;

  @Column(name = "overcommit_threshold", precision = 4, scale = 2, nullable = false)
  @Builder.Default
  private BigDecimal overcommitThreshold = new BigDecimal("0.15"); // 15%

  @Column(name = "dimension_alert_threshold", nullable = false)
  @Builder.Default
  private int dimensionAlertThreshold = 5;

  @Column(name = "dimension_priorities", columnDefinition = "TEXT")
  private String dimensionPriorities; // JSON object

  @Column(name = "standup_reminders_enabled", nullable = false)
  @Builder.Default
  private boolean standupRemindersEnabled = true;

  @Column(name = "ceremony_reminders_enabled", nullable = false)
  @Builder.Default
  private boolean ceremonyRemindersEnabled = true;

  @Column(name = "weekly_digest_enabled", nullable = false)
  @Builder.Default
  private boolean weeklyDigestEnabled = true;
}
