package app.kaiz.family.api;

import app.kaiz.family.application.FamilyService;
import app.kaiz.family.application.dto.FamilyDto.*;
import app.kaiz.shared.security.CurrentUser;
import app.kaiz.shared.util.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/** REST controller for family workspace management. */
@RestController
@RequestMapping("/api/v1/families")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Family", description = "Family workspace management endpoints")
public class FamilyController {

  private final FamilyService familyService;

  @PostMapping
  @Operation(summary = "Create family", description = "Create a new family workspace")
  public ResponseEntity<ApiResponse<FamilyResponse>> createFamily(
      @CurrentUser UUID userId, @Valid @RequestBody CreateFamilyRequest request) {
    FamilyResponse family = familyService.createFamily(userId, request);
    return ResponseEntity.created(URI.create("/api/v1/families/" + family.id()))
        .body(ApiResponse.success(family));
  }

  @GetMapping("/me")
  @Operation(summary = "Get my family", description = "Get the current user's family")
  public ResponseEntity<ApiResponse<FamilyResponse>> getMyFamily(@CurrentUser UUID userId) {
    return ResponseEntity.ok(ApiResponse.success(familyService.getMyFamily(userId)));
  }

  @GetMapping("/me/membership")
  @Operation(
      summary = "Get my membership",
      description = "Get current user's family membership info")
  public ResponseEntity<ApiResponse<MembershipResponse>> getMyMembership(@CurrentUser UUID userId) {
    return ResponseEntity.ok(ApiResponse.success(familyService.getMyMembership(userId)));
  }

  @GetMapping("/{familyId}")
  @Operation(summary = "Get family", description = "Get family details by ID")
  public ResponseEntity<ApiResponse<FamilyResponse>> getFamily(
      @CurrentUser UUID userId, @PathVariable UUID familyId) {
    return ResponseEntity.ok(ApiResponse.success(familyService.getFamily(userId, familyId)));
  }

  @PutMapping("/{familyId}")
  @Operation(summary = "Update family", description = "Update family settings")
  public ResponseEntity<ApiResponse<FamilyResponse>> updateFamily(
      @CurrentUser UUID userId,
      @PathVariable UUID familyId,
      @Valid @RequestBody UpdateFamilyRequest request) {
    return ResponseEntity.ok(
        ApiResponse.success(familyService.updateFamily(userId, familyId, request)));
  }

  @DeleteMapping("/{familyId}")
  @Operation(summary = "Delete family", description = "Delete family workspace (owner only)")
  public ResponseEntity<ApiResponse<MessageResponse>> deleteFamily(
      @CurrentUser UUID userId, @PathVariable UUID familyId) {
    familyService.deleteFamily(userId, familyId);
    return ResponseEntity.ok(
        ApiResponse.success(new MessageResponse("Family deleted successfully")));
  }

  @PostMapping("/{familyId}/invite-code/regenerate")
  @Operation(
      summary = "Regenerate invite code",
      description = "Generate a new invite code for the family")
  public ResponseEntity<ApiResponse<String>> regenerateInviteCode(
      @CurrentUser UUID userId, @PathVariable UUID familyId) {
    String newCode = familyService.regenerateInviteCode(userId, familyId);
    return ResponseEntity.ok(ApiResponse.success(newCode));
  }

  @PostMapping("/join")
  @Operation(summary = "Join family", description = "Join a family using invite code")
  public ResponseEntity<ApiResponse<MembershipResponse>> joinFamily(
      @CurrentUser UUID userId, @Valid @RequestBody JoinFamilyRequest request) {
    return ResponseEntity.ok(ApiResponse.success(familyService.joinFamily(userId, request)));
  }

  @PostMapping("/leave")
  @Operation(summary = "Leave family", description = "Leave current family")
  public ResponseEntity<ApiResponse<MessageResponse>> leaveFamily(@CurrentUser UUID userId) {
    familyService.leaveFamily(userId);
    return ResponseEntity.ok(
        ApiResponse.success(new MessageResponse("Successfully left the family")));
  }
}
