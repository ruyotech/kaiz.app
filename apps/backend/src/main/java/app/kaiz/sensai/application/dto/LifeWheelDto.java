package app.kaiz.sensai.application.dto;

import jakarta.validation.constraints.*;
import java.util.List;

/**
 * DTO for Life Wheel metrics and dimension analysis.
 */
public record LifeWheelDto(
    /** Overall life wheel balance score (0-10) */
    double overallBalance,
    /** List of all dimension metrics */
    List<DimensionMetric> dimensions,
    /** Dimension needing most attention */
    String lowestDimension,
    /** Strongest dimension */
    String highestDimension,
    /** Variance across dimensions (lower = more balanced) */
    double balanceVariance,
    /** Period this data covers */
    String periodLabel) {

    /**
     * Metrics for a single life dimension.
     */
    public record DimensionMetric(
        String dimensionId,
        String dimensionName,
        String icon,
        String color,
        /** Current score (0-10) */
        double currentScore,
        /** Previous period score */
        double previousScore,
        /** Change from previous period */
        double trend,
        /** Number of tasks completed in this dimension */
        int tasksCompleted,
        /** Points delivered in this dimension */
        int pointsDelivered,
        /** Sprints since significant activity */
        int sprintsNeglected,
        /** Whether this dimension needs attention */
        boolean needsAttention,
        /** Suggested recovery tasks */
        List<String> suggestedRecoveryTasks) {}

    /**
     * Request to rate a dimension.
     */
    public record RateDimensionRequest(
        @NotBlank String dimensionId,
        @Min(0) @Max(10) double score,
        @Size(max = 500) String notes) {}

    /**
     * Historical dimension scores.
     */
    public record DimensionHistory(
        String dimensionId,
        List<DimensionSnapshot> snapshots) {}

    /**
     * Point-in-time dimension score.
     */
    public record DimensionSnapshot(
        String sprintId,
        double score,
        String periodLabel) {}

    /**
     * Dimension balance analysis.
     */
    public record BalanceAnalysis(
        /** Dimensions significantly above average */
        List<String> overperforming,
        /** Dimensions significantly below average */
        List<String> underperforming,
        /** Dimensions near average */
        List<String> balanced,
        /** Recommended focus areas */
        List<String> focusRecommendations,
        /** Coach assessment message */
        String coachMessage) {}
}
