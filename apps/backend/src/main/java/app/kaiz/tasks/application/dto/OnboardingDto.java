package app.kaiz.tasks.application.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;

/**
 * DTOs for onboarding flow that creates initial tasks, epics, and events
 */
public class OnboardingDto {

    /**
     * Request to complete onboarding and create initial content
     */
    public record OnboardingRequest(
        @NotBlank @Size(min = 2, max = 100)
        String firstName,
        
        @Size(max = 100)
        String lastName,
        
        @NotNull
        PlanType planType,
        
        String corporateCode,
        
        String familyRole, // "owner", "adult", "child"
        
        @NotNull @Size(min = 1)
        List<String> selectedTaskTemplateIds,
        
        List<String> selectedEpicTemplateIds,
        
        List<ImportantDateRequest> importantDates,
        
        String preferredWorkStyle, // "morning", "afternoon", "evening", "flexible"
        
        Integer weeklyCommitmentHours,
        
        String howDidYouHear,
        
        String mainGoal
    ) {}

    /**
     * Plan types
     */
    public enum PlanType {
        INDIVIDUAL,
        FAMILY,
        CORPORATE
    }

    /**
     * Important date (birthday, anniversary, etc.)
     */
    public record ImportantDateRequest(
        @NotBlank String personName,
        @NotBlank String relationship, // "family", "friend", "colleague", "other"
        @NotBlank String dateType, // "birthday", "anniversary", "other"
        @NotBlank String date, // "MM-DD" format
        Integer year, // optional for age calculation
        Integer reminderDaysBefore
    ) {}

    /**
     * Response after onboarding completion
     */
    public record OnboardingResponse(
        int tasksCreated,
        int epicsCreated,
        int eventsCreated,
        String message,
        OnboardingSummary summary
    ) {}

    /**
     * Summary of created content
     */
    public record OnboardingSummary(
        List<CreatedTask> tasks,
        List<CreatedEpic> epics,
        List<CreatedEvent> events,
        int estimatedWeeklyPoints
    ) {}

    public record CreatedTask(
        String id,
        String title,
        int storyPoints,
        String sprintId,
        boolean isRecurring
    ) {}

    public record CreatedEpic(
        String id,
        String title,
        String icon,
        int taskCount
    ) {}

    public record CreatedEvent(
        String id,
        String personName,
        String dateType,
        String date
    ) {}

    /**
     * Task template for display during onboarding
     */
    public record TaskTemplateDto(
        String id,
        String title,
        String description,
        int storyPoints,
        String lifeWheelAreaId,
        String eisenhowerQuadrant,
        boolean isRecurring,
        RecurrencePattern recurrencePattern,
        String suggestedSprint // "current", "next", "backlog"
    ) {}

    public record RecurrencePattern(
        String frequency, // "daily", "weekly", "biweekly", "monthly"
        int interval
    ) {}

    /**
     * Epic template for display during onboarding
     */
    public record EpicTemplateDto(
        String id,
        String title,
        String description,
        String icon,
        String color,
        String lifeWheelAreaId,
        List<String> taskTemplateIds,
        int estimatedWeeks
    ) {}

    /**
     * Task template category
     */
    public record TaskTemplateCategoryDto(
        String id,
        String name,
        String icon,
        String color,
        String description,
        List<TaskTemplateDto> templates
    ) {}

    /**
     * Response containing task templates
     */
    public record TaskTemplatesResponse(
        List<TaskTemplateCategoryDto> categories
    ) {}

    /**
     * Response containing epic templates
     */
    public record EpicTemplatesResponse(
        List<EpicTemplateDto> epics
    ) {}

    /**
     * Corporate code validation request
     */
    public record ValidateCorporateCodeRequest(
        @NotBlank String code
    ) {}

    /**
     * Corporate code validation response
     */
    public record CorporateCodeValidation(
        boolean valid,
        String companyName,
        String message
    ) {}
}
