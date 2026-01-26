package app.kaiz.command_center.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Request DTO for submitting clarification answers.
 */
public record ClarificationAnswersRequest(
        @NotNull UUID sessionId,
        @NotBlank String flowId,
        @NotNull List<Answer> answers) {

    /**
     * Individual answer to a clarification question.
     */
    public record Answer(
            @NotBlank String questionId,
            @NotBlank String value,
            Map<String, Object> metadata) {}
}
