package app.kaiz.mindset.domain;

import app.kaiz.life_wheel.domain.LifeWheelArea;
import app.kaiz.shared.persistence.BaseEntity;
import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "mindset_contents")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class MindsetContent extends BaseEntity {

  @Column(name = "body", nullable = false, columnDefinition = "TEXT")
  private String body;

  @Column(name = "author", length = 200)
  private String author;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "life_wheel_area_id")
  private LifeWheelArea lifeWheelArea;

  @Column(name = "dimension_tag", length = 50)
  private String dimensionTag;

  @ElementCollection(fetch = FetchType.LAZY)
  @CollectionTable(
      name = "mindset_content_tags",
      joinColumns = @JoinColumn(name = "mindset_content_id"))
  @Column(name = "tag")
  @Builder.Default
  private List<String> secondaryTags = new ArrayList<>();

  @Column(name = "theme_preset", length = 50)
  private String themePreset;

  @Column(name = "intervention_weight")
  @Builder.Default
  private Integer interventionWeight = 50;

  @Enumerated(EnumType.STRING)
  @Column(name = "emotional_tone", length = 20)
  @Builder.Default
  private EmotionalTone emotionalTone = EmotionalTone.MOTIVATIONAL;

  @Column(name = "dwell_time_ms")
  @Builder.Default
  private Integer dwellTimeMs = 4000;

  @Column(name = "is_favorite")
  @Builder.Default
  private Boolean isFavorite = false;
}
