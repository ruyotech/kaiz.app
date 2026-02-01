package app.kaiz.family.api;

import app.kaiz.family.application.FamilyService;
import app.kaiz.family.application.dto.FamilyDto.*;
import app.kaiz.shared.security.CurrentUser;
import app.kaiz.shared.util.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/** REST controller for family member management. */
@RestController
@RequestMapping("/api/v1/families/{familyId}/members")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Family Members", description = "Family member management endpoints")
public class FamilyMemberController {

  private final FamilyService familyService;

  @GetMapping
  @Operation(summary = "List members", description = "Get all family members")
  public ResponseEntity<ApiResponse<List<FamilyMemberResponse>>> getMembers(
      @CurrentUser UUID userId, @PathVariable UUID familyId) {
    return ResponseEntity.ok(ApiResponse.success(familyService.getMembers(userId, familyId)));
  }

  @PostMapping("/invite")
  @Operation(summary = "Invite member", description = "Send an invite to a new member")
  public ResponseEntity<ApiResponse<FamilyInviteResponse>> inviteMember(
      @CurrentUser UUID userId,
      @PathVariable UUID familyId,
      @Valid @RequestBody InviteMemberRequest request) {
    return ResponseEntity.ok(
        ApiResponse.success(familyService.inviteMember(userId, familyId, request)));
  }

  @PutMapping("/{memberId}/role")
  @Operation(summary = "Update member role", description = "Change a member's role")
  public ResponseEntity<ApiResponse<FamilyMemberResponse>> updateMemberRole(
      @CurrentUser UUID userId,
      @PathVariable UUID familyId,
      @PathVariable UUID memberId,
      @Valid @RequestBody UpdateMemberRoleRequest request) {
    return ResponseEntity.ok(
        ApiResponse.success(familyService.updateMemberRole(userId, familyId, memberId, request)));
  }

  @DeleteMapping("/{memberId}")
  @Operation(summary = "Remove member", description = "Remove a member from the family")
  public ResponseEntity<ApiResponse<MessageResponse>> removeMember(
      @CurrentUser UUID userId, @PathVariable UUID familyId, @PathVariable UUID memberId) {
    familyService.removeMember(userId, familyId, memberId);
    return ResponseEntity.ok(
        ApiResponse.success(new MessageResponse("Member removed successfully")));
  }

  @GetMapping("/invites")
  @Operation(
      summary = "List pending invites",
      description = "Get all pending invites for the family")
  public ResponseEntity<ApiResponse<List<FamilyInviteResponse>>> getPendingInvites(
      @CurrentUser UUID userId, @PathVariable UUID familyId) {
    return ResponseEntity.ok(
        ApiResponse.success(familyService.getPendingInvites(userId, familyId)));
  }

  @DeleteMapping("/invites/{inviteId}")
  @Operation(summary = "Cancel invite", description = "Cancel a pending invite")
  public ResponseEntity<ApiResponse<MessageResponse>> cancelInvite(
      @CurrentUser UUID userId, @PathVariable UUID familyId, @PathVariable UUID inviteId) {
    familyService.cancelInvite(userId, familyId, inviteId);
    return ResponseEntity.ok(ApiResponse.success(new MessageResponse("Invite cancelled")));
  }
}
