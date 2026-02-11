package app.kaiz.essentia.application.dto;

import app.kaiz.essentia.domain.Difficulty;
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
    String summaryText,
    String coreMethodology,
    String appApplication,
    String coverImageUrl,
    String isbn,
    Boolean isFeatured,
    Boolean isPublished,
    List<String> keyTakeaways,
    Integer publicationYear,
    BigDecimal rating,
    Integer completionCount,
    Instant createdAt,
    Instant updatedAt,
    List<EssentiaCardDto> cards,
    List<String> relatedBookIds) {}
