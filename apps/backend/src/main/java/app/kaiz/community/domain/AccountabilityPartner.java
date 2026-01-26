package app.kaiz.community.domain;

import app.kaiz.shared.persistence.BaseEntity;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import lombok.*;
import lombok.experimental.SuperBuilder;

/**
 * Accountability partner relationship.
 */
@Entity
@Table(name = "community_partners")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class AccountabilityPartner extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private CommunityMember member;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "partner_id", nullable = false)
    private CommunityMember partner;

    @Column(name = "connected_since", nullable = false)
    private Instant connectedSince;

    @ElementCollection
    @CollectionTable(name = "partner_shared_challenges", joinColumns = @JoinColumn(name = "partnership_id"))
    @Column(name = "challenge_id")
    @Builder.Default
    private List<UUID> sharedChallengeIds = new ArrayList<>();

    @Column(name = "last_interaction")
    private Instant lastInteraction;

    @Column(name = "check_in_streak")
    @Builder.Default
    private Integer checkInStreak = 0;

    public void recordInteraction() {
        this.lastInteraction = Instant.now();
        this.checkInStreak++;
    }

    public void addSharedChallenge(UUID challengeId) {
        if (!sharedChallengeIds.contains(challengeId)) {
            sharedChallengeIds.add(challengeId);
        }
    }
}
