package app.kaiz.tasks.domain;

import app.kaiz.shared.persistence.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

/** Entity representing a file attachment for a task comment. */
@Entity
@Table(name = "task_comment_attachments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class TaskCommentAttachment extends BaseEntity {

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "comment_id", nullable = false)
  private TaskComment comment;

  @Column(name = "filename", nullable = false, length = 255)
  private String filename;

  @Column(name = "file_url", nullable = false, columnDefinition = "TEXT")
  private String fileUrl;

  @Column(name = "file_type", length = 100)
  private String fileType;

  @Column(name = "file_size")
  private Long fileSize; // in bytes
}
