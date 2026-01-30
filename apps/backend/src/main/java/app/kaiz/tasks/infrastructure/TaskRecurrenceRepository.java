package app.kaiz.tasks.infrastructure;

import app.kaiz.tasks.domain.TaskRecurrence;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface TaskRecurrenceRepository extends JpaRepository<TaskRecurrence, UUID> {

  Optional<TaskRecurrence> findByTaskId(UUID taskId);

  List<TaskRecurrence> findByIsActiveTrue();

  @Query(
      "SELECT r FROM TaskRecurrence r WHERE r.isActive = true AND "
          + "(r.endDate IS NULL OR r.endDate >= :today) AND "
          + "(r.lastGeneratedDate IS NULL OR r.lastGeneratedDate < :today)")
  List<TaskRecurrence> findActiveRecurrencesDueForGeneration(@Param("today") LocalDate today);

  @Query(
      "SELECT r FROM TaskRecurrence r JOIN r.task t WHERE t.user.id = :userId AND r.isActive = true")
  List<TaskRecurrence> findActiveRecurrencesByUserId(@Param("userId") UUID userId);
}
