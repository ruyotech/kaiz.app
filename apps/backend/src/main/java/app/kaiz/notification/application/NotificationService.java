package app.kaiz.notification.application;

import app.kaiz.identity.domain.User;
import app.kaiz.identity.infrastructure.UserRepository;
import app.kaiz.notification.application.dto.CreateNotificationRequest;
import app.kaiz.notification.application.dto.NotificationDto;
import app.kaiz.notification.application.dto.NotificationDto.GroupedNotificationsDto;
import app.kaiz.notification.application.dto.NotificationDto.UnreadCountDto;
import app.kaiz.notification.application.dto.NotificationPreferencesDto;
import app.kaiz.notification.application.dto.UpdatePreferencesRequest;
import app.kaiz.notification.domain.Notification;
import app.kaiz.notification.domain.NotificationCategory;
import app.kaiz.notification.domain.NotificationPreferences;
import app.kaiz.notification.domain.NotificationPriority;
import app.kaiz.notification.domain.NotificationType;
import app.kaiz.notification.infrastructure.NotificationPreferencesRepository;
import app.kaiz.notification.infrastructure.NotificationRepository;
import app.kaiz.shared.exception.ResourceNotFoundException;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class NotificationService {

  private final NotificationRepository notificationRepository;
  private final NotificationPreferencesRepository preferencesRepository;
  private final UserRepository userRepository;
  private final NotificationMapper notificationMapper;

  // ============ Notification Retrieval ============

  public Page<NotificationDto> getNotificationsByUserId(UUID userId, Pageable pageable) {
    return notificationRepository
        .findByUserIdAndIsArchivedFalseOrderByIsPinnedDescCreatedAtDesc(userId, pageable)
        .map(notificationMapper::toNotificationDto);
  }

  public Page<NotificationDto> getNotificationsByCategory(
      UUID userId, NotificationCategory category, Pageable pageable) {
    return notificationRepository
        .findByUserIdAndCategoryAndIsArchivedFalseOrderByCreatedAtDesc(userId, category, pageable)
        .map(notificationMapper::toNotificationDto);
  }

  public Page<NotificationDto> getArchivedNotifications(UUID userId, Pageable pageable) {
    return notificationRepository
        .findByUserIdAndIsArchivedTrueOrderByCreatedAtDesc(userId, pageable)
        .map(notificationMapper::toNotificationDto);
  }

  public Page<NotificationDto> getPinnedNotifications(UUID userId, Pageable pageable) {
    return notificationRepository
        .findByUserIdAndIsPinnedTrueAndIsArchivedFalseOrderByCreatedAtDesc(userId, pageable)
        .map(notificationMapper::toNotificationDto);
  }

  public List<NotificationDto> getUnreadNotifications(UUID userId) {
    return notificationMapper.toNotificationDtoList(
        notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId));
  }

  public GroupedNotificationsDto getGroupedNotifications(UUID userId) {
    LocalDate today = LocalDate.now();
    ZoneId zone = ZoneId.systemDefault();

    Instant todayStart = today.atStartOfDay(zone).toInstant();
    Instant yesterdayStart = today.minusDays(1).atStartOfDay(zone).toInstant();
    Instant weekStart = today.minusDays(7).atStartOfDay(zone).toInstant();

    List<Notification> allRecent =
        notificationRepository.findRecentNotifications(
            userId, weekStart.minus(30, ChronoUnit.DAYS));

    List<NotificationDto> todayList = new ArrayList<>();
    List<NotificationDto> yesterdayList = new ArrayList<>();
    List<NotificationDto> thisWeekList = new ArrayList<>();
    List<NotificationDto> olderList = new ArrayList<>();

    for (Notification notification : allRecent) {
      NotificationDto dto = notificationMapper.toNotificationDto(notification);
      Instant createdAt = notification.getCreatedAt();

      if (createdAt.isAfter(todayStart)) {
        todayList.add(dto);
      } else if (createdAt.isAfter(yesterdayStart)) {
        yesterdayList.add(dto);
      } else if (createdAt.isAfter(weekStart)) {
        thisWeekList.add(dto);
      } else {
        olderList.add(dto);
      }
    }

    return new GroupedNotificationsDto(todayList, yesterdayList, thisWeekList, olderList);
  }

  public Page<NotificationDto> searchNotifications(UUID userId, String query, Pageable pageable) {
    return notificationRepository
        .searchNotifications(userId, query, pageable)
        .map(notificationMapper::toNotificationDto);
  }

  // ============ Unread Counts ============

  public long getUnreadCount(UUID userId) {
    return notificationRepository.countByUserIdAndIsReadFalse(userId);
  }

  public UnreadCountDto getDetailedUnreadCount(UUID userId) {
    long total = notificationRepository.countByUserIdAndIsReadFalse(userId);
    List<Object[]> byCategoryResult = notificationRepository.countUnreadByCategory(userId);

    Map<String, Long> byCategory = new HashMap<>();
    for (Object[] row : byCategoryResult) {
      NotificationCategory category = (NotificationCategory) row[0];
      Long count = (Long) row[1];
      byCategory.put(category.getId(), count);
    }

    return new UnreadCountDto(total, byCategory);
  }

  // ============ Notification Status Updates ============

  @Transactional
  public NotificationDto markAsRead(UUID userId, UUID notificationId) {
    notificationRepository.markAsRead(notificationId, userId, Instant.now());
    Notification notification =
        notificationRepository
            .findByIdAndUserId(notificationId, userId)
            .orElseThrow(
                () -> new ResourceNotFoundException("Notification", notificationId.toString()));
    return notificationMapper.toNotificationDto(notification);
  }

  @Transactional
  public NotificationDto markAsUnread(UUID userId, UUID notificationId) {
    notificationRepository.markAsUnread(notificationId, userId);
    Notification notification =
        notificationRepository
            .findByIdAndUserId(notificationId, userId)
            .orElseThrow(
                () -> new ResourceNotFoundException("Notification", notificationId.toString()));
    return notificationMapper.toNotificationDto(notification);
  }

  @Transactional
  public int markAllAsRead(UUID userId) {
    return notificationRepository.markAllAsReadByUserId(userId, Instant.now());
  }

  @Transactional
  public int markCategoryAsRead(UUID userId, NotificationCategory category) {
    return notificationRepository.markAllAsReadByCategory(userId, category, Instant.now());
  }

  @Transactional
  public NotificationDto togglePinned(UUID userId, UUID notificationId) {
    Notification notification =
        notificationRepository
            .findByIdAndUserId(notificationId, userId)
            .orElseThrow(
                () -> new ResourceNotFoundException("Notification", notificationId.toString()));

    notification.togglePinned();
    return notificationMapper.toNotificationDto(notificationRepository.save(notification));
  }

  @Transactional
  public NotificationDto archiveNotification(UUID userId, UUID notificationId) {
    notificationRepository.archiveNotification(notificationId, userId);
    Notification notification =
        notificationRepository
            .findByIdAndUserId(notificationId, userId)
            .orElseThrow(
                () -> new ResourceNotFoundException("Notification", notificationId.toString()));
    return notificationMapper.toNotificationDto(notification);
  }

  @Transactional
  public NotificationDto unarchiveNotification(UUID userId, UUID notificationId) {
    notificationRepository.unarchiveNotification(notificationId, userId);
    Notification notification =
        notificationRepository
            .findByIdAndUserId(notificationId, userId)
            .orElseThrow(
                () -> new ResourceNotFoundException("Notification", notificationId.toString()));
    return notificationMapper.toNotificationDto(notification);
  }

  @Transactional
  public int archiveAllRead(UUID userId) {
    return notificationRepository.archiveAllReadByUserId(userId);
  }

  @Transactional
  public void deleteNotification(UUID userId, UUID notificationId) {
    notificationRepository.deleteByIdAndUserId(notificationId, userId);
  }

  // ============ Notification Creation ============

  @Transactional
  public NotificationDto createNotification(
      UUID userId,
      NotificationType type,
      String title,
      String content,
      Map<String, Object> metadata) {
    User user =
        userRepository
            .findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User", userId.toString()));

    // Check user preferences before creating
    NotificationPreferences prefs = getOrCreatePreferences(userId);
    NotificationCategory category = type.getCategory();

    if (!prefs.isCategoryEnabled(category)) {
      log.debug("Notification category {} is disabled for user {}", category, userId);
      return null; // Don't create notification if category is disabled
    }

    Notification notification =
        Notification.builder()
            .user(user)
            .type(type)
            .category(category)
            .priority(NotificationPriority.MEDIUM)
            .title(title)
            .content(content)
            .icon(type.getDefaultIcon())
            .metadata(metadata)
            .build();

    return notificationMapper.toNotificationDto(notificationRepository.save(notification));
  }

  @Transactional
  public NotificationDto createNotification(CreateNotificationRequest request) {
    User user =
        userRepository
            .findById(request.userId())
            .orElseThrow(() -> new ResourceNotFoundException("User", request.userId().toString()));

    // Check user preferences before creating
    NotificationPreferences prefs = getOrCreatePreferences(request.userId());
    NotificationCategory category =
        request.category() != null ? request.category() : request.type().getCategory();

    if (!prefs.isCategoryEnabled(category)) {
      log.debug("Notification category {} is disabled for user {}", category, request.userId());
      return null;
    }

    // Map actions if provided
    List<Notification.NotificationAction> actions = null;
    if (request.actions() != null && !request.actions().isEmpty()) {
      actions =
          request.actions().stream()
              .map(
                  a ->
                      Notification.NotificationAction.builder()
                          .id(a.id())
                          .label(a.label())
                          .action(a.action())
                          .style(a.style())
                          .build())
              .collect(Collectors.toList());
    }

    Notification notification =
        Notification.builder()
            .user(user)
            .type(request.type())
            .category(category)
            .priority(request.priority() != null ? request.priority() : NotificationPriority.MEDIUM)
            .title(request.title())
            .content(request.content())
            .icon(request.icon() != null ? request.icon() : request.type().getDefaultIcon())
            .deepLink(request.deepLink())
            .expiresAt(request.expiresAt())
            .senderId(request.senderId())
            .senderName(request.senderName())
            .senderAvatar(request.senderAvatar())
            .metadata(request.metadata())
            .actions(actions)
            .build();

    return notificationMapper.toNotificationDto(notificationRepository.save(notification));
  }

  // ============ Preferences Management ============

  public NotificationPreferencesDto getPreferences(UUID userId) {
    NotificationPreferences prefs = getOrCreatePreferences(userId);
    return notificationMapper.toPreferencesDto(prefs);
  }

  @Transactional
  public NotificationPreferencesDto updatePreferences(
      UUID userId, UpdatePreferencesRequest request) {
    NotificationPreferences prefs = getOrCreatePreferences(userId);

    // Update global settings
    if (request.pushEnabled() != null) prefs.setPushEnabled(request.pushEnabled());
    if (request.emailEnabled() != null) prefs.setEmailEnabled(request.emailEnabled());
    if (request.inAppEnabled() != null) prefs.setInAppEnabled(request.inAppEnabled());
    if (request.soundEnabled() != null) prefs.setSoundEnabled(request.soundEnabled());
    if (request.vibrationEnabled() != null) prefs.setVibrationEnabled(request.vibrationEnabled());
    if (request.quietHoursEnabled() != null)
      prefs.setQuietHoursEnabled(request.quietHoursEnabled());
    if (request.quietHoursStart() != null) prefs.setQuietHoursStart(request.quietHoursStart());
    if (request.quietHoursEnd() != null) prefs.setQuietHoursEnd(request.quietHoursEnd());

    // Update category settings
    if (request.categorySettings() != null) {
      for (Map.Entry<String, UpdatePreferencesRequest.CategoryPreferenceRequest> entry :
          request.categorySettings().entrySet()) {
        NotificationCategory category = NotificationCategory.fromId(entry.getKey());
        UpdatePreferencesRequest.CategoryPreferenceRequest catReq = entry.getValue();

        NotificationPreferences.CategoryPreference existing = prefs.getCategoryPreference(category);

        NotificationPreferences.CategoryPreference updated =
            NotificationPreferences.CategoryPreference.builder()
                .enabled(catReq.enabled() != null ? catReq.enabled() : existing.isEnabled())
                .push(catReq.push() != null ? catReq.push() : existing.isPush())
                .email(catReq.email() != null ? catReq.email() : existing.isEmail())
                .inApp(catReq.inApp() != null ? catReq.inApp() : existing.isInApp())
                .build();

        prefs.setCategoryPreference(category, updated);
      }
    }

    return notificationMapper.toPreferencesDto(preferencesRepository.save(prefs));
  }

  private NotificationPreferences getOrCreatePreferences(UUID userId) {
    return preferencesRepository
        .findByUserId(userId)
        .orElseGet(
            () -> {
              User user =
                  userRepository
                      .findById(userId)
                      .orElseThrow(() -> new ResourceNotFoundException("User", userId.toString()));
              NotificationPreferences prefs = NotificationPreferences.createDefault(user);
              return preferencesRepository.save(prefs);
            });
  }

  // ============ Scheduled Tasks ============

  /** Archive expired notifications daily at 2 AM. */
  @Scheduled(cron = "0 0 2 * * *")
  @Transactional
  public void archiveExpiredNotifications() {
    int count = notificationRepository.archiveExpiredNotifications(Instant.now());
    if (count > 0) {
      log.info("Archived {} expired notifications", count);
    }
  }
}
