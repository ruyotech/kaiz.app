package app.kaiz.community.application.dto;

import java.time.Instant;
import java.util.UUID;

/** Response DTO for story comment. */
public record StoryCommentResponse(
        UUID id, CommunityMemberResponse author, String text, Instant createdAt) {}
