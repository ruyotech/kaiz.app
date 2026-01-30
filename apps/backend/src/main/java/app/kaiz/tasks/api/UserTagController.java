package app.kaiz.tasks.api;

import app.kaiz.shared.security.CurrentUser;
import app.kaiz.shared.util.ApiResponse;
import app.kaiz.tasks.application.UserTagService;
import app.kaiz.tasks.application.dto.UserTagDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/tags")
@RequiredArgsConstructor
@Tag(name = "User Tags", description = "Manage user-level tags for tasks and templates")
public class UserTagController {

  private final UserTagService userTagService;

  @GetMapping
  @Operation(summary = "Get all user tags")
  public ResponseEntity<ApiResponse<List<UserTagDto>>> getUserTags(@CurrentUser UUID userId) {
    return ResponseEntity.ok(ApiResponse.success(userTagService.getUserTags(userId)));
  }

  @GetMapping("/{id}")
  @Operation(summary = "Get a specific tag")
  public ResponseEntity<ApiResponse<UserTagDto>> getTag(
      @CurrentUser UUID userId, @PathVariable UUID id) {
    return ResponseEntity.ok(ApiResponse.success(userTagService.getTagById(userId, id)));
  }

  @PostMapping
  @Operation(summary = "Create a new tag")
  public ResponseEntity<ApiResponse<UserTagDto>> createTag(
      @CurrentUser UUID userId, @Valid @RequestBody UserTagDto.CreateTagRequest request) {
    return ResponseEntity.ok(ApiResponse.success(userTagService.createTag(userId, request)));
  }

  @PutMapping("/{id}")
  @Operation(summary = "Update a tag")
  public ResponseEntity<ApiResponse<UserTagDto>> updateTag(
      @CurrentUser UUID userId,
      @PathVariable UUID id,
      @Valid @RequestBody UserTagDto.UpdateTagRequest request) {
    return ResponseEntity.ok(ApiResponse.success(userTagService.updateTag(userId, id, request)));
  }

  @DeleteMapping("/{id}")
  @Operation(summary = "Delete a tag")
  public ResponseEntity<ApiResponse<Void>> deleteTag(
      @CurrentUser UUID userId, @PathVariable UUID id) {
    userTagService.deleteTag(userId, id);
    return ResponseEntity.ok(ApiResponse.success(null));
  }
}
