package app.kaiz.community.application.dto;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/** Response DTO for community template. */
public record TemplateResponse(
        UUID id,
        String name,
        String description,
        String templateType,
        CommunityMemberResponse author,
        String content,
        String lifeWheelAreaId,
        List<String> tags,
        Integer downloadCount,
        Double rating,
        Integer ratingCount,
        String previewImageUrl,
        Boolean isFeatured,
        Instant createdAt) {}
