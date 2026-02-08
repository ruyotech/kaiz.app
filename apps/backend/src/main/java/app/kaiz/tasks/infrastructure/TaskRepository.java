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

  List<Task> findByUserIdAndDeletedAtIsNullOrderByCreatedAtDesc(UUID userId);

  Page<Task> findByUserIdAndDeletedAtIsNull(UUID userId, Pageable pageable);

  List<Task> findByUserIdAndStatusAndDeletedAtIsNullOrderByCreatedAtDesc(
      UUID userId, TaskStatus status);

  List<Task> findByUserIdAndSprintIdAndDeletedAtIsNullOrderByCreatedAtDesc(
      UUID userId, String sprintId);

  List<Task> findByUserIdAndEpicIdAndDeletedAtIsNullOrderByCreatedAtDesc(UUID userId, UUID epicId);

  // Soft-deleted tasks for trash view
  List<Task> findByUserIdAndDeletedAtIsNotNullOrderByDeletedAtDesc(UUID userId);

  @Query(
      "SELECT t FROM Task t WHERE t.user.id = :userId AND t.isDraft = true AND t.deletedAt IS NULL")
  List<Task> findDraftsByUserId(@Param("userId") UUID userId);

  @Query(
      "SELECT t FROM Task t WHERE t.user.id = :userId AND t.sprint IS NULL AND t.isDraft = false"
          + " AND t.deletedAt IS NULL")
  List<Task> findBacklogByUserId(@Param("userId") UUID userId);

  @Query("SELECT t FROM Task t WHERE t.id = :id AND t.user.id = :userId AND t.deletedAt IS NULL")
  Optional<Task> findByIdAndUserId(@Param("id") UUID id, @Param("userId") UUID userId);

  // Find by ID including soft-deleted (for restore/hard-delete operations)
  @Query("SELECT t FROM Task t WHERE t.id = :id AND t.user.id = :userId")
  Optional<Task> findByIdAndUserIdIncludingDeleted(
      @Param("id") UUID id, @Param("userId") UUID userId);

  @Query(
      "SELECT t FROM Task t LEFT JOIN FETCH t.comments LEFT JOIN FETCH t.history WHERE t.id = :id"
          + " AND t.user.id = :userId AND t.deletedAt IS NULL")
  Optional<Task> findByIdAndUserIdWithDetails(@Param("id") UUID id, @Param("userId") UUID userId);

  @Query(
      "SELECT t FROM Task t WHERE t.user.id = :userId AND t.lifeWheelArea.id = :areaId"
          + " AND t.deletedAt IS NULL ORDER BY t.createdAt DESC")
  List<Task> findByUserIdAndLifeWheelAreaId(
      @Param("userId") UUID userId, @Param("areaId") String areaId);

  @Query(
      "SELECT t FROM Task t WHERE t.user.id = :userId AND t.eisenhowerQuadrant.id = :quadrantId"
          + " AND t.deletedAt IS NULL ORDER BY t.createdAt DESC")
  List<Task> findByUserIdAndEisenhowerQuadrantId(
      @Param("userId") UUID userId, @Param("quadrantId") String quadrantId);

  @Query(
      "SELECT COUNT(t) FROM Task t WHERE t.user.id = :userId AND t.status = :status"
          + " AND t.deletedAt IS NULL")
  long countByUserIdAndStatus(@Param("userId") UUID userId, @Param("status") TaskStatus status);

  @Query(
      "SELECT SUM(t.storyPoints) FROM Task t WHERE t.user.id = :userId AND t.sprint.id = :sprintId"
          + " AND t.status = 'DONE' AND t.deletedAt IS NULL")
  Integer sumCompletedPointsByUserIdAndSprintId(
      @Param("userId") UUID userId, @Param("sprintId") String sprintId);

  /**
   * Find recurring tasks that should appear in a given date range (for sprint view). A recurring
   * task appears if: - Its recurrence start date is before or on the sprint end date - Its
   * recurrence end date is null (infinite) OR is after or on the sprint start date
   */
  @Query(
      "SELECT t FROM Task t JOIN t.recurrence r WHERE t.user.id = :userId "
          + "AND t.isRecurring = true "
          + "AND r.isActive = true "
          + "AND t.deletedAt IS NULL "
          + "AND r.startDate <= :sprintEndDate "
          + "AND (r.endDate IS NULL OR r.endDate >= :sprintStartDate) "
          + "ORDER BY t.createdAt DESC")
  List<Task> findRecurringTasksForDateRange(
      @Param("userId") UUID userId,
      @Param("sprintStartDate") java.time.LocalDate sprintStartDate,
      @Param("sprintEndDate") java.time.LocalDate sprintEndDate);
}
