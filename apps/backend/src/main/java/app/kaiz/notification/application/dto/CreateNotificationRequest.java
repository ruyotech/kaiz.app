package app.kaiz.notification.application.dto;

import app.kaiz.notification.domain.NotificationCategory;
import app.kaiz.notification.domain.NotificationPriority;
import app.kaiz.notification.domain.NotificationType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/** Request DTO for creating a new notification. */
public record CreateNotificationRequest(
    @NotNull(message = "User ID is required") UUID userId,
    @NotNull(message = "Notification type is required") NotificationType type,
    NotificationCategory category,
    NotificationPriority priority,
    @NotBlank(message = "Title is required")
        @Size(max = 255, message = "Title must be less than 255 characters")
        String title,
    @Size(max = 2000, message = "Content must be less than 2000 characters") String content,
    String icon,
    String deepLink,
    Instant expiresAt,
    UUID senderId,
    String senderName,
    String senderAvatar,
    Map<String, Object> metadata,
    List<ActionRequest> actions) {
  /** Action button request. */
  public record ActionRequest(String id, String label, String action, String style) {}
}
