package app.kaiz.command_center.application.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import java.util.List;

/**
 * Request to generate task drafts from quick-add text lines during sprint planning. Each line
 * represents a single task the user wants to create (e.g. "visit doctor", "walk 30 min", "call
 * mum").
 */
public record SprintQuickAddRequest(
    @NotEmpty(message = "At least one task line is required")
        @Size(max = 20, message = "Maximum 20 lines per request")
        List<@NotBlank String> lines,
    String sprintContext) {}
