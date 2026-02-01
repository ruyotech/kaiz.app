package app.kaiz.family.domain;

import app.kaiz.identity.domain.User;
import app.kaiz.shared.persistence.BaseEntity;
import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;
import lombok.*;
import lombok.experimental.SuperBuilder;

/**
 * Family workspace entity for family plan subscription users. Allows members to share tasks, epics,
 * and collaborate on life goals.
 */
@Entity
@Table(name = "families")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Family extends BaseEntity {

  @Column(name = "name", nullable = false, length = 100)
  private String name;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "owner_id", nullable = false)
  private User owner;

  @Column(name = "invite_code", unique = true, length = 20)
  private String inviteCode;

  @Column(name = "invite_code_expires_at")
  private java.time.Instant inviteCodeExpiresAt;

  @Column(name = "settings", columnDefinition = "jsonb")
  @Builder.Default
  private String settings = "{}";

  @OneToMany(mappedBy = "family", cascade = CascadeType.ALL, orphanRemoval = true)
  @Builder.Default
  private List<FamilyMember> members = new ArrayList<>();

  @OneToMany(mappedBy = "family", cascade = CascadeType.ALL, orphanRemoval = true)
  @Builder.Default
  private List<FamilyInvite> invites = new ArrayList<>();

  /** Add a member to the family. */
  public void addMember(FamilyMember member) {
    members.add(member);
    member.setFamily(this);
  }

  /** Remove a member from the family. */
  public void removeMember(FamilyMember member) {
    members.remove(member);
    member.setFamily(null);
  }

  /** Check if the user is the owner of this family. */
  public boolean isOwner(User user) {
    return owner != null && owner.getId().equals(user.getId());
  }
}
