package app.kaiz.community.domain;

import app.kaiz.shared.persistence.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

/** Secret (anonymous) compliment sent to another member. */
@Entity
@Table(name = "community_compliments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class SecretCompliment extends BaseEntity {

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "to_member_id", nullable = false)
  private CommunityMember toMember;

  @Column(name = "message", nullable = false, length = 500)
  private String message;

  @Enumerated(EnumType.STRING)
  @Column(name = "category", nullable = false)
  private ComplimentCategory category;

  @Column(name = "is_read")
  @Builder.Default
  private Boolean isRead = false;

  public void markAsRead() {
    this.isRead = true;
  }
}
