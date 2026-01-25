package com.kaiz.lifeos.sdlc.api;

import com.kaiz.lifeos.sdlc.application.SprintService;
import com.kaiz.lifeos.sdlc.application.dto.SprintDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/sprints")
@RequiredArgsConstructor
@Tag(name = "Sprints", description = "Sprint management endpoints")
public class SprintController {

  private final SprintService sprintService;

  @GetMapping
  @Operation(summary = "Get all sprints", description = "Retrieve all sprints, optionally filtered by year")
  public ResponseEntity<List<SprintDto>> getSprints(
      @RequestParam(required = false) Integer year) {
    List<SprintDto> sprints =
        year != null ? sprintService.getSprintsByYear(year) : sprintService.getAllSprints();
    return ResponseEntity.ok(sprints);
  }

  @GetMapping("/current")
  @Operation(summary = "Get current sprint", description = "Retrieve the currently active sprint")
  public ResponseEntity<SprintDto> getCurrentSprint() {
    return ResponseEntity.ok(sprintService.getCurrentSprint());
  }

  @GetMapping("/upcoming")
  @Operation(summary = "Get upcoming sprints", description = "Retrieve upcoming sprints")
  public ResponseEntity<List<SprintDto>> getUpcomingSprints(
      @RequestParam(defaultValue = "4") int limit) {
    return ResponseEntity.ok(sprintService.getUpcomingSprints(limit));
  }

  @GetMapping("/{id}")
  @Operation(summary = "Get sprint by ID", description = "Retrieve a specific sprint by its ID")
  public ResponseEntity<SprintDto> getSprintById(@PathVariable String id) {
    return ResponseEntity.ok(sprintService.getSprintById(id));
  }

  @PostMapping("/{id}/activate")
  @Operation(summary = "Activate sprint", description = "Set a sprint as the active sprint")
  public ResponseEntity<SprintDto> activateSprint(@PathVariable String id) {
    return ResponseEntity.ok(sprintService.activateSprint(id));
  }
}
