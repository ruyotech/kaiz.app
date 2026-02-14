package app.kaiz.sensai.application;

import app.kaiz.identity.domain.User;
import app.kaiz.identity.infrastructure.UserRepository;
import app.kaiz.sensai.application.dto.IntakeDto;
import app.kaiz.sensai.application.dto.SensAISettingsDto;
import app.kaiz.sensai.domain.CoachTone;
import app.kaiz.sensai.domain.SensAISettings;
import app.kaiz.sensai.infrastructure.SensAISettingsRepository;
import app.kaiz.shared.exception.ResourceNotFoundException;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Manages user coach settings and basic intake processing (pre-AI fallback). */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class SettingsService {

  private final SensAISettingsRepository settingsRepository;
  private final UserRepository userRepository;
  private final SensAIMapper mapper;

  public SensAISettingsDto getSettings(UUID userId) {
    SensAISettings settings =
        settingsRepository.findByUserId(userId).orElseGet(() -> createDefaultSettings(userId));
    return mapper.toDto(settings);
  }

  @Transactional
  public SensAISettingsDto updateSettings(
      UUID userId, SensAISettingsDto.UpdateSettingsRequest request) {
    SensAISettings settings =
        settingsRepository.findByUserId(userId).orElseGet(() -> createDefaultSettings(userId));

    if (request.coachTone() != null) settings.setCoachTone(request.coachTone());
    if (request.interventionsEnabled() != null)
      settings.setInterventionsEnabled(request.interventionsEnabled());
    if (request.dailyStandupTime() != null)
      settings.setDailyStandupTime(request.dailyStandupTime());
    if (request.sprintLengthDays() != null)
      settings.setSprintLengthDays(request.sprintLengthDays());
    if (request.maxDailyCapacity() != null)
      settings.setMaxDailyCapacity(request.maxDailyCapacity());
    if (request.overcommitThreshold() != null)
      settings.setOvercommitThreshold(request.overcommitThreshold());
    if (request.dimensionAlertThreshold() != null)
      settings.setDimensionAlertThreshold(request.dimensionAlertThreshold());
    if (request.dimensionPriorities() != null)
      settings.setDimensionPriorities(mapper.toJson(request.dimensionPriorities()));
    if (request.standupRemindersEnabled() != null)
      settings.setStandupRemindersEnabled(request.standupRemindersEnabled());
    if (request.ceremonyRemindersEnabled() != null)
      settings.setCeremonyRemindersEnabled(request.ceremonyRemindersEnabled());
    if (request.weeklyDigestEnabled() != null)
      settings.setWeeklyDigestEnabled(request.weeklyDigestEnabled());

    log.info("Settings updated: userId={}", userId);
    return mapper.toDto(settingsRepository.save(settings));
  }

  /** Basic intake processing — pre-AI fallback with keyword heuristics. */
  public IntakeDto processIntake(UUID userId, IntakeDto.ProcessIntakeRequest request) {
    String input = request.input().trim();
    String type = request.intakeType();

    IntakeDto.ParsedTask parsedTask = parseTaskFromInput(input);
    String suggestedDimension = suggestDimension(input);
    List<String> conflicts = List.of();
    IntakeDto.ScheduleSuggestion schedule =
        new IntakeDto.ScheduleSuggestion(
            "This week",
            "Based on your current capacity and priorities",
            true,
            parsedTask.estimatedPoints());
    String coachMessage = generateIntakeCoachMessage(parsedTask, suggestedDimension, conflicts);

    log.info("Intake processed: userId={}, type={}", userId, type);
    return new IntakeDto(
        input, type, parsedTask, suggestedDimension, schedule, conflicts, coachMessage, 0.85);
  }

  // ── Helpers ──

  private SensAISettings createDefaultSettings(UUID userId) {
    User user =
        userRepository
            .findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

    SensAISettings settings =
        SensAISettings.builder()
            .user(user)
            .coachTone(CoachTone.DIRECT)
            .interventionsEnabled(true)
            .dailyStandupTime("09:00")
            .sprintLengthDays(14)
            .maxDailyCapacity(8)
            .overcommitThreshold(new BigDecimal("0.15"))
            .dimensionAlertThreshold(5)
            .standupRemindersEnabled(true)
            .ceremonyRemindersEnabled(true)
            .weeklyDigestEnabled(true)
            .build();

    log.info("Default settings created: userId={}", userId);
    return settingsRepository.save(settings);
  }

  private IntakeDto.ParsedTask parseTaskFromInput(String input) {
    String title = input.length() > 100 ? input.substring(0, 100) : input;
    String description = input.length() > 100 ? input : null;

    int points = 3;
    if (input.toLowerCase().contains("quick") || input.toLowerCase().contains("small")) {
      points = 1;
    } else if (input.toLowerCase().contains("large") || input.toLowerCase().contains("complex")) {
      points = 8;
    }

    String priority = "medium";
    if (input.toLowerCase().contains("urgent") || input.toLowerCase().contains("asap")) {
      priority = "high";
    }

    return new IntakeDto.ParsedTask(
        title, description, points, priority, "do_first", List.of(), null);
  }

  private String suggestDimension(String input) {
    String lower = input.toLowerCase();

    if (lower.contains("work") || lower.contains("project") || lower.contains("meeting")) {
      return "career";
    } else if (lower.contains("exercise") || lower.contains("gym") || lower.contains("health")) {
      return "health";
    } else if (lower.contains("family") || lower.contains("kid") || lower.contains("parent")) {
      return "family";
    } else if (lower.contains("money") || lower.contains("budget") || lower.contains("invest")) {
      return "finance";
    } else if (lower.contains("learn") || lower.contains("read") || lower.contains("course")) {
      return "growth";
    } else if (lower.contains("friend") || lower.contains("social") || lower.contains("party")) {
      return "social";
    } else if (lower.contains("meditat") || lower.contains("pray") || lower.contains("spirit")) {
      return "spirit";
    } else if (lower.contains("creat") || lower.contains("art") || lower.contains("music")) {
      return "creativity";
    } else if (lower.contains("clean") || lower.contains("home") || lower.contains("organize")) {
      return "environment";
    }
    return "career";
  }

  private String generateIntakeCoachMessage(
      IntakeDto.ParsedTask task, String dimension, List<String> conflicts) {
    StringBuilder message = new StringBuilder();
    message.append("Got it! I've categorized this as a ").append(dimension).append(" task. ");

    if (task.estimatedPoints() >= 5) {
      message.append("This seems like a substantial task - consider breaking it down. ");
    }
    if (!conflicts.isEmpty()) {
      message.append("Note: There may be scheduling conflicts to review. ");
    }
    return message.toString();
  }
}
