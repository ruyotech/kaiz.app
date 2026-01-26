package app.kaiz.mindset.application.dto;

import app.kaiz.mindset.domain.EmotionalTone;
import java.time.Instant;
import java.util.List;

public record MindsetContentDto(
    String id,
    String body,
    String author,
    String dimensionTag,
    List<String> secondaryTags,
    String themePreset,
    Integer interventionWeight,
    EmotionalTone emotionalTone,
    Integer dwellTimeMs,
    Boolean isFavorite,
    Instant createdAt) {}
