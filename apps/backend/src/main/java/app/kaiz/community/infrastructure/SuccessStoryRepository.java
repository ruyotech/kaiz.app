package app.kaiz.community.infrastructure;

import app.kaiz.community.domain.StoryCategory;
import app.kaiz.community.domain.SuccessStory;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/** Repository for SuccessStory entity. */
@Repository
public interface SuccessStoryRepository extends JpaRepository<SuccessStory, UUID> {

    Page<SuccessStory> findByCategory(StoryCategory category, Pageable pageable);

    Page<SuccessStory> findByAuthorId(UUID authorId, Pageable pageable);

    Page<SuccessStory> findByLifeWheelAreaId(String lifeWheelAreaId, Pageable pageable);
}
