package com.kaiz.lifeos.sdlc.application.dto;

import com.kaiz.lifeos.sdlc.domain.SprintStatus;
import java.time.LocalDate;

public record SprintDto(
    String id,
    int weekNumber,
    int year,
    LocalDate startDate,
    LocalDate endDate,
    SprintStatus status,
    int totalPoints,
    int completedPoints) {}
