package app.kaiz.community.application;

import app.kaiz.community.application.dto.*;
import app.kaiz.community.domain.*;
import app.kaiz.community.infrastructure.*;
import app.kaiz.identity.domain.User;
import app.kaiz.identity.infrastructure.UserRepository;
import java.time.Instant;
import java.util.*;
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
 * Service handling all community-related business logic.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class CommunityService {

    private final CommunityMemberRepository memberRepository;
    private final ArticleRepository articleRepository;
    private final QuestionRepository questionRepository;
    private final AnswerRepository answerRepository;
    private final SuccessStoryRepository storyRepository;
    private final StoryCommentRepository commentRepository;
    private final CommunityTemplateRepository templateRepository;
    private final MotivationGroupRepository groupRepository;
    private final AccountabilityPartnerRepository partnerRepository;
    private final PartnerRequestRepository partnerRequestRepository;
    private final CommunityActivityRepository activityRepository;
    private final CommunityBadgeRepository badgeRepository;
    private final UserRepository userRepository;

    // ==================== Member Operations ====================

    @Transactional(readOnly = true)
    public CommunityMemberResponse getMemberProfile(UUID memberId) {
        CommunityMember member =
                memberRepository
                        .findById(memberId)
                        .orElseThrow(
                                () -> new IllegalArgumentException("Member not found: " + memberId));
        return toMemberResponse(member);
    }

    @Transactional(readOnly = true)
    public CommunityMemberResponse getMemberByUserId(UUID userId) {
        CommunityMember member =
                memberRepository
                        .findByUserId(userId)
                        .orElseThrow(
                                () ->
                                        new IllegalArgumentException(
                                                "Member not found for user: " + userId));
        return toMemberResponse(member);
    }

    public CommunityMemberResponse getOrCreateMemberByUserId(UUID userId) {
        return memberRepository
                .findByUserId(userId)
                .map(this::toMemberResponse)
                .orElseGet(() -> createMemberFromUser(userId));
    }

    private CommunityMemberResponse createMemberFromUser(UUID userId) {
        User user =
                userRepository
                        .findById(userId)
                        .orElseThrow(
                                () -> new IllegalArgumentException("User not found: " + userId));

        CommunityMember member =
                CommunityMember.builder()
                        .user(user)
                        .displayName(
                                user.getFullName() != null
                                        ? user.getFullName()
                                        : user.getEmail().split("@")[0])
                        .avatar("👤")
                        .bio("")
                        .level(1)
                        .levelTitle("Novice")
                        .reputationPoints(0)
                        .role(CommunityRole.MEMBER)
                        .isOnline(true)
                        .build();

        member = memberRepository.save(member);
        log.info("Created new community member for user: {}", userId);
        return toMemberResponse(member);
    }

    public CommunityMemberResponse updateMemberProfile(
            UUID memberId, UpdateProfileRequest request) {
        CommunityMember member =
                memberRepository
                        .findById(memberId)
                        .orElseThrow(
                                () -> new IllegalArgumentException("Member not found: " + memberId));

        if (request.displayName() != null) {
            member.setDisplayName(request.displayName());
        }
        if (request.bio() != null) {
            member.setBio(request.bio());
        }
        if (request.avatar() != null) {
            member.setAvatar(request.avatar());
        }
        if (request.showActivity() != null) {
            member.setShowActivity(request.showActivity());
        }
        if (request.acceptPartnerRequests() != null) {
            member.setAcceptPartnerRequests(request.acceptPartnerRequests());
        }

        member = memberRepository.save(member);
        return toMemberResponse(member);
    }

    // ==================== Article Operations ====================

    @Transactional(readOnly = true)
    public Page<ArticleResponse> getArticles(
            ArticleCategory category, String tag, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "publishedAt"));
        Page<Article> articles;

        if (category != null && tag != null) {
            articles =
                    articleRepository.findByIsPublishedAndCategoryAndTagsContaining(
                            true, category, tag, pageable);
        } else if (category != null) {
            articles = articleRepository.findByCategoryAndIsPublished(category, true, pageable);
        } else if (tag != null) {
            articles = articleRepository.findByIsPublishedAndTagsContaining(true, tag, pageable);
        } else {
            articles = articleRepository.findByIsPublished(true, pageable);
        }

        return articles.map(this::toArticleResponse);
    }

    @Transactional(readOnly = true)
    public ArticleResponse getArticle(UUID articleId) {
        Article article =
                articleRepository
                        .findById(articleId)
                        .orElseThrow(
                                () ->
                                        new IllegalArgumentException(
                                                "Article not found: " + articleId));
        article.incrementViewCount();
        articleRepository.save(article);
        return toArticleResponse(article);
    }

    public ArticleResponse createArticle(UUID authorId, CreateArticleRequest request) {
        CommunityMember author =
                memberRepository
                        .findById(authorId)
                        .orElseThrow(
                                () ->
                                        new IllegalArgumentException(
                                                "Member not found: " + authorId));

        Article article =
                Article.builder()
                        .author(author)
                        .title(request.title())
                        .excerpt(request.excerpt())
                        .content(request.content())
                        .category(request.category())
                        .coverImageUrl(request.coverImageUrl())
                        .tags(
                                request.tags() != null
                                        ? new ArrayList<>(request.tags())
                                        : new ArrayList<>())
                        .isPublished(request.isPublished() != null ? request.isPublished() : false)
                        .publishedAt(
                                request.isPublished() != null && request.isPublished()
                                        ? Instant.now()
                                        : null)
                        .readTimeMinutes(calculateReadTime(request.content()))
                        .build();

        article = articleRepository.save(article);

        if (article.getIsPublished()) {
            author.setTemplatesShared(author.getTemplatesShared() + 1);
            memberRepository.save(author);
            recordActivity(
                    author, ActivityType.STORY_POSTED, "Published article: " + article.getTitle());
        }

        return toArticleResponse(article);
    }

    public void likeArticle(UUID articleId, UUID memberId) {
        Article article =
                articleRepository
                        .findById(articleId)
                        .orElseThrow(
                                () ->
                                        new IllegalArgumentException(
                                                "Article not found: " + articleId));
        article.toggleLike(memberId);
        articleRepository.save(article);
    }

    // ==================== Q&A Operations ====================

    @Transactional(readOnly = true)
    public Page<QuestionResponse> getQuestions(
            QuestionStatus status, String tag, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Question> questions;

        if (status != null && tag != null) {
            questions = questionRepository.findByStatusAndTagsContaining(status, tag, pageable);
        } else if (status != null) {
            questions = questionRepository.findByStatus(status, pageable);
        } else if (tag != null) {
            questions = questionRepository.findByTagsContaining(tag, pageable);
        } else {
            questions = questionRepository.findAll(pageable);
        }

        return questions.map(this::toQuestionResponse);
    }

    @Transactional(readOnly = true)
    public QuestionResponse getQuestion(UUID questionId) {
        Question question =
                questionRepository
                        .findById(questionId)
                        .orElseThrow(
                                () ->
                                        new IllegalArgumentException(
                                                "Question not found: " + questionId));
        question.incrementViewCount();
        questionRepository.save(question);
        return toQuestionResponse(question);
    }

    public QuestionResponse createQuestion(UUID authorId, CreateQuestionRequest request) {
        CommunityMember author =
                memberRepository
                        .findById(authorId)
                        .orElseThrow(
                                () ->
                                        new IllegalArgumentException(
                                                "Member not found: " + authorId));

        Question question =
                Question.builder()
                        .author(author)
                        .title(request.title())
                        .body(request.body())
                        .tags(
                                request.tags() != null
                                        ? new ArrayList<>(request.tags())
                                        : new ArrayList<>())
                        .status(QuestionStatus.OPEN)
                        .build();

        question = questionRepository.save(question);
        return toQuestionResponse(question);
    }

    public AnswerResponse answerQuestion(
            UUID questionId, UUID authorId, CreateAnswerRequest request) {
        Question question =
                questionRepository
                        .findById(questionId)
                        .orElseThrow(
                                () ->
                                        new IllegalArgumentException(
                                                "Question not found: " + questionId));
        CommunityMember author =
                memberRepository
                        .findById(authorId)
                        .orElseThrow(
                                () ->
                                        new IllegalArgumentException(
                                                "Member not found: " + authorId));

        Answer answer =
                Answer.builder().question(question).author(author).body(request.body()).build();

        answer = answerRepository.save(answer);
        question.setAnswerCount(question.getAnswerCount() + 1);
        questionRepository.save(question);

        author.setHelpfulAnswers(author.getHelpfulAnswers() + 1);
        memberRepository.save(author);

        recordActivity(author, ActivityType.QUESTION_ANSWERED, "Answered: " + question.getTitle());

        return toAnswerResponse(answer);
    }

    public void upvoteQuestion(UUID questionId, UUID memberId) {
        Question question =
                questionRepository
                        .findById(questionId)
                        .orElseThrow(
                                () ->
                                        new IllegalArgumentException(
                                                "Question not found: " + questionId));
        question.toggleUpvote(memberId);
        questionRepository.save(question);
    }

    public void upvoteAnswer(UUID answerId, UUID memberId) {
        Answer answer =
                answerRepository
                        .findById(answerId)
                        .orElseThrow(
                                () -> new IllegalArgumentException("Answer not found: " + answerId));
        answer.toggleUpvote(memberId);
        answerRepository.save(answer);
    }

    public void acceptAnswer(UUID questionId, UUID answerId, UUID memberId) {
        Question question =
                questionRepository
                        .findById(questionId)
                        .orElseThrow(
                                () ->
                                        new IllegalArgumentException(
                                                "Question not found: " + questionId));

        if (!question.getAuthor().getId().equals(memberId)) {
            throw new IllegalArgumentException("Only question author can accept an answer");
        }

        Answer answer =
                answerRepository
                        .findById(answerId)
                        .orElseThrow(
                                () -> new IllegalArgumentException("Answer not found: " + answerId));

        question.setAcceptedAnswerId(answerId);
        question.setStatus(QuestionStatus.ANSWERED);
        answer.setIsAccepted(true);

        questionRepository.save(question);
        answerRepository.save(answer);
    }

    // ==================== Success Stories ====================

    @Transactional(readOnly = true)
    public Page<SuccessStoryResponse> getStories(StoryCategory category, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<SuccessStory> stories;

        if (category != null) {
            stories = storyRepository.findByCategory(category, pageable);
        } else {
            stories = storyRepository.findAll(pageable);
        }

        return stories.map(this::toStoryResponse);
    }

    public SuccessStoryResponse createStory(UUID authorId, CreateStoryRequest request) {
        CommunityMember author =
                memberRepository
                        .findById(authorId)
                        .orElseThrow(
                                () ->
                                        new IllegalArgumentException(
                                                "Member not found: " + authorId));

        SuccessStory story =
                SuccessStory.builder()
                        .author(author)
                        .title(request.title())
                        .story(request.story())
                        .category(request.category())
                        .lifeWheelAreaId(request.lifeWheelAreaId())
                        .imageUrls(
                                request.imageUrls() != null
                                        ? new ArrayList<>(request.imageUrls())
                                        : new ArrayList<>())
                        .build();

        story = storyRepository.save(story);

        recordActivity(author, ActivityType.STORY_POSTED, "Shared a win: " + story.getTitle());

        return toStoryResponse(story);
    }

    public void likeStory(UUID storyId, UUID memberId) {
        SuccessStory story =
                storyRepository
                        .findById(storyId)
                        .orElseThrow(
                                () -> new IllegalArgumentException("Story not found: " + storyId));
        story.toggleLike(memberId);
        storyRepository.save(story);
    }

    public void celebrateStory(UUID storyId, UUID memberId) {
        SuccessStory story =
                storyRepository
                        .findById(storyId)
                        .orElseThrow(
                                () -> new IllegalArgumentException("Story not found: " + storyId));
        story.toggleCelebrate(memberId);
        storyRepository.save(story);
    }

    public StoryCommentResponse addStoryComment(
            UUID storyId, UUID authorId, CreateCommentRequest request) {
        SuccessStory story =
                storyRepository
                        .findById(storyId)
                        .orElseThrow(
                                () -> new IllegalArgumentException("Story not found: " + storyId));
        CommunityMember author =
                memberRepository
                        .findById(authorId)
                        .orElseThrow(
                                () ->
                                        new IllegalArgumentException(
                                                "Member not found: " + authorId));

        StoryComment comment =
                StoryComment.builder().story(story).author(author).text(request.text()).build();

        comment = commentRepository.save(comment);
        story.setCommentCount(story.getCommentCount() + 1);
        storyRepository.save(story);

        return toCommentResponse(comment);
    }

    // ==================== Templates ====================

    @Transactional(readOnly = true)
    public Page<TemplateResponse> getTemplates(TemplateType type, String tag, int page, int size) {
        Pageable pageable =
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "downloadCount"));
        Page<CommunityTemplate> templates;

        if (type != null) {
            templates = templateRepository.findByTemplateType(type, pageable);
        } else {
            templates = templateRepository.findAll(pageable);
        }

        return templates.map(this::toTemplateResponse);
    }

    @Transactional(readOnly = true)
    public List<TemplateResponse> getFeaturedTemplates() {
        return templateRepository.findByIsFeaturedTrueOrderByDownloadCountDesc()
                .stream()
                .map(this::toTemplateResponse)
                .toList();
    }

    public TemplateResponse createTemplate(UUID authorId, CreateTemplateRequest request) {
        CommunityMember author =
                memberRepository
                        .findById(authorId)
                        .orElseThrow(
                                () ->
                                        new IllegalArgumentException(
                                                "Member not found: " + authorId));

        CommunityTemplate template =
                CommunityTemplate.builder()
                        .author(author)
                        .name(request.name())
                        .description(request.description())
                        .templateType(request.templateType())
                        .content(request.content())
                        .lifeWheelAreaId(request.lifeWheelAreaId())
                        .tags(
                                request.tags() != null
                                        ? new ArrayList<>(request.tags())
                                        : new ArrayList<>())
                        .previewImageUrl(request.previewImageUrl())
                        .build();

        template = templateRepository.save(template);

        author.setTemplatesShared(author.getTemplatesShared() + 1);
        memberRepository.save(author);

        recordActivity(author, ActivityType.TEMPLATE_SHARED, "Shared template: " + template.getName());

        return toTemplateResponse(template);
    }

    public void downloadTemplate(UUID templateId, UUID memberId) {
        CommunityTemplate template =
                templateRepository
                        .findById(templateId)
                        .orElseThrow(
                                () ->
                                        new IllegalArgumentException(
                                                "Template not found: " + templateId));
        template.incrementDownloadCount();
        templateRepository.save(template);
    }

    public void rateTemplate(UUID templateId, UUID memberId, int rating) {
        CommunityTemplate template =
                templateRepository
                        .findById(templateId)
                        .orElseThrow(
                                () ->
                                        new IllegalArgumentException(
                                                "Template not found: " + templateId));
        template.addRating(rating);
        templateRepository.save(template);
    }

    // ==================== Groups ====================

    @Transactional(readOnly = true)
    public Page<MotivationGroupResponse> getGroups(String lifeWheelAreaId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "memberCount"));
        Page<MotivationGroup> groups;

        if (lifeWheelAreaId != null) {
            groups = groupRepository.findByLifeWheelAreaId(lifeWheelAreaId, pageable);
        } else {
            groups = groupRepository.findByIsPrivate(false, pageable);
        }

        return groups.map(this::toGroupResponse);
    }

    public MotivationGroupResponse createGroup(UUID creatorId, CreateGroupRequest request) {
        CommunityMember creator =
                memberRepository
                        .findById(creatorId)
                        .orElseThrow(
                                () ->
                                        new IllegalArgumentException(
                                                "Member not found: " + creatorId));

        MotivationGroup group =
                MotivationGroup.builder()
                        .creator(creator)
                        .name(request.name())
                        .description(request.description())
                        .lifeWheelAreaId(request.lifeWheelAreaId())
                        .coverImageUrl(request.coverImageUrl())
                        .isPrivate(request.isPrivate() != null ? request.isPrivate() : false)
                        .maxMembers(request.maxMembers() != null ? request.maxMembers() : 100)
                        .tags(
                                request.tags() != null
                                        ? new ArrayList<>(request.tags())
                                        : new ArrayList<>())
                        .build();

        group.addMember(creatorId);
        group = groupRepository.save(group);

        return toGroupResponse(group);
    }

    public void joinGroup(UUID groupId, UUID memberId) {
        MotivationGroup group =
                groupRepository
                        .findById(groupId)
                        .orElseThrow(
                                () -> new IllegalArgumentException("Group not found: " + groupId));

        if (!group.addMember(memberId)) {
            throw new IllegalArgumentException("Group is full");
        }

        groupRepository.save(group);

        CommunityMember member =
                memberRepository
                        .findById(memberId)
                        .orElseThrow(
                                () ->
                                        new IllegalArgumentException(
                                                "Member not found: " + memberId));
        recordActivity(member, ActivityType.CHALLENGE_JOINED, "Joined group: " + group.getName());
    }

    public void leaveGroup(UUID groupId, UUID memberId) {
        MotivationGroup group =
                groupRepository
                        .findById(groupId)
                        .orElseThrow(
                                () -> new IllegalArgumentException("Group not found: " + groupId));
        group.removeMember(memberId);
        groupRepository.save(group);
    }

    // ==================== Accountability Partners ====================

    @Transactional(readOnly = true)
    public List<AccountabilityPartnerResponse> getPartners(UUID memberId) {
        List<AccountabilityPartner> partnerships =
                partnerRepository.findByMemberIdOrPartnerId(memberId, memberId);
        return partnerships.stream()
                .map(p -> toPartnerResponse(p, memberId))
                .collect(Collectors.toList());
    }

    public PartnerRequestResponse sendPartnerRequest(
            UUID fromMemberId, SendPartnerRequestRequest request) {
        CommunityMember fromMember =
                memberRepository
                        .findById(fromMemberId)
                        .orElseThrow(
                                () ->
                                        new IllegalArgumentException(
                                                "Member not found: " + fromMemberId));
        CommunityMember toMember =
                memberRepository
                        .findById(request.toMemberId())
                        .orElseThrow(
                                () ->
                                        new IllegalArgumentException(
                                                "Member not found: " + request.toMemberId()));

        if (!toMember.getAcceptPartnerRequests()) {
            throw new IllegalArgumentException("Member is not accepting partner requests");
        }

        PartnerRequest partnerRequest =
                PartnerRequest.builder()
                        .fromMember(fromMember)
                        .toMember(toMember)
                        .message(request.message())
                        .status(PartnerRequestStatus.PENDING)
                        .build();

        partnerRequest = partnerRequestRepository.save(partnerRequest);
        return toPartnerRequestResponse(partnerRequest);
    }

    public void acceptPartnerRequest(UUID requestId, UUID memberId) {
        PartnerRequest request =
                partnerRequestRepository
                        .findById(requestId)
                        .orElseThrow(
                                () ->
                                        new IllegalArgumentException(
                                                "Request not found: " + requestId));

        if (!request.getToMember().getId().equals(memberId)) {
            throw new IllegalArgumentException("Not authorized to accept this request");
        }

        request.accept();
        partnerRequestRepository.save(request);

        AccountabilityPartner partnership =
                AccountabilityPartner.builder()
                        .member(request.getFromMember())
                        .partner(request.getToMember())
                        .connectedSince(Instant.now())
                        .build();

        partnerRepository.save(partnership);
    }

    public void declinePartnerRequest(UUID requestId, UUID memberId) {
        PartnerRequest request =
                partnerRequestRepository
                        .findById(requestId)
                        .orElseThrow(
                                () ->
                                        new IllegalArgumentException(
                                                "Request not found: " + requestId));

        if (!request.getToMember().getId().equals(memberId)) {
            throw new IllegalArgumentException("Not authorized to decline this request");
        }

        request.decline();
        partnerRequestRepository.save(request);
    }

    // ==================== Activity Feed ====================

    @Transactional(readOnly = true)
    public Page<CommunityActivityResponse> getActivityFeed(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return activityRepository.findAll(pageable).map(this::toActivityResponse);
    }

    @Transactional(readOnly = true)
    public Page<CommunityActivityResponse> getMemberActivities(UUID memberId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return activityRepository.findByMemberId(memberId, pageable).map(this::toActivityResponse);
    }

    public void celebrateActivity(UUID activityId, UUID memberId) {
        CommunityActivity activity =
                activityRepository
                        .findById(activityId)
                        .orElseThrow(
                                () ->
                                        new IllegalArgumentException(
                                                "Activity not found: " + activityId));
        activity.celebrate(memberId);
        activityRepository.save(activity);
    }

    private void recordActivity(CommunityMember member, ActivityType type, String title) {
        CommunityActivity activity =
                CommunityActivity.builder()
                        .member(member)
                        .activityType(type)
                        .title(title)
                        .build();
        activityRepository.save(activity);
    }

    // ==================== Leaderboard ====================

    @Transactional(readOnly = true)
    public List<LeaderboardEntryResponse> getLeaderboard(String timeframe, int limit) {
        Pageable pageable =
                PageRequest.of(0, limit, Sort.by(Sort.Direction.DESC, "reputationPoints"));
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
                        .orElseThrow(
                                () -> new IllegalArgumentException("Member not found: " + memberId));

        return member.getBadges().stream()
                .map(
                        badgeType ->
                                badgeRepository
                                        .findByBadgeType(badgeType)
                                        .map(this::toBadgeResponse)
                                        .orElse(null))
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }

    // ==================== Search ====================

    @Transactional(readOnly = true)
    public Page<CommunityMemberResponse> searchMembers(String query, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return memberRepository
                .findByDisplayNameContainingIgnoreCase(query, pageable)
                .map(this::toMemberResponse);
    }

    // ==================== Response Mappers ====================

    private CommunityMemberResponse toMemberResponse(CommunityMember member) {
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

    private ArticleResponse toArticleResponse(Article article) {
        return new ArticleResponse(
                article.getId(),
                article.getTitle(),
                article.getExcerpt(),
                article.getContent(),
                article.getCategory().name(),
                article.getCoverImageUrl(),
                toMemberResponse(article.getAuthor()),
                article.getPublishedAt(),
                article.getIsPublished(),
                article.getIsFeatured(),
                article.getReadTimeMinutes(),
                article.getViewCount(),
                article.getLikeCount(),
                article.getTags(),
                article.getCreatedAt());
    }

    private QuestionResponse toQuestionResponse(Question question) {
        List<AnswerResponse> answerResponses =
                question.getAnswers().stream()
                        .map(this::toAnswerResponse)
                        .collect(Collectors.toList());

        return new QuestionResponse(
                question.getId(),
                question.getTitle(),
                question.getBody(),
                toMemberResponse(question.getAuthor()),
                question.getTags(),
                question.getStatus().name(),
                question.getViewCount(),
                question.getUpvoteCount(),
                question.getAnswerCount(),
                question.getAcceptedAnswerId(),
                answerResponses,
                question.getCreatedAt());
    }

    private AnswerResponse toAnswerResponse(Answer answer) {
        return new AnswerResponse(
                answer.getId(),
                answer.getBody(),
                toMemberResponse(answer.getAuthor()),
                answer.getUpvoteCount(),
                answer.getIsVerified(),
                answer.getIsAccepted(),
                answer.getCreatedAt());
    }

    private SuccessStoryResponse toStoryResponse(SuccessStory story) {
        List<StoryCommentResponse> commentResponses =
                story.getComments().stream()
                        .map(this::toCommentResponse)
                        .collect(Collectors.toList());

        return new SuccessStoryResponse(
                story.getId(),
                toMemberResponse(story.getAuthor()),
                story.getTitle(),
                story.getStory(),
                story.getCategory().name(),
                story.getLifeWheelAreaId(),
                story.getImageUrls(),
                story.getLikeCount(),
                story.getCommentCount(),
                story.getCelebrateCount(),
                commentResponses,
                story.getCreatedAt());
    }

    private StoryCommentResponse toCommentResponse(StoryComment comment) {
        return new StoryCommentResponse(
                comment.getId(),
                toMemberResponse(comment.getAuthor()),
                comment.getText(),
                comment.getCreatedAt());
    }

    private TemplateResponse toTemplateResponse(CommunityTemplate template) {
        return new TemplateResponse(
                template.getId(),
                template.getName(),
                template.getDescription(),
                template.getTemplateType().name(),
                toMemberResponse(template.getAuthor()),
                template.getContent(),
                template.getLifeWheelAreaId(),
                template.getTags(),
                template.getDownloadCount(),
                template.getRating(),
                template.getRatingCount(),
                template.getPreviewImageUrl(),
                template.getIsFeatured(),
                template.getCreatedAt());
    }

    private MotivationGroupResponse toGroupResponse(MotivationGroup group) {
        return new MotivationGroupResponse(
                group.getId(),
                group.getName(),
                group.getDescription(),
                group.getCoverImageUrl(),
                group.getLifeWheelAreaId(),
                group.getMemberCount(),
                group.getMaxMembers(),
                group.getIsPrivate(),
                toMemberResponse(group.getCreator()),
                group.getTags(),
                group.getCreatedAt());
    }

    private AccountabilityPartnerResponse toPartnerResponse(
            AccountabilityPartner partnership, UUID currentMemberId) {
        CommunityMember partnerMember =
                partnership.getMember().getId().equals(currentMemberId)
                        ? partnership.getPartner()
                        : partnership.getMember();

        return new AccountabilityPartnerResponse(
                partnership.getId(),
                toMemberResponse(partnerMember),
                partnership.getConnectedSince(),
                partnership.getCheckInStreak(),
                partnership.getLastInteraction(),
                partnership.getSharedChallengeIds());
    }

    private PartnerRequestResponse toPartnerRequestResponse(PartnerRequest request) {
        return new PartnerRequestResponse(
                request.getId(),
                toMemberResponse(request.getFromMember()),
                toMemberResponse(request.getToMember()),
                request.getMessage(),
                request.getStatus().name(),
                request.getCreatedAt());
    }

    private CommunityActivityResponse toActivityResponse(CommunityActivity activity) {
        return new CommunityActivityResponse(
                activity.getId(),
                toMemberResponse(activity.getMember()),
                activity.getActivityType().name(),
                activity.getTitle(),
                activity.getDescription(),
                activity.getMetadata(),
                activity.getCelebrateCount(),
                activity.getCreatedAt());
    }

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

    private int calculateReadTime(String content) {
        if (content == null) return 1;
        int wordCount = content.split("\\s+").length;
        return Math.max(1, wordCount / 200); // Average reading speed
    }

    // ==================== Community Home Operations ====================

    @Transactional(readOnly = true)
    public CommunityHomeResponse getCommunityHome(UUID userId) {
        // Get or create current member
        CommunityMemberResponse currentMember = getOrCreateMemberByUserId(userId);

        // Get featured article (latest featured or most recent)
        ArticleResponse featuredArticle = articleRepository.findFirstByIsFeaturedTrueOrderByCreatedAtDesc()
                .map(this::toArticleResponse)
                .orElse(null);

        // Get recent activity (last 10 activities)
        List<CommunityActivityResponse> recentActivity = activityRepository
                .findTop10ByOrderByCreatedAtDesc()
                .stream()
                .map(this::toActivityResponse)
                .toList();

        // Get top contributors (by reputation points)
        List<CommunityMemberResponse> topContributors = memberRepository
                .findTop5ByOrderByReputationPointsDesc()
                .stream()
                .map(this::toMemberResponse)
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
