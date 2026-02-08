package app.kaiz.tasks.application.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.Instant;
import java.util.UUID;

public record TaskChecklistItemDto(
    UUID id, String text, boolean completed, int sortOrder, Instant createdAt, Instant updatedAt) {

  public record CreateChecklistItemRequest(@NotBlank @Size(max = 500) String text) {}
}
