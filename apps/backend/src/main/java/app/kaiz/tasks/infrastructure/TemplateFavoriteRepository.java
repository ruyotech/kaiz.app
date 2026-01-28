package app.kaiz.tasks.infrastructure;

import app.kaiz.tasks.domain.TemplateFavorite;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface TemplateFavoriteRepository extends JpaRepository<TemplateFavorite, UUID> {

    // Find user's favorite templates
    List<TemplateFavorite> findByUserIdOrderByCreatedAtDesc(UUID userId);

    // Check if user has favorited a template
    boolean existsByUserIdAndTemplateId(UUID userId, UUID templateId);

    // Get specific favorite
    Optional<TemplateFavorite> findByUserIdAndTemplateId(UUID userId, UUID templateId);

    // Delete favorite (unfavorite)
    void deleteByUserIdAndTemplateId(UUID userId, UUID templateId);

    // Count favorites for a template
    long countByTemplateId(UUID templateId);

    // Get template IDs that user has favorited
    @Query("SELECT f.template.id FROM TemplateFavorite f WHERE f.user.id = :userId")
    List<UUID> findTemplateIdsByUserId(@Param("userId") UUID userId);
}
