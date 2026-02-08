package app.kaiz.tasks.application.dto;

import jakarta.validation.constraints.NotEmpty;
import java.util.List;

/** Request to commit selected tasks to a sprint. */
public record SprintCommitRequest(
    @NotEmpty(message = "At least one task must be selected") List<String> taskIds,
    String sprintGoal) {}
