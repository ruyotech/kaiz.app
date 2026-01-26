package com.kaiz.lifeos.admin.domain;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

@Entity
@Table(name = "site_content")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SiteContent {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @Column(name = "content_key", nullable = false, unique = true)
  private String key; // e.g., "about_hero", "about_features", "landing_hero"

  @Column(name = "content_type", nullable = false)
  private String type; // e.g., "json", "text", "html"

  @Column(columnDefinition = "TEXT", nullable = false)
  private String content;

  @Column(name = "is_active", nullable = false)
  private boolean active = true;

  @Column(nullable = false)
  private Integer version = 1;

  @CreationTimestamp private Instant createdAt;

  @UpdateTimestamp private Instant updatedAt;

  @Column private String updatedBy;
}
