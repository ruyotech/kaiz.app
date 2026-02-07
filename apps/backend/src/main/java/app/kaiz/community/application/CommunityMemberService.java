package app.kaiz.community.application;

import app.kaiz.community.application.dto.*;
import app.kaiz.community.domain.*;
import app.kaiz.community.infrastructure.CommunityMemberRepository;
import app.kaiz.identity.domain.User;
import app.kaiz.identity.infrastructure.UserRepository;
import app.kaiz.shared.exception.ResourceNotFoundException;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Handles community member profile operations: lookup, creation, updates, search. */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class CommunityMemberService {

  private final CommunityMemberRepository memberRepository;
  private final UserRepository userRepository;

  @Transactional(readOnly = true)
  public CommunityMemberResponse getMemberProfile(UUID memberId) {
    CommunityMember member =
        memberRepository
            .findById(memberId)
            .orElseThrow(() -> new ResourceNotFoundException("Member not found: " + memberId));
    return CommunityMemberMapper.toMemberResponse(member);
  }

  @Transactional(readOnly = true)
  public CommunityMemberResponse getMemberByUserId(UUID userId) {
    CommunityMember member =
        memberRepository
            .findByUserId(userId)
            .orElseThrow(
                () -> new ResourceNotFoundException("Member not found for user: " + userId));
    return CommunityMemberMapper.toMemberResponse(member);
  }

  public CommunityMemberResponse getOrCreateMemberByUserId(UUID userId) {
    return memberRepository
        .findByUserId(userId)
        .map(CommunityMemberMapper::toMemberResponse)
        .orElseGet(() -> createMemberFromUser(userId));
  }

  public CommunityMemberResponse updateMemberProfile(UUID memberId, UpdateProfileRequest request) {
    CommunityMember member =
        memberRepository
            .findById(memberId)
            .orElseThrow(() -> new ResourceNotFoundException("Member not found: " + memberId));

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
    return CommunityMemberMapper.toMemberResponse(member);
  }

  @Transactional(readOnly = true)
  public Page<CommunityMemberResponse> searchMembers(String query, int page, int size) {
    Pageable pageable = PageRequest.of(page, size);
    return memberRepository
        .findByDisplayNameContainingIgnoreCase(query, pageable)
        .map(CommunityMemberMapper::toMemberResponse);
  }

  /** Look up a member entity by ID. Package-visible for use by sibling services. */
  CommunityMember findMemberOrThrow(UUID memberId) {
    return memberRepository
        .findById(memberId)
        .orElseThrow(() -> new ResourceNotFoundException("Member not found: " + memberId));
  }

  private CommunityMemberResponse createMemberFromUser(UUID userId) {
    User user =
        userRepository
            .findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

    CommunityMember member =
        CommunityMember.builder()
            .user(user)
            .displayName(
                user.getFullName() != null ? user.getFullName() : user.getEmail().split("@")[0])
            .avatar("\uD83D\uDC64")
            .bio("")
            .level(1)
            .levelTitle("Novice")
            .reputationPoints(0)
            .role(CommunityRole.MEMBER)
            .isOnline(true)
            .build();

    member = memberRepository.save(member);
    log.info("Created new community member for user: {}", userId);
    return CommunityMemberMapper.toMemberResponse(member);
  }
}
