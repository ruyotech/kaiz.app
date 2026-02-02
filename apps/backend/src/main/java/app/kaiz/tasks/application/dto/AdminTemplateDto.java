package app.kaiz.tasks.application.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import java.util.UUID;

public class AdminTemplateDto {

  public record BulkCreateTemplatesRequest(
      @NotEmpty(message = "Templates list cannot be empty")
          @Valid
          List<TaskTemplateDto.CreateTaskTemplateRequest> templates) {}

  public record BulkUpdateTemplatesRequest(
      @NotEmpty(message = "Templates list cannot be empty")
          @Valid
          List<BulkUpdateItem> templates) {}

  public record BulkUpdateItem(
      @NotNull(message = "Template ID is required") UUID id,
      @Valid TaskTemplateDto.UpdateTaskTemplateRequest data) {}

  public record BulkDeleteTemplatesRequest(
      @NotEmpty(message = "IDs list cannot be empty") List<UUID> ids) {}

  public record BulkOperationResponse(
      int totalRequested,
      int successCount,
      int failedCount,
      List<BulkOperationError> errors,
      List<TaskTemplateDto> createdTemplates) {}

  public record BulkOperationError(String identifier, String error) {}
}
