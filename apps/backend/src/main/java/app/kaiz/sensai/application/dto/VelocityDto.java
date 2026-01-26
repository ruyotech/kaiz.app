package app.kaiz.sensai.application.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * DTO for velocity metrics and analytics.
 */
public record VelocityDto(
    UUID id,
    String sprintId,
    LocalDate sprintStartDate,
    LocalDate sprintEndDate,
    int committedPoints,
    int completedPoints,
    int carriedOverPoints,
    int addedMidSprint,
    BigDecimal completionRate,
    BigDecimal focusFactor,
    boolean isOvercommitted,
    BigDecimal overcommitPercentage,
    Map<String, Integer> dimensionDistribution) {

    /**
     * Aggregated velocity metrics across multiple sprints.
     */
    public record VelocityMetrics(
        /** Average points completed per sprint */
        double averageCompleted,
        /** Current sprint's committed points */
        int currentSprintCommitted,
        /** Current sprint's completed points so far */
        int currentSprintCompleted,
        /** Percentage change from previous sprint */
        double trendPercentage,
        /** Whether current sprint is overcommitted */
        boolean isOvercommitted,
        /** Rolling average completion rate (last 5 sprints) */
        double averageCompletionRate,
        /** Best sprint completed points */
        int bestSprintPoints,
        /** Suggested commitment based on historical data */
        int suggestedCommitment) {}

    /**
     * Sprint health assessment.
     */
    public record SprintHealth(
        String sprintId,
        int daysElapsed,
        int daysRemaining,
        int totalDays,
        int committedPoints,
        int completedPoints,
        int remainingPoints,
        int inProgressPoints,
        /** Expected completion rate at current pace */
        double projectedCompletion,
        /** Health score 0-100 */
        int healthScore,
        /** Risk level: low, medium, high */
        String riskLevel,
        List<String> riskFactors,
        String coachAssessment) {}

    /**
     * Historical velocity data for charting.
     */
    public record VelocityHistory(
        List<VelocityDto> sprints,
        double averageCommitted,
        double averageCompleted,
        double overallCompletionRate,
        int totalPointsDelivered,
        int sprintCount) {}

    /**
     * Daily burndown data point.
     */
    public record BurndownPoint(
        LocalDate date,
        int remainingPoints,
        int idealRemaining,
        int completedToday) {}
}
