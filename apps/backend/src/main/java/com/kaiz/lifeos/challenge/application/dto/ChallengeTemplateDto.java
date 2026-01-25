package com.kaiz.lifeos.challenge.application.dto;

import com.kaiz.lifeos.challenge.domain.Difficulty;
import com.kaiz.lifeos.challenge.domain.MetricType;
import com.kaiz.lifeos.challenge.domain.Recurrence;
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
