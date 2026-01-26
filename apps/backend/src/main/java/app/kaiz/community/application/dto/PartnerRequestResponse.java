package app.kaiz.community.application.dto;

import java.time.Instant;
import java.util.UUID;

/** Response DTO for partner request. */
public record PartnerRequestResponse(
        UUID id,
        CommunityMemberResponse fromMember,
        CommunityMemberResponse toMember,
        String message,
        String status,
        Instant createdAt) {}
