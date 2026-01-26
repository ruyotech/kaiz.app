package app.kaiz.tasks.infrastructure;

import app.kaiz.tasks.domain.Task;
import app.kaiz.tasks.domain.TaskStatus;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface TaskRepository extends JpaRepository<Task, UUID> {

  List<Task> findByUserIdOrderByCreatedAtDesc(UUID userId);

  Page<Task> findByUserId(UUID userId, Pageable pageable);

  List<Task> findByUserIdAndStatusOrderByCreatedAtDesc(UUID userId, TaskStatus status);

  List<Task> findByUserIdAndSprintIdOrderByCreatedAtDesc(UUID userId, String sprintId);

  List<Task> findByUserIdAndEpicIdOrderByCreatedAtDesc(UUID userId, UUID epicId);

  @Query("SELECT t FROM Task t WHERE t.user.id = :userId AND t.isDraft = true")
  List<Task> findDraftsByUserId(@Param("userId") UUID userId);

  @Query("SELECT t FROM Task t WHERE t.user.id = :userId AND t.sprint IS NULL AND t.isDraft = false")
  List<Task> findBacklogByUserId(@Param("userId") UUID userId);

  Optional<Task> findByIdAndUserId(UUID id, UUID userId);

  @Query(
      "SELECT t FROM Task t LEFT JOIN FETCH t.comments LEFT JOIN FETCH t.history WHERE t.id = :id"
          + " AND t.user.id = :userId")
  Optional<Task> findByIdAndUserIdWithDetails(
      @Param("id") UUID id, @Param("userId") UUID userId);

  @Query(
      "SELECT t FROM Task t WHERE t.user.id = :userId AND t.lifeWheelArea.id = :areaId ORDER BY"
          + " t.createdAt DESC")
  List<Task> findByUserIdAndLifeWheelAreaId(
      @Param("userId") UUID userId, @Param("areaId") String areaId);

  @Query(
      "SELECT t FROM Task t WHERE t.user.id = :userId AND t.eisenhowerQuadrant.id = :quadrantId"
          + " ORDER BY t.createdAt DESC")
  List<Task> findByUserIdAndEisenhowerQuadrantId(
      @Param("userId") UUID userId, @Param("quadrantId") String quadrantId);

  @Query("SELECT COUNT(t) FROM Task t WHERE t.user.id = :userId AND t.status = :status")
  long countByUserIdAndStatus(@Param("userId") UUID userId, @Param("status") TaskStatus status);

  @Query(
      "SELECT SUM(t.storyPoints) FROM Task t WHERE t.user.id = :userId AND t.sprint.id = :sprintId"
          + " AND t.status = 'DONE'")
  Integer sumCompletedPointsByUserIdAndSprintId(
      @Param("userId") UUID userId, @Param("sprintId") String sprintId);
}
