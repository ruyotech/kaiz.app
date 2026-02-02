package app.kaiz.admin.domain.crm;

import app.kaiz.admin.domain.AdminUser;
import app.kaiz.shared.persistence.BaseEntity;
import jakarta.persistence.*;
import java.time.Instant;
import lombok.*;

/** Tracks interactions and activities with a lead. */
@Entity
@Table(name = "lead_activities")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LeadActivity extends BaseEntity {

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "lead_id", nullable = false)
  private Lead lead;

  @Enumerated(EnumType.STRING)
  @Column(name = "activity_type", nullable = false)
  private ActivityType activityType;

  @Column(name = "title", nullable = false)
  private String title;

  @Column(name = "description", columnDefinition = "TEXT")
  private String description;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "performed_by")
  private AdminUser performedBy;

  @Column(name = "metadata", columnDefinition = "jsonb")
  private String metadata;

  @Column(name = "performed_at")
  @Builder.Default
  private Instant performedAt = Instant.now();

  public enum ActivityType {
    CALL,
    EMAIL,
    MEETING,
    NOTE,
    TASK,
    STATUS_CHANGE,
    DEMO,
    FOLLOW_UP,
    OTHER
  }
}
