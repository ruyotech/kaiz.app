package app.kaiz.tasks.domain;

import app.kaiz.identity.domain.User;
import app.kaiz.life_wheel.domain.EisenhowerQuadrant;
import app.kaiz.life_wheel.domain.LifeWheelArea;
import app.kaiz.shared.persistence.BaseEntity;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
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

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "created_from_template_id")
  private TaskTemplate createdFromTemplate;

  @Column(name = "completed_at")
  private Instant completedAt;

  @OneToMany(mappedBy = "task", cascade = CascadeType.ALL, orphanRemoval = true)
  @Builder.Default
  private List<TaskComment> comments = new ArrayList<>();

  @OneToMany(mappedBy = "task", cascade = CascadeType.ALL, orphanRemoval = true)
  @Builder.Default
  private List<TaskHistory> history = new ArrayList<>();
}
