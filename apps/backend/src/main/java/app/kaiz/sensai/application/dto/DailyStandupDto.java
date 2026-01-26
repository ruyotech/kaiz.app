package app.kaiz.sensai.application.dto;

import jakarta.validation.constraints.*;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

/**
 * DTO for daily standup.
 */
public record DailyStandupDto(
    UUID id,
    LocalDate standupDate,
    String yesterdaySummary,
    String todayPlan,
    String blockers,
    Integer moodScore,
    Integer energyLevel,
    Instant completedAt,
    String coachResponse,
    boolean isSkipped,
    String skipReason,
    Instant createdAt) {

    /**
     * Request to complete a daily standup.
     */
    public record CompleteStandupRequest(
        @NotNull LocalDate standupDate,
        @Size(max = 2000) String yesterdaySummary,
        @NotBlank @Size(max = 2000) String todayPlan,
        @Size(max = 1000) String blockers,
        @Min(1) @Max(5) Integer moodScore,
        @Min(1) @Max(5) Integer energyLevel) {}

    /**
     * Request to skip a standup.
     */
    public record SkipStandupRequest(
        @NotNull LocalDate standupDate,
        @Size(max = 500) String skipReason) {}

    /**
     * Summary of standup completion for a period.
     */
    public record StandupSummary(
        int totalDays,
        int completedCount,
        int skippedCount,
        int missedCount,
        double completionRate,
        double averageMood,
        double averageEnergy,
        int currentStreak) {}
}
