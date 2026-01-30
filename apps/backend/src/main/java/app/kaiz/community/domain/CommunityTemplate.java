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

/** Community-shared template (sprint plans, rituals, etc.). */
@Entity
@Table(name = "community_templates")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class CommunityTemplate extends BaseEntity {

  @Column(name = "name", nullable = false, length = 200)
  private String name;

  @Column(name = "description", nullable = false, length = 1000)
  private String description;

  @Enumerated(EnumType.STRING)
  @Column(name = "template_type", nullable = false)
  private TemplateType templateType;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "author_id", nullable = false)
  private CommunityMember author;

  @Column(name = "content", nullable = false, columnDefinition = "TEXT")
  private String content; // JSON content

  @Column(name = "life_wheel_area_id", length = 50)
  private String lifeWheelAreaId;

  @ElementCollection
  @CollectionTable(name = "template_tags", joinColumns = @JoinColumn(name = "template_id"))
  @Column(name = "tag")
  @Builder.Default
  private List<String> tags = new ArrayList<>();

  @Column(name = "download_count")
  @Builder.Default
  private Integer downloadCount = 0;

  @Column(name = "rating")
  @Builder.Default
  private Double rating = 0.0;

  @Column(name = "rating_count")
  @Builder.Default
  private Integer ratingCount = 0;

  @Column(name = "rating_sum")
  @Builder.Default
  private Integer ratingSum = 0;

  @Column(name = "preview_image_url", length = 500)
  private String previewImageUrl;

  @Column(name = "is_featured")
  @Builder.Default
  private Boolean isFeatured = false;

  @ElementCollection
  @CollectionTable(name = "template_bookmarks", joinColumns = @JoinColumn(name = "template_id"))
  @Column(name = "member_id")
  @Builder.Default
  private Set<UUID> bookmarkedByMemberIds = new HashSet<>();

  public void incrementDownloadCount() {
    this.downloadCount++;
  }

  public void addRating(int newRating) {
    this.ratingSum += newRating;
    this.ratingCount++;
    this.rating = (double) this.ratingSum / this.ratingCount;
  }

  public boolean toggleBookmark(UUID memberId) {
    if (bookmarkedByMemberIds.contains(memberId)) {
      bookmarkedByMemberIds.remove(memberId);
      return false;
    } else {
      bookmarkedByMemberIds.add(memberId);
      return true;
    }
  }
}
