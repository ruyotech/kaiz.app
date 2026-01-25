package com.kaiz.lifeos.sdlc.api;

import com.kaiz.lifeos.sdlc.application.TaskTemplateService;
import com.kaiz.lifeos.sdlc.application.dto.TaskTemplateDto;
import com.kaiz.lifeos.shared.security.CurrentUser;
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
@Tag(name = "Task Templates", description = "Task template management endpoints")
public class TaskTemplateController {

  private final TaskTemplateService taskTemplateService;

  @GetMapping
  @Operation(summary = "Get all templates", description = "Retrieve all task templates for the current user")
  public ResponseEntity<List<TaskTemplateDto>> getTemplates(@CurrentUser UUID userId) {
    return ResponseEntity.ok(taskTemplateService.getTemplatesByUserId(userId));
  }

  @GetMapping("/{id}")
  @Operation(summary = "Get template by ID", description = "Retrieve a specific task template")
  public ResponseEntity<TaskTemplateDto> getTemplateById(
      @CurrentUser UUID userId, @PathVariable UUID id) {
    return ResponseEntity.ok(taskTemplateService.getTemplateById(userId, id));
  }

  @PostMapping
  @Operation(summary = "Create template", description = "Create a new task template")
  public ResponseEntity<TaskTemplateDto> createTemplate(
      @CurrentUser UUID userId, @Valid @RequestBody TaskTemplateDto.CreateTaskTemplateRequest request) {
    TaskTemplateDto template = taskTemplateService.createTemplate(userId, request);
    return ResponseEntity.created(URI.create("/api/v1/templates/" + template.id())).body(template);
  }

  @PutMapping("/{id}")
  @Operation(summary = "Update template", description = "Update an existing task template")
  public ResponseEntity<TaskTemplateDto> updateTemplate(
      @CurrentUser UUID userId,
      @PathVariable UUID id,
      @Valid @RequestBody TaskTemplateDto.UpdateTaskTemplateRequest request) {
    return ResponseEntity.ok(taskTemplateService.updateTemplate(userId, id, request));
  }

  @DeleteMapping("/{id}")
  @Operation(summary = "Delete template", description = "Delete a task template")
  public ResponseEntity<Void> deleteTemplate(@CurrentUser UUID userId, @PathVariable UUID id) {
    taskTemplateService.deleteTemplate(userId, id);
    return ResponseEntity.noContent().build();
  }
}
