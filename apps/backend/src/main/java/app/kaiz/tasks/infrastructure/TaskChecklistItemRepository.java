package app.kaiz.tasks.infrastructure;

import app.kaiz.tasks.domain.TaskChecklistItem;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TaskChecklistItemRepository extends JpaRepository<TaskChecklistItem, UUID> {

  List<TaskChecklistItem> findByTaskIdOrderBySortOrderAsc(UUID taskId);

  int countByTaskId(UUID taskId);
}
