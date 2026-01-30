package app.kaiz.sensai.application.dto;

import jakarta.validation.constraints.*;
import java.util.List;

/** DTO for universal intake system. */
public record IntakeDto(
    /** Original input text */
    String originalInput,
    /** Type of intake */
    String intakeType,
    /** Parsed task details */
    ParsedTask parsedTask,
    /** Suggested life dimension */
    String suggestedDimension,
    /** Suggested scheduling */
    ScheduleSuggestion suggestedSchedule,
    /** Any conflicts detected */
    List<String> conflicts,
    /** Coach's message about the intake */
    String coachMessage,
    /** Confidence score of AI parsing (0-1) */
    double confidence) {

  /** Request to process an intake. */
  public record ProcessIntakeRequest(
      @NotBlank @Size(max = 2000) String input, @NotBlank String intakeType) {}

  /** Parsed task from intake. */
  public record ParsedTask(
      String title,
      String description,
      int estimatedPoints,
      String priority,
      String eisenhowerQuadrant,
      List<String> suggestedTags,
      String suggestedEpic) {}

  /** Schedule suggestion for intake. */
  public record ScheduleSuggestion(
      String optimalTime, String reasoning, boolean addToCurrentSprint, int capacityImpact) {}

  /** Batch intake result. */
  public record BatchIntakeResult(
      int totalProcessed, int successCount, int conflictCount, List<IntakeDto> results) {}
}
