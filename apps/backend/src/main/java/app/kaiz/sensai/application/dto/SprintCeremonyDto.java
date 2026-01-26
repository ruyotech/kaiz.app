package app.kaiz.sensai.application.dto;

import app.kaiz.sensai.domain.CeremonyStatus;
import app.kaiz.sensai.domain.CeremonyType;
import jakarta.validation.constraints.*;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * DTO for sprint ceremonies.
 */
public record SprintCeremonyDto(
    UUID id,
    String sprintId,
    CeremonyType ceremonyType,
    CeremonyStatus status,
    Instant scheduledAt,
    Instant startedAt,
    Instant completedAt,
    Integer durationMinutes,
    String notes,
    CeremonyOutcomes outcomes,
    List<String> actionItems,
    String coachSummary,
    Instant createdAt) {

    /**
     * Request to start a ceremony.
     */
    public record StartCeremonyRequest(
        @NotNull CeremonyType ceremonyType,
        @NotBlank String sprintId) {}

    /**
     * Request to complete a ceremony.
     */
    public record CompleteCeremonyRequest(
        @Size(max = 5000) String notes,
        CeremonyOutcomes outcomes,
        List<@Size(max = 500) String> actionItems) {}

    /**
     * Ceremony outcomes structure.
     */
    public record CeremonyOutcomes(
        // Planning outcomes
        Integer plannedPoints,
        Integer tasksSelected,
        String sprintGoal,
        
        // Review outcomes
        Integer pointsDelivered,
        Integer tasksCompleted,
        List<String> highlights,
        List<String> carriedOver,
        
        // Retrospective outcomes
        List<String> wentWell,
        List<String> needsImprovement,
        List<String> tryNextSprint) {}

    /**
     * Ceremony schedule for a sprint.
     */
    public record CeremonySchedule(
        String sprintId,
        List<CeremonySlot> ceremonies) {}

    /**
     * Single ceremony slot.
     */
    public record CeremonySlot(
        CeremonyType type,
        Instant scheduledAt,
        CeremonyStatus status,
        boolean isOverdue) {}
}
