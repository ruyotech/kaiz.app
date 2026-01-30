package app.kaiz.community.domain;

import app.kaiz.shared.persistence.BaseEntity;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;
import lombok.*;
import lombok.experimental.SuperBuilder;

/** Weekly community challenge. */
@Entity
@Table(name = "community_weekly_challenges")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class WeeklyChallenge extends BaseEntity {

  @Column(name = "title", nullable = false, length = 200)
  private String title;

  @Column(name = "description", nullable = false, length = 1000)
  private String description;

  @Column(name = "life_wheel_area_id", length = 50)
  private String lifeWheelAreaId;

  @Column(name = "start_date", nullable = false)
  private Instant startDate;

  @Column(name = "end_date", nullable = false)
  private Instant endDate;

  @Column(name = "participant_count")
  @Builder.Default
  private Integer participantCount = 0;

  @Column(name = "completion_count")
  @Builder.Default
  private Integer completionCount = 0;

  @Column(name = "reward_xp")
  @Builder.Default
  private Integer rewardXp = 100;

  @Enumerated(EnumType.STRING)
  @Column(name = "reward_badge")
  private BadgeType rewardBadge;

  @ElementCollection
  @CollectionTable(
      name = "weekly_challenge_participants",
      joinColumns = @JoinColumn(name = "challenge_id"))
  @Column(name = "member_id")
  @Builder.Default
  private Set<UUID> participantIds = new HashSet<>();

  @ElementCollection
  @CollectionTable(
      name = "weekly_challenge_completions",
      joinColumns = @JoinColumn(name = "challenge_id"))
  @Column(name = "member_id")
  @Builder.Default
  private Set<UUID> completedByMemberIds = new HashSet<>();

  public boolean join(UUID memberId) {
    if (participantIds.add(memberId)) {
      participantCount++;
      return true;
    }
    return false;
  }

  public boolean complete(UUID memberId) {
    if (participantIds.contains(memberId) && completedByMemberIds.add(memberId)) {
      completionCount++;
      return true;
    }
    return false;
  }

  public boolean isActive() {
    Instant now = Instant.now();
    return now.isAfter(startDate) && now.isBefore(endDate);
  }

  public boolean isParticipant(UUID memberId) {
    return participantIds.contains(memberId);
  }

  public boolean hasCompleted(UUID memberId) {
    return completedByMemberIds.contains(memberId);
  }
}
