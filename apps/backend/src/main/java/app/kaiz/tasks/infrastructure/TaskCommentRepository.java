package app.kaiz.tasks.infrastructure;

import app.kaiz.tasks.domain.TaskComment;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TaskCommentRepository extends JpaRepository<TaskComment, UUID> {

  List<TaskComment> findByTaskIdOrderByCreatedAtDesc(UUID taskId);

  List<TaskComment> findByTaskIdOrderByCreatedAtAsc(UUID taskId);

  long countByTaskId(UUID taskId);
}
