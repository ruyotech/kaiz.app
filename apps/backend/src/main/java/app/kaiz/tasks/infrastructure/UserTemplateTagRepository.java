package app.kaiz.tasks.infrastructure;

import app.kaiz.tasks.domain.UserTemplateTag;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface UserTemplateTagRepository extends JpaRepository<UserTemplateTag, UUID> {

    // Find all tags a user has added to a specific template
    List<UserTemplateTag> findByUserIdAndTemplateId(UUID userId, UUID templateId);

    // Get just the tag strings for a user's template
    @Query("SELECT utt.tag FROM UserTemplateTag utt WHERE utt.user.id = :userId AND utt.template.id = :templateId ORDER BY utt.tag")
    List<String> findTagsByUserIdAndTemplateId(@Param("userId") UUID userId, @Param("templateId") UUID templateId);

    // Check if a specific tag exists for user and template
    boolean existsByUserIdAndTemplateIdAndTag(UUID userId, UUID templateId, String tag);

    // Find specific tag entry
    Optional<UserTemplateTag> findByUserIdAndTemplateIdAndTag(UUID userId, UUID templateId, String tag);

    // Delete specific tag
    void deleteByUserIdAndTemplateIdAndTag(UUID userId, UUID templateId, String tag);

    // Delete all tags for a user's template
    void deleteByUserIdAndTemplateId(UUID userId, UUID templateId);

    // Get all template IDs that have user tags
    @Query("SELECT DISTINCT utt.template.id FROM UserTemplateTag utt WHERE utt.user.id = :userId")
    List<UUID> findTemplateIdsWithUserTags(@Param("userId") UUID userId);
}
