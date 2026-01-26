package app.kaiz.notification.application.dto;

import java.time.LocalTime;
import java.util.Map;

/**
 * Response DTO for notification preferences.
 */
public record NotificationPreferencesDto(
    boolean pushEnabled,
    boolean emailEnabled,
    boolean inAppEnabled,
    boolean soundEnabled,
    boolean vibrationEnabled,
    boolean quietHoursEnabled,
    LocalTime quietHoursStart,
    LocalTime quietHoursEnd,
    Map<String, CategoryPreferenceDto> categorySettings
) {
  /**
   * Category preference response.
   */
  public record CategoryPreferenceDto(
      boolean enabled,
      boolean push,
      boolean email,
      boolean inApp
  ) {}
}
