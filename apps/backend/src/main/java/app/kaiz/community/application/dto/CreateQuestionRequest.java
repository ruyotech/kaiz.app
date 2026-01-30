package app.kaiz.community.application.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.List;

/** Request DTO for creating a question. */
public record CreateQuestionRequest(
    @NotBlank(message = "Title is required")
        @Size(max = 300, message = "Title must be at most 300 characters")
        String title,
    @NotBlank(message = "Body is required") String body,
    List<String> tags) {}
