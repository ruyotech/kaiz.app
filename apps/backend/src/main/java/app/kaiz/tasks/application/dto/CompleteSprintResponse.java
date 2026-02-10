package app.kaiz.tasks.application.dto;

import java.time.Instant;
import java.util.List;

public record CompleteSprintResponse(
    String sprintId,
    int completedPoints,
    int totalPoints,
    double completionRate,
    int tasksCompleted,
    int tasksCarriedOver,
    String nextSprintId,
    List<String> carriedOverTaskIds,
    Instant completedAt) {}
