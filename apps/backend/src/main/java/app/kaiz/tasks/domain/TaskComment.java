package app.kaiz.tasks.domain;

import app.kaiz.identity.domain.User;
import app.kaiz.shared.persistence.BaseEntity;
import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "task_comments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class TaskComment extends BaseEntity {

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "task_id", nullable = false)
  private Task task;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id")
  private User user;

  @Column(name = "comment_text", nullable = false, columnDefinition = "TEXT")
  private String commentText;

  @Column(name = "is_ai_generated", nullable = false)
  @Builder.Default
  private boolean isAiGenerated = false;

  // Attachments
  @OneToMany(mappedBy = "comment", cascade = CascadeType.ALL, orphanRemoval = true)
  @Builder.Default
  private List<TaskCommentAttachment> attachments = new ArrayList<>();
}
