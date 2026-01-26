package app.kaiz.community.api;

import app.kaiz.community.application.CommunityService;
import app.kaiz.community.application.dto.*;
import app.kaiz.community.domain.*;
import app.kaiz.shared.security.CurrentUser;
import app.kaiz.shared.util.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/** REST API controller for community features. */
@RestController
@RequestMapping("/api/v1/community")
@RequiredArgsConstructor
@Tag(name = "Community", description = "Community features API")
public class CommunityController {

    private final CommunityService communityService;

    // ==================== Home Endpoint ====================

    @GetMapping("/home")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Get community home data", description = "Returns featured content, activity, and top contributors for the current user")
    public ResponseEntity<ApiResponse<CommunityHomeResponse>> getCommunityHome(
            @CurrentUser UUID userId) {
        CommunityHomeResponse response = communityService.getCommunityHome(userId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    // ==================== Member Endpoints ====================

    @GetMapping("/members/{memberId}")
    @Operation(summary = "Get member profile by ID")
    public ResponseEntity<ApiResponse<CommunityMemberResponse>> getMemberProfile(
            @PathVariable UUID memberId) {
        CommunityMemberResponse response = communityService.getMemberProfile(memberId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/members/by-user/{userId}")
    @Operation(summary = "Get member profile by user ID")
    public ResponseEntity<ApiResponse<CommunityMemberResponse>> getMemberByUserId(
            @PathVariable UUID userId) {
        CommunityMemberResponse response = communityService.getMemberByUserId(userId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/members/me")
    @Operation(summary = "Get or create member profile for current user")
    public ResponseEntity<ApiResponse<CommunityMemberResponse>> getOrCreateMember(
            @RequestParam UUID userId) {
        CommunityMemberResponse response = communityService.getOrCreateMemberByUserId(userId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/members/{memberId}")
    @Operation(summary = "Update member profile")
    public ResponseEntity<ApiResponse<CommunityMemberResponse>> updateMemberProfile(
            @PathVariable UUID memberId, @Valid @RequestBody UpdateProfileRequest request) {
        CommunityMemberResponse response =
                communityService.updateMemberProfile(memberId, request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/members/search")
    @Operation(summary = "Search members by name")
    public ResponseEntity<ApiResponse<Page<CommunityMemberResponse>>> searchMembers(
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<CommunityMemberResponse> response = communityService.searchMembers(query, page, size);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    // ==================== Article Endpoints ====================

    @GetMapping("/articles")
    @Operation(summary = "Get articles with optional filtering")
    public ResponseEntity<ApiResponse<Page<ArticleResponse>>> getArticles(
            @RequestParam(required = false) ArticleCategory category,
            @RequestParam(required = false) String tag,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<ArticleResponse> response = communityService.getArticles(category, tag, page, size);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/articles/{articleId}")
    @Operation(summary = "Get article by ID")
    public ResponseEntity<ApiResponse<ArticleResponse>> getArticle(@PathVariable UUID articleId) {
        ArticleResponse response = communityService.getArticle(articleId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/articles")
    @Operation(summary = "Create a new article")
    public ResponseEntity<ApiResponse<ArticleResponse>> createArticle(
            @RequestParam UUID authorId, @Valid @RequestBody CreateArticleRequest request) {
        ArticleResponse response = communityService.createArticle(authorId, request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/articles/{articleId}/like")
    @Operation(summary = "Toggle like on an article")
    public ResponseEntity<ApiResponse<Void>> likeArticle(
            @PathVariable UUID articleId, @RequestParam UUID memberId) {
        communityService.likeArticle(articleId, memberId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    // ==================== Question Endpoints ====================

    @GetMapping("/questions")
    @Operation(summary = "Get questions with optional filtering")
    public ResponseEntity<ApiResponse<Page<QuestionResponse>>> getQuestions(
            @RequestParam(required = false) QuestionStatus status,
            @RequestParam(required = false) String tag,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<QuestionResponse> response = communityService.getQuestions(status, tag, page, size);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/questions/{questionId}")
    @Operation(summary = "Get question by ID")
    public ResponseEntity<ApiResponse<QuestionResponse>> getQuestion(
            @PathVariable UUID questionId) {
        QuestionResponse response = communityService.getQuestion(questionId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/questions")
    @Operation(summary = "Create a new question")
    public ResponseEntity<ApiResponse<QuestionResponse>> createQuestion(
            @RequestParam UUID authorId, @Valid @RequestBody CreateQuestionRequest request) {
        QuestionResponse response = communityService.createQuestion(authorId, request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/questions/{questionId}/answers")
    @Operation(summary = "Post an answer to a question")
    public ResponseEntity<ApiResponse<AnswerResponse>> answerQuestion(
            @PathVariable UUID questionId,
            @RequestParam UUID authorId,
            @Valid @RequestBody CreateAnswerRequest request) {
        AnswerResponse response = communityService.answerQuestion(questionId, authorId, request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/questions/{questionId}/upvote")
    @Operation(summary = "Toggle upvote on a question")
    public ResponseEntity<ApiResponse<Void>> upvoteQuestion(
            @PathVariable UUID questionId, @RequestParam UUID memberId) {
        communityService.upvoteQuestion(questionId, memberId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @PostMapping("/answers/{answerId}/upvote")
    @Operation(summary = "Toggle upvote on an answer")
    public ResponseEntity<ApiResponse<Void>> upvoteAnswer(
            @PathVariable UUID answerId, @RequestParam UUID memberId) {
        communityService.upvoteAnswer(answerId, memberId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @PostMapping("/questions/{questionId}/accept/{answerId}")
    @Operation(summary = "Accept an answer as the solution")
    public ResponseEntity<ApiResponse<Void>> acceptAnswer(
            @PathVariable UUID questionId,
            @PathVariable UUID answerId,
            @RequestParam UUID memberId) {
        communityService.acceptAnswer(questionId, answerId, memberId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    // ==================== Story Endpoints ====================

    @GetMapping("/stories")
    @Operation(summary = "Get success stories with optional filtering")
    public ResponseEntity<ApiResponse<Page<SuccessStoryResponse>>> getStories(
            @RequestParam(required = false) StoryCategory category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<SuccessStoryResponse> response = communityService.getStories(category, page, size);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/stories")
    @Operation(summary = "Share a success story")
    public ResponseEntity<ApiResponse<SuccessStoryResponse>> createStory(
            @RequestParam UUID authorId, @Valid @RequestBody CreateStoryRequest request) {
        SuccessStoryResponse response = communityService.createStory(authorId, request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/stories/{storyId}/like")
    @Operation(summary = "Toggle like on a story")
    public ResponseEntity<ApiResponse<Void>> likeStory(
            @PathVariable UUID storyId, @RequestParam UUID memberId) {
        communityService.likeStory(storyId, memberId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @PostMapping("/stories/{storyId}/celebrate")
    @Operation(summary = "Celebrate a story")
    public ResponseEntity<ApiResponse<Void>> celebrateStory(
            @PathVariable UUID storyId, @RequestParam UUID memberId) {
        communityService.celebrateStory(storyId, memberId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @PostMapping("/stories/{storyId}/comments")
    @Operation(summary = "Add a comment to a story")
    public ResponseEntity<ApiResponse<StoryCommentResponse>> addStoryComment(
            @PathVariable UUID storyId,
            @RequestParam UUID authorId,
            @Valid @RequestBody CreateCommentRequest request) {
        StoryCommentResponse response =
                communityService.addStoryComment(storyId, authorId, request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    // ==================== Template Endpoints ====================

    @GetMapping("/templates")
    @Operation(summary = "Get templates with optional filtering")
    public ResponseEntity<ApiResponse<Page<TemplateResponse>>> getTemplates(
            @RequestParam(required = false) TemplateType type,
            @RequestParam(required = false) String tag,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<TemplateResponse> response = communityService.getTemplates(type, tag, page, size);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/templates/featured")
    @Operation(summary = "Get featured templates")
    public ResponseEntity<ApiResponse<List<TemplateResponse>>> getFeaturedTemplates() {
        List<TemplateResponse> response = communityService.getFeaturedTemplates();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/templates")
    @Operation(summary = "Share a new template")
    public ResponseEntity<ApiResponse<TemplateResponse>> createTemplate(
            @RequestParam UUID authorId, @Valid @RequestBody CreateTemplateRequest request) {
        TemplateResponse response = communityService.createTemplate(authorId, request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/templates/{templateId}/download")
    @Operation(summary = "Record a template download")
    public ResponseEntity<ApiResponse<Void>> downloadTemplate(
            @PathVariable UUID templateId, @RequestParam UUID memberId) {
        communityService.downloadTemplate(templateId, memberId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @PostMapping("/templates/{templateId}/rate")
    @Operation(summary = "Rate a template")
    public ResponseEntity<ApiResponse<Void>> rateTemplate(
            @PathVariable UUID templateId,
            @RequestParam UUID memberId,
            @RequestParam int rating) {
        communityService.rateTemplate(templateId, memberId, rating);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    // ==================== Group Endpoints ====================

    @GetMapping("/groups")
    @Operation(summary = "Get groups with optional filtering")
    public ResponseEntity<ApiResponse<Page<MotivationGroupResponse>>> getGroups(
            @RequestParam(required = false) String lifeWheelAreaId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<MotivationGroupResponse> response =
                communityService.getGroups(lifeWheelAreaId, page, size);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/groups")
    @Operation(summary = "Create a new group")
    public ResponseEntity<ApiResponse<MotivationGroupResponse>> createGroup(
            @RequestParam UUID creatorId, @Valid @RequestBody CreateGroupRequest request) {
        MotivationGroupResponse response = communityService.createGroup(creatorId, request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/groups/{groupId}/join")
    @Operation(summary = "Join a group")
    public ResponseEntity<ApiResponse<Void>> joinGroup(
            @PathVariable UUID groupId, @RequestParam UUID memberId) {
        communityService.joinGroup(groupId, memberId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @PostMapping("/groups/{groupId}/leave")
    @Operation(summary = "Leave a group")
    public ResponseEntity<ApiResponse<Void>> leaveGroup(
            @PathVariable UUID groupId, @RequestParam UUID memberId) {
        communityService.leaveGroup(groupId, memberId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    // ==================== Partner Endpoints ====================

    @GetMapping("/partners")
    @Operation(summary = "Get accountability partners for a member")
    public ResponseEntity<ApiResponse<List<AccountabilityPartnerResponse>>> getPartners(
            @RequestParam UUID memberId) {
        List<AccountabilityPartnerResponse> response = communityService.getPartners(memberId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/partners/request")
    @Operation(summary = "Send a partner request")
    public ResponseEntity<ApiResponse<PartnerRequestResponse>> sendPartnerRequest(
            @RequestParam UUID fromMemberId,
            @Valid @RequestBody SendPartnerRequestRequest request) {
        PartnerRequestResponse response =
                communityService.sendPartnerRequest(fromMemberId, request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/partners/request/{requestId}/accept")
    @Operation(summary = "Accept a partner request")
    public ResponseEntity<ApiResponse<Void>> acceptPartnerRequest(
            @PathVariable UUID requestId, @RequestParam UUID memberId) {
        communityService.acceptPartnerRequest(requestId, memberId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @PostMapping("/partners/request/{requestId}/decline")
    @Operation(summary = "Decline a partner request")
    public ResponseEntity<ApiResponse<Void>> declinePartnerRequest(
            @PathVariable UUID requestId, @RequestParam UUID memberId) {
        communityService.declinePartnerRequest(requestId, memberId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    // ==================== Activity Endpoints ====================

    @GetMapping("/activities")
    @Operation(summary = "Get community activity feed")
    public ResponseEntity<ApiResponse<Page<CommunityActivityResponse>>> getActivityFeed(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<CommunityActivityResponse> response = communityService.getActivityFeed(page, size);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/activities/member/{memberId}")
    @Operation(summary = "Get activities for a specific member")
    public ResponseEntity<ApiResponse<Page<CommunityActivityResponse>>> getMemberActivities(
            @PathVariable UUID memberId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<CommunityActivityResponse> response =
                communityService.getMemberActivities(memberId, page, size);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/activities/{activityId}/celebrate")
    @Operation(summary = "Celebrate an activity")
    public ResponseEntity<ApiResponse<Void>> celebrateActivity(
            @PathVariable UUID activityId, @RequestParam UUID memberId) {
        communityService.celebrateActivity(activityId, memberId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    // ==================== Leaderboard Endpoints ====================

    @GetMapping("/leaderboard")
    @Operation(summary = "Get community leaderboard")
    public ResponseEntity<ApiResponse<List<LeaderboardEntryResponse>>> getLeaderboard(
            @RequestParam(defaultValue = "weekly") String timeframe,
            @RequestParam(defaultValue = "50") int limit) {
        List<LeaderboardEntryResponse> response =
                communityService.getLeaderboard(timeframe, limit);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    // ==================== Badge Endpoints ====================

    @GetMapping("/badges")
    @Operation(summary = "Get all available badges")
    public ResponseEntity<ApiResponse<List<BadgeResponse>>> getAllBadges() {
        List<BadgeResponse> response = communityService.getAllBadges();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/badges/member/{memberId}")
    @Operation(summary = "Get badges earned by a member")
    public ResponseEntity<ApiResponse<List<BadgeResponse>>> getMemberBadges(
            @PathVariable UUID memberId) {
        List<BadgeResponse> response = communityService.getMemberBadges(memberId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
