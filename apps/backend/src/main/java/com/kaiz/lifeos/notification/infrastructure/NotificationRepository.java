package com.kaiz.lifeos.notification.infrastructure;

import com.kaiz.lifeos.notification.domain.Notification;
import com.kaiz.lifeos.notification.domain.NotificationType;
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

  Page<Notification> findByUserIdOrderByCreatedAtDesc(UUID userId, Pageable pageable);

  List<Notification> findByUserIdAndIsReadFalseOrderByCreatedAtDesc(UUID userId);

  List<Notification> findByUserIdAndTypeOrderByCreatedAtDesc(UUID userId, NotificationType type);

  Optional<Notification> findByIdAndUserId(UUID id, UUID userId);

  long countByUserIdAndIsReadFalse(UUID userId);

  @Modifying
  @Query("UPDATE Notification n SET n.isRead = true WHERE n.user.id = :userId AND n.isRead = false")
  int markAllAsReadByUserId(@Param("userId") UUID userId);

  @Modifying
  @Query("UPDATE Notification n SET n.isRead = true WHERE n.id = :id AND n.user.id = :userId")
  int markAsRead(@Param("id") UUID id, @Param("userId") UUID userId);
}
