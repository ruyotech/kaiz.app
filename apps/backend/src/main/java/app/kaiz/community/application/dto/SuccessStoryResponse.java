package app.kaiz.community.application.dto;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/** Response DTO for success story. */
public record SuccessStoryResponse(
        UUID id,
        CommunityMemberResponse author,
        String title,
        String story,
        String category,
        String lifeWheelAreaId,
        List<String> imageUrls,
        Integer likeCount,
        Integer commentCount,
        Integer celebrateCount,
        List<StoryCommentResponse> comments,
        Instant createdAt) {}
