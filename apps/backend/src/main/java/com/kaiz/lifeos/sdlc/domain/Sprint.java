package com.kaiz.lifeos.sdlc.domain;

import jakarta.persistence.*;
import java.time.Instant;
import java.time.LocalDate;
import lombok.*;

@Entity
@Table(name = "sprints")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Sprint {

  @Id
  @Column(name = "id", length = 20)
  private String id;

  @Column(name = "week_number", nullable = false)
  private int weekNumber;

  @Column(name = "year", nullable = false)
  private int year;

  @Column(name = "start_date", nullable = false)
  private LocalDate startDate;

  @Column(name = "end_date", nullable = false)
  private LocalDate endDate;

  @Convert(converter = SprintStatusConverter.class)
  @Column(name = "status", nullable = false, length = 20)
  @Builder.Default
  private SprintStatus status = SprintStatus.PLANNED;

  @Column(name = "total_points", nullable = false)
  @Builder.Default
  private int totalPoints = 0;

  @Column(name = "completed_points", nullable = false)
  @Builder.Default
  private int completedPoints = 0;

  @Column(name = "created_at", nullable = false, updatable = false)
  private Instant createdAt;

  @Column(name = "updated_at", nullable = false)
  private Instant updatedAt;

  @PrePersist
  protected void onCreate() {
    createdAt = Instant.now();
    updatedAt = Instant.now();
  }

  @PreUpdate
  protected void onUpdate() {
    updatedAt = Instant.now();
  }
}
