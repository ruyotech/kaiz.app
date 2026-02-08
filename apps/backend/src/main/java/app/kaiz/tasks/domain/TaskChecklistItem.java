package app.kaiz.tasks.domain;

import app.kaiz.shared.persistence.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "task_checklist_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class TaskChecklistItem extends BaseEntity {

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "task_id", nullable = false)
  private Task task;

  @Column(name = "text", nullable = false, length = 500)
  private String text;

  @Column(name = "completed", nullable = false)
  @Builder.Default
  private boolean completed = false;

  @Column(name = "sort_order", nullable = false)
  @Builder.Default
  private int sortOrder = 0;
}
