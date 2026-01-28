package app.kaiz.tasks.api;

import app.kaiz.tasks.application.TaskTemplateService;
import app.kaiz.tasks.application.dto.TaskTemplateDto;
import app.kaiz.tasks.application.dto.TaskTemplateDto.*;
import app.kaiz.shared.security.CurrentUser;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/templates")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Task Templates", description = "Task/Event template management endpoints")
public class TaskTemplateController {

  private final TaskTemplateService taskTemplateService;

  // ============ List Templates ============

  @GetMapping
  @Operation(summary = "Get all available templates", description = "Get all templates available to the user (global + user's own)")
  public ResponseEntity<List<TaskTemplateDto>> getAllTemplates(@CurrentUser UUID userId) {
    return ResponseEntity.ok(taskTemplateService.getAllAvailableTemplates(userId));
  }

  @GetMapping("/global")
  @Operation(summary = "Get global templates", description = "Get all system-created global templates")
  public ResponseEntity<List<TaskTemplateDto>> getGlobalTemplates(@CurrentUser UUID userId) {
    return ResponseEntity.ok(taskTemplateService.getGlobalTemplates(userId));
  }

  @GetMapping("/global/area/{areaId}")
  @Operation(summary = "Get global templates by life wheel area", description = "Get global templates filtered by life wheel area")
  public ResponseEntity<List<TaskTemplateDto>> getGlobalTemplatesByArea(
      @CurrentUser UUID userId, @PathVariable String areaId) {
    return ResponseEntity.ok(taskTemplateService.getGlobalTemplatesByLifeWheelArea(userId, areaId));
  }

  @GetMapping("/user")
  @Operation(summary = "Get user's templates", description = "Get all templates created by the current user")
  public ResponseEntity<List<TaskTemplateDto>> getUserTemplates(@CurrentUser UUID userId) {
    return ResponseEntity.ok(taskTemplateService.getTemplatesByUserId(userId));
  }

  @GetMapping("/favorites")
  @Operation(summary = "Get favorite templates", description = "Get user's favorited/bookmarked templates")
  public ResponseEntity<List<TaskTemplateDto>> getFavoriteTemplates(@CurrentUser UUID userId) {
    return ResponseEntity.ok(taskTemplateService.getFavoriteTemplates(userId));
  }

  @GetMapping("/search")
  @Operation(summary = "Search templates", description = "Search templates by name or description")
  public ResponseEntity<List<TaskTemplateDto>> searchTemplates(
      @CurrentUser UUID userId, @RequestParam String q) {
    return ResponseEntity.ok(taskTemplateService.searchTemplates(userId, q));
  }

  // ============ Single Template ============

  @GetMapping("/{id}")
  @Operation(summary = "Get template by ID", description = "Retrieve a specific template (global or user's own)")
  public ResponseEntity<TaskTemplateDto> getTemplateById(
      @CurrentUser UUID userId, @PathVariable UUID id) {
    return ResponseEntity.ok(taskTemplateService.getTemplateById(userId, id));
  }

  // ============ CRUD Operations ============

  @PostMapping
  @Operation(summary = "Create template", description = "Create a new user template")
  public ResponseEntity<TaskTemplateDto> createTemplate(
      @CurrentUser UUID userId, @Valid @RequestBody CreateTaskTemplateRequest request) {
    TaskTemplateDto template = taskTemplateService.createTemplate(userId, request);
    return ResponseEntity.created(URI.create("/api/v1/templates/" + template.id())).body(template);
  }

  @PutMapping("/{id}")
  @Operation(summary = "Update template", description = "Update an existing user template")
  public ResponseEntity<TaskTemplateDto> updateTemplate(
      @CurrentUser UUID userId,
      @PathVariable UUID id,
      @Valid @RequestBody UpdateTaskTemplateRequest request) {
    return ResponseEntity.ok(taskTemplateService.updateTemplate(userId, id, request));
  }

  @DeleteMapping("/{id}")
  @Operation(summary = "Delete template", description = "Delete a user template")
  public ResponseEntity<Void> deleteTemplate(@CurrentUser UUID userId, @PathVariable UUID id) {
    taskTemplateService.deleteTemplate(userId, id);
    return ResponseEntity.noContent().build();
  }

  // ============ Favorites ============

  @PostMapping("/{id}/favorite")
  @Operation(summary = "Toggle favorite", description = "Add or remove template from favorites")
  public ResponseEntity<FavoriteResponse> toggleFavorite(
      @CurrentUser UUID userId, @PathVariable UUID id) {
    boolean isFavorite = taskTemplateService.toggleFavorite(userId, id);
    return ResponseEntity.ok(new FavoriteResponse(id, isFavorite));
  }

  // ============ Rating ============

  @PostMapping("/{id}/rate")
  @Operation(summary = "Rate template", description = "Rate a template (1-5 stars)")
  public ResponseEntity<RatingResponse> rateTemplate(
      @CurrentUser UUID userId, 
      @PathVariable UUID id, 
      @Valid @RequestBody RateTemplateRequest request) {
    return ResponseEntity.ok(taskTemplateService.rateTemplate(userId, id, request.rating()));
  }

  // ============ Clone ============

  @PostMapping("/{id}/clone")
  @Operation(summary = "Clone template", description = "Clone a global template to user's templates for customization")
  public ResponseEntity<TaskTemplateDto> cloneTemplate(
      @CurrentUser UUID userId, @PathVariable UUID id) {
    TaskTemplateDto cloned = taskTemplateService.cloneTemplate(userId, id);
    return ResponseEntity.created(URI.create("/api/v1/templates/" + cloned.id())).body(cloned);
  }

  // ============ Use Template ============

  @PostMapping("/{id}/use")
  @Operation(summary = "Use template", description = "Increment template usage count (called when creating task from template)")
  public ResponseEntity<Void> useTemplate(@PathVariable UUID id) {
    taskTemplateService.incrementUsage(id);
    return ResponseEntity.ok().build();
  }

  // ============ Response DTOs ============

  public record FavoriteResponse(UUID templateId, boolean isFavorite) {}
}
