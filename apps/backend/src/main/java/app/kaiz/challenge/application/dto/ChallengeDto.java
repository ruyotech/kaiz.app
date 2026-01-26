package app.kaiz.challenge.application.dto;

import app.kaiz.challenge.domain.*;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record ChallengeDto(
    UUID id,
    String name,
    String description,
    String lifeWheelAreaId,
    MetricType metricType,
    BigDecimal targetValue,
    String unit,
    int duration,
    Recurrence recurrence,
    ChallengeStatus status,
    Instant startDate,
    Instant endDate,
    String whyStatement,
    String rewardDescription,
    int graceDays,
    int currentStreak,
    int bestStreak,
    ChallengeType challengeType,
    Visibility visibility,
    String createdFromTemplateId,
    List<ChallengeParticipantDto> participants,
    Instant createdAt,
    Instant updatedAt) {

  public record CreateChallengeRequest(
      @NotBlank @Size(max = 255) String name,
      @Size(max = 2000) String description,
      @NotNull String lifeWheelAreaId,
      @NotNull MetricType metricType,
      @NotNull @DecimalMin("0.01") BigDecimal targetValue,
      @Size(max = 50) String unit,
      @Min(1) @Max(365) Integer duration,
      Recurrence recurrence,
      @Size(max = 1000) String whyStatement,
      @Size(max = 500) String rewardDescription,
      @Min(0) @Max(7) Integer graceDays,
      ChallengeType challengeType,
      Visibility visibility,
      String createdFromTemplateId) {}

  public record UpdateChallengeRequest(
      @Size(max = 255) String name,
      @Size(max = 2000) String description,
      String lifeWheelAreaId,
      MetricType metricType,
      @DecimalMin("0.01") BigDecimal targetValue,
      @Size(max = 50) String unit,
      @Min(1) @Max(365) Integer duration,
      Recurrence recurrence,
      ChallengeStatus status,
      @Size(max = 1000) String whyStatement,
      @Size(max = 500) String rewardDescription,
      @Min(0) @Max(7) Integer graceDays,
      Visibility visibility) {}
}
