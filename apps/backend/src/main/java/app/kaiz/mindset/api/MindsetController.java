package app.kaiz.mindset.api;

import app.kaiz.mindset.application.MindsetService;
import app.kaiz.mindset.application.dto.MindsetContentResponse;
import app.kaiz.mindset.application.dto.MindsetThemeResponse;
import app.kaiz.mindset.application.dto.ToggleFavoriteResponse;
import app.kaiz.shared.security.CurrentUser;
import app.kaiz.shared.util.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/mindset")
@RequiredArgsConstructor
@Tag(name = "Mindset", description = "Motivational content, themes, and favorites")
public class MindsetController {

  private final MindsetService mindsetService;

  @GetMapping("/content")
  @Operation(summary = "Get all mindset content (paginated)")
  public ResponseEntity<ApiResponse<List<MindsetContentResponse>>> getAllContent(
      @CurrentUser UUID userId,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "20") int size) {
    Page<MindsetContentResponse> result =
        mindsetService.getAllContent(
            userId, PageRequest.of(page, size, Sort.by("createdAt").descending()));
    return ResponseEntity.ok(
        ApiResponse.success(
            result.getContent(), ApiResponse.PageMeta.of(page, size, result.getTotalElements())));
  }

  @GetMapping("/content/feed")
  @Operation(
      summary = "Get curated content feed",
      description =
          "Returns a personalized feed of ~20 items using contextual injection algorithm."
              + " Pass weakDimensions for targeted intervention content.")
  public ResponseEntity<ApiResponse<List<MindsetContentResponse>>> getFeed(
      @CurrentUser UUID userId, @RequestParam(required = false) List<String> weakDimensions) {
    return ResponseEntity.ok(ApiResponse.success(mindsetService.getFeed(userId, weakDimensions)));
  }

  @GetMapping("/content/{id}")
  @Operation(summary = "Get mindset content by ID")
  public ResponseEntity<ApiResponse<MindsetContentResponse>> getContentById(
      @CurrentUser UUID userId, @PathVariable UUID id) {
    return ResponseEntity.ok(ApiResponse.success(mindsetService.getContentById(id, userId)));
  }

  @GetMapping("/content/dimension/{lifeWheelAreaId}")
  @Operation(summary = "Get content by life wheel dimension (paginated)")
  public ResponseEntity<ApiResponse<List<MindsetContentResponse>>> getContentByDimension(
      @CurrentUser UUID userId,
      @PathVariable String lifeWheelAreaId,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "20") int size) {
    Page<MindsetContentResponse> result =
        mindsetService.getContentByDimension(lifeWheelAreaId, userId, PageRequest.of(page, size));
    return ResponseEntity.ok(
        ApiResponse.success(
            result.getContent(), ApiResponse.PageMeta.of(page, size, result.getTotalElements())));
  }

  @GetMapping("/favorites")
  @Operation(summary = "Get user's favorite content (paginated)")
  public ResponseEntity<ApiResponse<List<MindsetContentResponse>>> getFavorites(
      @CurrentUser UUID userId,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "20") int size) {
    Page<MindsetContentResponse> result =
        mindsetService.getFavorites(userId, PageRequest.of(page, size));
    return ResponseEntity.ok(
        ApiResponse.success(
            result.getContent(), ApiResponse.PageMeta.of(page, size, result.getTotalElements())));
  }

  @PostMapping("/content/{id}/favorite")
  @Operation(summary = "Toggle favorite status for a content item")
  public ResponseEntity<ApiResponse<ToggleFavoriteResponse>> toggleFavorite(
      @CurrentUser UUID userId, @PathVariable UUID id) {
    return ResponseEntity.ok(ApiResponse.success(mindsetService.toggleFavorite(userId, id)));
  }

  @GetMapping("/themes")
  @Operation(summary = "Get all available themes")
  public ResponseEntity<ApiResponse<List<MindsetThemeResponse>>> getAllThemes() {
    return ResponseEntity.ok(ApiResponse.success(mindsetService.getAllThemes()));
  }

  @GetMapping("/themes/{id}")
  @Operation(summary = "Get theme by ID")
  public ResponseEntity<ApiResponse<MindsetThemeResponse>> getThemeById(@PathVariable UUID id) {
    return ResponseEntity.ok(ApiResponse.success(mindsetService.getThemeById(id)));
  }

  @GetMapping("/themes/name/{name}")
  @Operation(summary = "Get theme by name")
  public ResponseEntity<ApiResponse<MindsetThemeResponse>> getThemeByName(
      @PathVariable String name) {
    return ResponseEntity.ok(ApiResponse.success(mindsetService.getThemeByName(name)));
  }
}
