package com.kaiz.lifeos.admin.domain;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

@Entity
@Table(name = "about_features")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AboutFeature {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @Column(nullable = false, unique = true)
  private String slug;

  @Column(nullable = false)
  private String title;

  @Column(nullable = false)
  private String subtitle;

  @Column(columnDefinition = "TEXT", nullable = false)
  private String description;

  @Column(name = "bullet_points", columnDefinition = "jsonb")
  private String bulletPoints; // JSON array

  @Column(columnDefinition = "jsonb")
  private String example; // JSON object with scenario and outcome

  @Column(nullable = false)
  private String icon;

  @Column(nullable = false)
  private String color;

  @Column(name = "display_order", nullable = false)
  private Integer displayOrder;

  @Column(name = "is_active", nullable = false)
  private boolean active = true;

  @CreationTimestamp private Instant createdAt;

  @UpdateTimestamp private Instant updatedAt;
}
