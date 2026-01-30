package app.kaiz.community.domain;

import app.kaiz.shared.persistence.BaseEntity;
import jakarta.persistence.*;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;
import lombok.*;
import lombok.experimental.SuperBuilder;

/** Answer to a community question. */
@Entity
@Table(name = "community_answers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Answer extends BaseEntity {

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "question_id", nullable = false)
  private Question question;

  @Column(name = "body", nullable = false, columnDefinition = "TEXT")
  private String body;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "author_id", nullable = false)
  private CommunityMember author;

  @Column(name = "upvote_count")
  @Builder.Default
  private Integer upvoteCount = 0;

  @Column(name = "is_verified")
  @Builder.Default
  private Boolean isVerified = false;

  @Column(name = "is_accepted")
  @Builder.Default
  private Boolean isAccepted = false;

  @ElementCollection
  @CollectionTable(name = "answer_upvotes", joinColumns = @JoinColumn(name = "answer_id"))
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

  public void verify() {
    this.isVerified = true;
  }

  public void accept() {
    this.isAccepted = true;
  }
}
