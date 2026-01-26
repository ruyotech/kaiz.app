package app.kaiz.tasks.application.dto;

import java.time.Instant;
import java.util.UUID;

public record TaskHistoryDto(
    UUID id,
    UUID taskId,
    String fieldName,
    String oldValue,
    String newValue,
    UUID changedByUserId,
    String changedByUserName,
    Instant createdAt) {}
