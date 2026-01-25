package com.kaiz.lifeos.essentia.application.dto;

import com.kaiz.lifeos.essentia.domain.Difficulty;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record EssentiaBookDto(
    String id,
    String title,
    String author,
    String lifeWheelAreaId,
    String category,
    Integer duration,
    Integer cardCount,
    Difficulty difficulty,
    List<String> tags,
    String description,
    List<String> keyTakeaways,
    Integer publicationYear,
    BigDecimal rating,
    Integer completionCount,
    Instant createdAt,
    Instant updatedAt,
    List<EssentiaCardDto> cards) {}
