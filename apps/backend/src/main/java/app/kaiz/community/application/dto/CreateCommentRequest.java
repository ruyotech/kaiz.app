package app.kaiz.community.application.dto;

import jakarta.validation.constraints.NotBlank;

/** Request DTO for creating a story comment. */
public record CreateCommentRequest(@NotBlank(message = "Text is required") String text) {}
