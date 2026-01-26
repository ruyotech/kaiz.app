package app.kaiz.community.application.dto;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/** Response DTO for knowledge hub article. */
public record ArticleResponse(
        UUID id,
        String title,
        String excerpt,
        String content,
        String category,
        String coverImageUrl,
        CommunityMemberResponse author,
        Instant publishedAt,
        Boolean isPublished,
        Boolean isFeatured,
        Integer readTimeMinutes,
        Integer viewCount,
        Integer likeCount,
        List<String> tags,
        Instant createdAt) {}
