package app.kaiz.tasks.domain;

import app.kaiz.family.domain.Family;
import app.kaiz.family.domain.TaskVisibility;
import app.kaiz.identity.domain.User;
import app.kaiz.life_wheel.domain.LifeWheelArea;
import app.kaiz.shared.persistence.BaseEntity;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "epics")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Epic extends BaseEntity {

  @Column(name = "title", nullable = false)
  private String title;

  @Column(name = "description", columnDefinition = "TEXT")
  private String description;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", nullable = false)
  private User user;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "life_wheel_area_id", nullable = false)
  private LifeWheelArea lifeWheelArea;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "target_sprint_id")
  private Sprint targetSprint;

  @Enumerated(EnumType.STRING)
  @Column(name = "status", nullable = false, length = 20)
  @Builder.Default
  private EpicStatus status = EpicStatus.PLANNING;

  @Column(name = "total_points", nullable = false)
  @Builder.Default
  private int totalPoints = 0;

  @Column(name = "completed_points", nullable = false)
  @Builder.Default
  private int completedPoints = 0;

  @Column(name = "color", nullable = false, length = 7)
  @Builder.Default
  private String color = "#3B82F6";

  @Column(name = "icon", length = 50)
  private String icon;

  @Column(name = "start_date")
  private Instant startDate;

  @Column(name = "end_date")
  private Instant endDate;

  @OneToMany(mappedBy = "epic", cascade = CascadeType.ALL)
  @Builder.Default
  private List<Task> tasks = new ArrayList<>();

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
}
