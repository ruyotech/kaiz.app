package com.kaiz.lifeos.mindset.domain;

import com.kaiz.lifeos.shared.persistence.BaseEntity;
import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "mindset_themes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class MindsetTheme extends BaseEntity {

  @Column(name = "name", nullable = false, length = 100)
  private String name;

  @Column(name = "background_color", length = 20)
  private String backgroundColor;

  @Column(name = "text_color", length = 20)
  private String textColor;

  @Column(name = "accent_color", length = 20)
  private String accentColor;

  @ElementCollection
  @CollectionTable(name = "mindset_theme_gradient_colors", joinColumns = @JoinColumn(name = "mindset_theme_id"))
  @Column(name = "color")
  @OrderColumn(name = "sort_order")
  @Builder.Default
  private List<String> gradientColors = new ArrayList<>();

  @Column(name = "default_asset", length = 500)
  private String defaultAsset;
}
