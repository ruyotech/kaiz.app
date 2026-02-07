package app.kaiz.mindset.infrastructure;

import app.kaiz.mindset.domain.EmotionalTone;
import app.kaiz.mindset.domain.MindsetContent;
import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface MindsetContentRepository extends JpaRepository<MindsetContent, UUID> {

  Page<MindsetContent> findAll(Pageable pageable);

  List<MindsetContent> findByDimensionTag(String dimensionTag);

  Page<MindsetContent> findByDimensionTag(String dimensionTag, Pageable pageable);

  List<MindsetContent> findByEmotionalTone(EmotionalTone emotionalTone);

  Page<MindsetContent> findByEmotionalTone(EmotionalTone emotionalTone, Pageable pageable);

  @Query("SELECT m FROM MindsetContent m WHERE m.lifeWheelArea.id = :lifeWheelAreaId")
  List<MindsetContent> findByLifeWheelAreaId(@Param("lifeWheelAreaId") String lifeWheelAreaId);

  @Query("SELECT m FROM MindsetContent m WHERE m.lifeWheelArea.id = :lifeWheelAreaId")
  Page<MindsetContent> findByLifeWheelAreaId(
      @Param("lifeWheelAreaId") String lifeWheelAreaId, Pageable pageable);

  @Query("SELECT m FROM MindsetContent m ORDER BY m.interventionWeight DESC")
  List<MindsetContent> findAllOrderByInterventionWeight();

  @Query(
      "SELECT m FROM MindsetContent m WHERE m.interventionWeight >= :minWeight"
          + " AND m.lifeWheelArea.id IN :areaIds")
  List<MindsetContent> findInterventionContent(
      @Param("minWeight") int minWeight, @Param("areaIds") List<String> areaIds);

  @Query(
      "SELECT m FROM MindsetContent m WHERE m.interventionWeight < :maxWeight"
          + " OR m.lifeWheelArea.id NOT IN :areaIds OR m.lifeWheelArea IS NULL")
  List<MindsetContent> findGenericContent(
      @Param("maxWeight") int maxWeight, @Param("areaIds") List<String> areaIds);

  @Query(
      "SELECT m FROM MindsetContent m WHERE LOWER(m.body) LIKE LOWER(CONCAT('%', :search, '%'))"
          + " OR LOWER(m.author) LIKE LOWER(CONCAT('%', :search, '%'))")
  Page<MindsetContent> searchByBodyOrAuthor(@Param("search") String search, Pageable pageable);

  long countByLifeWheelAreaId(String lifeWheelAreaId);

  long countByEmotionalTone(EmotionalTone emotionalTone);
}
