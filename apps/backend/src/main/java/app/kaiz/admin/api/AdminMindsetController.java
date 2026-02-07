package app.kaiz.admin.api;

import app.kaiz.admin.application.AdminMindsetService;
import app.kaiz.admin.application.dto.AdminMindsetDtos.*;
import app.kaiz.shared.util.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/mindset")
@RequiredArgsConstructor
@Tag(name = "Admin Mindset", description = "Admin CRUD for mindset content and themes")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasRole('ADMIN')")
public class AdminMindsetController {

  private final AdminMindsetService adminMindsetService;

  // ── Content Endpoints ───────────────────────────────────────────────────

  @GetMapping("/content")
  @Operation(summary = "Get all mindset content (paginated, filterable)")
  public ResponseEntity<ApiResponse<List<AdminMindsetContentResponse>>> getAllContent(
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "20") int size,
      @RequestParam(required = false) String dimension,
      @RequestParam(required = false) String tone,
      @RequestParam(required = false) String search) {
    Page<AdminMindsetContentResponse> result =
        adminMindsetService.getAllContent(
            PageRequest.of(page, size, Sort.by("createdAt").descending()), dimension, tone, search);
    return ResponseEntity.ok(
        ApiResponse.success(
            result.getContent(), ApiResponse.PageMeta.of(page, size, result.getTotalElements())));
  }

  @GetMapping("/content/{id}")
  @Operation(summary = "Get mindset content by ID")
  public ResponseEntity<ApiResponse<AdminMindsetContentResponse>> getContentById(
      @PathVariable UUID id) {
    return ResponseEntity.ok(ApiResponse.success(adminMindsetService.getContentById(id)));
  }

  @PostMapping("/content")
  @Operation(summary = "Create mindset content")
  public ResponseEntity<ApiResponse<AdminMindsetContentResponse>> createContent(
      @Valid @RequestBody CreateMindsetContentRequest request) {
    return ResponseEntity.status(HttpStatus.CREATED)
        .body(ApiResponse.success(adminMindsetService.createContent(request)));
  }

  @PutMapping("/content/{id}")
  @Operation(summary = "Update mindset content")
  public ResponseEntity<ApiResponse<AdminMindsetContentResponse>> updateContent(
      @PathVariable UUID id, @Valid @RequestBody UpdateMindsetContentRequest request) {
    return ResponseEntity.ok(ApiResponse.success(adminMindsetService.updateContent(id, request)));
  }

  @DeleteMapping("/content/{id}")
  @Operation(summary = "Delete mindset content")
  public ResponseEntity<ApiResponse<Void>> deleteContent(@PathVariable UUID id) {
    adminMindsetService.deleteContent(id);
    return ResponseEntity.ok(ApiResponse.success(null));
  }

  @PostMapping("/content/bulk")
  @Operation(summary = "Bulk upload mindset content")
  public ResponseEntity<ApiResponse<BulkUploadResultResponse>> bulkCreateContent(
      @Valid @RequestBody BulkCreateMindsetContentRequest request) {
    return ResponseEntity.status(HttpStatus.CREATED)
        .body(ApiResponse.success(adminMindsetService.bulkCreateContent(request)));
  }

  // ── Theme Endpoints ─────────────────────────────────────────────────────

  @GetMapping("/themes")
  @Operation(summary = "Get all mindset themes")
  public ResponseEntity<ApiResponse<List<AdminMindsetThemeResponse>>> getAllThemes() {
    return ResponseEntity.ok(ApiResponse.success(adminMindsetService.getAllThemes()));
  }

  @PostMapping("/themes")
  @Operation(summary = "Create mindset theme")
  public ResponseEntity<ApiResponse<AdminMindsetThemeResponse>> createTheme(
      @Valid @RequestBody CreateMindsetThemeRequest request) {
    return ResponseEntity.status(HttpStatus.CREATED)
        .body(ApiResponse.success(adminMindsetService.createTheme(request)));
  }

  @PutMapping("/themes/{id}")
  @Operation(summary = "Update mindset theme")
  public ResponseEntity<ApiResponse<AdminMindsetThemeResponse>> updateTheme(
      @PathVariable UUID id, @Valid @RequestBody UpdateMindsetThemeRequest request) {
    return ResponseEntity.ok(ApiResponse.success(adminMindsetService.updateTheme(id, request)));
  }

  @DeleteMapping("/themes/{id}")
  @Operation(summary = "Delete mindset theme")
  public ResponseEntity<ApiResponse<Void>> deleteTheme(@PathVariable UUID id) {
    adminMindsetService.deleteTheme(id);
    return ResponseEntity.ok(ApiResponse.success(null));
  }

  // ── Stats Endpoint ──────────────────────────────────────────────────────

  @GetMapping("/stats")
  @Operation(summary = "Get mindset dashboard stats")
  public ResponseEntity<ApiResponse<AdminMindsetStatsResponse>> getStats() {
    return ResponseEntity.ok(ApiResponse.success(adminMindsetService.getStats()));
  }
}
