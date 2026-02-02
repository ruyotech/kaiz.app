package app.kaiz.admin.domain.crm;

import app.kaiz.admin.domain.AdminUser;
import app.kaiz.shared.persistence.BaseEntity;
import jakarta.persistence.*;
import java.time.Instant;
import lombok.*;

/** Task/follow-up reminder for a lead. */
@Entity
@Table(name = "lead_tasks")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LeadTask extends BaseEntity {

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "lead_id", nullable = false)
  private Lead lead;

  @Column(name = "title", nullable = false)
  private String title;

  @Column(name = "description", columnDefinition = "TEXT")
  private String description;

  @Enumerated(EnumType.STRING)
  @Column(name = "task_type")
  @Builder.Default
  private TaskType taskType = TaskType.FOLLOW_UP;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "assigned_to")
  private AdminUser assignedTo;

  @Column(name = "due_date")
  private Instant dueDate;

  @Column(name = "is_completed")
  @Builder.Default
  private Boolean isCompleted = false;

  @Column(name = "completed_at")
  private Instant completedAt;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "completed_by")
  private AdminUser completedBy;

  @Enumerated(EnumType.STRING)
  @Column(name = "priority")
  @Builder.Default
  private Lead.LeadPriority priority = Lead.LeadPriority.MEDIUM;

  public enum TaskType {
    CALL,
    EMAIL,
    MEETING,
    FOLLOW_UP,
    DEMO,
    OTHER
  }

  public void complete(AdminUser completedBy) {
    this.isCompleted = true;
    this.completedAt = Instant.now();
    this.completedBy = completedBy;
  }
}
