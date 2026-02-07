package app.kaiz.mindset.domain;

import app.kaiz.identity.domain.User;
import app.kaiz.shared.persistence.BaseEntity;
import jakarta.persistence.*;
import java.time.Instant;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Table(
    name = "user_mindset_favorites",
    uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "content_id"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class UserMindsetFavorite extends BaseEntity {

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", nullable = false)
  private User user;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "content_id", nullable = false)
  private MindsetContent content;

  @Column(name = "note", columnDefinition = "TEXT")
  private String note;

  @Column(name = "saved_at", nullable = false)
  @Builder.Default
  private Instant savedAt = Instant.now();
}
