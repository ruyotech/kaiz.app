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

/**
 * Q&A Forum question entity.
 */
@Entity
@Table(name = "community_questions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Question extends BaseEntity {

    @Column(name = "title", nullable = false, length = 300)
    private String title;

    @Column(name = "body", nullable = false, columnDefinition = "TEXT")
    private String body;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", nullable = false)
    private CommunityMember author;

    @ElementCollection
    @CollectionTable(name = "question_tags", joinColumns = @JoinColumn(name = "question_id"))
    @Column(name = "tag")
    @Builder.Default
    private List<String> tags = new ArrayList<>();

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private QuestionStatus status = QuestionStatus.OPEN;

    @Column(name = "view_count")
    @Builder.Default
    private Integer viewCount = 0;

    @Column(name = "upvote_count")
    @Builder.Default
    private Integer upvoteCount = 0;

    @Column(name = "answer_count")
    @Builder.Default
    private Integer answerCount = 0;

    @Column(name = "accepted_answer_id")
    private UUID acceptedAnswerId;

    @ElementCollection
    @CollectionTable(name = "question_upvotes", joinColumns = @JoinColumn(name = "question_id"))
    @Column(name = "member_id")
    @Builder.Default
    private Set<UUID> upvotedByMemberIds = new HashSet<>();

    @OneToMany(mappedBy = "question", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Answer> answers = new ArrayList<>();

    public void incrementViewCount() {
        this.viewCount++;
    }

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

    public void incrementAnswerCount() {
        this.answerCount++;
    }

    public void decrementAnswerCount() {
        if (this.answerCount > 0) {
            this.answerCount--;
        }
    }

    public void acceptAnswer(UUID answerId) {
        this.acceptedAnswerId = answerId;
        this.status = QuestionStatus.ANSWERED;
    }
}
