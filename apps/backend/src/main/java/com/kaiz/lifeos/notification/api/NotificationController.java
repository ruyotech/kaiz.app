package com.kaiz.lifeos.notification.api;

import com.kaiz.lifeos.notification.application.NotificationService;
import com.kaiz.lifeos.notification.application.dto.NotificationDto;
import com.kaiz.lifeos.shared.security.CurrentUser;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Notifications", description = "Notification management endpoints")
public class NotificationController {

  private final NotificationService notificationService;

  @GetMapping
  @Operation(
      summary = "Get all notifications",
      description = "Retrieve paginated notifications for the current user")
  public ResponseEntity<Page<NotificationDto>> getNotifications(
      @CurrentUser UUID userId, @PageableDefault(size = 20) Pageable pageable) {
    return ResponseEntity.ok(notificationService.getNotificationsByUserId(userId, pageable));
  }

  @GetMapping("/unread")
  @Operation(
      summary = "Get unread notifications",
      description = "Retrieve all unread notifications for the current user")
  public ResponseEntity<List<NotificationDto>> getUnreadNotifications(@CurrentUser UUID userId) {
    return ResponseEntity.ok(notificationService.getUnreadNotifications(userId));
  }

  @GetMapping("/unread-count")
  @Operation(
      summary = "Get unread count",
      description = "Get the count of unread notifications for the current user")
  public ResponseEntity<NotificationDto.UnreadCountDto> getUnreadCount(@CurrentUser UUID userId) {
    long count = notificationService.getUnreadCount(userId);
    return ResponseEntity.ok(new NotificationDto.UnreadCountDto(count));
  }

  @PutMapping("/{id}/read")
  @Operation(summary = "Mark as read", description = "Mark a specific notification as read")
  public ResponseEntity<NotificationDto> markAsRead(
      @CurrentUser UUID userId, @PathVariable UUID id) {
    return ResponseEntity.ok(notificationService.markAsRead(userId, id));
  }

  @PutMapping("/read-all")
  @Operation(summary = "Mark all as read", description = "Mark all notifications as read")
  public ResponseEntity<Void> markAllAsRead(@CurrentUser UUID userId) {
    notificationService.markAllAsRead(userId);
    return ResponseEntity.noContent().build();
  }
}
