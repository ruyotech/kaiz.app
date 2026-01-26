package app.kaiz.community.application.dto;

import java.util.UUID;

/** Response DTO for badge. */
public record BadgeResponse(
        UUID id,
        String badgeType,
        String name,
        String description,
        String icon,
        String rarity,
        Integer xpReward) {}
