package app.kaiz.community.domain;

import app.kaiz.shared.persistence.BaseEntity;
import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import lombok.*;
import lombok.experimental.SuperBuilder;

/** Success story / win posted by community members. */
@Entity
@Table(name = "community_stories")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class SuccessStory extends BaseEntity {

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "author_id", nullable = false)
  private CommunityMember author;

  @Column(name = "title", nullable = false, length = 200)
  private String title;

  @Column(name = "story", nullable = false, columnDefinition = "TEXT")
  private String story;

  @Enumerated(EnumType.STRING)
  @Column(name = "category", nullable = false)
  @Builder.Default
  private StoryCategory category = StoryCategory.OTHER;

  @Column(name = "life_wheel_area_id", length = 50)
  private String lifeWheelAreaId;

  @ElementCollection
  @CollectionTable(name = "story_image_urls", joinColumns = @JoinColumn(name = "story_id"))
  @Column(name = "image_url", length = 500)
  @Builder.Default
  private List<String> imageUrls = new ArrayList<>();

  @ElementCollection
  @CollectionTable(name = "story_metrics", joinColumns = @JoinColumn(name = "story_id"))
  @Builder.Default
  private List<StoryMetric> metrics = new ArrayList<>();

  @Column(name = "like_count")
  @Builder.Default
  private Integer likeCount = 0;

  @Column(name = "comment_count")
  @Builder.Default
  private Integer commentCount = 0;

  @Column(name = "celebrate_count")
  @Builder.Default
  private Integer celebrateCount = 0;

  @ElementCollection
  @CollectionTable(name = "story_likes", joinColumns = @JoinColumn(name = "story_id"))
  @Column(name = "member_id")
  @Builder.Default
  private Set<UUID> likedByMemberIds = new HashSet<>();

  @ElementCollection
  @CollectionTable(name = "story_celebrates", joinColumns = @JoinColumn(name = "story_id"))
  @Column(name = "member_id")
  @Builder.Default
  private Set<UUID> celebratedByMemberIds = new HashSet<>();

  @OneToMany(mappedBy = "story", cascade = CascadeType.ALL, orphanRemoval = true)
  @Builder.Default
  private List<StoryComment> comments = new ArrayList<>();

  public boolean toggleLike(UUID memberId) {
    if (likedByMemberIds.contains(memberId)) {
      likedByMemberIds.remove(memberId);
      likeCount--;
      return false;
    } else {
      likedByMemberIds.add(memberId);
      likeCount++;
      return true;
    }
  }

  public boolean toggleCelebrate(UUID memberId) {
    if (celebratedByMemberIds.contains(memberId)) {
      celebratedByMemberIds.remove(memberId);
      celebrateCount--;
      return false;
    } else {
      celebratedByMemberIds.add(memberId);
      celebrateCount++;
      return true;
    }
  }

  public void incrementCommentCount() {
    this.commentCount++;
  }

  @Embeddable
  @Data
  @NoArgsConstructor
  @AllArgsConstructor
  public static class StoryMetric {
    @Column(name = "metric_label", length = 100)
    private String label;

    @Column(name = "metric_value", length = 100)
    private String value;
  }
}
