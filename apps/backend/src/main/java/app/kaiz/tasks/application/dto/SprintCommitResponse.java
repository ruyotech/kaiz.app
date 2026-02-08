package app.kaiz.tasks.application.dto;

import java.time.Instant;
import java.util.Map;

/** Response after committing tasks to a sprint. */
public record SprintCommitResponse(
    String sprintId,
    int weekNumber,
    int year,
    int taskCount,
    int totalPoints,
    int committedPoints,
    boolean activated,
    String sprintGoal,
    Map<String, Integer> dimensionDistribution,
    Instant committedAt) {}
