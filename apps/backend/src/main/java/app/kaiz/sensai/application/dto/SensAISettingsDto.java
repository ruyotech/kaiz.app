package app.kaiz.sensai.application.dto;

import app.kaiz.sensai.domain.CoachTone;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;

/** DTO for SensAI settings. */
public record SensAISettingsDto(
    UUID id,
    CoachTone coachTone,
    boolean interventionsEnabled,
    String dailyStandupTime,
    int sprintLengthDays,
    int maxDailyCapacity,
    BigDecimal overcommitThreshold,
    int dimensionAlertThreshold,
    Map<String, Integer> dimensionPriorities,
    boolean standupRemindersEnabled,
    boolean ceremonyRemindersEnabled,
    boolean weeklyDigestEnabled,
    int targetVelocity,
    String planningDayOfWeek,
    String planningTime,
    Instant createdAt,
    Instant updatedAt) {

  /** Request to update SensAI settings. */
  public record UpdateSettingsRequest(
      CoachTone coachTone,
      Boolean interventionsEnabled,
      @Pattern(regexp = "^([01]\\d|2[0-3]):[0-5]\\d$", message = "Time must be in HH:mm format")
          String dailyStandupTime,
      @Min(7) @Max(28) Integer sprintLengthDays,
      @Min(1) @Max(24) Integer maxDailyCapacity,
      @DecimalMin("0.05") @DecimalMax("0.50") BigDecimal overcommitThreshold,
      @Min(1) @Max(9) Integer dimensionAlertThreshold,
      Map<String, Integer> dimensionPriorities,
      Boolean standupRemindersEnabled,
      Boolean ceremonyRemindersEnabled,
      Boolean weeklyDigestEnabled,
      @Min(20) @Max(100) Integer targetVelocity,
      String planningDayOfWeek,
      @Pattern(regexp = "^([01]\\d|2[0-3]):[0-5]\\d$", message = "Time must be in HH:mm format")
          String planningTime) {}
}
