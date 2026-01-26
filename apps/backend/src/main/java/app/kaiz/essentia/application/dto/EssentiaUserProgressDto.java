package app.kaiz.essentia.application.dto;

import java.time.Instant;

public record EssentiaUserProgressDto(
    String id,
    String bookId,
    String bookTitle,
    Integer currentCardIndex,
    Integer totalCards,
    Boolean isCompleted,
    Boolean isFavorite,
    Instant createdAt,
    Instant updatedAt) {}
