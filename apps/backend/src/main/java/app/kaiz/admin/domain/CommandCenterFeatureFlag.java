package app.kaiz.admin.domain;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

/** Feature flags for Command Center features. Allows gradual rollout and beta testing. */
@Entity
@Table(name = "command_center_feature_flags")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommandCenterFeatureFlag {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @Column(name = "flag_key", nullable = false, unique = true)
  private String flagKey;

  @Column(name = "flag_name", nullable = false)
  private String flagName;

  @Column(name = "description", columnDefinition = "TEXT")
  private String description;

  @Column(name = "is_enabled")
  private boolean enabled;

  @Column(name = "rollout_percentage")
  private Integer rolloutPercentage;

  @JdbcTypeCode(SqlTypes.JSON)
  @Column(name = "allowed_user_ids", columnDefinition = "jsonb")
  private String allowedUserIds;

  @JdbcTypeCode(SqlTypes.JSON)
  @Column(name = "metadata", columnDefinition = "jsonb")
  private String metadata;

  @CreationTimestamp
  @Column(name = "created_at")
  private Instant createdAt;

  @UpdateTimestamp
  @Column(name = "updated_at")
  private Instant updatedAt;

  @Column(name = "created_by")
  private String createdBy;

  @Column(name = "updated_by")
  private String updatedBy;
}
