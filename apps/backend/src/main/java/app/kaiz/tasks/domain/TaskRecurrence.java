package app.kaiz.tasks.domain;

import app.kaiz.shared.persistence.BaseEntity;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalTime;
import lombok.*;
import lombok.experimental.SuperBuilder;

/**
 * Entity representing recurrence settings for a recurring task. This is a separate table to keep
 * recurring task logic modular.
 */
@Entity
@Table(name = "task_recurrences")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class TaskRecurrence extends BaseEntity {

  @OneToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "task_id", nullable = false, unique = true)
  private Task task;

  @Enumerated(EnumType.STRING)
  @Column(name = "frequency", nullable = false, length = 20)
  private RecurrenceFrequency frequency;

  @Column(name = "interval_value", nullable = false)
  @Builder.Default
  private int intervalValue = 1;

  @Column(name = "start_date", nullable = false)
  private LocalDate startDate;

  @Column(name = "end_date")
  private LocalDate endDate;

  /** Day of week for weekly recurrence (0-6, Sunday-Saturday) */
  @Column(name = "day_of_week")
  private Integer dayOfWeek;

  /** Day of month for monthly recurrence (1-31) */
  @Column(name = "day_of_month")
  private Integer dayOfMonth;

  /** Specific date for yearly recurrence */
  @Column(name = "yearly_date")
  private LocalDate yearlyDate;

  /** Time of day for the recurring task */
  @Column(name = "scheduled_time")
  private LocalTime scheduledTime;

  /** Last date when a task instance was generated from this recurrence */
  @Column(name = "last_generated_date")
  private LocalDate lastGeneratedDate;

  /** Whether this recurrence is still active */
  @Column(name = "is_active", nullable = false)
  @Builder.Default
  private boolean isActive = true;
}
