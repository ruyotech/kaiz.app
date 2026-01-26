package app.kaiz.tasks.domain;

import app.kaiz.identity.domain.User;
import app.kaiz.shared.persistence.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "task_history")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class TaskHistory extends BaseEntity {

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "task_id", nullable = false)
  private Task task;

  @Column(name = "field_name", nullable = false, length = 50)
  private String fieldName;

  @Column(name = "old_value", columnDefinition = "TEXT")
  private String oldValue;

  @Column(name = "new_value", columnDefinition = "TEXT")
  private String newValue;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "changed_by_user_id")
  private User changedByUser;
}
