package app.kaiz.admin.domain.crm;

import app.kaiz.admin.domain.AdminUser;
import app.kaiz.identity.domain.User;
import app.kaiz.shared.persistence.BaseEntity;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import lombok.*;

/** Lead entity for CRM lead management. Tracks potential customers through the sales pipeline. */
@Entity
@Table(name = "leads")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Lead extends BaseEntity {

  @Column(name = "email", nullable = false)
  private String email;

  @Column(name = "full_name")
  private String fullName;

  @Column(name = "phone")
  private String phone;

  @Column(name = "company")
  private String company;

  @Column(name = "job_title")
  private String jobTitle;

  @Enumerated(EnumType.STRING)
  @Column(name = "status", nullable = false)
  @Builder.Default
  private LeadStatus status = LeadStatus.NEW;

  @Enumerated(EnumType.STRING)
  @Column(name = "priority")
  @Builder.Default
  private LeadPriority priority = LeadPriority.MEDIUM;

  @Column(name = "source")
  private String source;

  @Enumerated(EnumType.STRING)
  @Column(name = "lifecycle_stage")
  @Builder.Default
  private LifecycleStage lifecycleStage = LifecycleStage.SUBSCRIBER;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "assigned_to")
  private AdminUser assignedTo;

  @Column(name = "lead_score")
  @Builder.Default
  private Integer leadScore = 0;

  @Column(name = "last_activity_at")
  private Instant lastActivityAt;

  @Column(name = "first_contact_at")
  private Instant firstContactAt;

  @Column(name = "converted_at")
  private Instant convertedAt;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "converted_user_id")
  private User convertedUser;

  @Column(name = "conversion_value")
  private BigDecimal conversionValue;

  @Column(name = "notes", columnDefinition = "TEXT")
  private String notes;

  @Column(name = "tags", columnDefinition = "TEXT[]")
  private String[] tags;

  @Column(name = "custom_fields", columnDefinition = "jsonb")
  private String customFields;

  @OneToMany(mappedBy = "lead", cascade = CascadeType.ALL, orphanRemoval = true)
  @Builder.Default
  private List<LeadActivity> activities = new ArrayList<>();

  @OneToMany(mappedBy = "lead", cascade = CascadeType.ALL, orphanRemoval = true)
  @Builder.Default
  private List<LeadTask> tasks = new ArrayList<>();

  // Enums
  public enum LeadStatus {
    NEW,
    CONTACTED,
    QUALIFIED,
    PROPOSAL,
    NEGOTIATION,
    WON,
    LOST,
    NURTURING
  }

  public enum LeadPriority {
    LOW,
    MEDIUM,
    HIGH,
    URGENT
  }

  public enum LifecycleStage {
    SUBSCRIBER,
    LEAD,
    MARKETING_QUALIFIED,
    SALES_QUALIFIED,
    OPPORTUNITY,
    CUSTOMER,
    EVANGELIST
  }

  // Helper methods
  public void addActivity(LeadActivity activity) {
    activities.add(activity);
    activity.setLead(this);
    this.lastActivityAt = activity.getPerformedAt();
  }

  public void addTask(LeadTask task) {
    tasks.add(task);
    task.setLead(this);
  }

  public boolean isConverted() {
    return convertedAt != null;
  }

  public void markAsConverted(User user, BigDecimal value) {
    this.convertedAt = Instant.now();
    this.convertedUser = user;
    this.conversionValue = value;
    this.status = LeadStatus.WON;
    this.lifecycleStage = LifecycleStage.CUSTOMER;
  }
}
