package app.kaiz.community.application.dto;

import jakarta.validation.constraints.NotBlank;

/** Request DTO for creating an answer. */
public record CreateAnswerRequest(@NotBlank(message = "Body is required") String body) {}
