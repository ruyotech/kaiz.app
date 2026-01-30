package app.kaiz.tasks.infrastructure;

import app.kaiz.tasks.domain.CreatorType;
import app.kaiz.tasks.domain.TaskTemplate;
import app.kaiz.tasks.domain.TemplateType;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface TaskTemplateRepository extends JpaRepository<TaskTemplate, UUID> {

  // User's own templates
  List<TaskTemplate> findByUserIdOrderByNameAsc(UUID userId);

  Optional<TaskTemplate> findByIdAndUserId(UUID id, UUID userId);

  boolean existsByNameAndUserId(String name, UUID userId);

  // Global (system) templates
  List<TaskTemplate> findByCreatorTypeOrderByRatingDesc(CreatorType creatorType);

  @Query(
      "SELECT t FROM TaskTemplate t WHERE t.creatorType = :creatorType ORDER BY t.usageCount DESC")
  List<TaskTemplate> findGlobalByUsageCount(@Param("creatorType") CreatorType creatorType);

  // Templates by type (task/event)
  List<TaskTemplate> findByCreatorTypeAndTypeOrderByRatingDesc(
      CreatorType creatorType, TemplateType type);

  // Templates by life wheel area
  @Query(
      "SELECT t FROM TaskTemplate t WHERE t.creatorType = 'SYSTEM' AND t.defaultLifeWheelArea.id = :areaId ORDER BY t.rating DESC")
  List<TaskTemplate> findGlobalByLifeWheelArea(@Param("areaId") String areaId);

  @Query(
      "SELECT t FROM TaskTemplate t WHERE t.user.id = :userId AND t.defaultLifeWheelArea.id = :areaId ORDER BY t.name ASC")
  List<TaskTemplate> findByUserIdAndLifeWheelArea(
      @Param("userId") UUID userId, @Param("areaId") String areaId);

  // Search templates
  @Query(
      "SELECT t FROM TaskTemplate t WHERE "
          + "(t.creatorType = 'SYSTEM' OR t.user.id = :userId) AND "
          + "(LOWER(t.name) LIKE LOWER(CONCAT('%', :search, '%')) OR "
          + "LOWER(t.description) LIKE LOWER(CONCAT('%', :search, '%'))) "
          + "ORDER BY t.rating DESC")
  List<TaskTemplate> searchTemplates(@Param("userId") UUID userId, @Param("search") String search);

  // Combined query for user's templates and global templates
  @Query(
      "SELECT t FROM TaskTemplate t WHERE t.creatorType = 'SYSTEM' OR t.user.id = :userId ORDER BY t.creatorType ASC, t.rating DESC")
  List<TaskTemplate> findAllAvailableForUser(@Param("userId") UUID userId);

  // Paginated global templates
  @Query("SELECT t FROM TaskTemplate t WHERE t.creatorType = 'SYSTEM' ORDER BY t.rating DESC")
  Page<TaskTemplate> findGlobalTemplates(Pageable pageable);

  // Top rated templates
  @Query(
      "SELECT t FROM TaskTemplate t WHERE t.creatorType = 'SYSTEM' AND t.ratingCount >= :minRatings ORDER BY t.rating DESC")
  List<TaskTemplate> findTopRatedGlobal(@Param("minRatings") int minRatings, Pageable pageable);

  // Increment usage count
  @Modifying
  @Query("UPDATE TaskTemplate t SET t.usageCount = t.usageCount + 1 WHERE t.id = :templateId")
  void incrementUsageCount(@Param("templateId") UUID templateId);

  // Admin: find all system templates
  List<TaskTemplate> findByCreatorType(CreatorType creatorType);
}
