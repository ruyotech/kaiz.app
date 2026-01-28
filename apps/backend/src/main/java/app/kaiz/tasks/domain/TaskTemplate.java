package app.kaiz.tasks.domain;

import app.kaiz.identity.domain.User;
import app.kaiz.life_wheel.domain.EisenhowerQuadrant;
import app.kaiz.life_wheel.domain.LifeWheelArea;
import app.kaiz.shared.persistence.BaseEntity;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
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

  // Template type: task or event
  @Enumerated(EnumType.STRING)
  @Column(name = "type", nullable = false, length = 10)
  @Builder.Default
  private TemplateType type = TemplateType.TASK;

  // Nullable for system templates (global)
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id")
  private User user;

  // Creator type: system (admin-created global) or user (user-created personal)
  @Enumerated(EnumType.STRING)
  @Column(name = "creator_type", nullable = false, length = 10)
  @Builder.Default
  private CreatorType creatorType = CreatorType.USER;

  // Task defaults
  @Column(name = "default_story_points", nullable = false)
  @Builder.Default
  private int defaultStoryPoints = 3;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "default_life_wheel_area_id")
  private LifeWheelArea defaultLifeWheelArea;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "default_eisenhower_quadrant_id")
  private EisenhowerQuadrant defaultEisenhowerQuadrant;

  // Event defaults
  @Column(name = "default_duration")
  private Integer defaultDuration; // minutes

  @Column(name = "default_location", length = 500)
  private String defaultLocation;

  @Column(name = "is_all_day", nullable = false)
  @Builder.Default
  private boolean isAllDay = false;

  @Column(name = "default_attendees", columnDefinition = "TEXT[]")
  @Builder.Default
  private String[] defaultAttendees = new String[0];

  // Recurrence settings
  @Column(name = "is_recurring", nullable = false)
  @Builder.Default
  private boolean isRecurring = false;

  @Enumerated(EnumType.STRING)
  @Column(name = "recurrence_frequency", length = 20)
  private RecurrenceFrequency recurrenceFrequency;

  @Column(name = "recurrence_interval")
  @Builder.Default
  private Integer recurrenceInterval = 1;

  @Column(name = "recurrence_end_date")
  private LocalDate recurrenceEndDate;

  // Sprint placement suggestion
  @Enumerated(EnumType.STRING)
  @Column(name = "suggested_sprint", nullable = false, length = 20)
  @Builder.Default
  private SuggestedSprint suggestedSprint = SuggestedSprint.BACKLOG;

  // Community metrics
  @Column(name = "rating", precision = 2, scale = 1, nullable = false)
  @Builder.Default
  private BigDecimal rating = BigDecimal.ZERO;

  @Column(name = "rating_count", nullable = false)
  @Builder.Default
  private int ratingCount = 0;

  @Column(name = "usage_count", nullable = false)
  @Builder.Default
  private int usageCount = 0;

  // Display customization
  @Column(name = "icon", length = 50)
  @Builder.Default
  private String icon = "📋";

  @Column(name = "color", length = 7)
  @Builder.Default
  private String color = "#3B82F6";

  // Custom tags using ElementCollection (creates task_template_tags table)
  @ElementCollection(fetch = FetchType.LAZY)
  @CollectionTable(name = "task_template_tags", joinColumns = @JoinColumn(name = "template_id"))
  @Column(name = "tag", length = 100)
  @Builder.Default
  private List<String> tags = new ArrayList<>();

  // Favorites relationship (mapped by TemplateFavorite)
  @OneToMany(mappedBy = "template", cascade = CascadeType.ALL, orphanRemoval = true)
  @Builder.Default
  private List<TemplateFavorite> favorites = new ArrayList<>();

  // Ratings relationship (mapped by TemplateRating)
  @OneToMany(mappedBy = "template", cascade = CascadeType.ALL, orphanRemoval = true)
  @Builder.Default
  private List<TemplateRating> ratings = new ArrayList<>();

  // Helper method to check if this is a global template
  public boolean isGlobal() {
    return creatorType == CreatorType.SYSTEM;
  }
}
