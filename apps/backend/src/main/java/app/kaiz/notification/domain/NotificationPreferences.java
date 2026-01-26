package app.kaiz.notification.domain;

import app.kaiz.identity.domain.User;
import app.kaiz.shared.persistence.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalTime;
import java.util.HashMap;
import java.util.Map;

@Entity
@Table(name = "notification_preferences")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class NotificationPreferences extends BaseEntity {

  @OneToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", nullable = false, unique = true)
  private User user;

  @Column(name = "push_enabled", nullable = false)
  @Builder.Default
  private boolean pushEnabled = true;

  @Column(name = "email_enabled", nullable = false)
  @Builder.Default
  private boolean emailEnabled = true;

  @Column(name = "in_app_enabled", nullable = false)
  @Builder.Default
  private boolean inAppEnabled = true;

  @Column(name = "sound_enabled", nullable = false)
  @Builder.Default
  private boolean soundEnabled = true;

  @Column(name = "vibration_enabled", nullable = false)
  @Builder.Default
  private boolean vibrationEnabled = true;

  @Column(name = "quiet_hours_enabled", nullable = false)
  @Builder.Default
  private boolean quietHoursEnabled = false;

  @Column(name = "quiet_hours_start")
  @Builder.Default
  private LocalTime quietHoursStart = LocalTime.of(22, 0);

  @Column(name = "quiet_hours_end")
  @Builder.Default
  private LocalTime quietHoursEnd = LocalTime.of(8, 0);

  @JdbcTypeCode(SqlTypes.JSON)
  @Column(name = "category_settings", columnDefinition = "jsonb")
  @Builder.Default
  private Map<String, CategoryPreference> categorySettings = new HashMap<>();

  /**
   * Get or create preference for a category.
   */
  public CategoryPreference getCategoryPreference(NotificationCategory category) {
    return categorySettings.computeIfAbsent(
        category.getId(),
        k -> CategoryPreference.defaultEnabled()
    );
  }

  /**
   * Update preference for a category.
   */
  public void setCategoryPreference(NotificationCategory category, CategoryPreference preference) {
    categorySettings.put(category.getId(), preference);
  }

  /**
   * Check if notifications are allowed for a category.
   */
  public boolean isCategoryEnabled(NotificationCategory category) {
    CategoryPreference pref = categorySettings.get(category.getId());
    return pref == null || pref.isEnabled();
  }

  /**
   * Check if push notifications are allowed for a category.
   */
  public boolean isPushEnabledForCategory(NotificationCategory category) {
    if (!pushEnabled) return false;
    CategoryPreference pref = categorySettings.get(category.getId());
    return pref == null || pref.isPush();
  }

  /**
   * Check if email notifications are allowed for a category.
   */
  public boolean isEmailEnabledForCategory(NotificationCategory category) {
    if (!emailEnabled) return false;
    CategoryPreference pref = categorySettings.get(category.getId());
    return pref == null || pref.isEmail();
  }

  /**
   * Check if currently in quiet hours.
   */
  public boolean isInQuietHours() {
    if (!quietHoursEnabled || quietHoursStart == null || quietHoursEnd == null) {
      return false;
    }
    
    LocalTime now = LocalTime.now();
    
    // Handle overnight quiet hours (e.g., 22:00 to 08:00)
    if (quietHoursStart.isAfter(quietHoursEnd)) {
      return now.isAfter(quietHoursStart) || now.isBefore(quietHoursEnd);
    }
    
    // Normal quiet hours (e.g., 14:00 to 16:00)
    return now.isAfter(quietHoursStart) && now.isBefore(quietHoursEnd);
  }

  /**
   * Create default preferences for a new user.
   */
  public static NotificationPreferences createDefault(User user) {
    Map<String, CategoryPreference> defaultSettings = new HashMap<>();
    for (NotificationCategory category : NotificationCategory.values()) {
      defaultSettings.put(category.getId(), CategoryPreference.defaultEnabled());
    }

    return NotificationPreferences.builder()
        .user(user)
        .pushEnabled(true)
        .emailEnabled(true)
        .inAppEnabled(true)
        .soundEnabled(true)
        .vibrationEnabled(true)
        .quietHoursEnabled(false)
        .quietHoursStart(LocalTime.of(22, 0))
        .quietHoursEnd(LocalTime.of(8, 0))
        .categorySettings(defaultSettings)
        .build();
  }

  /**
   * Inner class for category-specific preferences.
   */
  @Data
  @NoArgsConstructor
  @AllArgsConstructor
  @Builder
  public static class CategoryPreference {
    @Builder.Default
    private boolean enabled = true;
    @Builder.Default
    private boolean push = true;
    @Builder.Default
    private boolean email = true;
    @Builder.Default
    private boolean inApp = true;

    public static CategoryPreference defaultEnabled() {
      return CategoryPreference.builder()
          .enabled(true)
          .push(true)
          .email(true)
          .inApp(true)
          .build();
    }

    public static CategoryPreference disabled() {
      return CategoryPreference.builder()
          .enabled(false)
          .push(false)
          .email(false)
          .inApp(false)
          .build();
    }
  }
}
