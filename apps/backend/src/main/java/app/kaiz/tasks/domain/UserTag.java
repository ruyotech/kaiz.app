package app.kaiz.tasks.domain;

import app.kaiz.identity.domain.User;
import app.kaiz.shared.persistence.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

/**
 * Entity representing a user's personal tag. Tags can be used for both tasks and templates at the
 * user level.
 */
@Entity
@Table(
    name = "user_tags",
    uniqueConstraints = {@UniqueConstraint(columnNames = {"user_id", "name"})})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class UserTag extends BaseEntity {

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", nullable = false)
  private User user;

  @Column(name = "name", nullable = false, length = 100)
  private String name;

  @Column(name = "color", length = 7)
  @Builder.Default
  private String color = "#6B7280";

  @Column(name = "usage_count", nullable = false)
  @Builder.Default
  private int usageCount = 0;

  /** Increment usage count when tag is applied to a task or template */
  public void incrementUsage() {
    this.usageCount++;
  }

  /** Decrement usage count when tag is removed */
  public void decrementUsage() {
    if (this.usageCount > 0) {
      this.usageCount--;
    }
  }
}
