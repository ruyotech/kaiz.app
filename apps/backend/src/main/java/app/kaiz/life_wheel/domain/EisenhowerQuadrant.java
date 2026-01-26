package app.kaiz.life_wheel.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "eisenhower_quadrants")
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class EisenhowerQuadrant {

  @Id
  @Column(name = "id", length = 10)
  private String id;

  @Column(name = "name", nullable = false, length = 100)
  private String name;

  @Column(name = "label", nullable = false, length = 50)
  private String label;

  @Column(name = "description")
  private String description;

  @Column(name = "color", nullable = false, length = 7)
  private String color;

  @Column(name = "display_order", nullable = false)
  private int displayOrder;
}
