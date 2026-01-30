package app.kaiz.tasks.infrastructure;

import app.kaiz.tasks.domain.TaskCommentAttachment;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TaskCommentAttachmentRepository
    extends JpaRepository<TaskCommentAttachment, UUID> {

  List<TaskCommentAttachment> findByCommentIdOrderByCreatedAtAsc(UUID commentId);

  Optional<TaskCommentAttachment> findByIdAndCommentId(UUID id, UUID commentId);

  void deleteByCommentId(UUID commentId);
}
