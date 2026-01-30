package app.kaiz.notification.application.dto;

import app.kaiz.notification.domain.NotificationCategory;
import app.kaiz.notification.domain.NotificationPriority;
import app.kaiz.notification.domain.NotificationType;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public record NotificationDto(
    UUID id,
    NotificationType type,
    NotificationCategory category,
    NotificationPriority priority,
    String title,
    String content,
    boolean isRead,
    Instant readAt,
    boolean isPinned,
    boolean isArchived,
    String icon,
    String deepLink,
    Instant expiresAt,
    SenderDto sender,
    Map<String, Object> metadata,
    List<ActionDto> actions,
    Instant createdAt) {

  /** Sender information for the notification. */
  public record SenderDto(UUID id, String name, String avatar) {}

  /** Action button for the notification. */
  public record ActionDto(String id, String label, String action, String style) {}

  /** Unread count response. */
  public record UnreadCountDto(long total, Map<String, Long> byCategory) {
    public UnreadCountDto(long total) {
      this(total, Map.of());
    }
  }

  /** Paginated notifications response. */
  public record NotificationPageDto(
      List<NotificationDto> notifications,
      int page,
      int size,
      long totalElements,
      int totalPages,
      boolean hasNext,
      boolean hasPrevious) {}

  /** Grouped notifications by time period. */
  public record GroupedNotificationsDto(
      List<NotificationDto> today,
      List<NotificationDto> yesterday,
      List<NotificationDto> thisWeek,
      List<NotificationDto> older) {}
}
