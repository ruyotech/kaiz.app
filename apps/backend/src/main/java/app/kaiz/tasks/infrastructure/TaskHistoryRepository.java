package app.kaiz.tasks.infrastructure;

import app.kaiz.tasks.domain.TaskHistory;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TaskHistoryRepository extends JpaRepository<TaskHistory, UUID> {

  List<TaskHistory> findByTaskIdOrderByCreatedAtDesc(UUID taskId);

  List<TaskHistory> findByTaskIdOrderByCreatedAtAsc(UUID taskId);
}
