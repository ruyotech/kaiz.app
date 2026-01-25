package com.kaiz.lifeos.challenge.application.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record ChallengeParticipantDto(
    UUID id,
    UUID challengeId,
    UUID userId,
    String userName,
    Instant joinedAt,
    BigDecimal currentProgress,
    int streakDays,
    boolean isAccountabilityPartner) {

  public record InviteParticipantRequest(UUID userId, boolean isAccountabilityPartner) {}
}
