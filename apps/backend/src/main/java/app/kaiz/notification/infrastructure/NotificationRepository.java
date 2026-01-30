package app.kaiz.notification.infrastructure;

import app.kaiz.notification.domain.Notification;
import app.kaiz.notification.domain.NotificationCategory;
import app.kaiz.notification.domain.NotificationPriority;
import app.kaiz.notification.domain.NotificationType;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, UUID> {

  // ============ Basic Queries ============

  Page<Notification> findByUserIdOrderByCreatedAtDesc(UUID userId, Pageable pageable);

  List<Notification> findByUserIdAndIsReadFalseOrderByCreatedAtDesc(UUID userId);

  List<Notification> findByUserIdAndTypeOrderByCreatedAtDesc(UUID userId, NotificationType type);

  Optional<Notification> findByIdAndUserId(UUID id, UUID userId);

  long countByUserIdAndIsReadFalse(UUID userId);

  // ============ Category Queries ============

  Page<Notification> findByUserIdAndCategoryOrderByCreatedAtDesc(
      UUID userId, NotificationCategory category, Pageable pageable);

  Page<Notification> findByUserIdAndCategoryAndIsArchivedFalseOrderByCreatedAtDesc(
      UUID userId, NotificationCategory category, Pageable pageable);

  @Query(
      "SELECT n.category, COUNT(n) FROM Notification n "
          + "WHERE n.user.id = :userId AND n.isRead = false AND n.isArchived = false "
          + "GROUP BY n.category")
  List<Object[]> countUnreadByCategory(@Param("userId") UUID userId);

  // ============ Archive & Pin Queries ============

  Page<Notification> findByUserIdAndIsArchivedFalseOrderByIsPinnedDescCreatedAtDesc(
      UUID userId, Pageable pageable);

  Page<Notification> findByUserIdAndIsArchivedTrueOrderByCreatedAtDesc(
      UUID userId, Pageable pageable);

  Page<Notification> findByUserIdAndIsPinnedTrueAndIsArchivedFalseOrderByCreatedAtDesc(
      UUID userId, Pageable pageable);

  // ============ Priority Queries ============

  Page<Notification> findByUserIdAndPriorityAndIsArchivedFalseOrderByCreatedAtDesc(
      UUID userId, NotificationPriority priority, Pageable pageable);

  List<Notification> findByUserIdAndPriorityInAndIsReadFalseAndIsArchivedFalse(
      UUID userId, List<NotificationPriority> priorities);

  // ============ Time-based Queries ============

  @Query(
      "SELECT n FROM Notification n WHERE n.user.id = :userId "
          + "AND n.isArchived = false AND n.createdAt >= :since "
          + "ORDER BY n.isPinned DESC, n.createdAt DESC")
  List<Notification> findRecentNotifications(
      @Param("userId") UUID userId, @Param("since") Instant since);

  @Query(
      "SELECT n FROM Notification n WHERE n.user.id = :userId "
          + "AND n.isArchived = false AND n.createdAt BETWEEN :start AND :end "
          + "ORDER BY n.createdAt DESC")
  List<Notification> findByUserIdAndCreatedAtBetween(
      @Param("userId") UUID userId, @Param("start") Instant start, @Param("end") Instant end);

  // ============ Expiration Queries ============

  @Query(
      "SELECT n FROM Notification n WHERE n.expiresAt IS NOT NULL "
          + "AND n.expiresAt < :now AND n.isArchived = false")
  List<Notification> findExpiredNotifications(@Param("now") Instant now);

  @Modifying
  @Query(
      "UPDATE Notification n SET n.isArchived = true "
          + "WHERE n.expiresAt IS NOT NULL AND n.expiresAt < :now AND n.isArchived = false")
  int archiveExpiredNotifications(@Param("now") Instant now);

  // ============ Bulk Update Queries ============

  @Modifying
  @Query(
      "UPDATE Notification n SET n.isRead = true, n.readAt = :now "
          + "WHERE n.user.id = :userId AND n.isRead = false")
  int markAllAsReadByUserId(@Param("userId") UUID userId, @Param("now") Instant now);

  @Modifying
  @Query(
      "UPDATE Notification n SET n.isRead = true, n.readAt = :now "
          + "WHERE n.id = :id AND n.user.id = :userId")
  int markAsRead(@Param("id") UUID id, @Param("userId") UUID userId, @Param("now") Instant now);

  @Modifying
  @Query(
      "UPDATE Notification n SET n.isRead = false, n.readAt = null "
          + "WHERE n.id = :id AND n.user.id = :userId")
  int markAsUnread(@Param("id") UUID id, @Param("userId") UUID userId);

  @Modifying
  @Query(
      "UPDATE Notification n SET n.isPinned = :pinned "
          + "WHERE n.id = :id AND n.user.id = :userId")
  int updatePinnedStatus(
      @Param("id") UUID id, @Param("userId") UUID userId, @Param("pinned") boolean pinned);

  @Modifying
  @Query(
      "UPDATE Notification n SET n.isArchived = true " + "WHERE n.id = :id AND n.user.id = :userId")
  int archiveNotification(@Param("id") UUID id, @Param("userId") UUID userId);

  @Modifying
  @Query(
      "UPDATE Notification n SET n.isArchived = false "
          + "WHERE n.id = :id AND n.user.id = :userId")
  int unarchiveNotification(@Param("id") UUID id, @Param("userId") UUID userId);

  @Modifying
  @Query(
      "UPDATE Notification n SET n.isArchived = true "
          + "WHERE n.user.id = :userId AND n.isRead = true AND n.isArchived = false")
  int archiveAllReadByUserId(@Param("userId") UUID userId);

  @Modifying
  @Query(
      "UPDATE Notification n SET n.isRead = true, n.readAt = :now "
          + "WHERE n.user.id = :userId AND n.category = :category AND n.isRead = false")
  int markAllAsReadByCategory(
      @Param("userId") UUID userId,
      @Param("category") NotificationCategory category,
      @Param("now") Instant now);

  // ============ Delete Queries ============

  @Modifying
  @Query(
      "DELETE FROM Notification n WHERE n.user.id = :userId AND n.isArchived = true "
          + "AND n.createdAt < :before")
  int deleteArchivedOlderThan(@Param("userId") UUID userId, @Param("before") Instant before);

  void deleteByIdAndUserId(UUID id, UUID userId);

  // ============ Search Queries ============

  @Query(
      "SELECT n FROM Notification n WHERE n.user.id = :userId "
          + "AND n.isArchived = false "
          + "AND (LOWER(n.title) LIKE LOWER(CONCAT('%', :query, '%')) "
          + "OR LOWER(n.content) LIKE LOWER(CONCAT('%', :query, '%'))) "
          + "ORDER BY n.createdAt DESC")
  Page<Notification> searchNotifications(
      @Param("userId") UUID userId, @Param("query") String query, Pageable pageable);

  // ============ Statistics Queries ============

  @Query(
      "SELECT COUNT(n) FROM Notification n WHERE n.user.id = :userId " + "AND n.isArchived = false")
  long countActiveNotifications(@Param("userId") UUID userId);

  @Query(
      "SELECT n.type, COUNT(n) FROM Notification n "
          + "WHERE n.user.id = :userId AND n.createdAt >= :since "
          + "GROUP BY n.type ORDER BY COUNT(n) DESC")
  List<Object[]> getNotificationTypeStats(
      @Param("userId") UUID userId, @Param("since") Instant since);
}
