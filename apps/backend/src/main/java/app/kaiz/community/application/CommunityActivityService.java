package app.kaiz.community.application;

import app.kaiz.community.application.dto.CommunityActivityResponse;
import app.kaiz.community.domain.ActivityType;
import app.kaiz.community.domain.CommunityActivity;
import app.kaiz.community.domain.CommunityMember;
import app.kaiz.community.infrastructure.CommunityActivityRepository;
import app.kaiz.shared.exception.ResourceNotFoundException;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Handles community activity feed operations. This is a cross-cutting service used by other
 * community services to record activities.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class CommunityActivityService {

  private final CommunityActivityRepository activityRepository;

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
            .orElseThrow(() -> new ResourceNotFoundException("Activity not found: " + activityId));
    activity.celebrate(memberId);
    activityRepository.save(activity);
  }

  /** Get the 10 most recent activities for the community home page. */
  @Transactional(readOnly = true)
  public List<CommunityActivityResponse> getRecentActivity() {
    return activityRepository.findTop10ByOrderByCreatedAtDesc().stream()
        .map(this::toActivityResponse)
        .toList();
  }

  /** Record an activity entry. Called by other community services after mutations. */
  public void recordActivity(CommunityMember member, ActivityType type, String title) {
    CommunityActivity activity =
        CommunityActivity.builder().member(member).activityType(type).title(title).build();
    activityRepository.save(activity);
  }

  CommunityActivityResponse toActivityResponse(CommunityActivity activity) {
    return new CommunityActivityResponse(
        activity.getId(),
        CommunityMemberMapper.toMemberResponse(activity.getMember()),
        activity.getActivityType().name(),
        activity.getTitle(),
        activity.getDescription(),
        activity.getMetadata(),
        activity.getCelebrateCount(),
        activity.getCreatedAt());
  }
}
