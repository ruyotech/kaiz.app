package app.kaiz.family.application;

import app.kaiz.family.application.dto.FamilyDto.*;
import app.kaiz.family.domain.*;
import app.kaiz.family.infrastructure.*;
import app.kaiz.identity.domain.User;
import app.kaiz.identity.infrastructure.UserRepository;
import app.kaiz.shared.exception.BadRequestException;
import app.kaiz.shared.exception.ForbiddenException;
import app.kaiz.shared.exception.ResourceNotFoundException;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Service for managing family workspaces and members. */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class FamilyService {

  private final FamilyRepository familyRepository;
  private final FamilyMemberRepository memberRepository;
  private final FamilyInviteRepository inviteRepository;
  private final UserRepository userRepository;
  private final ObjectMapper objectMapper;
  private final SecureRandom secureRandom = new SecureRandom();

  private static final String INVITE_CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  private static final int INVITE_CODE_LENGTH = 8;
  private static final int INVITE_EXPIRY_DAYS = 7;

  // ==========================================
  // Family CRUD Operations
  // ==========================================

  /** Create a new family workspace. */
  public FamilyResponse createFamily(UUID userId, CreateFamilyRequest request) {
    User user = getUserOrThrow(userId);

    // Check if user already belongs to a family
    if (familyRepository.existsByUserMembership(userId)) {
      throw new BadRequestException(
          "You already belong to a family. Leave your current family first.");
    }

    // Create family
    Family family =
        Family.builder()
            .name(request.name())
            .owner(user)
            .inviteCode(generateInviteCode())
            .inviteCodeExpiresAt(Instant.now().plus(INVITE_EXPIRY_DAYS, ChronoUnit.DAYS))
            .settings(
                serializeSettings(
                    request.settings() != null ? request.settings() : FamilySettingsDto.defaults()))
            .build();

    family = familyRepository.save(family);

    // Add owner as a member
    FamilyMember ownerMember =
        FamilyMember.builder()
            .family(family)
            .user(user)
            .role(FamilyRole.OWNER)
            .joinedAt(Instant.now())
            .isActive(true)
            .lastActiveAt(Instant.now())
            .permissions(serializePermissions(FamilyRole.OWNER))
            .build();

    memberRepository.save(ownerMember);

    log.info("Created new family '{}' for user {}", family.getName(), userId);
    return mapToFamilyResponse(family);
  }

  /** Get family by ID. */
  @Transactional(readOnly = true)
  public FamilyResponse getFamily(UUID userId, UUID familyId) {
    Family family = getFamilyOrThrow(familyId);
    validateFamilyAccess(userId, family);
    return mapToFamilyResponse(family);
  }

  /** Get the current user's family. */
  @Transactional(readOnly = true)
  public FamilyResponse getMyFamily(UUID userId) {
    Family family =
        familyRepository
            .findByUserMembership(userId)
            .orElseThrow(() -> new ResourceNotFoundException("You are not a member of any family"));
    return mapToFamilyResponse(family);
  }

  /** Get current user's membership info. */
  @Transactional(readOnly = true)
  public MembershipResponse getMyMembership(UUID userId) {
    FamilyMember member =
        memberRepository
            .findByUserId(userId)
            .orElseThrow(() -> new ResourceNotFoundException("You are not a member of any family"));

    Family family = member.getFamily();
    return new MembershipResponse(
        family.getId(),
        family.getName(),
        member.getId(),
        member.getRole(),
        family.isOwner(member.getUser()),
        member.getJoinedAt(),
        getPermissionsForRole(member.getRole()));
  }

  /** Update family settings. */
  public FamilyResponse updateFamily(UUID userId, UUID familyId, UpdateFamilyRequest request) {
    Family family = getFamilyOrThrow(familyId);
    validateAdminAccess(userId, family);

    if (request.name() != null && !request.name().isBlank()) {
      family.setName(request.name());
    }

    if (request.settings() != null) {
      family.setSettings(serializeSettings(request.settings()));
    }

    family = familyRepository.save(family);
    log.info("Updated family '{}' by user {}", family.getName(), userId);
    return mapToFamilyResponse(family);
  }

  /** Delete a family (owner only). */
  public void deleteFamily(UUID userId, UUID familyId) {
    Family family = getFamilyOrThrow(familyId);

    if (!family.isOwner(getUserOrThrow(userId))) {
      throw new ForbiddenException("Only the family owner can delete the family");
    }

    log.info("Deleting family '{}' by owner {}", family.getName(), userId);
    familyRepository.delete(family);
  }

  /** Generate a new invite code for the family. */
  public String regenerateInviteCode(UUID userId, UUID familyId) {
    Family family = getFamilyOrThrow(familyId);
    validateAdminAccess(userId, family);

    family.setInviteCode(generateInviteCode());
    family.setInviteCodeExpiresAt(Instant.now().plus(INVITE_EXPIRY_DAYS, ChronoUnit.DAYS));
    familyRepository.save(family);

    return family.getInviteCode();
  }

  // ==========================================
  // Member Management
  // ==========================================

  /** Get all members of a family. */
  @Transactional(readOnly = true)
  public List<FamilyMemberResponse> getMembers(UUID userId, UUID familyId) {
    Family family = getFamilyOrThrow(familyId);
    validateFamilyAccess(userId, family);

    return memberRepository.findByFamilyIdAndIsActiveTrue(familyId).stream()
        .map(this::mapToMemberResponse)
        .collect(Collectors.toList());
  }

  /** Send an invite to a new member. */
  public FamilyInviteResponse inviteMember(
      UUID userId, UUID familyId, InviteMemberRequest request) {
    Family family = getFamilyOrThrow(familyId);
    validateAdminAccess(userId, family);
    User inviter = getUserOrThrow(userId);

    // Check if already a member
    if (userRepository.findByEmail(request.email()).isPresent()) {
      UUID targetUserId = userRepository.findByEmail(request.email()).get().getId();
      if (memberRepository.existsByFamilyIdAndUserId(familyId, targetUserId)) {
        throw new BadRequestException("This user is already a member of the family");
      }
    }

    // Check for existing pending invite
    if (inviteRepository.existsByEmailAndFamilyIdAndStatus(
        request.email(), familyId, FamilyInvite.InviteStatus.PENDING)) {
      throw new BadRequestException("An invite has already been sent to this email");
    }

    // Create invite
    FamilyInvite invite =
        FamilyInvite.builder()
            .family(family)
            .email(request.email())
            .suggestedRole(request.role())
            .invitedBy(inviter)
            .status(FamilyInvite.InviteStatus.PENDING)
            .expiresAt(Instant.now().plus(INVITE_EXPIRY_DAYS, ChronoUnit.DAYS))
            .inviteToken(generateInviteToken())
            .build();

    invite = inviteRepository.save(invite);
    log.info("Sent family invite to {} for family '{}'", request.email(), family.getName());

    return mapToInviteResponse(invite);
  }

  /** Join a family using invite code. */
  public MembershipResponse joinFamily(UUID userId, JoinFamilyRequest request) {
    User user = getUserOrThrow(userId);

    // Check if user already in a family
    if (familyRepository.existsByUserMembership(userId)) {
      throw new BadRequestException(
          "You already belong to a family. Leave your current family first.");
    }

    // Find family by invite code
    Family family =
        familyRepository
            .findByInviteCode(request.inviteCode())
            .orElseThrow(() -> new ResourceNotFoundException("Invalid invite code"));

    // Check if invite code is expired
    if (family.getInviteCodeExpiresAt() != null
        && Instant.now().isAfter(family.getInviteCodeExpiresAt())) {
      throw new BadRequestException("This invite code has expired");
    }

    // Determine role (default to ADULT, can be changed by admin later)
    FamilyRole role = FamilyRole.ADULT;

    // Check if there's a pending invite for this email with a suggested role
    inviteRepository
        .findByEmailAndFamilyIdAndStatus(
            user.getEmail(), family.getId(), FamilyInvite.InviteStatus.PENDING)
        .ifPresent(
            invite -> {
              invite.accept(user);
              inviteRepository.save(invite);
            });

    // Create membership
    FamilyMember member =
        FamilyMember.builder()
            .family(family)
            .user(user)
            .role(role)
            .joinedAt(Instant.now())
            .isActive(true)
            .lastActiveAt(Instant.now())
            .permissions(serializePermissions(role))
            .build();

    member = memberRepository.save(member);
    log.info("User {} joined family '{}' as {}", userId, family.getName(), role);

    return new MembershipResponse(
        family.getId(),
        family.getName(),
        member.getId(),
        member.getRole(),
        false,
        member.getJoinedAt(),
        getPermissionsForRole(member.getRole()));
  }

  /** Update a member's role. */
  public FamilyMemberResponse updateMemberRole(
      UUID userId, UUID familyId, UUID memberId, UpdateMemberRoleRequest request) {
    Family family = getFamilyOrThrow(familyId);
    validateAdminAccess(userId, family);

    FamilyMember member =
        memberRepository
            .findById(memberId)
            .orElseThrow(() -> new ResourceNotFoundException("Member not found"));

    // Cannot change owner's role
    if (member.getRole() == FamilyRole.OWNER) {
      throw new ForbiddenException("Cannot change the owner's role");
    }

    // Cannot make someone else owner (must transfer ownership separately)
    if (request.role() == FamilyRole.OWNER) {
      throw new BadRequestException("Use the transfer ownership function to change owners");
    }

    member.setRole(request.role());
    member.setPermissions(serializePermissions(request.role()));
    member = memberRepository.save(member);

    log.info(
        "Updated member {} role to {} in family '{}'", memberId, request.role(), family.getName());
    return mapToMemberResponse(member);
  }

  /** Remove a member from the family. */
  public void removeMember(UUID userId, UUID familyId, UUID memberId) {
    Family family = getFamilyOrThrow(familyId);
    User currentUser = getUserOrThrow(userId);
    validateAdminAccess(userId, family);

    FamilyMember member =
        memberRepository
            .findById(memberId)
            .orElseThrow(() -> new ResourceNotFoundException("Member not found"));

    // Cannot remove owner
    if (member.getRole() == FamilyRole.OWNER) {
      throw new ForbiddenException("Cannot remove the family owner");
    }

    // Cannot remove self via this method (use leaveFamily instead)
    if (member.getUser().getId().equals(userId)) {
      throw new BadRequestException("Use 'leave family' to remove yourself");
    }

    member.setActive(false);
    memberRepository.save(member);

    log.info("Removed member {} from family '{}' by {}", memberId, family.getName(), userId);
  }

  /** Leave a family. */
  public void leaveFamily(UUID userId) {
    FamilyMember member =
        memberRepository
            .findByUserId(userId)
            .orElseThrow(() -> new ResourceNotFoundException("You are not a member of any family"));

    Family family = member.getFamily();

    // Owner cannot leave - must transfer ownership or delete family
    if (family.isOwner(member.getUser())) {
      throw new BadRequestException(
          "Owner cannot leave the family. Transfer ownership or delete the family.");
    }

    member.setActive(false);
    memberRepository.save(member);

    log.info("User {} left family '{}'", userId, family.getName());
  }

  // ==========================================
  // Invite Management
  // ==========================================

  /** Get pending invites for a family. */
  @Transactional(readOnly = true)
  public List<FamilyInviteResponse> getPendingInvites(UUID userId, UUID familyId) {
    Family family = getFamilyOrThrow(familyId);
    validateAdminAccess(userId, family);

    return inviteRepository
        .findByFamilyIdAndStatus(familyId, FamilyInvite.InviteStatus.PENDING)
        .stream()
        .filter(FamilyInvite::isValid)
        .map(this::mapToInviteResponse)
        .collect(Collectors.toList());
  }

  /** Cancel a pending invite. */
  public void cancelInvite(UUID userId, UUID familyId, UUID inviteId) {
    Family family = getFamilyOrThrow(familyId);
    validateAdminAccess(userId, family);

    FamilyInvite invite =
        inviteRepository
            .findById(inviteId)
            .orElseThrow(() -> new ResourceNotFoundException("Invite not found"));

    if (!invite.getFamily().getId().equals(familyId)) {
      throw new ForbiddenException("Invite does not belong to this family");
    }

    inviteRepository.delete(invite);
    log.info("Cancelled invite {} for family '{}'", inviteId, family.getName());
  }

  // ==========================================
  // Permission Helpers
  // ==========================================

  /** Check if a user can view a task based on family visibility rules. */
  @Transactional(readOnly = true)
  public boolean canViewFamilyTask(
      UUID userId,
      UUID familyId,
      UUID taskOwnerId,
      TaskVisibility visibility,
      UUID assignedToUserId) {
    // Task owner can always see their own task
    if (userId.equals(taskOwnerId)) {
      return true;
    }

    // Not in a family
    if (familyId == null) {
      return false;
    }

    FamilyMember viewer = memberRepository.findByFamilyIdAndUserId(familyId, userId).orElse(null);

    if (viewer == null || !viewer.isActive()) {
      return false;
    }

    // Adults can see all tasks
    if (viewer.isAdult()) {
      return true;
    }

    // For minors, check visibility
    return switch (visibility) {
      case SHARED -> true;
      case ASSIGNED -> userId.equals(assignedToUserId);
      case PRIVATE -> false;
    };
  }

  // ==========================================
  // Helper Methods
  // ==========================================

  private User getUserOrThrow(UUID userId) {
    return userRepository
        .findById(userId)
        .orElseThrow(() -> new ResourceNotFoundException("User not found"));
  }

  private Family getFamilyOrThrow(UUID familyId) {
    return familyRepository
        .findById(familyId)
        .orElseThrow(() -> new ResourceNotFoundException("Family not found"));
  }

  private void validateFamilyAccess(UUID userId, Family family) {
    if (!family.isOwner(getUserOrThrow(userId))
        && !memberRepository.existsByFamilyIdAndUserId(family.getId(), userId)) {
      throw new ForbiddenException("You do not have access to this family");
    }
  }

  private void validateAdminAccess(UUID userId, Family family) {
    if (family.isOwner(getUserOrThrow(userId))) {
      return;
    }

    FamilyMember member =
        memberRepository
            .findByFamilyIdAndUserId(family.getId(), userId)
            .orElseThrow(() -> new ForbiddenException("You do not have access to this family"));

    if (!member.canManageMembers()) {
      throw new ForbiddenException("You do not have admin access to this family");
    }
  }

  private String generateInviteCode() {
    StringBuilder code = new StringBuilder();
    for (int i = 0; i < INVITE_CODE_LENGTH; i++) {
      code.append(INVITE_CODE_CHARS.charAt(secureRandom.nextInt(INVITE_CODE_CHARS.length())));
    }
    return code.toString();
  }

  private String generateInviteToken() {
    byte[] bytes = new byte[32];
    secureRandom.nextBytes(bytes);
    return java.util.Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
  }

  private String serializeSettings(FamilySettingsDto settings) {
    try {
      return objectMapper.writeValueAsString(settings);
    } catch (JsonProcessingException e) {
      return "{}";
    }
  }

  private FamilySettingsDto deserializeSettings(String json) {
    try {
      return objectMapper.readValue(json, FamilySettingsDto.class);
    } catch (JsonProcessingException e) {
      return FamilySettingsDto.defaults();
    }
  }

  private String serializePermissions(FamilyRole role) {
    try {
      return objectMapper.writeValueAsString(getPermissionsForRole(role));
    } catch (JsonProcessingException e) {
      return "[]";
    }
  }

  private List<String> getPermissionsForRole(FamilyRole role) {
    return switch (role) {
      case OWNER ->
          List.of(
              "view_shared_tasks",
              "create_shared_tasks",
              "edit_shared_tasks",
              "delete_shared_tasks",
              "assign_tasks",
              "view_shared_epics",
              "create_shared_epics",
              "edit_shared_epics",
              "view_family_calendar",
              "add_calendar_events",
              "view_family_velocity",
              "manage_members",
              "invite_members",
              "remove_members",
              "manage_settings",
              "send_kudos",
              "view_all_tasks",
              "approve_independence");
      case ADULT ->
          List.of(
              "view_shared_tasks",
              "create_shared_tasks",
              "edit_shared_tasks",
              "delete_shared_tasks",
              "assign_tasks",
              "view_shared_epics",
              "create_shared_epics",
              "edit_shared_epics",
              "view_family_calendar",
              "add_calendar_events",
              "view_family_velocity",
              "invite_members",
              "manage_settings",
              "send_kudos",
              "view_all_tasks",
              "approve_independence");
      case TEEN ->
          List.of(
              "view_shared_tasks",
              "create_shared_tasks",
              "edit_shared_tasks",
              "view_shared_epics",
              "view_family_calendar",
              "add_calendar_events",
              "send_kudos");
      case CHILD ->
          List.of("view_shared_tasks", "view_shared_epics", "view_family_calendar", "send_kudos");
    };
  }

  private FamilyResponse mapToFamilyResponse(Family family) {
    List<FamilyMemberResponse> members =
        memberRepository.findByFamilyIdAndIsActiveTrue(family.getId()).stream()
            .map(this::mapToMemberResponse)
            .collect(Collectors.toList());

    return new FamilyResponse(
        family.getId(),
        family.getName(),
        family.getOwner().getId(),
        family.getOwner().getFullName(),
        family.getInviteCode(),
        family.getInviteCodeExpiresAt(),
        deserializeSettings(family.getSettings()),
        members,
        members.size(),
        family.getCreatedAt(),
        family.getUpdatedAt());
  }

  private FamilyMemberResponse mapToMemberResponse(FamilyMember member) {
    User user = member.getUser();
    return new FamilyMemberResponse(
        member.getId(),
        user.getId(),
        user.getFullName(),
        user.getEmail(),
        user.getAvatarUrl(),
        member.getRole(),
        member.getJoinedAt(),
        member.isActive(),
        member.getLastActiveAt(),
        0, // TODO: Calculate from tasks
        0 // TODO: Calculate streak
        );
  }

  private FamilyInviteResponse mapToInviteResponse(FamilyInvite invite) {
    return new FamilyInviteResponse(
        invite.getId(),
        invite.getEmail(),
        invite.getSuggestedRole(),
        invite.getInvitedBy().getFullName(),
        invite.getStatus(),
        invite.getExpiresAt(),
        invite.getCreatedAt());
  }
}
