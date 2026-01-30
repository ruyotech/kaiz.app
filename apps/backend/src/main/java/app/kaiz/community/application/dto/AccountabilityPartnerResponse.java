package app.kaiz.community.application.dto;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/** Response DTO for accountability partner relationship. */
public record AccountabilityPartnerResponse(
    UUID id,
    CommunityMemberResponse partner,
    Instant connectedSince,
    Integer checkInStreak,
    Instant lastInteraction,
    List<UUID> sharedChallengeIds) {}
