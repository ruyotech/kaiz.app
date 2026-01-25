package com.kaiz.lifeos.challenge.domain;

import com.kaiz.lifeos.identity.domain.User;
import com.kaiz.lifeos.shared.persistence.BaseEntity;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Table(
    name = "challenge_entries",
    uniqueConstraints = @UniqueConstraint(columnNames = {"challenge_id", "user_id", "entry_date"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class ChallengeEntry extends BaseEntity {

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "challenge_id", nullable = false)
  private Challenge challenge;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", nullable = false)
  private User user;

  @Column(name = "entry_date", nullable = false)
  private LocalDate entryDate;

  @Column(name = "value_numeric", precision = 10, scale = 2)
  private BigDecimal valueNumeric;

  @Column(name = "value_boolean")
  private Boolean valueBoolean;

  @Column(name = "note", columnDefinition = "TEXT")
  private String note;
}
