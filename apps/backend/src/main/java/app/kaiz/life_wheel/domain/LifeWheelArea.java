package app.kaiz.life_wheel.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "life_wheel_areas")
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class LifeWheelArea {

  @Id
  @Column(name = "id", length = 10)
  private String id;

  @Column(name = "name", nullable = false, length = 100)
  private String name;

  @Column(name = "icon", nullable = false, length = 10)
  private String icon;

  @Column(name = "color", nullable = false, length = 7)
  private String color;

  @Column(name = "display_order", nullable = false)
  private int displayOrder;
}
