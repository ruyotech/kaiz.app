package app.kaiz.tasks.domain;

import app.kaiz.identity.domain.User;
import app.kaiz.life_wheel.domain.EisenhowerQuadrant;
import app.kaiz.life_wheel.domain.LifeWheelArea;
import app.kaiz.shared.persistence.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "task_templates")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class TaskTemplate extends BaseEntity {

  @Column(name = "name", nullable = false)
  private String name;

  @Column(name = "description", columnDefinition = "TEXT")
  private String description;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", nullable = false)
  private User user;

  @Column(name = "default_story_points", nullable = false)
  @Builder.Default
  private int defaultStoryPoints = 3;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "default_life_wheel_area_id")
  private LifeWheelArea defaultLifeWheelArea;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "default_eisenhower_quadrant_id")
  private EisenhowerQuadrant defaultEisenhowerQuadrant;
}
