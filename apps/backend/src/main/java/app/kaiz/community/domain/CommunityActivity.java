package app.kaiz.community.domain;

import app.kaiz.shared.persistence.BaseEntity;
import jakarta.persistence.*;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;
import lombok.*;
import lombok.experimental.SuperBuilder;

/**
 * Activity feed entry for community events.
 */
@Entity
@Table(name = "community_activities")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class CommunityActivity extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private CommunityMember member;

    @Enumerated(EnumType.STRING)
    @Column(name = "activity_type", nullable = false)
    private ActivityType activityType;

    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Column(name = "description", length = 500)
    private String description;

    @Column(name = "metadata", columnDefinition = "TEXT")
    private String metadata; // JSON for additional data

    @Column(name = "celebrate_count")
    @Builder.Default
    private Integer celebrateCount = 0;

    @ElementCollection
    @CollectionTable(name = "activity_celebrates", joinColumns = @JoinColumn(name = "activity_id"))
    @Column(name = "member_id")
    @Builder.Default
    private Set<UUID> celebratedByMemberIds = new HashSet<>();

    public boolean celebrate(UUID memberId) {
        if (celebratedByMemberIds.add(memberId)) {
            celebrateCount++;
            return true;
        }
        return false;
    }
}
