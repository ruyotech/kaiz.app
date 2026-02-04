package app.kaiz.admin.api;

import app.kaiz.admin.application.AdminCommandCenterService;
import app.kaiz.admin.application.dto.CommandCenterAdminDtos.*;
import app.kaiz.shared.util.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

/**
 * Admin endpoints for managing Command Center configuration. Includes LLM providers, system
 * prompts, test attachments, settings, and feature flags.
 */
@RestController
@RequestMapping("/api/v1/admin/command-center")
@RequiredArgsConstructor
@Tag(
    name = "Admin Command Center",
    description = "Admin endpoints for Command Center configuration")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasRole('ADMIN')")
public class AdminCommandCenterController {

  private final AdminCommandCenterService commandCenterService;

  // =============== LLM Providers ===============

  @GetMapping("/providers")
  @Operation(summary = "Get all LLM providers")
  public ResponseEntity<ApiResponse<List<LlmProviderResponse>>> getAllProviders() {
    return ResponseEntity.ok(ApiResponse.success(commandCenterService.getAllProviders()));
  }

  @GetMapping("/providers/{id}")
  @Operation(summary = "Get LLM provider by ID")
  public ResponseEntity<ApiResponse<LlmProviderResponse>> getProvider(@PathVariable UUID id) {
    return ResponseEntity.ok(ApiResponse.success(commandCenterService.getProvider(id)));
  }

  @PostMapping("/providers")
  @Operation(summary = "Create new LLM provider")
  public ResponseEntity<ApiResponse<LlmProviderResponse>> createProvider(
      @Valid @RequestBody CreateLlmProviderRequest request) {
    return ResponseEntity.status(HttpStatus.CREATED)
        .body(ApiResponse.success(commandCenterService.createProvider(request)));
  }

  @PutMapping("/providers/{id}")
  @Operation(summary = "Update LLM provider")
  public ResponseEntity<ApiResponse<LlmProviderResponse>> updateProvider(
      @PathVariable UUID id, @Valid @RequestBody UpdateLlmProviderRequest request) {
    return ResponseEntity.ok(ApiResponse.success(commandCenterService.updateProvider(id, request)));
  }

  @PostMapping("/providers/{id}/set-default")
  @Operation(summary = "Set LLM provider as default")
  public ResponseEntity<ApiResponse<Void>> setDefaultProvider(@PathVariable UUID id) {
    commandCenterService.setDefaultProvider(id);
    return ResponseEntity.ok(ApiResponse.success(null));
  }

  @DeleteMapping("/providers/{id}")
  @Operation(summary = "Delete LLM provider")
  public ResponseEntity<ApiResponse<Void>> deleteProvider(@PathVariable UUID id) {
    commandCenterService.deleteProvider(id);
    return ResponseEntity.ok(ApiResponse.success(null));
  }

  // =============== System Prompts ===============

  @GetMapping("/prompts")
  @Operation(summary = "Get all system prompts")
  public ResponseEntity<ApiResponse<List<SystemPromptResponse>>> getAllPrompts() {
    return ResponseEntity.ok(ApiResponse.success(commandCenterService.getAllPrompts()));
  }

  @GetMapping("/prompts/category/{category}")
  @Operation(summary = "Get system prompts by category")
  public ResponseEntity<ApiResponse<List<SystemPromptResponse>>> getPromptsByCategory(
      @PathVariable String category) {
    return ResponseEntity.ok(
        ApiResponse.success(commandCenterService.getPromptsByCategory(category)));
  }

  @GetMapping("/prompts/{id}")
  @Operation(summary = "Get system prompt by ID")
  public ResponseEntity<ApiResponse<SystemPromptResponse>> getPrompt(@PathVariable UUID id) {
    return ResponseEntity.ok(ApiResponse.success(commandCenterService.getPrompt(id)));
  }

  @GetMapping("/prompts/key/{key}")
  @Operation(summary = "Get system prompt by key")
  public ResponseEntity<ApiResponse<SystemPromptResponse>> getPromptByKey(
      @PathVariable String key) {
    return ResponseEntity.ok(ApiResponse.success(commandCenterService.getPromptByKey(key)));
  }

  @PostMapping("/prompts")
  @Operation(summary = "Create new system prompt")
  public ResponseEntity<ApiResponse<SystemPromptResponse>> createPrompt(
      @Valid @RequestBody CreateSystemPromptRequest request) {
    return ResponseEntity.status(HttpStatus.CREATED)
        .body(ApiResponse.success(commandCenterService.createPrompt(request)));
  }

  @PutMapping("/prompts/{id}")
  @Operation(summary = "Update system prompt")
  public ResponseEntity<ApiResponse<SystemPromptResponse>> updatePrompt(
      @PathVariable UUID id, @Valid @RequestBody UpdateSystemPromptRequest request) {
    return ResponseEntity.ok(ApiResponse.success(commandCenterService.updatePrompt(id, request)));
  }

  @DeleteMapping("/prompts/{id}")
  @Operation(summary = "Delete system prompt")
  public ResponseEntity<ApiResponse<Void>> deletePrompt(@PathVariable UUID id) {
    commandCenterService.deletePrompt(id);
    return ResponseEntity.ok(ApiResponse.success(null));
  }

  // =============== Test Attachments ===============

  @GetMapping("/test-attachments")
  @Operation(summary = "Get all test attachments")
  public ResponseEntity<ApiResponse<List<TestAttachmentResponse>>> getAllTestAttachments() {
    return ResponseEntity.ok(ApiResponse.success(commandCenterService.getAllTestAttachments()));
  }

  @GetMapping("/test-attachments/type/{type}")
  @Operation(summary = "Get test attachments by type")
  public ResponseEntity<ApiResponse<List<TestAttachmentResponse>>> getTestAttachmentsByType(
      @PathVariable String type) {
    return ResponseEntity.ok(
        ApiResponse.success(commandCenterService.getTestAttachmentsByType(type)));
  }

  @GetMapping("/test-attachments/{id}")
  @Operation(summary = "Get test attachment by ID")
  public ResponseEntity<ApiResponse<TestAttachmentResponse>> getTestAttachment(
      @PathVariable UUID id) {
    return ResponseEntity.ok(ApiResponse.success(commandCenterService.getTestAttachment(id)));
  }

  @GetMapping("/test-attachments/{id}/download")
  @Operation(summary = "Download test attachment file")
  public ResponseEntity<byte[]> downloadTestAttachment(@PathVariable UUID id) {
    TestAttachmentResponse attachment = commandCenterService.getTestAttachment(id);
    byte[] data = commandCenterService.getTestAttachmentData(id);

    return ResponseEntity.ok()
        .contentType(MediaType.parseMediaType(attachment.mimeType()))
        .header(
            "Content-Disposition", "attachment; filename=\"" + attachment.attachmentName() + "\"")
        .body(data);
  }

  @PostMapping(value = "/test-attachments", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  @Operation(summary = "Create new test attachment with file upload")
  public ResponseEntity<ApiResponse<TestAttachmentResponse>> createTestAttachment(
      @RequestPart("metadata") CreateTestAttachmentRequest request,
      @RequestPart(value = "file", required = false) MultipartFile file) {
    return ResponseEntity.status(HttpStatus.CREATED)
        .body(ApiResponse.success(commandCenterService.createTestAttachment(request, file)));
  }

  @PutMapping("/test-attachments/{id}")
  @Operation(summary = "Update test attachment metadata")
  public ResponseEntity<ApiResponse<TestAttachmentResponse>> updateTestAttachment(
      @PathVariable UUID id, @Valid @RequestBody UpdateTestAttachmentRequest request) {
    return ResponseEntity.ok(
        ApiResponse.success(commandCenterService.updateTestAttachment(id, request)));
  }

  @DeleteMapping("/test-attachments/{id}")
  @Operation(summary = "Delete test attachment")
  public ResponseEntity<ApiResponse<Void>> deleteTestAttachment(@PathVariable UUID id) {
    commandCenterService.deleteTestAttachment(id);
    return ResponseEntity.ok(ApiResponse.success(null));
  }

  // =============== Settings ===============

  @GetMapping("/settings")
  @Operation(summary = "Get all Command Center settings")
  public ResponseEntity<ApiResponse<List<SettingResponse>>> getAllSettings() {
    return ResponseEntity.ok(ApiResponse.success(commandCenterService.getAllSettings()));
  }

  @GetMapping("/settings/{key}")
  @Operation(summary = "Get setting by key")
  public ResponseEntity<ApiResponse<SettingResponse>> getSetting(@PathVariable String key) {
    return ResponseEntity.ok(ApiResponse.success(commandCenterService.getSetting(key)));
  }

  @PutMapping("/settings/{key}")
  @Operation(summary = "Update setting")
  public ResponseEntity<ApiResponse<SettingResponse>> updateSetting(
      @PathVariable String key, @Valid @RequestBody UpdateSettingRequest request) {
    return ResponseEntity.ok(ApiResponse.success(commandCenterService.updateSetting(key, request)));
  }

  // =============== Feature Flags ===============

  @GetMapping("/feature-flags")
  @Operation(summary = "Get all feature flags")
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
