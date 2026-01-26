package app.kaiz.mindset.infrastructure;

import app.kaiz.mindset.domain.MindsetContent;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface MindsetContentRepository extends JpaRepository<MindsetContent, UUID> {

  List<MindsetContent> findByDimensionTag(String dimensionTag);

  List<MindsetContent> findByEmotionalTone(app.kaiz.mindset.domain.EmotionalTone emotionalTone);

  @Query("SELECT m FROM MindsetContent m WHERE m.lifeWheelArea.id = :lifeWheelAreaId")
  List<MindsetContent> findByLifeWheelAreaId(UUID lifeWheelAreaId);

  List<MindsetContent> findByIsFavoriteTrue();

  @Query("SELECT m FROM MindsetContent m ORDER BY m.interventionWeight DESC")
  List<MindsetContent> findAllOrderByInterventionWeight();
}
