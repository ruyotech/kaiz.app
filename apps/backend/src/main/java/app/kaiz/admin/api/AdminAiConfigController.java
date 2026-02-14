package app.kaiz.admin.api;

import app.kaiz.admin.application.AdminCommandCenterService;
import app.kaiz.admin.application.dto.CommandCenterAdminDtos.*;
import app.kaiz.shared.util.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * Admin endpoints for global AI configuration: settings (model params, rate limits) and feature
 * flags (toggles for AI sub-features).
 *
 * <p>Delegates to the existing {@link AdminCommandCenterService} which already manages settings and
 * feature flags. This controller provides a focused, well-named API surface for AI config
 * specifically.
 */
@RestController
@RequestMapping("/api/v1/admin/ai-config")
@RequiredArgsConstructor
@Tag(name = "Admin AI Config", description = "Global AI settings and feature flags")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasRole('ADMIN')")
public class AdminAiConfigController {

  private final AdminCommandCenterService commandCenterService;

  // =============== Settings ===============

  @GetMapping("/settings")
  @Operation(summary = "Get all AI settings")
  public ResponseEntity<ApiResponse<List<SettingResponse>>> getAllSettings() {
    return ResponseEntity.ok(ApiResponse.success(commandCenterService.getAllSettings()));
  }

  @GetMapping("/settings/{key}")
  @Operation(summary = "Get AI setting by key")
  public ResponseEntity<ApiResponse<SettingResponse>> getSetting(@PathVariable String key) {
    return ResponseEntity.ok(ApiResponse.success(commandCenterService.getSetting(key)));
  }

  @PutMapping("/settings/{key}")
  @Operation(summary = "Update AI setting")
  public ResponseEntity<ApiResponse<SettingResponse>> updateSetting(
      @PathVariable String key, @Valid @RequestBody UpdateSettingRequest request) {
    return ResponseEntity.ok(ApiResponse.success(commandCenterService.updateSetting(key, request)));
  }

  // =============== Feature Flags ===============

  @GetMapping("/feature-flags")
  @Operation(summary = "Get all AI feature flags")
  public ResponseEntity<ApiResponse<List<FeatureFlagResponse>>> getAllFeatureFlags() {
    return ResponseEntity.ok(ApiResponse.success(commandCenterService.getAllFeatureFlags()));
  }

  @GetMapping("/feature-flags/{key}")
  @Operation(summary = "Get feature flag by key")
  public ResponseEntity<ApiResponse<FeatureFlagResponse>> getFeatureFlag(@PathVariable String key) {
    return ResponseEntity.ok(ApiResponse.success(commandCenterService.getFeatureFlag(key)));
  }

  @PutMapping("/feature-flags/{key}")
  @Operation(summary = "Update feature flag")
  public ResponseEntity<ApiResponse<FeatureFlagResponse>> updateFeatureFlag(
      @PathVariable String key, @Valid @RequestBody UpdateFeatureFlagRequest request) {
    return ResponseEntity.ok(
        ApiResponse.success(commandCenterService.updateFeatureFlag(key, request)));
  }
}
