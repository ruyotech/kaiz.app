package app.kaiz.community.application.dto;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/** Response DTO for Q&A question. */
public record QuestionResponse(
        UUID id,
        String title,
        String body,
        CommunityMemberResponse author,
        List<String> tags,
        String status,
        Integer viewCount,
        Integer upvoteCount,
        Integer answerCount,
        UUID acceptedAnswerId,
        List<AnswerResponse> answers,
        Instant createdAt) {}
