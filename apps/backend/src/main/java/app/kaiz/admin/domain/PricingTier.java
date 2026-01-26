package app.kaiz.admin.domain;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;
import lombok.*;

@Entity
@Table(name = "pricing_tiers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PricingTier {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @Column(nullable = false, length = 100)
  private String name;

  @Column(nullable = false, precision = 10, scale = 2)
  private BigDecimal price;

  @Column(name = "billing_period", nullable = false, length = 50)
  private String billingPeriod = "month";

  @Column(columnDefinition = "TEXT")
  private String description;

  @Column(columnDefinition = "jsonb")
  private String features = "[]";

  @Column(name = "cta_text", length = 100)
  private String ctaText = "Get Started";

  @Column(name = "cta_link", length = 500)
  private String ctaLink = "/signup";

  @Column(name = "is_popular")
  private Boolean popular = false;

  @Column(name = "is_active")
  private Boolean active = true;

  @Column(name = "display_order")
  private Integer displayOrder = 0;

  @Column(name = "created_at")
  private Instant createdAt;

  @Column(name = "updated_at")
  private Instant updatedAt;

  @Column(name = "created_by")
  private String createdBy;

  @Column(name = "updated_by")
  private String updatedBy;

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
