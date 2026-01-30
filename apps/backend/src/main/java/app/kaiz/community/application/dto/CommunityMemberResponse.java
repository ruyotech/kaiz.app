package app.kaiz.community.application.dto;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/** Response DTO for community member profile. */
public record CommunityMemberResponse(
    UUID id,
    UUID userId,
    String displayName,
    String avatar,
    String bio,
    Integer level,
    String levelTitle,
    Integer reputationPoints,
    String role,
    Boolean isOnline,
    Integer currentStreak,
    Integer sprintsCompleted,
    Integer helpfulAnswers,
    Integer templatesShared,
    List<String> badges,
    Boolean showActivity,
    Boolean acceptPartnerRequests,
    Instant createdAt,
    Instant updatedAt) {}
