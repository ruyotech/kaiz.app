package app.kaiz.community.domain;

import app.kaiz.shared.persistence.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

/** Badge definition entity containing metadata about each badge type. */
@Entity
@Table(name = "community_badges")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class CommunityBadge extends BaseEntity {

  @Enumerated(EnumType.STRING)
  @Column(name = "badge_type", nullable = false, unique = true)
  private BadgeType badgeType;

  @Column(name = "name", nullable = false, length = 100)
  private String name;

  @Column(name = "description", nullable = false, length = 500)
  private String description;

  @Column(name = "icon", length = 100)
  private String icon;

  @Enumerated(EnumType.STRING)
  @Column(name = "rarity", nullable = false)
  @Builder.Default
  private BadgeRarity rarity = BadgeRarity.COMMON;

  @Column(name = "xp_reward")
  @Builder.Default
  private Integer xpReward = 50;
}
