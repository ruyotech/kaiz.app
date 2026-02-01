package app.kaiz.family.application.dto;

import app.kaiz.family.domain.FamilyInvite.InviteStatus;
import app.kaiz.family.domain.FamilyRole;
import jakarta.validation.constraints.*;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

/** Data Transfer Objects for Family operations. */
public class FamilyDto {

  /** Family response DTO. */
  public record FamilyResponse(
      UUID id,
      String name,
      UUID ownerId,
      String ownerName,
      String inviteCode,
      Instant inviteCodeExpiresAt,
      FamilySettingsDto settings,
      List<FamilyMemberResponse> members,
      int memberCount,
      Instant createdAt,
      Instant updatedAt) {}

  /** Family member response DTO. */
  public record FamilyMemberResponse(
      UUID id,
      UUID userId,
      String displayName,
      String email,
      String avatarUrl,
      FamilyRole role,
      Instant joinedAt,
      boolean isActive,
      Instant lastActiveAt,
      // Stats
      int tasksCompleted,
      int currentStreak) {}

  /** Family settings DTO. */
  public record FamilySettingsDto(
      boolean allowChildTaskCreation,
      boolean requireApprovalForKidsTasks,
      boolean sharedCalendarEnabled,
      String sprintStartDay,
      String standupTime,
      List<Integer> standupDays,
      boolean enableVelocitySharing,
      boolean enableKudos,
      boolean enableCeremonies,
      boolean notifyOnMemberActivity,
      String defaultTaskVisibility) {
    /** Default settings for a new family. */
    public static FamilySettingsDto defaults() {
      return new FamilySettingsDto(
          true, // allowChildTaskCreation
          true, // requireApprovalForKidsTasks
          true, // sharedCalendarEnabled
          "sunday",
          "18:00",
          List.of(0), // Sunday
          true, // enableVelocitySharing
          true, // enableKudos
          true, // enableCeremonies
          true, // notifyOnMemberActivity
          "shared");
    }
  }

  /** Family invite response DTO. */
  public record FamilyInviteResponse(
      UUID id,
      String email,
      FamilyRole suggestedRole,
      String invitedByName,
      InviteStatus status,
      Instant expiresAt,
      Instant createdAt) {}

  /** Request to create a new family. */
  public record CreateFamilyRequest(
      @NotBlank @Size(min = 2, max = 100) String name, FamilySettingsDto settings) {}

  /** Request to update family details. */
  public record UpdateFamilyRequest(
      @Size(min = 2, max = 100) String name, FamilySettingsDto settings) {}

  /** Request to invite a member to the family. */
  public record InviteMemberRequest(@NotBlank @Email String email, @NotNull FamilyRole role) {}

  /** Request to update a member's role. */
  public record UpdateMemberRoleRequest(@NotNull FamilyRole role) {}

  /** Request to join a family using invite code. */
  public record JoinFamilyRequest(@NotBlank String inviteCode) {}

  /** Request to accept a specific invite by token. */
  public record AcceptInviteRequest(@NotBlank String inviteToken) {}

  /** User's membership info. */
  public record MembershipResponse(
      UUID familyId,
      String familyName,
      UUID memberId,
      FamilyRole role,
      boolean isOwner,
      Instant joinedAt,
      List<String> permissions) {}

  /** Simple message response. */
  public record MessageResponse(String message) {}
}
