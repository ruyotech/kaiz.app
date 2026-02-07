package app.kaiz.community.application;

import app.kaiz.community.application.dto.*;
import app.kaiz.community.domain.ArticleCategory;
import app.kaiz.community.domain.CommunityBadge;
import app.kaiz.community.domain.CommunityMember;
import app.kaiz.community.domain.QuestionStatus;
import app.kaiz.community.domain.StoryCategory;
import app.kaiz.community.domain.TemplateType;
import app.kaiz.community.infrastructure.ArticleRepository;
import app.kaiz.community.infrastructure.CommunityBadgeRepository;
import app.kaiz.community.infrastructure.CommunityMemberRepository;
import app.kaiz.shared.exception.ResourceNotFoundException;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Thin facade delegating to focused community sub-services. Keeps the same public API so
 * CommunityController requires zero changes. Leaderboard, badges, and community home stay here as
 * they span multiple domains.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class CommunityService {

  // --- Focused sub-services ---
  private final CommunityMemberService communityMemberService;
  private final ArticleService articleService;
  private final QAService qaService;
  private final SuccessStoryService successStoryService;
  private final CommunityTemplateService communityTemplateService;
  private final MotivationGroupService motivationGroupService;
  private final AccountabilityPartnerService accountabilityPartnerService;
  private final CommunityActivityService communityActivityService;

  // --- Repos kept for cross-domain aggregators (leaderboard, badges, home) ---
  private final CommunityMemberRepository memberRepository;
  private final CommunityBadgeRepository badgeRepository;
  private final ArticleRepository articleRepository;

  // ==================== Member Operations ====================

  @Transactional(readOnly = true)
  public CommunityMemberResponse getMemberProfile(UUID memberId) {
    return communityMemberService.getMemberProfile(memberId);
  }

  @Transactional(readOnly = true)
  public CommunityMemberResponse getMemberByUserId(UUID userId) {
    return communityMemberService.getMemberByUserId(userId);
  }

  public CommunityMemberResponse getOrCreateMemberByUserId(UUID userId) {
    return communityMemberService.getOrCreateMemberByUserId(userId);
  }

  public CommunityMemberResponse updateMemberProfile(UUID memberId, UpdateProfileRequest request) {
    return communityMemberService.updateMemberProfile(memberId, request);
  }

  // ==================== Article Operations ====================

  @Transactional(readOnly = true)
  public Page<ArticleResponse> getArticles(
      ArticleCategory category, String tag, int page, int size) {
    return articleService.getArticles(category, tag, page, size);
  }

  @Transactional(readOnly = true)
  public ArticleResponse getArticle(UUID articleId) {
    return articleService.getArticle(articleId);
  }

  public ArticleResponse createArticle(UUID authorId, CreateArticleRequest request) {
    return articleService.createArticle(authorId, request);
  }

  public void likeArticle(UUID articleId, UUID memberId) {
    articleService.likeArticle(articleId, memberId);
  }

  // ==================== Q&A Operations ====================

  @Transactional(readOnly = true)
  public Page<QuestionResponse> getQuestions(
      QuestionStatus status, String tag, int page, int size) {
    return qaService.getQuestions(status, tag, page, size);
  }

  @Transactional(readOnly = true)
  public QuestionResponse getQuestion(UUID questionId) {
    return qaService.getQuestion(questionId);
  }

  public QuestionResponse createQuestion(UUID authorId, CreateQuestionRequest request) {
    return qaService.createQuestion(authorId, request);
  }

  public AnswerResponse answerQuestion(
      UUID questionId, UUID authorId, CreateAnswerRequest request) {
    return qaService.answerQuestion(questionId, authorId, request);
  }

  public void upvoteQuestion(UUID questionId, UUID memberId) {
    qaService.upvoteQuestion(questionId, memberId);
  }

  public void upvoteAnswer(UUID answerId, UUID memberId) {
    qaService.upvoteAnswer(answerId, memberId);
  }

  public void acceptAnswer(UUID questionId, UUID answerId, UUID memberId) {
    qaService.acceptAnswer(questionId, answerId, memberId);
  }

  // ==================== Success Stories ====================

  @Transactional(readOnly = true)
  public Page<SuccessStoryResponse> getStories(StoryCategory category, int page, int size) {
    return successStoryService.getStories(category, page, size);
  }

  public SuccessStoryResponse createStory(UUID authorId, CreateStoryRequest request) {
    return successStoryService.createStory(authorId, request);
  }

  public void likeStory(UUID storyId, UUID memberId) {
    successStoryService.likeStory(storyId, memberId);
  }

  public void celebrateStory(UUID storyId, UUID memberId) {
    successStoryService.celebrateStory(storyId, memberId);
  }

  public StoryCommentResponse addStoryComment(
      UUID storyId, UUID authorId, CreateCommentRequest request) {
    return successStoryService.addStoryComment(storyId, authorId, request);
  }

  // ==================== Templates ====================

  @Transactional(readOnly = true)
  public Page<TemplateResponse> getTemplates(TemplateType type, String tag, int page, int size) {
    return communityTemplateService.getTemplates(type, tag, page, size);
  }

  @Transactional(readOnly = true)
  public List<TemplateResponse> getFeaturedTemplates() {
    return communityTemplateService.getFeaturedTemplates();
  }

  public TemplateResponse createTemplate(UUID authorId, CreateTemplateRequest request) {
    return communityTemplateService.createTemplate(authorId, request);
  }

  public void downloadTemplate(UUID templateId, UUID memberId) {
    communityTemplateService.downloadTemplate(templateId, memberId);
  }

  public void rateTemplate(UUID templateId, UUID memberId, int rating) {
    communityTemplateService.rateTemplate(templateId, memberId, rating);
  }

  // ==================== Groups ====================

  @Transactional(readOnly = true)
  public Page<MotivationGroupResponse> getGroups(String lifeWheelAreaId, int page, int size) {
    return motivationGroupService.getGroups(lifeWheelAreaId, page, size);
  }

  public MotivationGroupResponse createGroup(UUID creatorId, CreateGroupRequest request) {
    return motivationGroupService.createGroup(creatorId, request);
  }

  public void joinGroup(UUID groupId, UUID memberId) {
    motivationGroupService.joinGroup(groupId, memberId);
  }

  public void leaveGroup(UUID groupId, UUID memberId) {
    motivationGroupService.leaveGroup(groupId, memberId);
  }

  // ==================== Accountability Partners ====================

  @Transactional(readOnly = true)
  public List<AccountabilityPartnerResponse> getPartners(UUID memberId) {
    return accountabilityPartnerService.getPartners(memberId);
  }

  public PartnerRequestResponse sendPartnerRequest(
      UUID fromMemberId, SendPartnerRequestRequest request) {
    return accountabilityPartnerService.sendPartnerRequest(fromMemberId, request);
  }

  public void acceptPartnerRequest(UUID requestId, UUID memberId) {
    accountabilityPartnerService.acceptPartnerRequest(requestId, memberId);
  }

  public void declinePartnerRequest(UUID requestId, UUID memberId) {
    accountabilityPartnerService.declinePartnerRequest(requestId, memberId);
  }

  // ==================== Activity Feed ====================

  @Transactional(readOnly = true)
  public Page<CommunityActivityResponse> getActivityFeed(int page, int size) {
    return communityActivityService.getActivityFeed(page, size);
  }

  @Transactional(readOnly = true)
  public Page<CommunityActivityResponse> getMemberActivities(UUID memberId, int page, int size) {
    return communityActivityService.getMemberActivities(memberId, page, size);
  }

  public void celebrateActivity(UUID activityId, UUID memberId) {
    communityActivityService.celebrateActivity(activityId, memberId);
  }

  // ==================== Leaderboard ====================

  @Transactional(readOnly = true)
  public List<LeaderboardEntryResponse> getLeaderboard(String timeframe, int limit) {
    Pageable pageable = PageRequest.of(0, limit, Sort.by(Sort.Direction.DESC, "reputationPoints"));
    List<CommunityMember> members = memberRepository.findAll(pageable).getContent();

    List<LeaderboardEntryResponse> leaderboard = new ArrayList<>();
    for (int i = 0; i < members.size(); i++) {
      CommunityMember m = members.get(i);
      leaderboard.add(
          new LeaderboardEntryResponse(
              m.getId(),
              m.getDisplayName(),
              m.getAvatar(),
              m.getLevel(),
              m.getLevelTitle(),
              m.getReputationPoints(),
              m.getCurrentStreak(),
              i + 1,
              0 // change from previous
              ));
    }
    return leaderboard;
  }

  // ==================== Badges ====================

  @Transactional(readOnly = true)
  public List<BadgeResponse> getAllBadges() {
    return badgeRepository.findAll().stream()
        .map(this::toBadgeResponse)
        .collect(Collectors.toList());
  }

  @Transactional(readOnly = true)
  public List<BadgeResponse> getMemberBadges(UUID memberId) {
    CommunityMember member =
        memberRepository
            .findById(memberId)
            .orElseThrow(() -> new ResourceNotFoundException("Member not found: " + memberId));

    return member.getBadges().stream()
        .map(
            badgeType ->
                badgeRepository.findByBadgeType(badgeType).map(this::toBadgeResponse).orElse(null))
        .filter(Objects::nonNull)
        .collect(Collectors.toList());
  }

  // ==================== Search ====================

  @Transactional(readOnly = true)
  public Page<CommunityMemberResponse> searchMembers(String query, int page, int size) {
    return communityMemberService.searchMembers(query, page, size);
  }

  // ==================== Response Mappers (only for cross-domain aggregators) ====================

  private BadgeResponse toBadgeResponse(CommunityBadge badge) {
    return new BadgeResponse(
        badge.getId(),
        badge.getBadgeType().name(),
        badge.getName(),
        badge.getDescription(),
        badge.getIcon(),
        badge.getRarity().name(),
        badge.getXpReward());
  }

  // ==================== Community Home Operations ====================

  @Transactional(readOnly = true)
  public CommunityHomeResponse getCommunityHome(UUID userId) {
    CommunityMemberResponse currentMember = getOrCreateMemberByUserId(userId);

    ArticleResponse featuredArticle =
        articleRepository
            .findFirstByIsFeaturedTrueOrderByCreatedAtDesc()
            .map(article -> articleService.toArticleResponse(article))
            .orElse(null);

    List<CommunityActivityResponse> recentActivity = communityActivityService.getRecentActivity();

    List<CommunityMemberResponse> topContributors =
        memberRepository.findTop5ByOrderByReputationPointsDesc().stream()
            .map(CommunityMemberMapper::toMemberResponse)
            .toList();

    return new CommunityHomeResponse(
        currentMember,
        featuredArticle,
        null, // activePoll - not implemented yet
        null, // weeklyChallenge - not implemented yet
        recentActivity,
        topContributors);
  }
}
