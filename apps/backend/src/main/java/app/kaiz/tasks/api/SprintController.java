package app.kaiz.tasks.api;

import app.kaiz.shared.security.CurrentUser;
import app.kaiz.shared.util.ApiResponse;
import app.kaiz.tasks.application.SprintService;
import app.kaiz.tasks.application.dto.SprintCommitRequest;
import app.kaiz.tasks.application.dto.SprintCommitResponse;
import app.kaiz.tasks.application.dto.SprintDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/sprints")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Sprints", description = "Sprint management endpoints")
public class SprintController {

  private final SprintService sprintService;

  @GetMapping
  @Operation(
      summary = "Get all sprints",
      description = "Retrieve all sprints, optionally filtered by year")
  public ResponseEntity<ApiResponse<List<SprintDto>>> getSprints(
      @RequestParam(required = false) Integer year) {
    List<SprintDto> sprints =
        year != null ? sprintService.getSprintsByYear(year) : sprintService.getAllSprints();
    return ResponseEntity.ok(ApiResponse.success(sprints));
  }

  @GetMapping("/current")
  @Operation(summary = "Get current sprint", description = "Retrieve the currently active sprint")
  public ResponseEntity<ApiResponse<SprintDto>> getCurrentSprint() {
    return ResponseEntity.ok(ApiResponse.success(sprintService.getCurrentSprint()));
  }

  @GetMapping("/upcoming")
  @Operation(summary = "Get upcoming sprints", description = "Retrieve upcoming sprints")
  public ResponseEntity<ApiResponse<List<SprintDto>>> getUpcomingSprints(
      @RequestParam(defaultValue = "4") int limit) {
    return ResponseEntity.ok(ApiResponse.success(sprintService.getUpcomingSprints(limit)));
  }

  @GetMapping("/{id}")
  @Operation(summary = "Get sprint by ID", description = "Retrieve a specific sprint by its ID")
  public ResponseEntity<ApiResponse<SprintDto>> getSprintById(@PathVariable String id) {
    return ResponseEntity.ok(ApiResponse.success(sprintService.getSprintById(id)));
  }

  @PostMapping("/{id}/activate")
  @Operation(summary = "Activate sprint", description = "Set a sprint as the active sprint")
  public ResponseEntity<ApiResponse<SprintDto>> activateSprint(@PathVariable String id) {
    return ResponseEntity.ok(ApiResponse.success(sprintService.activateSprint(id)));
  }

  @PostMapping("/{id}/commit")
  @Operation(
      summary = "Commit sprint",
      description =
          "Batch-assign selected tasks to a sprint, record velocity commitment, "
              + "and auto-activate if sprint start date is today or earlier")
  public ResponseEntity<ApiResponse<SprintCommitResponse>> commitSprint(
      @CurrentUser UUID userId,
      @PathVariable String id,
      @Valid @RequestBody SprintCommitRequest request) {
    return ResponseEntity.ok(ApiResponse.success(sprintService.commitSprint(userId, id, request)));
  }
}
