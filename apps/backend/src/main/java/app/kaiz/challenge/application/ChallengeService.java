package app.kaiz.challenge.application;

import app.kaiz.challenge.application.dto.*;
import app.kaiz.challenge.domain.*;
import app.kaiz.challenge.infrastructure.*;
import app.kaiz.identity.domain.User;
import app.kaiz.identity.infrastructure.UserRepository;
import app.kaiz.life_wheel.infrastructure.LifeWheelAreaRepository;
import app.kaiz.shared.exception.ResourceNotFoundException;
import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ChallengeService {

  private final ChallengeRepository challengeRepository;
  private final ChallengeTemplateRepository challengeTemplateRepository;
  private final ChallengeParticipantRepository challengeParticipantRepository;
  private final ChallengeEntryRepository challengeEntryRepository;
  private final UserRepository userRepository;
  private final LifeWheelAreaRepository lifeWheelAreaRepository;
  private final ChallengeMapper challengeMapper;

  // Template methods
  public List<ChallengeTemplateDto> getAllTemplates() {
    return challengeMapper.toChallengeTemplateDtoList(
        challengeTemplateRepository.findAllByOrderByPopularityScoreDesc());
  }

  public List<ChallengeTemplateDto> getTemplatesByLifeWheelArea(String lifeWheelAreaId) {
    return challengeMapper.toChallengeTemplateDtoList(
        challengeTemplateRepository.findByLifeWheelAreaIdOrderByPopularityScoreDesc(
            lifeWheelAreaId));
  }

  public ChallengeTemplateDto getTemplateById(String templateId) {
    ChallengeTemplate template =
        challengeTemplateRepository
            .findById(templateId)
            .orElseThrow(() -> new ResourceNotFoundException("ChallengeTemplate", templateId));
    return challengeMapper.toChallengeTemplateDto(template);
  }

  // Challenge methods
  public List<ChallengeDto> getChallengesByUserId(UUID userId) {
    return challengeMapper.toChallengeDtoListWithoutParticipants(
        challengeRepository.findByUserIdOrderByCreatedAtDesc(userId));
  }

  public List<ChallengeDto> getChallengesByUserIdAndStatus(UUID userId, ChallengeStatus status) {
    return challengeMapper.toChallengeDtoListWithoutParticipants(
        challengeRepository.findByUserIdAndStatusOrderByCreatedAtDesc(userId, status));
  }

  public List<ChallengeDto> getActiveChallenges(UUID userId) {
    return challengeMapper.toChallengeDtoListWithoutParticipants(
        challengeRepository.findActiveChallengesByUserId(userId));
  }

  public ChallengeDto getChallengeById(UUID userId, UUID challengeId) {
    Challenge challenge =
        challengeRepository
            .findByIdAndUserIdWithDetails(challengeId, userId)
            .orElseThrow(() -> new ResourceNotFoundException("Challenge", challengeId.toString()));
    return challengeMapper.toChallengeDto(challenge);
  }

  @Transactional
  public ChallengeDto createChallenge(UUID userId, ChallengeDto.CreateChallengeRequest request) {
    User user =
        userRepository
            .findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User", userId.toString()));

    var lifeWheelArea =
        lifeWheelAreaRepository
            .findById(request.lifeWheelAreaId())
            .orElseThrow(
                () -> new ResourceNotFoundException("LifeWheelArea", request.lifeWheelAreaId()));

    Challenge challenge =
        Challenge.builder()
            .name(request.name())
            .description(request.description())
            .user(user)
            .lifeWheelArea(lifeWheelArea)
            .metricType(request.metricType())
            .targetValue(request.targetValue())
            .unit(request.unit())
            .duration(request.duration() != null ? request.duration() : 30)
            .recurrence(request.recurrence() != null ? request.recurrence() : Recurrence.DAILY)
            .whyStatement(request.whyStatement())
            .rewardDescription(request.rewardDescription())
            .graceDays(request.graceDays() != null ? request.graceDays() : 0)
            .challengeType(
                request.challengeType() != null ? request.challengeType() : ChallengeType.SOLO)
            .visibility(request.visibility() != null ? request.visibility() : Visibility.PRIVATE)
            .status(ChallengeStatus.DRAFT)
            .build();

    if (request.createdFromTemplateId() != null) {
      challengeTemplateRepository
          .findById(request.createdFromTemplateId())
          .ifPresent(challenge::setCreatedFromTemplate);
    }

    Challenge saved = challengeRepository.save(challenge);

    // Auto-add creator as participant
    ChallengeParticipant participant =
        ChallengeParticipant.builder().challenge(saved).user(user).build();
    challengeParticipantRepository.save(participant);

    return challengeMapper.toChallengeDto(saved);
  }

  @Transactional
  public ChallengeDto updateChallenge(
      UUID userId, UUID challengeId, ChallengeDto.UpdateChallengeRequest request) {
    Challenge challenge =
        challengeRepository
            .findByIdAndUserId(challengeId, userId)
            .orElseThrow(() -> new ResourceNotFoundException("Challenge", challengeId.toString()));

    if (request.name() != null) {
      challenge.setName(request.name());
    }
    if (request.description() != null) {
      challenge.setDescription(request.description());
    }
    if (request.lifeWheelAreaId() != null) {
      var lifeWheelArea =
          lifeWheelAreaRepository
              .findById(request.lifeWheelAreaId())
              .orElseThrow(
                  () -> new ResourceNotFoundException("LifeWheelArea", request.lifeWheelAreaId()));
      challenge.setLifeWheelArea(lifeWheelArea);
    }
    if (request.metricType() != null) {
      challenge.setMetricType(request.metricType());
    }
    if (request.targetValue() != null) {
      challenge.setTargetValue(request.targetValue());
    }
    if (request.unit() != null) {
      challenge.setUnit(request.unit());
    }
    if (request.duration() != null) {
      challenge.setDuration(request.duration());
    }
    if (request.recurrence() != null) {
      challenge.setRecurrence(request.recurrence());
    }
    if (request.status() != null) {
      updateChallengeStatus(challenge, request.status());
    }
    if (request.whyStatement() != null) {
      challenge.setWhyStatement(request.whyStatement());
    }
    if (request.rewardDescription() != null) {
      challenge.setRewardDescription(request.rewardDescription());
    }
    if (request.graceDays() != null) {
      challenge.setGraceDays(request.graceDays());
    }
    if (request.visibility() != null) {
      challenge.setVisibility(request.visibility());
    }

    return challengeMapper.toChallengeDto(challengeRepository.save(challenge));
  }

  private void updateChallengeStatus(Challenge challenge, ChallengeStatus newStatus) {
    ChallengeStatus oldStatus = challenge.getStatus();

    if (oldStatus == ChallengeStatus.DRAFT && newStatus == ChallengeStatus.ACTIVE) {
      challenge.setStartDate(Instant.now());
      challenge.setEndDate(Instant.now().plus(challenge.getDuration(), ChronoUnit.DAYS));
    }

    challenge.setStatus(newStatus);
  }

  @Transactional
  public void deleteChallenge(UUID userId, UUID challengeId) {
    Challenge challenge =
        challengeRepository
            .findByIdAndUserId(challengeId, userId)
            .orElseThrow(() -> new ResourceNotFoundException("Challenge", challengeId.toString()));
    challengeRepository.delete(challenge);
  }

  // Entry methods
  public List<ChallengeEntryDto> getEntriesByChallengeId(UUID userId, UUID challengeId) {
    // Verify user owns the challenge
    challengeRepository
        .findByIdAndUserId(challengeId, userId)
        .orElseThrow(() -> new ResourceNotFoundException("Challenge", challengeId.toString()));

    return challengeMapper.toChallengeEntryDtoList(
        challengeEntryRepository.findByChallengeIdOrderByEntryDateDesc(challengeId));
  }

  @Transactional
  public ChallengeEntryDto logEntry(
      UUID userId, UUID challengeId, ChallengeEntryDto.CreateChallengeEntryRequest request) {
    Challenge challenge =
        challengeRepository
            .findByIdAndUserId(challengeId, userId)
            .orElseThrow(() -> new ResourceNotFoundException("Challenge", challengeId.toString()));

    User user =
        userRepository
            .findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User", userId.toString()));

    // Check if entry already exists for this date
    var existingEntry =
        challengeEntryRepository.findByChallengeIdAndUserIdAndEntryDate(
            challengeId, userId, request.entryDate());

    ChallengeEntry entry;
    if (existingEntry.isPresent()) {
      // Update existing entry
      entry = existingEntry.get();
      entry.setValueNumeric(request.valueNumeric());
      entry.setValueBoolean(request.valueBoolean());
      entry.setNote(request.note());
    } else {
      // Create new entry
      entry =
          ChallengeEntry.builder()
              .challenge(challenge)
              .user(user)
              .entryDate(request.entryDate())
              .valueNumeric(request.valueNumeric())
              .valueBoolean(request.valueBoolean())
              .note(request.note())
              .build();
    }

    ChallengeEntry saved = challengeEntryRepository.save(entry);

    // Update streak
    updateStreak(challenge, userId);

    return challengeMapper.toChallengeEntryDto(saved);
  }

  private void updateStreak(Challenge challenge, UUID userId) {
    LocalDate today = LocalDate.now();
    int streak = 0;
    LocalDate checkDate = today;

    while (true) {
      var entry =
          challengeEntryRepository.findByChallengeIdAndUserIdAndEntryDate(
              challenge.getId(), userId, checkDate);

      if (entry.isEmpty()) {
        // Check grace days
        if (streak == 0 && challenge.getGraceDays() > 0) {
          checkDate = checkDate.minusDays(1);
          continue;
        }
        break;
      }

      // Check if entry meets target
      ChallengeEntry e = entry.get();
      boolean success = false;
      if (challenge.getMetricType() == MetricType.YESNO) {
        success = Boolean.TRUE.equals(e.getValueBoolean());
      } else if (e.getValueNumeric() != null) {
        success = e.getValueNumeric().compareTo(challenge.getTargetValue()) >= 0;
      }

      if (success) {
        streak++;
        checkDate = checkDate.minusDays(1);
      } else {
        break;
      }
    }

    challenge.setCurrentStreak(streak);
    if (streak > challenge.getBestStreak()) {
      challenge.setBestStreak(streak);
    }
    challengeRepository.save(challenge);
  }

  // Participant methods
  @Transactional
  public ChallengeParticipantDto inviteParticipant(
      UUID userId, UUID challengeId, ChallengeParticipantDto.InviteParticipantRequest request) {
    Challenge challenge =
        challengeRepository
            .findByIdAndUserId(challengeId, userId)
            .orElseThrow(() -> new ResourceNotFoundException("Challenge", challengeId.toString()));

    User invitedUser =
        userRepository
            .findById(request.userId())
            .orElseThrow(() -> new ResourceNotFoundException("User", request.userId().toString()));

    // Check if already a participant
    if (challengeParticipantRepository.existsByChallengeIdAndUserId(
        challengeId, request.userId())) {
      throw new IllegalStateException("User is already a participant in this challenge");
    }

    ChallengeParticipant participant =
        ChallengeParticipant.builder()
            .challenge(challenge)
            .user(invitedUser)
            .isAccountabilityPartner(request.isAccountabilityPartner())
            .build();

    return challengeMapper.toChallengeParticipantDto(
        challengeParticipantRepository.save(participant));
  }
}
