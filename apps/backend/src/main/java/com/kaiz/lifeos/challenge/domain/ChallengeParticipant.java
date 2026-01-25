package com.kaiz.lifeos.challenge.domain;

import com.kaiz.lifeos.identity.domain.User;
import com.kaiz.lifeos.shared.persistence.BaseEntity;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Table(
    name = "challenge_participants",
    uniqueConstraints = @UniqueConstraint(columnNames = {"challenge_id", "user_id"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class ChallengeParticipant extends BaseEntity {

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "challenge_id", nullable = false)
  private Challenge challenge;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", nullable = false)
  private User user;

  @Column(name = "joined_at", nullable = false)
  @Builder.Default
  private Instant joinedAt = Instant.now();

  @Column(name = "current_progress", nullable = false, precision = 10, scale = 2)
  @Builder.Default
  private BigDecimal currentProgress = BigDecimal.ZERO;

  @Column(name = "streak_days", nullable = false)
  @Builder.Default
  private int streakDays = 0;

  @Column(name = "is_accountability_partner", nullable = false)
  @Builder.Default
  private boolean isAccountabilityPartner = false;
}
