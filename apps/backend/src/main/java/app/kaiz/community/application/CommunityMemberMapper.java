package app.kaiz.community.application;

import app.kaiz.community.application.dto.CommunityMemberResponse;
import app.kaiz.community.domain.CommunityMember;
import java.util.stream.Collectors;
import lombok.AccessLevel;
import lombok.NoArgsConstructor;

/**
 * Shared mapper for converting {@link CommunityMember} to {@link CommunityMemberResponse}. Used by
 * all community sub-services to avoid duplicating this mapping logic.
 */
@NoArgsConstructor(access = AccessLevel.PRIVATE)
public final class CommunityMemberMapper {

  public static CommunityMemberResponse toMemberResponse(CommunityMember member) {
    return new CommunityMemberResponse(
        member.getId(),
        member.getUser().getId(),
        member.getDisplayName(),
        member.getAvatar(),
        member.getBio(),
        member.getLevel(),
        member.getLevelTitle(),
        member.getReputationPoints(),
        member.getRole().name(),
        member.getIsOnline(),
        member.getCurrentStreak(),
        member.getSprintsCompleted(),
        member.getHelpfulAnswers(),
        member.getTemplatesShared(),
        member.getBadges().stream().map(Enum::name).collect(Collectors.toList()),
        member.getShowActivity(),
        member.getAcceptPartnerRequests(),
        member.getCreatedAt(),
        member.getUpdatedAt());
  }
}
