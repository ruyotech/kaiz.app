package app.kaiz.community.domain;

import app.kaiz.shared.persistence.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

/** Kudos sent from one member to another. */
@Entity
@Table(name = "community_kudos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Kudos extends BaseEntity {

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "from_member_id", nullable = false)
  private CommunityMember fromMember;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "to_member_id", nullable = false)
  private CommunityMember toMember;

  @Column(name = "message", nullable = false, length = 300)
  private String message;

  @Column(name = "reason", length = 100)
  private String reason;

  @Column(name = "is_public")
  @Builder.Default
  private Boolean isPublic = true;
}
