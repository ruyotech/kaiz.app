package app.kaiz.sensai.application;

import app.kaiz.identity.domain.User;
import app.kaiz.identity.infrastructure.UserRepository;
import app.kaiz.sensai.application.dto.DailyStandupDto;
import app.kaiz.sensai.domain.*;
import app.kaiz.sensai.infrastructure.DailyStandupRepository;
import app.kaiz.shared.exception.ResourceNotFoundException;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Manages daily standup lifecycle: creation, completion, skipping, history, and summary statistics.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class StandupService {

  private final DailyStandupRepository standupRepository;
  private final UserRepository userRepository;
  private final InterventionService interventionService;
  private final SensAIMapper mapper;

  public DailyStandupDto getTodayStandup(UUID userId) {
    return standupRepository
        .findByUserIdAndStandupDate(userId, LocalDate.now())
        .map(mapper::toDto)
        .orElse(null);
  }

  public List<DailyStandupDto> getStandupHistory(
      UUID userId, LocalDate startDate, LocalDate endDate) {
    return mapper.toStandupDtos(
        standupRepository.findByUserIdAndStandupDateBetweenOrderByStandupDateDesc(
            userId, startDate, endDate));
  }

  @Transactional
  public DailyStandupDto completeStandup(
      UUID userId, DailyStandupDto.CompleteStandupRequest request) {
    User user =
        userRepository
            .findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

    DailyStandup standup =
        standupRepository
            .findByUserIdAndStandupDate(userId, request.standupDate())
            .orElseGet(
                () -> DailyStandup.builder().user(user).standupDate(request.standupDate()).build());

    standup.setYesterdaySummary(request.yesterdaySummary());
    standup.setTodayPlan(request.todayPlan());
    standup.setBlockers(request.blockers());
    standup.setMoodScore(request.moodScore());
    standup.setEnergyLevel(request.energyLevel());
    standup.setCompletedAt(Instant.now());
    standup.setSkipped(false);

    standup.setCoachResponse(generateCoachResponse(standup));
    checkStandupInterventions(userId, standup);

    log.info("Standup completed: userId={}, date={}", userId, request.standupDate());
    return mapper.toDto(standupRepository.save(standup));
  }

  @Transactional
  public DailyStandupDto skipStandup(UUID userId, DailyStandupDto.SkipStandupRequest request) {
    User user =
        userRepository
            .findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

    DailyStandup standup =
        standupRepository
            .findByUserIdAndStandupDate(userId, request.standupDate())
            .orElseGet(
                () -> DailyStandup.builder().user(user).standupDate(request.standupDate()).build());

    standup.setSkipped(true);
    standup.setSkipReason(request.skipReason());
    standup.setCompletedAt(Instant.now());

    log.info("Standup skipped: userId={}, date={}", userId, request.standupDate());
    return mapper.toDto(standupRepository.save(standup));
  }

  public DailyStandupDto.StandupSummary getStandupSummary(UUID userId, int days) {
    LocalDate endDate = LocalDate.now();
    LocalDate startDate = endDate.minusDays(days);

    int completedCount = standupRepository.countCompletedStandups(userId, startDate, endDate);
    Double avgMood = standupRepository.getAverageMoodScore(userId, startDate, endDate);
    Double avgEnergy = standupRepository.getAverageEnergyLevel(userId, startDate, endDate);

    List<DailyStandup> recent =
        standupRepository.findByUserIdAndStandupDateBetweenOrderByStandupDateDesc(
            userId, startDate, endDate);

    int skippedCount = (int) recent.stream().filter(DailyStandup::isSkipped).count();
    int missedCount = days - completedCount - skippedCount;
    int currentStreak = calculateStandupStreak(recent);

    return new DailyStandupDto.StandupSummary(
        days,
        completedCount,
        skippedCount,
        Math.max(0, missedCount),
        days > 0 ? (double) completedCount / days * 100 : 0,
        avgMood != null ? avgMood : 0,
        avgEnergy != null ? avgEnergy : 0,
        currentStreak);
  }

  // ── Helpers ──

  private String generateCoachResponse(DailyStandup standup) {
    StringBuilder response = new StringBuilder();

    if (standup.getBlockers() != null && !standup.getBlockers().isEmpty()) {
      response.append("I noticed you have blockers. Let's work on removing them. ");
    }
    if (standup.getMoodScore() != null && standup.getMoodScore() <= 2) {
      response.append("It sounds like a tough day. Remember, progress over perfection. ");
    }
    if (standup.getEnergyLevel() != null && standup.getEnergyLevel() <= 2) {
      response.append("Low energy noted. Consider tackling easier tasks today. ");
    }
    if (response.length() == 0) {
      response.append("Great standup! You've got a clear plan. Let's make it happen.");
    }

    return response.toString();
  }

  private void checkStandupInterventions(UUID userId, DailyStandup standup) {
    if (standup.getMoodScore() != null
        && standup.getEnergyLevel() != null
        && standup.getMoodScore() <= 2
        && standup.getEnergyLevel() <= 2) {
      interventionService.triggerIntervention(
          userId,
          InterventionType.BURNOUT_WARNING,
          InterventionUrgency.MEDIUM,
          "Energy Check",
          "Your mood and energy are both low today. Consider taking it easier.",
          "Reduce your task load for today and take breaks",
          null,
          null,
          null);
    }

    if (standup.getBlockers() != null && !standup.getBlockers().isEmpty()) {
      interventionService.triggerIntervention(
          userId,
          InterventionType.BLOCKER_ALERT,
          InterventionUrgency.MEDIUM,
          "Blocker Detected",
          "You've reported blockers in your standup. Let's address them.",
          "Break down the blocker into smaller actionable items",
          null,
          null,
          null);
    }
  }

  private int calculateStandupStreak(List<DailyStandup> standups) {
    int streak = 0;
    LocalDate expected = LocalDate.now();

    for (DailyStandup standup : standups) {
      if (standup.getStandupDate().equals(expected)
          && standup.getCompletedAt() != null
          && !standup.isSkipped()) {
        streak++;
        expected = expected.minusDays(1);
      } else {
        break;
      }
    }

    return streak;
  }
}
