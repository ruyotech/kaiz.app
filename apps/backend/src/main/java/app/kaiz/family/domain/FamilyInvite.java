package app.kaiz.family.domain;

import app.kaiz.identity.domain.User;
import app.kaiz.shared.persistence.BaseEntity;
import jakarta.persistence.*;
import java.time.Instant;
import lombok.*;
import lombok.experimental.SuperBuilder;

/** Family invitation entity for inviting new members. Tracks invitation status and expiration. */
@Entity
@Table(name = "family_invites")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class FamilyInvite extends BaseEntity {

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "family_id", nullable = false)
  private Family family;

  @Column(name = "email", nullable = false, length = 255)
  private String email;

  @Enumerated(EnumType.STRING)
  @Column(name = "suggested_role", nullable = false, length = 20)
  private FamilyRole suggestedRole;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "invited_by_id", nullable = false)
  private User invitedBy;

  @Enumerated(EnumType.STRING)
  @Column(name = "status", nullable = false, length = 20)
  @Builder.Default
  private InviteStatus status = InviteStatus.PENDING;

  @Column(name = "expires_at", nullable = false)
  private Instant expiresAt;

  @Column(name = "accepted_at")
  private Instant acceptedAt;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "accepted_by_id")
  private User acceptedBy;

  @Column(name = "invite_token", unique = true, length = 64)
  private String inviteToken;

  /** Check if the invitation has expired. */
  public boolean isExpired() {
    return expiresAt != null && Instant.now().isAfter(expiresAt);
  }

  /** Check if the invitation is still valid. */
  public boolean isValid() {
    return status == InviteStatus.PENDING && !isExpired();
  }

  /** Mark the invitation as accepted. */
  public void accept(User user) {
    this.status = InviteStatus.ACCEPTED;
    this.acceptedAt = Instant.now();
    this.acceptedBy = user;
  }

  /** Mark the invitation as declined. */
  public void decline() {
    this.status = InviteStatus.DECLINED;
  }

  /** Invitation status enumeration. */
  public enum InviteStatus {
    PENDING,
    ACCEPTED,
    DECLINED,
    EXPIRED
  }
}
