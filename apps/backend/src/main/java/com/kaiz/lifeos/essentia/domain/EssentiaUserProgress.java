package com.kaiz.lifeos.essentia.domain;

import com.kaiz.lifeos.identity.domain.User;
import com.kaiz.lifeos.shared.persistence.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "essentia_user_progress")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class EssentiaUserProgress extends BaseEntity {

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", nullable = false)
  private User user;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "book_id", nullable = false)
  private EssentiaBook book;

  @Column(name = "current_card_index")
  @Builder.Default
  private Integer currentCardIndex = 0;

  @Column(name = "is_completed")
  @Builder.Default
  private Boolean isCompleted = false;

  @Column(name = "is_favorite")
  @Builder.Default
  private Boolean isFavorite = false;
}
