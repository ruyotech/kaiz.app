package app.kaiz.tasks.application.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.Instant;
import java.util.UUID;

public record UserTagDto(UUID id, String name, String color, int usageCount, Instant createdAt) {

  public record CreateTagRequest(
      @NotBlank @Size(max = 100) String name, @Size(max = 7) String color) {}

  public record UpdateTagRequest(@Size(max = 100) String name, @Size(max = 7) String color) {}
}
