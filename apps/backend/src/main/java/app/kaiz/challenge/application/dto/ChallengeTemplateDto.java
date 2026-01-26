package app.kaiz.challenge.application.dto;

import app.kaiz.challenge.domain.Difficulty;
import app.kaiz.challenge.domain.MetricType;
import app.kaiz.challenge.domain.Recurrence;
import java.math.BigDecimal;
import java.time.Instant;

public record ChallengeTemplateDto(
    String id,
    String name,
    String description,
    String lifeWheelAreaId,
    MetricType metricType,
    BigDecimal targetValue,
    String unit,
    int suggestedDuration,
    Recurrence recurrence,
    Difficulty difficulty,
    int popularityScore,
    Instant createdAt) {}
