package app.kaiz.tasks.infrastructure;

import app.kaiz.tasks.domain.TemplateRating;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface TemplateRatingRepository extends JpaRepository<TemplateRating, UUID> {

  // Find user's rating for a template
  Optional<TemplateRating> findByUserIdAndTemplateId(UUID userId, UUID templateId);

  // Check if user has rated a template
  boolean existsByUserIdAndTemplateId(UUID userId, UUID templateId);

  // Get average rating for a template
  @Query("SELECT AVG(r.rating) FROM TemplateRating r WHERE r.template.id = :templateId")
  Double getAverageRating(@Param("templateId") UUID templateId);

  // Count ratings for a template
  long countByTemplateId(UUID templateId);

  // Delete rating
  void deleteByUserIdAndTemplateId(UUID userId, UUID templateId);
}
