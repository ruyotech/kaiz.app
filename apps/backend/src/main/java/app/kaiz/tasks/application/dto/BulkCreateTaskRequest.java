package app.kaiz.tasks.application.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import java.util.List;

/** Request to create multiple tasks in a single batch. Max 50 tasks per request. */
public record BulkCreateTaskRequest(
    @NotEmpty(message = "At least one task is required")
        @Size(max = 50, message = "Maximum 50 tasks per batch")
        @Valid
        List<TaskDto.CreateTaskRequest> tasks) {}
