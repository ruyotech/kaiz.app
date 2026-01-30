package app.kaiz.community.application.dto;

import java.util.List;

/** Response DTO for community home page data. */
public record CommunityHomeResponse(
    CommunityMemberResponse currentMember,
    ArticleResponse featuredArticle,
    Object activePoll,
    Object weeklyChallenge,
    List<CommunityActivityResponse> recentActivity,
    List<CommunityMemberResponse> topContributors) {}
