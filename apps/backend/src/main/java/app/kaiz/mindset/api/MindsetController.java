package app.kaiz.mindset.api;

import app.kaiz.mindset.application.MindsetService;
import app.kaiz.mindset.application.dto.MindsetContentDto;
import app.kaiz.mindset.application.dto.MindsetThemeDto;
import app.kaiz.mindset.domain.EmotionalTone;
import app.kaiz.shared.util.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/mindset")
@RequiredArgsConstructor
@Tag(name = "Mindset", description = "Motivational content and themes endpoints")
public class MindsetController {

  private final MindsetService mindsetService;

  @GetMapping("/content")
  @Operation(
      summary = "Get all mindset content",
      description = "Retrieve all motivational content ordered by intervention weight")
  public ResponseEntity<ApiResponse<List<MindsetContentDto>>> getAllContent() {
    return ResponseEntity.ok(ApiResponse.success(mindsetService.getAllContent()));
  }

  @GetMapping("/content/{id}")
  @Operation(
      summary = "Get mindset content by ID",
      description = "Retrieve a specific mindset content item")
  public ResponseEntity<ApiResponse<MindsetContentDto>> getContentById(@PathVariable String id) {
    return ResponseEntity.ok(ApiResponse.success(mindsetService.getContentById(id)));
  }

  @GetMapping("/content/dimension/{dimensionTag}")
  @Operation(
      summary = "Get content by dimension",
      description = "Retrieve mindset content filtered by life wheel dimension tag")
  public ResponseEntity<ApiResponse<List<MindsetContentDto>>> getContentByDimension(
      @PathVariable String dimensionTag) {
    return ResponseEntity.ok(
        ApiResponse.success(mindsetService.getContentByDimensionTag(dimensionTag)));
  }

  @GetMapping("/content/tone/{tone}")
  @Operation(
      summary = "Get content by emotional tone",
      description = "Retrieve mindset content filtered by emotional tone")
  public ResponseEntity<ApiResponse<List<MindsetContentDto>>> getContentByTone(
      @PathVariable EmotionalTone tone) {
    return ResponseEntity.ok(ApiResponse.success(mindsetService.getContentByEmotionalTone(tone)));
  }

  @GetMapping("/content/favorites")
  @Operation(
      summary = "Get favorite content",
      description = "Retrieve all favorited mindset content")
  public ResponseEntity<ApiResponse<List<MindsetContentDto>>> getFavorites() {
    return ResponseEntity.ok(ApiResponse.success(mindsetService.getFavorites()));
  }

  @PostMapping("/content/{id}/toggle-favorite")
  @Operation(
      summary = "Toggle favorite status",
      description = "Toggle the favorite status of a mindset content item")
  public ResponseEntity<ApiResponse<MindsetContentDto>> toggleFavorite(@PathVariable String id) {
    return ResponseEntity.ok(ApiResponse.success(mindsetService.toggleFavorite(id)));
  }

  @GetMapping("/themes")
  @Operation(summary = "Get all themes", description = "Retrieve all available mindset themes")
  public ResponseEntity<ApiResponse<List<MindsetThemeDto>>> getAllThemes() {
    return ResponseEntity.ok(ApiResponse.success(mindsetService.getAllThemes()));
  }

  @GetMapping("/themes/{id}")
  @Operation(summary = "Get theme by ID", description = "Retrieve a specific mindset theme")
  public ResponseEntity<ApiResponse<MindsetThemeDto>> getThemeById(@PathVariable String id) {
    return ResponseEntity.ok(ApiResponse.success(mindsetService.getThemeById(id)));
  }

  @GetMapping("/themes/name/{name}")
  @Operation(summary = "Get theme by name", description = "Retrieve a mindset theme by its name")
  public ResponseEntity<ApiResponse<MindsetThemeDto>> getThemeByName(@PathVariable String name) {
    return ResponseEntity.ok(ApiResponse.success(mindsetService.getThemeByName(name)));
  }
}
