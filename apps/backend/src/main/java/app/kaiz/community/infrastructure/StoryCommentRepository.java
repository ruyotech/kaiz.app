package app.kaiz.community.infrastructure;

import app.kaiz.community.domain.StoryComment;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/** Repository for StoryComment entity. */
@Repository
public interface StoryCommentRepository extends JpaRepository<StoryComment, UUID> {

    List<StoryComment> findByStoryId(UUID storyId);

    List<StoryComment> findByAuthorId(UUID authorId);
}
