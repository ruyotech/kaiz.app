package com.kaiz.lifeos.sdlc.api;

import com.kaiz.lifeos.sdlc.application.TaskService;
import com.kaiz.lifeos.sdlc.application.dto.TaskCommentDto;
import com.kaiz.lifeos.sdlc.application.dto.TaskDto;
import com.kaiz.lifeos.sdlc.application.dto.TaskHistoryDto;
import com.kaiz.lifeos.sdlc.domain.TaskStatus;
import com.kaiz.lifeos.shared.security.CurrentUser;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/tasks")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Tasks", description = "Task management endpoints")
public class TaskController {

  private final TaskService taskService;

  @GetMapping
  @Operation(summary = "Get all tasks", description = "Retrieve tasks with optional filters")
  public ResponseEntity<Page<TaskDto>> getTasks(
      @CurrentUser UUID userId, @PageableDefault(size = 20) Pageable pageable) {
    return ResponseEntity.ok(taskService.getTasksByUserId(userId, pageable));
  }

  @GetMapping("/sprint/{sprintId}")
  @Operation(summary = "Get tasks by sprint", description = "Retrieve tasks for a specific sprint")
  public ResponseEntity<List<TaskDto>> getTasksBySprint(
      @CurrentUser UUID userId, @PathVariable String sprintId) {
    return ResponseEntity.ok(taskService.getTasksBySprintId(userId, sprintId));
  }

  @GetMapping("/epic/{epicId}")
  @Operation(summary = "Get tasks by epic", description = "Retrieve tasks for a specific epic")
  public ResponseEntity<List<TaskDto>> getTasksByEpic(
      @CurrentUser UUID userId, @PathVariable UUID epicId) {
    return ResponseEntity.ok(taskService.getTasksByEpicId(userId, epicId));
  }

  @GetMapping("/status/{status}")
  @Operation(summary = "Get tasks by status", description = "Retrieve tasks with a specific status")
  public ResponseEntity<List<TaskDto>> getTasksByStatus(
      @CurrentUser UUID userId, @PathVariable TaskStatus status) {
    return ResponseEntity.ok(taskService.getTasksByStatus(userId, status));
  }

  @GetMapping("/drafts")
  @Operation(summary = "Get draft tasks", description = "Retrieve all draft tasks")
  public ResponseEntity<List<TaskDto>> getDraftTasks(@CurrentUser UUID userId) {
    return ResponseEntity.ok(taskService.getDraftTasks(userId));
  }

  @GetMapping("/backlog")
  @Operation(summary = "Get backlog tasks", description = "Retrieve tasks not assigned to a sprint")
  public ResponseEntity<List<TaskDto>> getBacklogTasks(@CurrentUser UUID userId) {
    return ResponseEntity.ok(taskService.getBacklogTasks(userId));
  }

  @GetMapping("/{id}")
  @Operation(
      summary = "Get task by ID",
      description = "Retrieve a specific task with comments and history")
  public ResponseEntity<TaskDto> getTaskById(@CurrentUser UUID userId, @PathVariable UUID id) {
    return ResponseEntity.ok(taskService.getTaskById(userId, id));
  }

  @PostMapping
  @Operation(summary = "Create task", description = "Create a new task")
  public ResponseEntity<TaskDto> createTask(
      @CurrentUser UUID userId, @Valid @RequestBody TaskDto.CreateTaskRequest request) {
    TaskDto task = taskService.createTask(userId, request);
    return ResponseEntity.created(URI.create("/api/v1/tasks/" + task.id())).body(task);
  }

  @PutMapping("/{id}")
  @Operation(summary = "Update task", description = "Update an existing task")
  public ResponseEntity<TaskDto> updateTask(
      @CurrentUser UUID userId,
      @PathVariable UUID id,
      @Valid @RequestBody TaskDto.UpdateTaskRequest request) {
    return ResponseEntity.ok(taskService.updateTask(userId, id, request));
  }

  @PatchMapping("/{id}/status")
  @Operation(summary = "Update task status", description = "Update only the status of a task")
  public ResponseEntity<TaskDto> updateTaskStatus(
      @CurrentUser UUID userId,
      @PathVariable UUID id,
      @Valid @RequestBody TaskDto.UpdateTaskStatusRequest request) {
    return ResponseEntity.ok(taskService.updateTaskStatus(userId, id, request.status()));
  }

  @DeleteMapping("/{id}")
  @Operation(summary = "Delete task", description = "Delete a task")
  public ResponseEntity<Void> deleteTask(@CurrentUser UUID userId, @PathVariable UUID id) {
    taskService.deleteTask(userId, id);
    return ResponseEntity.noContent().build();
  }

  @GetMapping("/{id}/history")
  @Operation(summary = "Get task history", description = "Retrieve the change history of a task")
  public ResponseEntity<List<TaskHistoryDto>> getTaskHistory(
      @CurrentUser UUID userId, @PathVariable UUID id) {
    return ResponseEntity.ok(taskService.getTaskHistory(userId, id));
  }

  @GetMapping("/{id}/comments")
  @Operation(summary = "Get task comments", description = "Retrieve comments for a task")
  public ResponseEntity<List<TaskCommentDto>> getTaskComments(
      @CurrentUser UUID userId, @PathVariable UUID id) {
    return ResponseEntity.ok(taskService.getTaskComments(userId, id));
  }

  @PostMapping("/{id}/comments")
  @Operation(summary = "Add comment", description = "Add a comment to a task")
  public ResponseEntity<TaskCommentDto> addComment(
      @CurrentUser UUID userId,
      @PathVariable UUID id,
      @Valid @RequestBody TaskCommentDto.CreateTaskCommentRequest request) {
    TaskCommentDto comment = taskService.addComment(userId, id, request);
    return ResponseEntity.created(URI.create("/api/v1/tasks/" + id + "/comments/" + comment.id()))
        .body(comment);
  }
}
