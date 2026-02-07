package app.kaiz.community.domain;

import app.kaiz.identity.domain.User;
import app.kaiz.shared.persistence.BaseEntity;
import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;
import lombok.*;
import lombok.experimental.SuperBuilder;

/**
 * Community member profile extending user identity. Contains community-specific data like
 * reputation, badges, and activity settings.
 */
@Entity
@Table(name = "community_members")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class CommunityMember extends BaseEntity {

  @OneToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", nullable = false, unique = true)
  private User user;

  @Column(name = "display_name", nullable = false, length = 100)
  private String displayName;

  @Column(name = "avatar", length = 50)
  @Builder.Default
  private String avatar = "👤";

  @Column(name = "bio", length = 500)
  private String bio;

  @Column(name = "level")
  @Builder.Default
  private Integer level = 1;

  @Column(name = "level_title", length = 50)
  @Builder.Default
  private String levelTitle = "Novice";

  @Column(name = "reputation_points")
  @Builder.Default
  private Integer reputationPoints = 0;

  @ElementCollection(fetch = FetchType.LAZY)
  @CollectionTable(name = "community_member_badges", joinColumns = @JoinColumn(name = "member_id"))
  @Enumerated(EnumType.STRING)
  @Column(name = "badge_type")
  @Builder.Default
  private List<BadgeType> badges = new ArrayList<>();

  @Enumerated(EnumType.STRING)
  @Column(name = "role", nullable = false)
  @Builder.Default
  private CommunityRole role = CommunityRole.MEMBER;

  @Column(name = "is_online")
  @Builder.Default
  private Boolean isOnline = false;

  @Column(name = "sprints_completed")
  @Builder.Default
  private Integer sprintsCompleted = 0;

  @Column(name = "helpful_answers")
  @Builder.Default
  private Integer helpfulAnswers = 0;

  @Column(name = "templates_shared")
  @Builder.Default
  private Integer templatesShared = 0;

  @Column(name = "current_streak")
  @Builder.Default
  private Integer currentStreak = 0;

  // Privacy settings
  @Column(name = "show_activity")
  @Builder.Default
  private Boolean showActivity = true;

  @Column(name = "accept_partner_requests")
  @Builder.Default
  private Boolean acceptPartnerRequests = true;

  /** Update level based on reputation points. */
  public void updateLevel() {
    if (reputationPoints >= 10000) {
      this.level = 50;
      this.levelTitle = "Legend";
    } else if (reputationPoints >= 5000) {
      this.level = 30;
      this.levelTitle = "Master";
    } else if (reputationPoints >= 2000) {
      this.level = 20;
      this.levelTitle = "Expert";
    } else if (reputationPoints >= 500) {
      this.level = 10;
      this.levelTitle = "Achiever";
    } else {
      this.level = Math.max(1, reputationPoints / 100);
      this.levelTitle = "Novice";
    }
  }

  /** Add reputation points and update level. */
  public void addReputationPoints(int points) {
    this.reputationPoints += points;
    updateLevel();
  }

  /** Award a badge to this member. */
  public boolean awardBadge(BadgeType badge) {
    if (!badges.contains(badge)) {
      badges.add(badge);
      return true;
    }
    return false;
  }
}
