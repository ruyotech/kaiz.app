package app.kaiz.tasks.domain;

import app.kaiz.family.domain.Family;
import app.kaiz.family.domain.TaskVisibility;
import app.kaiz.identity.domain.User;
import app.kaiz.life_wheel.domain.EisenhowerQuadrant;
import app.kaiz.life_wheel.domain.LifeWheelArea;
import app.kaiz.shared.persistence.BaseEntity;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "tasks")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Task extends BaseEntity {

  @Column(name = "deleted_at")
  private Instant deletedAt;

  @Column(name = "title", nullable = false)
  private String title;

  @Column(name = "description", columnDefinition = "TEXT")
  private String description;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", nullable = false)
  private User user;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "epic_id")
  private Epic epic;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "life_wheel_area_id", nullable = false)
  private LifeWheelArea lifeWheelArea;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "eisenhower_quadrant_id", nullable = false)
  private EisenhowerQuadrant eisenhowerQuadrant;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "sprint_id")
  private Sprint sprint;

  @Column(name = "story_points", nullable = false)
  @Builder.Default
  private int storyPoints = 3;

  @Enumerated(EnumType.STRING)
  @Column(name = "status", nullable = false, length = 20)
  @Builder.Default
  private TaskStatus status = TaskStatus.TODO;

  @Column(name = "is_draft", nullable = false)
  @Builder.Default
  private boolean isDraft = false;

  @Column(name = "ai_confidence", precision = 3, scale = 2)
  private BigDecimal aiConfidence;

  @Column(name = "ai_session_id")
  private UUID aiSessionId;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "created_from_template_id")
  private TaskTemplate createdFromTemplate;

  @Column(name = "completed_at")
  private Instant completedAt;

  // ==========================================
  // Agile Carry-Over Fields
  // ==========================================

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "carried_over_from_sprint_id")
  private Sprint carriedOverFromSprint;

  @Column(name = "original_story_points")
  private Integer originalStoryPoints;

  // ==========================================
  // Family Plan Fields
  // ==========================================

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "family_id")
  private Family family;

  @Enumerated(EnumType.STRING)
  @Column(name = "visibility", length = 20)
  @Builder.Default
  private TaskVisibility visibility = TaskVisibility.PRIVATE;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "assigned_to_user_id")
  private User assignedToUser;

  @Column(name = "requires_approval", nullable = false)
  @Builder.Default
  private boolean requiresApproval = false;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "approved_by_user_id")
  private User approvedByUser;

  @Column(name = "approved_at")
  private Instant approvedAt;

  // Target date for non-recurring tasks (due date)
  @Column(name = "target_date")
  private Instant targetDate;

  // Recurring task flag and relationship
  @Column(name = "is_recurring", nullable = false)
  @Builder.Default
  private boolean isRecurring = false;

  @OneToOne(
      mappedBy = "task",
      cascade = CascadeType.ALL,
      orphanRemoval = true,
      fetch = FetchType.LAZY)
  private TaskRecurrence recurrence;

  // Task type discriminator (TASK, EVENT, BIRTHDAY)
  @Enumerated(EnumType.STRING)
  @Column(name = "task_type", nullable = false, length = 20)
  @Builder.Default
  private TaskType taskType = TaskType.TASK;

  // Alert/reminder before event time
  @Enumerated(EnumType.STRING)
  @Column(name = "alert_before", nullable = false, length = 20)
  @Builder.Default
  private AlertBefore alertBefore = AlertBefore.NONE;

  @Column(name = "location", length = 500)
  private String location;

  @Column(name = "is_all_day", nullable = false)
  @Builder.Default
  private boolean isAllDay = false;

  @Column(name = "event_start_time")
  private Instant eventStartTime;

  @Column(name = "event_end_time")
  private Instant eventEndTime;

  // Tags (many-to-many with UserTag)
  @ManyToMany(fetch = FetchType.LAZY)
  @JoinTable(
      name = "task_tags",
      joinColumns = @JoinColumn(name = "task_id"),
      inverseJoinColumns = @JoinColumn(name = "tag_id"))
  @Builder.Default
  private Set<UserTag> tags = new HashSet<>();

  // Attachments
  @OneToMany(mappedBy = "task", cascade = CascadeType.ALL, orphanRemoval = true)
  @Builder.Default
  private List<TaskAttachment> attachments = new ArrayList<>();

  @OneToMany(mappedBy = "task", cascade = CascadeType.ALL, orphanRemoval = true)
  @Builder.Default
  private List<TaskComment> comments = new ArrayList<>();

  @OneToMany(mappedBy = "task", cascade = CascadeType.ALL, orphanRemoval = true)
  @Builder.Default
  private List<TaskHistory> history = new ArrayList<>();

  @OneToMany(mappedBy = "task", cascade = CascadeType.ALL, orphanRemoval = true)
  @OrderBy("sortOrder ASC")
  @Builder.Default
  private List<TaskChecklistItem> checklistItems = new ArrayList<>();
}
