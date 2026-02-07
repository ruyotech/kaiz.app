package app.kaiz.community.application;

import app.kaiz.community.application.dto.CommunityMemberResponse;
import app.kaiz.community.application.dto.CreateCommentRequest;
import app.kaiz.community.application.dto.CreateStoryRequest;
import app.kaiz.community.application.dto.StoryCommentResponse;
import app.kaiz.community.application.dto.SuccessStoryResponse;
import app.kaiz.community.domain.ActivityType;
import app.kaiz.community.domain.CommunityMember;
import app.kaiz.community.domain.StoryCategory;
import app.kaiz.community.domain.StoryComment;
import app.kaiz.community.domain.SuccessStory;
import app.kaiz.community.infrastructure.CommunityMemberRepository;
import app.kaiz.community.infrastructure.StoryCommentRepository;
import app.kaiz.community.infrastructure.SuccessStoryRepository;
import app.kaiz.shared.exception.ResourceNotFoundException;
import java.util.ArrayList;
import java.util.List;
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

/** Handles community success stories, likes, celebrates, and comments. */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class SuccessStoryService {

  private final SuccessStoryRepository storyRepository;
  private final StoryCommentRepository commentRepository;
  private final CommunityMemberRepository memberRepository;
  private final CommunityActivityService activityService;

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
            .orElseThrow(() -> new ResourceNotFoundException("Member not found: " + authorId));

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

    activityService.recordActivity(
        author, ActivityType.STORY_POSTED, "Shared a win: " + story.getTitle());

    return toStoryResponse(story);
  }

  public void likeStory(UUID storyId, UUID memberId) {
    SuccessStory story =
        storyRepository
            .findById(storyId)
            .orElseThrow(() -> new ResourceNotFoundException("Story not found: " + storyId));
    story.toggleLike(memberId);
    storyRepository.save(story);
  }

  public void celebrateStory(UUID storyId, UUID memberId) {
    SuccessStory story =
        storyRepository
            .findById(storyId)
            .orElseThrow(() -> new ResourceNotFoundException("Story not found: " + storyId));
    story.toggleCelebrate(memberId);
    storyRepository.save(story);
  }

  public StoryCommentResponse addStoryComment(
      UUID storyId, UUID authorId, CreateCommentRequest request) {
    SuccessStory story =
        storyRepository
            .findById(storyId)
            .orElseThrow(() -> new ResourceNotFoundException("Story not found: " + storyId));
    CommunityMember author =
        memberRepository
            .findById(authorId)
            .orElseThrow(() -> new ResourceNotFoundException("Member not found: " + authorId));

    StoryComment comment =
        StoryComment.builder().story(story).author(author).text(request.text()).build();

    comment = commentRepository.save(comment);
    story.setCommentCount(story.getCommentCount() + 1);
    storyRepository.save(story);

    return toCommentResponse(comment);
  }

  SuccessStoryResponse toStoryResponse(SuccessStory story) {
    CommunityMemberResponse authorResponse =
        CommunityMemberMapper.toMemberResponse(story.getAuthor());

    List<StoryCommentResponse> commentResponses =
        story.getComments().stream().map(this::toCommentResponse).collect(Collectors.toList());

    return new SuccessStoryResponse(
        story.getId(),
        authorResponse,
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

  StoryCommentResponse toCommentResponse(StoryComment comment) {
    CommunityMemberResponse authorResponse =
        CommunityMemberMapper.toMemberResponse(comment.getAuthor());

    return new StoryCommentResponse(
        comment.getId(), authorResponse, comment.getText(), comment.getCreatedAt());
  }
}
