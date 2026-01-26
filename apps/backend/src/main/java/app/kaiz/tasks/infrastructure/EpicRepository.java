package app.kaiz.tasks.infrastructure;

import app.kaiz.tasks.domain.Epic;
import app.kaiz.tasks.domain.EpicStatus;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface EpicRepository extends JpaRepository<Epic, UUID> {

  List<Epic> findByUserIdOrderByCreatedAtDesc(UUID userId);

  List<Epic> findByUserIdAndStatusOrderByCreatedAtDesc(UUID userId, EpicStatus status);

  @Query("SELECT e FROM Epic e WHERE e.user.id = :userId AND e.targetSprint.id = :sprintId")
  List<Epic> findByUserIdAndTargetSprintId(
      @Param("userId") UUID userId, @Param("sprintId") String sprintId);

  Optional<Epic> findByIdAndUserId(UUID id, UUID userId);

  @Query(
      "SELECT e FROM Epic e LEFT JOIN FETCH e.tasks WHERE e.id = :id AND e.user.id = :userId")
  Optional<Epic> findByIdAndUserIdWithTasks(
      @Param("id") UUID id, @Param("userId") UUID userId);

  @Query("SELECT e FROM Epic e WHERE e.user.id = :userId AND e.lifeWheelArea.id = :areaId")
  List<Epic> findByUserIdAndLifeWheelAreaId(
      @Param("userId") UUID userId, @Param("areaId") String areaId);
}
