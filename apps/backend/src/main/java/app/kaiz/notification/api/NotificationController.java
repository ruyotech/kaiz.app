package app.kaiz.notification.api;

import app.kaiz.notification.application.NotificationService;
import app.kaiz.notification.application.dto.CreateNotificationRequest;
import app.kaiz.notification.application.dto.NotificationDto;
import app.kaiz.notification.application.dto.NotificationDto.GroupedNotificationsDto;
import app.kaiz.notification.application.dto.NotificationDto.UnreadCountDto;
import app.kaiz.notification.application.dto.NotificationPreferencesDto;
import app.kaiz.notification.application.dto.UpdatePreferencesRequest;
import app.kaiz.notification.domain.NotificationCategory;
import app.kaiz.shared.security.CurrentUser;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Notifications", description = "Notification management endpoints")
public class NotificationController {

  private final NotificationService notificationService;

  // ============ Retrieval Endpoints ============

  @GetMapping
  @Operation(
      summary = "Get all notifications",
      description = "Retrieve paginated notifications for the current user (excludes archived)")
  public ResponseEntity<Page<NotificationDto>> getNotifications(
      @CurrentUser UUID userId,
      @PageableDefault(size = 20) Pageable pageable) {
    return ResponseEntity.ok(notificationService.getNotificationsByUserId(userId, pageable));
  }

  @GetMapping("/category/{category}")
  @Operation(
      summary = "Get notifications by category",
      description = "Retrieve paginated notifications for a specific category")
  public ResponseEntity<Page<NotificationDto>> getNotificationsByCategory(
      @CurrentUser UUID userId,
      @PathVariable @Parameter(description = "Notification category") NotificationCategory category,
      @PageableDefault(size = 20) Pageable pageable) {
    return ResponseEntity.ok(notificationService.getNotificationsByCategory(userId, category, pageable));
  }

  @GetMapping("/grouped")
  @Operation(
      summary = "Get grouped notifications",
      description = "Retrieve notifications grouped by time period (today, yesterday, this week, older)")
  public ResponseEntity<GroupedNotificationsDto> getGroupedNotifications(@CurrentUser UUID userId) {
    return ResponseEntity.ok(notificationService.getGroupedNotifications(userId));
  }

  @GetMapping("/archived")
  @Operation(
      summary = "Get archived notifications",
      description = "Retrieve paginated archived notifications")
  public ResponseEntity<Page<NotificationDto>> getArchivedNotifications(
      @CurrentUser UUID userId,
      @PageableDefault(size = 20) Pageable pageable) {
    return ResponseEntity.ok(notificationService.getArchivedNotifications(userId, pageable));
  }

  @GetMapping("/pinned")
  @Operation(
      summary = "Get pinned notifications",
      description = "Retrieve paginated pinned notifications")
  public ResponseEntity<Page<NotificationDto>> getPinnedNotifications(
      @CurrentUser UUID userId,
      @PageableDefault(size = 20) Pageable pageable) {
    return ResponseEntity.ok(notificationService.getPinnedNotifications(userId, pageable));
  }

  @GetMapping("/unread")
  @Operation(
      summary = "Get unread notifications",
      description = "Retrieve all unread notifications for the current user")
  public ResponseEntity<List<NotificationDto>> getUnreadNotifications(@CurrentUser UUID userId) {
    return ResponseEntity.ok(notificationService.getUnreadNotifications(userId));
  }

  @GetMapping("/search")
  @Operation(
      summary = "Search notifications",
      description = "Search notifications by title or content")
  public ResponseEntity<Page<NotificationDto>> searchNotifications(
      @CurrentUser UUID userId,
      @RequestParam @Parameter(description = "Search query") String query,
      @PageableDefault(size = 20) Pageable pageable) {
    return ResponseEntity.ok(notificationService.searchNotifications(userId, query, pageable));
  }

  // ============ Count Endpoints ============

  @GetMapping("/unread-count")
  @Operation(
      summary = "Get unread count",
      description = "Get the count of unread notifications for the current user")
  public ResponseEntity<UnreadCountDto> getUnreadCount(@CurrentUser UUID userId) {
    return ResponseEntity.ok(notificationService.getDetailedUnreadCount(userId));
  }

  // ============ Status Update Endpoints ============

  @PutMapping("/{id}/read")
  @Operation(summary = "Mark as read", description = "Mark a specific notification as read")
  public ResponseEntity<NotificationDto> markAsRead(
      @CurrentUser UUID userId,
      @PathVariable @Parameter(description = "Notification ID") UUID id) {
    return ResponseEntity.ok(notificationService.markAsRead(userId, id));
  }

  @PutMapping("/{id}/unread")
  @Operation(summary = "Mark as unread", description = "Mark a specific notification as unread")
  public ResponseEntity<NotificationDto> markAsUnread(
      @CurrentUser UUID userId,
      @PathVariable @Parameter(description = "Notification ID") UUID id) {
    return ResponseEntity.ok(notificationService.markAsUnread(userId, id));
  }

  @PutMapping("/read-all")
  @Operation(summary = "Mark all as read", description = "Mark all notifications as read")
  public ResponseEntity<Void> markAllAsRead(@CurrentUser UUID userId) {
    notificationService.markAllAsRead(userId);
    return ResponseEntity.noContent().build();
  }

  @PutMapping("/category/{category}/read-all")
  @Operation(summary = "Mark category as read", description = "Mark all notifications in a category as read")
  public ResponseEntity<Void> markCategoryAsRead(
      @CurrentUser UUID userId,
      @PathVariable @Parameter(description = "Notification category") NotificationCategory category) {
    notificationService.markCategoryAsRead(userId, category);
    return ResponseEntity.noContent().build();
  }

  // ============ Pin/Archive Endpoints ============

  @PutMapping("/{id}/pin")
  @Operation(summary = "Toggle pinned", description = "Toggle the pinned status of a notification")
  public ResponseEntity<NotificationDto> togglePinned(
      @CurrentUser UUID userId,
      @PathVariable @Parameter(description = "Notification ID") UUID id) {
    return ResponseEntity.ok(notificationService.togglePinned(userId, id));
  }

  @PutMapping("/{id}/archive")
  @Operation(summary = "Archive notification", description = "Archive a specific notification")
  public ResponseEntity<NotificationDto> archiveNotification(
      @CurrentUser UUID userId,
      @PathVariable @Parameter(description = "Notification ID") UUID id) {
    return ResponseEntity.ok(notificationService.archiveNotification(userId, id));
  }

  @PutMapping("/{id}/unarchive")
  @Operation(summary = "Unarchive notification", description = "Unarchive a specific notification")
  public ResponseEntity<NotificationDto> unarchiveNotification(
      @CurrentUser UUID userId,
      @PathVariable @Parameter(description = "Notification ID") UUID id) {
    return ResponseEntity.ok(notificationService.unarchiveNotification(userId, id));
  }

  @PutMapping("/archive-read")
  @Operation(summary = "Archive all read", description = "Archive all read notifications")
  public ResponseEntity<Void> archiveAllRead(@CurrentUser UUID userId) {
    notificationService.archiveAllRead(userId);
    return ResponseEntity.noContent().build();
  }

  // ============ Delete Endpoints ============

  @DeleteMapping("/{id}")
  @Operation(summary = "Delete notification", description = "Permanently delete a notification")
  public ResponseEntity<Void> deleteNotification(
      @CurrentUser UUID userId,
      @PathVariable @Parameter(description = "Notification ID") UUID id) {
    notificationService.deleteNotification(userId, id);
    return ResponseEntity.noContent().build();
  }

  // ============ Create Endpoint ============

  @PostMapping
  @Operation(summary = "Create notification", description = "Create a new notification (internal/admin use)")
  public ResponseEntity<NotificationDto> createNotification(
      @Valid @RequestBody CreateNotificationRequest request) {
    NotificationDto created = notificationService.createNotification(request);
    if (created == null) {
      return ResponseEntity.status(HttpStatus.NO_CONTENT).build(); // Category disabled
    }
    return ResponseEntity.status(HttpStatus.CREATED).body(created);
  }

  // ============ Preferences Endpoints ============

  @GetMapping("/preferences")
  @Operation(
      summary = "Get notification preferences",
      description = "Retrieve notification preferences for the current user")
  public ResponseEntity<NotificationPreferencesDto> getPreferences(@CurrentUser UUID userId) {
    return ResponseEntity.ok(notificationService.getPreferences(userId));
  }

  @PutMapping("/preferences")
  @Operation(
      summary = "Update notification preferences",
      description = "Update notification preferences for the current user")
  public ResponseEntity<NotificationPreferencesDto> updatePreferences(
      @CurrentUser UUID userId,
      @Valid @RequestBody UpdatePreferencesRequest request) {
    return ResponseEntity.ok(notificationService.updatePreferences(userId, request));
  }
}

