package app.kaiz.community.application.dto;

import java.time.Instant;
import java.util.UUID;

/** Response DTO for community activity feed item. */
public record CommunityActivityResponse(
    UUID id,
    CommunityMemberResponse member,
    String activityType,
    String title,
    String description,
    String metadata,
    Integer celebrateCount,
    Instant createdAt) {}
