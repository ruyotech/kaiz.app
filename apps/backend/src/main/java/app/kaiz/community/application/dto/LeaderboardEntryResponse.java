package app.kaiz.community.application.dto;

import java.util.UUID;

/** Response DTO for leaderboard entry. */
public record LeaderboardEntryResponse(
        UUID memberId,
        String displayName,
        String avatar,
        Integer level,
        String levelTitle,
        Integer reputationPoints,
        Integer currentStreak,
        Integer rank,
        Integer changeFromPrevious) {}
