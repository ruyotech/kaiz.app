package app.kaiz.community.application.dto;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/** Response DTO for motivation group. */
public record MotivationGroupResponse(
        UUID id,
        String name,
        String description,
        String coverImageUrl,
        String lifeWheelAreaId,
        Integer memberCount,
        Integer maxMembers,
        Boolean isPrivate,
        CommunityMemberResponse createdBy,
        List<String> tags,
        Instant createdAt) {}
