package app.kaiz.community.application.dto;

import java.time.Instant;
import java.util.UUID;

/** Response DTO for answer to a question. */
public record AnswerResponse(
        UUID id,
        String body,
        CommunityMemberResponse author,
        Integer upvoteCount,
        Boolean isVerified,
        Boolean isAccepted,
        Instant createdAt) {}
