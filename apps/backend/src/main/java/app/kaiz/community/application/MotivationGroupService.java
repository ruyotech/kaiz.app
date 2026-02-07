package app.kaiz.community.application;

import app.kaiz.community.application.dto.CreateGroupRequest;
import app.kaiz.community.application.dto.MotivationGroupResponse;
import app.kaiz.community.domain.ActivityType;
import app.kaiz.community.domain.CommunityMember;
import app.kaiz.community.domain.MotivationGroup;
import app.kaiz.community.infrastructure.CommunityMemberRepository;
import app.kaiz.community.infrastructure.MotivationGroupRepository;
import app.kaiz.shared.exception.BadRequestException;
import app.kaiz.shared.exception.ResourceNotFoundException;
import java.util.ArrayList;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Handles motivation group CRUD, joining, and leaving. */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class MotivationGroupService {

  private final MotivationGroupRepository groupRepository;
  private final CommunityMemberRepository memberRepository;
  private final CommunityActivityService activityService;

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
            .orElseThrow(() -> new ResourceNotFoundException("Member not found: " + creatorId));

    MotivationGroup group =
        MotivationGroup.builder()
            .creator(creator)
            .name(request.name())
            .description(request.description())
            .lifeWheelAreaId(request.lifeWheelAreaId())
            .coverImageUrl(request.coverImageUrl())
            .isPrivate(request.isPrivate() != null ? request.isPrivate() : false)
            .maxMembers(request.maxMembers() != null ? request.maxMembers() : 100)
            .tags(request.tags() != null ? new ArrayList<>(request.tags()) : new ArrayList<>())
            .build();

    group.addMember(creatorId);
    group = groupRepository.save(group);

    return toGroupResponse(group);
  }

  public void joinGroup(UUID groupId, UUID memberId) {
    MotivationGroup group =
        groupRepository
            .findById(groupId)
            .orElseThrow(() -> new ResourceNotFoundException("Group not found: " + groupId));

    if (!group.addMember(memberId)) {
      throw new BadRequestException("Group is full");
    }

    groupRepository.save(group);

    CommunityMember member =
        memberRepository
            .findById(memberId)
            .orElseThrow(() -> new ResourceNotFoundException("Member not found: " + memberId));
    activityService.recordActivity(
        member, ActivityType.CHALLENGE_JOINED, "Joined group: " + group.getName());
  }

  public void leaveGroup(UUID groupId, UUID memberId) {
    MotivationGroup group =
        groupRepository
            .findById(groupId)
            .orElseThrow(() -> new ResourceNotFoundException("Group not found: " + groupId));
    group.removeMember(memberId);
    groupRepository.save(group);
  }

  MotivationGroupResponse toGroupResponse(MotivationGroup group) {
    return new MotivationGroupResponse(
        group.getId(),
        group.getName(),
        group.getDescription(),
        group.getCoverImageUrl(),
        group.getLifeWheelAreaId(),
        group.getMemberCount(),
        group.getMaxMembers(),
        group.getIsPrivate(),
        CommunityMemberMapper.toMemberResponse(group.getCreator()),
        group.getTags(),
        group.getCreatedAt());
  }
}
