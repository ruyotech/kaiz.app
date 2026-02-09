package app.kaiz.tasks.application.dto;

import app.kaiz.tasks.domain.SprintStatus;
import java.time.Instant;
import java.time.LocalDate;

public record SprintDto(
    String id,
    int weekNumber,
    int year,
    LocalDate startDate,
    LocalDate endDate,
    SprintStatus status,
    int totalPoints,
    int completedPoints,
    Instant committedAt) {}
