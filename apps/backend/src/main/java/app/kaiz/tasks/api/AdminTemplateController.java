package app.kaiz.tasks.api;

import app.kaiz.tasks.application.TaskTemplateService;
import app.kaiz.tasks.application.dto.TaskTemplateDto;
import app.kaiz.tasks.application.dto.TaskTemplateDto.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * Admin endpoints for managing global (system) templates.
 * Only accessible by users with ADMIN role.
 */
@RestController
@RequestMapping("/api/v1/admin/templates")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Admin Templates", description = "Admin endpoints for managing global templates")
@PreAuthorize("hasRole('ADMIN')")
public class AdminTemplateController {

  private final TaskTemplateService taskTemplateService;

  @GetMapping
  @Operation(summary = "Get all system templates", description = "Get all global (system-created) templates")
  public ResponseEntity<List<TaskTemplateDto>> getAllSystemTemplates() {
    return ResponseEntity.ok(taskTemplateService.getAllSystemTemplates());
  }

  @PostMapping
  @Operation(summary = "Create system template", description = "Create a new global template visible to all users")
  public ResponseEntity<TaskTemplateDto> createSystemTemplate(
      @Valid @RequestBody CreateTaskTemplateRequest request) {
    TaskTemplateDto template = taskTemplateService.createSystemTemplate(request);
    return ResponseEntity.created(URI.create("/api/v1/admin/templates/" + template.id())).body(template);
  }

  @PutMapping("/{id}")
  @Operation(summary = "Update system template", description = "Update an existing global template")
  public ResponseEntity<TaskTemplateDto> updateSystemTemplate(
      @PathVariable UUID id,
      @Valid @RequestBody UpdateTaskTemplateRequest request) {
    return ResponseEntity.ok(taskTemplateService.updateSystemTemplate(id, request));
  }

  @DeleteMapping("/{id}")
  @Operation(summary = "Delete system template", description = "Delete a global template")
  public ResponseEntity<Void> deleteSystemTemplate(@PathVariable UUID id) {
    taskTemplateService.deleteSystemTemplate(id);
    return ResponseEntity.noContent().build();
  }
}
