package app.kaiz.tasks.application.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record TaskTemplateDto(
    UUID id,
    String name,
    String description,
    String type, // TASK or EVENT
    String creatorType, // SYSTEM or USER
    UUID userId, // null for system templates
    
    // Task defaults
    int defaultStoryPoints,
    String defaultLifeWheelAreaId,
    String defaultEisenhowerQuadrantId,
    
    // Event defaults
    Integer defaultDuration, // minutes
    String defaultLocation,
    boolean isAllDay,
    List<String> defaultAttendees,
    
    // Recurrence
    boolean isRecurring,
    RecurrencePatternDto recurrencePattern,
    String suggestedSprint, // CURRENT, NEXT, BACKLOG
    
    // Community metrics
    BigDecimal rating,
    int ratingCount,
    int usageCount,
    
    // Display
    String icon,
    String color,
    List<String> tags, // Template's own tags
    
    // User-specific (populated per request)
    boolean isFavorite,
    Integer userRating, // null if user hasn't rated
    List<String> userTags, // User's personal tags for this template
    
    Instant createdAt,
    Instant updatedAt) {

  public record RecurrencePatternDto(
      String frequency, // DAILY, WEEKLY, BIWEEKLY, MONTHLY, YEARLY
      int interval,
      LocalDate endDate) {}

  public record CreateTaskTemplateRequest(
      @NotBlank @Size(max = 255) String name,
      @Size(max = 2000) String description,
      String type, // TASK or EVENT (defaults to TASK)
      @Min(1) @Max(21) Integer defaultStoryPoints,
      String defaultLifeWheelAreaId,
      String defaultEisenhowerQuadrantId,
      
      // Event fields
      Integer defaultDuration,
      @Size(max = 500) String defaultLocation,
      Boolean isAllDay,
      List<String> defaultAttendees,
      
      // Recurrence
      Boolean isRecurring,
      RecurrencePatternDto recurrencePattern,
      String suggestedSprint, // CURRENT, NEXT, BACKLOG
      
      // Display
      @Size(max = 50) String icon,
      @Size(max = 7) String color,
      List<String> tags) {}

  public record UpdateTaskTemplateRequest(
      @Size(max = 255) String name,
      @Size(max = 2000) String description,
      String type,
      @Min(1) @Max(21) Integer defaultStoryPoints,
      String defaultLifeWheelAreaId,
      String defaultEisenhowerQuadrantId,
      
      // Event fields
      Integer defaultDuration,
      @Size(max = 500) String defaultLocation,
      Boolean isAllDay,
      List<String> defaultAttendees,
      
      // Recurrence
      Boolean isRecurring,
      RecurrencePatternDto recurrencePattern,
      String suggestedSprint,
      
      // Display
      @Size(max = 50) String icon,
      @Size(max = 7) String color,
      List<String> tags) {}

  // Request to rate a template (1-5 stars)
  public record RateTemplateRequest(
      @Min(1) @Max(5) int rating) {}

  // Response after rating
  public record RatingResponse(
      UUID templateId,
      BigDecimal averageRating,
      int ratingCount,
      int userRating) {}

  // Request to create task/event from template
  public record UseTemplateRequest(
      String title, // Override template title
      String description, // Override template description
      String sprintId, // null for backlog
      String epicId, // optional epic association
      LocalDate startDate, // for recurring or scheduled tasks
      
      // Recurrence override
      Boolean isRecurring,
      RecurrencePatternDto recurrencePattern) {}

  // Filter options for template listing
  public record TemplateFilterRequest(
      String type, // TASK, EVENT, or null for all
      String lifeWheelAreaId,
      String search,
      Boolean favoritesOnly,
      String sortBy) {} // rating, usage, name, createdAt
}
