package app.kaiz.family.domain;

import app.kaiz.identity.domain.User;
import app.kaiz.shared.persistence.BaseEntity;
import jakarta.persistence.*;
import java.time.Instant;
import lombok.*;
import lombok.experimental.SuperBuilder;

/**
 * Family membership entity linking users to family workspaces. Contains role and permission
 * information for each member.
 */
@Entity
@Table(
    name = "family_members",
    uniqueConstraints = {@UniqueConstraint(columnNames = {"family_id", "user_id"})})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class FamilyMember extends BaseEntity {

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "family_id", nullable = false)
  private Family family;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", nullable = false)
  private User user;

  @Enumerated(EnumType.STRING)
  @Column(name = "role", nullable = false, length = 20)
  private FamilyRole role;

  @Column(name = "joined_at", nullable = false)
  @Builder.Default
  private Instant joinedAt = Instant.now();

  @Column(name = "permissions", columnDefinition = "jsonb")
  @Builder.Default
  private String permissions = "[]";

  @Column(name = "is_active", nullable = false)
  @Builder.Default
  private boolean isActive = true;

  @Column(name = "last_active_at")
  private Instant lastActiveAt;

  /** Check if this member is an adult (owner or adult role). */
  public boolean isAdult() {
    return role == FamilyRole.OWNER || role == FamilyRole.ADULT;
  }

  /** Check if this member is a minor (teen or child role). */
  public boolean isMinor() {
    return role == FamilyRole.TEEN || role == FamilyRole.CHILD;
  }

  /** Check if this member can manage other members. */
  public boolean canManageMembers() {
    return role == FamilyRole.OWNER || role == FamilyRole.ADULT;
  }

  /** Check if this member can view all tasks in the family. */
  public boolean canViewAllTasks() {
    return role == FamilyRole.OWNER || role == FamilyRole.ADULT;
  }

  /** Check if this member can assign tasks to others. */
  public boolean canAssignTasks() {
    return role == FamilyRole.OWNER || role == FamilyRole.ADULT;
  }

  /** Check if this member can approve task completions. */
  public boolean canApproveTaskCompletions() {
    return role == FamilyRole.OWNER || role == FamilyRole.ADULT;
  }
}
