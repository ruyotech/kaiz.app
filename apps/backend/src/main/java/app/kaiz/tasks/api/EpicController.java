package app.kaiz.tasks.api;

import app.kaiz.tasks.application.EpicService;
import app.kaiz.tasks.application.dto.EpicDto;
import app.kaiz.tasks.domain.EpicStatus;
import app.kaiz.shared.security.CurrentUser;
import app.kaiz.shared.util.ApiResponse;
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
@RequestMapping("/api/v1/epics")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Epics", description = "Epic management endpoints")
public class EpicController {

  private final EpicService epicService;

  @GetMapping
  @Operation(summary = "Get all epics", description = "Retrieve all epics for the current user")
  public ResponseEntity<ApiResponse<List<EpicDto>>> getEpics(
      @CurrentUser UUID userId, @RequestParam(required = false) EpicStatus status) {
    List<EpicDto> epics =
        status != null
            ? epicService.getEpicsByUserIdAndStatus(userId, status)
            : epicService.getEpicsByUserId(userId);
    return ResponseEntity.ok(ApiResponse.success(epics));
  }

  @GetMapping("/{id}")
  @Operation(summary = "Get epic by ID", description = "Retrieve a specific epic with its tasks")
  public ResponseEntity<ApiResponse<EpicDto>> getEpicById(@CurrentUser UUID userId, @PathVariable UUID id) {
    return ResponseEntity.ok(ApiResponse.success(epicService.getEpicById(userId, id)));
  }

  @PostMapping
  @Operation(summary = "Create epic", description = "Create a new epic")
  public ResponseEntity<ApiResponse<EpicDto>> createEpic(
      @CurrentUser UUID userId, @Valid @RequestBody EpicDto.CreateEpicRequest request) {
    EpicDto epic = epicService.createEpic(userId, request);
    return ResponseEntity.created(URI.create("/api/v1/epics/" + epic.id())).body(ApiResponse.success(epic));
  }

  @PutMapping("/{id}")
  @Operation(summary = "Update epic", description = "Update an existing epic")
  public ResponseEntity<ApiResponse<EpicDto>> updateEpic(
      @CurrentUser UUID userId,
      @PathVariable UUID id,
      @Valid @RequestBody EpicDto.UpdateEpicRequest request) {
    return ResponseEntity.ok(ApiResponse.success(epicService.updateEpic(userId, id, request)));
  }

  @DeleteMapping("/{id}")
  @Operation(summary = "Delete epic", description = "Delete an epic")
  public ResponseEntity<ApiResponse<Void>> deleteEpic(@CurrentUser UUID userId, @PathVariable UUID id) {
    epicService.deleteEpic(userId, id);
    return ResponseEntity.ok(ApiResponse.success(null));
  }
}
