package app.kaiz.notification.domain;

import app.kaiz.identity.domain.User;
import app.kaiz.shared.persistence.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "notifications", indexes = {
    @Index(name = "idx_notification_user_created", columnList = "user_id, created_at DESC"),
    @Index(name = "idx_notification_user_category", columnList = "user_id, category"),
    @Index(name = "idx_notification_user_unread", columnList = "user_id, is_read"),
    @Index(name = "idx_notification_user_pinned", columnList = "user_id, is_pinned"),
    @Index(name = "idx_notification_expires", columnList = "expires_at")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Notification extends BaseEntity {

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", nullable = false)
  private User user;

  @Enumerated(EnumType.STRING)
  @Column(name = "type", nullable = false, length = 50)
  private NotificationType type;

  @Enumerated(EnumType.STRING)
  @Column(name = "category", nullable = false, length = 20)
  @Builder.Default
  private NotificationCategory category = NotificationCategory.SYSTEM;

  @Enumerated(EnumType.STRING)
  @Column(name = "priority", nullable = false, length = 10)
  @Builder.Default
  private NotificationPriority priority = NotificationPriority.MEDIUM;

  @Column(name = "title", nullable = false)
  private String title;

  @Column(name = "content", columnDefinition = "TEXT")
  private String content;

  @Column(name = "is_read", nullable = false)
  @Builder.Default
  private boolean isRead = false;

  @Column(name = "read_at")
  private Instant readAt;

  @Column(name = "is_pinned", nullable = false)
  @Builder.Default
  private boolean isPinned = false;

  @Column(name = "is_archived", nullable = false)
  @Builder.Default
  private boolean isArchived = false;

  @Column(name = "icon", length = 100)
  private String icon;

  @Column(name = "deep_link", length = 500)
  private String deepLink;

  @Column(name = "expires_at")
  private Instant expiresAt;

  @Column(name = "sender_id")
  private UUID senderId;

  @Column(name = "sender_name", length = 100)
  private String senderName;

  @Column(name = "sender_avatar", length = 500)
  private String senderAvatar;

  @JdbcTypeCode(SqlTypes.JSON)
  @Column(name = "metadata", columnDefinition = "jsonb")
  private Map<String, Object> metadata;

  @JdbcTypeCode(SqlTypes.JSON)
  @Column(name = "actions", columnDefinition = "jsonb")
  private List<NotificationAction> actions;

  /**
   * Mark notification as read with timestamp.
   */
  public void markAsRead() {
    if (!this.isRead) {
      this.isRead = true;
      this.readAt = Instant.now();
    }
  }

  /**
   * Mark notification as unread.
   */
  public void markAsUnread() {
    this.isRead = false;
    this.readAt = null;
  }

  /**
   * Toggle pinned status.
   */
  public void togglePinned() {
    this.isPinned = !this.isPinned;
  }

  /**
   * Archive the notification.
   */
  public void archive() {
    this.isArchived = true;
  }

  /**
   * Unarchive the notification.
   */
  public void unarchive() {
    this.isArchived = false;
  }

  /**
   * Check if notification is expired.
   */
  public boolean isExpired() {
    return expiresAt != null && Instant.now().isAfter(expiresAt);
  }

  /**
   * Get the icon to display (custom or default from type).
   */
  public String getDisplayIcon() {
    return icon != null ? icon : type.getDefaultIcon();
  }

  /**
   * Pre-persist hook to set defaults.
   */
  @PrePersist
  public void prePersist() {
    if (category == null && type != null) {
      category = type.getCategory();
    }
    if (icon == null && type != null) {
      icon = type.getDefaultIcon();
    }
  }

  /**
   * Inner class for notification actions (serialized to JSON).
   */
  @Data
  @NoArgsConstructor
  @AllArgsConstructor
  @Builder
  public static class NotificationAction {
    private String id;
    private String label;
    private String action;
    private String style; // "primary", "secondary", "destructive"
  }
}
