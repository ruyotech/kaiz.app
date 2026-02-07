package app.kaiz.community.application;

import app.kaiz.community.application.dto.AccountabilityPartnerResponse;
import app.kaiz.community.application.dto.PartnerRequestResponse;
import app.kaiz.community.application.dto.SendPartnerRequestRequest;
import app.kaiz.community.domain.AccountabilityPartner;
import app.kaiz.community.domain.CommunityMember;
import app.kaiz.community.domain.PartnerRequest;
import app.kaiz.community.domain.PartnerRequestStatus;
import app.kaiz.community.infrastructure.AccountabilityPartnerRepository;
import app.kaiz.community.infrastructure.CommunityMemberRepository;
import app.kaiz.community.infrastructure.PartnerRequestRepository;
import app.kaiz.shared.exception.BadRequestException;
import app.kaiz.shared.exception.ResourceNotFoundException;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Handles accountability partner matching, requests, and partnerships. */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AccountabilityPartnerService {

  private final AccountabilityPartnerRepository partnerRepository;
  private final PartnerRequestRepository partnerRequestRepository;
  private final CommunityMemberRepository memberRepository;

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
            .orElseThrow(() -> new ResourceNotFoundException("Member not found: " + fromMemberId));
    CommunityMember toMember =
        memberRepository
            .findById(request.toMemberId())
            .orElseThrow(
                () -> new ResourceNotFoundException("Member not found: " + request.toMemberId()));

    if (!toMember.getAcceptPartnerRequests()) {
      throw new BadRequestException("Member is not accepting partner requests");
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
            .orElseThrow(() -> new ResourceNotFoundException("Request not found: " + requestId));

    if (!request.getToMember().getId().equals(memberId)) {
      throw new BadRequestException("Not authorized to accept this request");
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
            .orElseThrow(() -> new ResourceNotFoundException("Request not found: " + requestId));

    if (!request.getToMember().getId().equals(memberId)) {
      throw new BadRequestException("Not authorized to decline this request");
    }

    request.decline();
    partnerRequestRepository.save(request);
  }

  AccountabilityPartnerResponse toPartnerResponse(
      AccountabilityPartner partnership, UUID currentMemberId) {
    CommunityMember partnerMember =
        partnership.getMember().getId().equals(currentMemberId)
            ? partnership.getPartner()
            : partnership.getMember();

    return new AccountabilityPartnerResponse(
        partnership.getId(),
        CommunityMemberMapper.toMemberResponse(partnerMember),
        partnership.getConnectedSince(),
        partnership.getCheckInStreak(),
        partnership.getLastInteraction(),
        partnership.getSharedChallengeIds());
  }

  PartnerRequestResponse toPartnerRequestResponse(PartnerRequest request) {
    return new PartnerRequestResponse(
        request.getId(),
        CommunityMemberMapper.toMemberResponse(request.getFromMember()),
        CommunityMemberMapper.toMemberResponse(request.getToMember()),
        request.getMessage(),
        request.getStatus().name(),
        request.getCreatedAt());
  }
}
