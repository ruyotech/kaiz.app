package app.kaiz.tasks.domain;

import app.kaiz.identity.domain.User;
import app.kaiz.shared.persistence.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

/**
 * Entity representing a user's personal tag for a template. This allows users to add their own tags
 * to any template (including global ones) without modifying the template itself.
 */
@Entity
@Table(
    name = "user_template_tags",
    uniqueConstraints = {@UniqueConstraint(columnNames = {"user_id", "template_id", "tag"})})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class UserTemplateTag extends BaseEntity {

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", nullable = false)
  private User user;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "template_id", nullable = false)
  private TaskTemplate template;

  @Column(name = "tag", nullable = false, length = 100)
  private String tag;
}
