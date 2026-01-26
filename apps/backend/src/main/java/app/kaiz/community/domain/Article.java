package app.kaiz.community.domain;

import app.kaiz.shared.persistence.BaseEntity;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import lombok.*;
import lombok.experimental.SuperBuilder;

/**
 * Knowledge hub article entity for educational content.
 */
@Entity
@Table(name = "community_articles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Article extends BaseEntity {

    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Column(name = "excerpt", length = 500)
    private String excerpt;

    @Column(name = "content", nullable = false, columnDefinition = "TEXT")
    private String content;

    @Enumerated(EnumType.STRING)
    @Column(name = "category", nullable = false)
    private ArticleCategory category;

    @Column(name = "cover_image_url", length = 500)
    private String coverImageUrl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", nullable = false)
    private CommunityMember author;

    @Column(name = "published_at")
    private Instant publishedAt;

    @Column(name = "is_published")
    @Builder.Default
    private Boolean isPublished = false;

    @Column(name = "is_featured")
    @Builder.Default
    private Boolean isFeatured = false;

    @Column(name = "read_time_minutes")
    @Builder.Default
    private Integer readTimeMinutes = 5;

    @Column(name = "view_count")
    @Builder.Default
    private Integer viewCount = 0;

    @Column(name = "like_count")
    @Builder.Default
    private Integer likeCount = 0;

    @ElementCollection
    @CollectionTable(name = "article_tags", joinColumns = @JoinColumn(name = "article_id"))
    @Column(name = "tag")
    @Builder.Default
    private List<String> tags = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "article_likes", joinColumns = @JoinColumn(name = "article_id"))
    @Column(name = "member_id")
    @Builder.Default
    private Set<UUID> likedByMemberIds = new HashSet<>();

    @ElementCollection
    @CollectionTable(name = "article_bookmarks", joinColumns = @JoinColumn(name = "article_id"))
    @Column(name = "member_id")
    @Builder.Default
    private Set<UUID> bookmarkedByMemberIds = new HashSet<>();

    public void incrementViewCount() {
        this.viewCount++;
    }

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

    public boolean toggleBookmark(UUID memberId) {
        if (bookmarkedByMemberIds.contains(memberId)) {
            bookmarkedByMemberIds.remove(memberId);
            return false;
        } else {
            bookmarkedByMemberIds.add(memberId);
            return true;
        }
    }

    public void publish() {
        this.isPublished = true;
        this.publishedAt = Instant.now();
    }
}
