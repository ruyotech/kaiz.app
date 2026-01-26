package com.kaiz.lifeos.admin.domain;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

@Entity
@Table(name = "testimonials")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Testimonial {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @Column(nullable = false)
  private String name;

  @Column(nullable = false)
  private String role;

  @Column private String company;

  @Column(name = "avatar_url")
  private String avatarUrl;

  @Column(columnDefinition = "TEXT", nullable = false)
  private String quote;

  @Column(nullable = false)
  private Integer rating; // 1-5

  @Column(columnDefinition = "TEXT")
  private String metrics; // JSON object with label, before, after

  @Column(name = "is_featured", nullable = false)
  private boolean featured = false;

  @Column(name = "display_order", nullable = false)
  private Integer displayOrder;

  @Column(name = "is_active", nullable = false)
  private boolean active = true;

  @CreationTimestamp private Instant createdAt;

  @UpdateTimestamp private Instant updatedAt;
}
