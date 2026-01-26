package app.kaiz.sensai.application.dto;

import app.kaiz.sensai.domain.InterventionType;
import app.kaiz.sensai.domain.InterventionUrgency;
import jakarta.validation.constraints.*;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * DTO for coach interventions.
 */
public record InterventionDto(
    UUID id,
    InterventionType interventionType,
    InterventionUrgency urgency,
    String title,
    String message,
    String actionSuggestion,
    Map<String, Object> dataContext,
    Instant triggeredAt,
    Instant acknowledgedAt,
    String actionTaken,
    Instant dismissedAt,
    String dismissReason,
    boolean isActive,
    String relatedSprintId,
    String relatedDimension) {

    /**
     * Request to acknowledge an intervention.
     */
    public record AcknowledgeRequest(
        @Size(max = 1000) String actionTaken) {}

    /**
     * Request to dismiss an intervention.
     */
    public record DismissRequest(
        @NotBlank @Size(max = 500) String dismissReason) {}

    /**
     * Overcommit intervention data.
     */
    public record OvercommitData(
        int currentLoad,
        int capacity,
        double overcommitPercentage,
        List<String> suggestedTasksToDefer) {}

    /**
     * Dimension imbalance intervention data.
     */
    public record DimensionImbalanceData(
        String dimensionId,
        String dimensionName,
        int currentScore,
        int previousScore,
        int sprintsNeglected,
        List<String> suggestedRecoveryTasks) {}

    /**
     * Sprint at risk intervention data.
     */
    public record SprintAtRiskData(
        String sprintId,
        int daysRemaining,
        int remainingPoints,
        int completedPoints,
        double projectedCompletion,
        List<String> atRiskTasks) {}

    /**
     * Summary of interventions.
     */
    public record InterventionSummary(
        int totalTriggered,
        int acknowledged,
        int dismissed,
        int pending,
        Map<InterventionType, Integer> byType,
        double averageResponseTimeHours) {}
}
