package app.kaiz.tasks.infrastructure;

import app.kaiz.tasks.domain.TaskComment;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface TaskCommentRepository extends JpaRepository<TaskComment, UUID> {

  List<TaskComment> findByTaskIdOrderByCreatedAtDesc(UUID taskId);

  List<TaskComment> findByTaskIdOrderByCreatedAtAsc(UUID taskId);

  /** Find comments with attachments eagerly loaded to avoid lazy loading issues */
  @Query(
      "SELECT DISTINCT c FROM TaskComment c LEFT JOIN FETCH c.attachments "
          + "LEFT JOIN FETCH c.user WHERE c.task.id = :taskId ORDER BY c.createdAt ASC")
  List<TaskComment> findByTaskIdWithAttachmentsOrderByCreatedAtAsc(@Param("taskId") UUID taskId);

  long countByTaskId(UUID taskId);
}
