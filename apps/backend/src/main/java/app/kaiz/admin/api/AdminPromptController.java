package app.kaiz.admin.api;

import app.kaiz.admin.application.PromptVersioningService;
import app.kaiz.admin.domain.SystemPrompt;
import app.kaiz.shared.util.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * Admin endpoints for prompt version management: versioning, activation toggle, and rollback.
 *
 * <p>Base CRUD for prompts is in {@link AdminCommandCenterController}. This controller adds
 * versioning operations on top.
 */
@RestController
@RequestMapping("/api/v1/admin/prompts")
@RequiredArgsConstructor
@Tag(name = "Admin Prompts", description = "Prompt version management, activation, rollback")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasRole('ADMIN')")
public class AdminPromptController {

  private final PromptVersioningService versioningService;

  @GetMapping
  @Operation(summary = "Get all prompts grouped by category")
  public ResponseEntity<ApiResponse<List<PromptVersionResponse>>> getAllPrompts() {
    List<PromptVersionResponse> prompts =
        versioningService.getAllPromptsGrouped().stream().map(this::toResponse).toList();
    return ResponseEntity.ok(ApiResponse.success(prompts));
  }

  @GetMapping("/key/{key}")
  @Operation(summary = "Get prompt by key with version info")
  public ResponseEntity<ApiResponse<PromptVersionResponse>> getByKey(@PathVariable String key) {
    return ResponseEntity.ok(ApiResponse.success(toResponse(versioningService.getByKey(key))));
  }

  @PostMapping("/{id}/version")
  @Operation(summary = "Create new version of a prompt (auto-increments version number)")
  public ResponseEntity<ApiResponse<PromptVersionResponse>> createVersion(
      @PathVariable UUID id, @RequestBody CreateVersionRequest request) {
    SystemPrompt updated =
        versioningService.createNewVersion(id, request.content(), request.changeNote());
    return ResponseEntity.ok(ApiResponse.success(toResponse(updated)));
  }

  @PutMapping("/{id}/activate")
  @Operation(summary = "Activate a prompt")
  public ResponseEntity<ApiResponse<Void>> activate(@PathVariable UUID id) {
    versioningService.setActive(id, true);
    return ResponseEntity.ok(ApiResponse.success(null));
  }

  @PutMapping("/{id}/deactivate")
  @Operation(summary = "Deactivate a prompt")
  public ResponseEntity<ApiResponse<Void>> deactivate(@PathVariable UUID id) {
    versioningService.setActive(id, false);
    return ResponseEntity.ok(ApiResponse.success(null));
  }

  @PostMapping("/{id}/rollback")
  @Operation(summary = "Rollback prompt content from a source prompt")
  public ResponseEntity<ApiResponse<PromptVersionResponse>> rollback(
      @PathVariable UUID id, @RequestBody RollbackRequest request) {
    SystemPrompt rolledBack = versioningService.rollbackFrom(id, request.sourcePromptId());
    return ResponseEntity.ok(ApiResponse.success(toResponse(rolledBack)));
  }

  // ── DTOs ──

  private PromptVersionResponse toResponse(SystemPrompt p) {
    return new PromptVersionResponse(
        p.getId(),
        p.getPromptKey(),
        p.getPromptName(),
        p.getPromptCategory().name(),
        p.getPromptContent(),
        p.getVariables(),
        p.getDescription(),
        p.getVersion(),
        p.isActive(),
        p.getUpdatedAt());
  }

  public record PromptVersionResponse(
      UUID id,
      String promptKey,
      String promptName,
      String category,
      String content,
      String variables,
      String description,
      int version,
      boolean active,
      java.time.Instant updatedAt) {}

  public record CreateVersionRequest(String content, String changeNote) {}

  public record RollbackRequest(UUID sourcePromptId) {}
}
