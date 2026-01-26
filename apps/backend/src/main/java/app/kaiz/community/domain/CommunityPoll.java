package app.kaiz.community.domain;

import app.kaiz.shared.persistence.BaseEntity;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import lombok.*;
import lombok.experimental.SuperBuilder;

/**
 * Community poll for engagement.
 */
@Entity
@Table(name = "community_polls")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class CommunityPoll extends BaseEntity {

    @Column(name = "question", nullable = false, length = 500)
    private String question;

    @ElementCollection
    @CollectionTable(name = "poll_options", joinColumns = @JoinColumn(name = "poll_id"))
    @OrderColumn(name = "option_order")
    @Builder.Default
    private List<PollOption> options = new ArrayList<>();

    @Column(name = "total_votes")
    @Builder.Default
    private Integer totalVotes = 0;

    @Column(name = "ends_at", nullable = false)
    private Instant endsAt;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    @ElementCollection
    @CollectionTable(name = "poll_votes", joinColumns = @JoinColumn(name = "poll_id"))
    @MapKeyColumn(name = "member_id")
    @Column(name = "option_id")
    @Builder.Default
    private Map<UUID, UUID> memberVotes = new HashMap<>();

    public boolean vote(UUID memberId, UUID optionId) {
        if (memberVotes.containsKey(memberId)) {
            return false; // Already voted
        }
        
        for (PollOption option : options) {
            if (option.getId().equals(optionId)) {
                option.incrementVoteCount();
                memberVotes.put(memberId, optionId);
                totalVotes++;
                return true;
            }
        }
        return false;
    }

    public UUID getMemberVote(UUID memberId) {
        return memberVotes.get(memberId);
    }

    public boolean hasEnded() {
        return Instant.now().isAfter(endsAt);
    }

    @Embeddable
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PollOption {
        @Column(name = "option_id")
        private UUID id;

        @Column(name = "option_text", length = 200)
        private String text;

        @Column(name = "vote_count")
        @Builder.Default
        private Integer voteCount = 0;

        public void incrementVoteCount() {
            this.voteCount++;
        }
    }
}
