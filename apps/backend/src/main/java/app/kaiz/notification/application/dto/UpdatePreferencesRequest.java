package app.kaiz.notification.application.dto;

import jakarta.validation.constraints.Size;
import java.time.LocalTime;
import java.util.Map;

/** Request DTO for updating notification preferences. */
public record UpdatePreferencesRequest(
    Boolean pushEnabled,
    Boolean emailEnabled,
    Boolean inAppEnabled,
    Boolean soundEnabled,
    Boolean vibrationEnabled,
    Boolean quietHoursEnabled,
    LocalTime quietHoursStart,
    LocalTime quietHoursEnd,
    @Size(max = 20, message = "Cannot update more than 20 categories at once")
        Map<String, CategoryPreferenceRequest> categorySettings) {
  /** Category preference request. */
  public record CategoryPreferenceRequest(
      Boolean enabled, Boolean push, Boolean email, Boolean inApp) {}
}
