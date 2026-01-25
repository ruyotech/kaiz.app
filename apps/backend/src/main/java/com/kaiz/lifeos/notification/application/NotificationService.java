package com.kaiz.lifeos.notification.application;

import com.kaiz.lifeos.identity.domain.User;
import com.kaiz.lifeos.identity.infrastructure.UserRepository;
import com.kaiz.lifeos.notification.application.dto.NotificationDto;
import com.kaiz.lifeos.notification.domain.Notification;
import com.kaiz.lifeos.notification.domain.NotificationType;
import com.kaiz.lifeos.notification.infrastructure.NotificationRepository;
import com.kaiz.lifeos.shared.exception.ResourceNotFoundException;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NotificationService {

  private final NotificationRepository notificationRepository;
  private final UserRepository userRepository;
  private final NotificationMapper notificationMapper;

  public Page<NotificationDto> getNotificationsByUserId(UUID userId, Pageable pageable) {
    return notificationRepository
        .findByUserIdOrderByCreatedAtDesc(userId, pageable)
        .map(notificationMapper::toNotificationDto);
  }

  public List<NotificationDto> getUnreadNotifications(UUID userId) {
    return notificationMapper.toNotificationDtoList(
        notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId));
  }

  public long getUnreadCount(UUID userId) {
    return notificationRepository.countByUserIdAndIsReadFalse(userId);
  }

  @Transactional
  public NotificationDto markAsRead(UUID userId, UUID notificationId) {
    notificationRepository.markAsRead(notificationId, userId);
    Notification notification =
        notificationRepository
            .findByIdAndUserId(notificationId, userId)
            .orElseThrow(
                () -> new ResourceNotFoundException("Notification", notificationId.toString()));
    return notificationMapper.toNotificationDto(notification);
  }

  @Transactional
  public int markAllAsRead(UUID userId) {
    return notificationRepository.markAllAsReadByUserId(userId);
  }

  @Transactional
  public NotificationDto createNotification(
      UUID userId, NotificationType type, String title, String content, Map<String, Object> metadata) {
    User user =
        userRepository
            .findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User", userId.toString()));

    Notification notification =
        Notification.builder()
            .user(user)
            .type(type)
            .title(title)
            .content(content)
            .metadata(metadata)
            .build();

    return notificationMapper.toNotificationDto(notificationRepository.save(notification));
  }
}
