package app.kaiz.admin.domain;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

/** Command Center settings for various configurations. */
@Entity
@Table(name = "command_center_settings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommandCenterSetting {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @Column(name = "setting_key", nullable = false, unique = true)
  private String settingKey;

  @Column(name = "setting_value", columnDefinition = "TEXT")
  private String settingValue;

  @Column(name = "setting_type", nullable = false)
  @Enumerated(EnumType.STRING)
  private SettingType settingType;

  @Column(name = "description", columnDefinition = "TEXT")
  private String description;

  @Column(name = "is_secret")
  private boolean secret;

  @Column(name = "is_active")
  private boolean active;

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

  public enum SettingType {
    TEXT,
    JSON,
    SECRET,
    NUMBER,
    BOOLEAN
  }
}
