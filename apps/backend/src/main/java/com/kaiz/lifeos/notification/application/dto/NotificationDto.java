package com.kaiz.lifeos.notification.application.dto;

import com.kaiz.lifeos.notification.domain.NotificationType;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;

public record NotificationDto(
    UUID id,
    NotificationType type,
    String title,
    String content,
    boolean isRead,
    Map<String, Object> metadata,
    Instant createdAt) {

  public record UnreadCountDto(long count) {}
}
