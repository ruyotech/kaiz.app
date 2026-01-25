package com.kaiz.lifeos.mindset.application.dto;

import com.kaiz.lifeos.mindset.domain.EmotionalTone;
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
