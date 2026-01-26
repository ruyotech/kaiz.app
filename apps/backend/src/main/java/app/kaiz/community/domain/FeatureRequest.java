package app.kaiz.community.domain;

import app.kaiz.shared.persistence.BaseEntity;
import jakarta.persistence.*;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;
import lombok.*;
import lombok.experimental.SuperBuilder;

/**
 * Feature request submitted by community members.
 */
@Entity
@Table(name = "community_feature_requests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class FeatureRequest extends BaseEntity {

    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Column(name = "description", nullable = false, columnDefinition = "TEXT")
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", nullable = false)
    private CommunityMember author;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private FeatureRequestStatus status = FeatureRequestStatus.SUBMITTED;

    @Column(name = "upvote_count")
    @Builder.Default
    private Integer upvoteCount = 0;

    @Column(name = "comment_count")
    @Builder.Default
    private Integer commentCount = 0;

    @Column(name = "official_response", columnDefinition = "TEXT")
    private String officialResponse;

    @ElementCollection
    @CollectionTable(name = "feature_request_upvotes", joinColumns = @JoinColumn(name = "request_id"))
    @Column(name = "member_id")
    @Builder.Default
    private Set<UUID> upvotedByMemberIds = new HashSet<>();

    public boolean toggleUpvote(UUID memberId) {
        if (upvotedByMemberIds.contains(memberId)) {
            upvotedByMemberIds.remove(memberId);
            upvoteCount--;
            return false;
        } else {
            upvotedByMemberIds.add(memberId);
            upvoteCount++;
            return true;
        }
    }

    public void addOfficialResponse(String response) {
        this.officialResponse = response;
    }

    public void updateStatus(FeatureRequestStatus newStatus) {
        this.status = newStatus;
    }
}
