package app.kaiz.tasks.infrastructure;

import app.kaiz.tasks.domain.TaskAttachment;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TaskAttachmentRepository extends JpaRepository<TaskAttachment, UUID> {

  List<TaskAttachment> findByTaskIdOrderByCreatedAtDesc(UUID taskId);

  Optional<TaskAttachment> findByIdAndTaskId(UUID id, UUID taskId);

  long countByTaskId(UUID taskId);

  void deleteByTaskId(UUID taskId);
}
