package app.kaiz.community.infrastructure;

import app.kaiz.community.domain.Question;
import app.kaiz.community.domain.QuestionStatus;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/** Repository for Question entity. */
@Repository
public interface QuestionRepository extends JpaRepository<Question, UUID> {

    Page<Question> findByStatus(QuestionStatus status, Pageable pageable);

    @Query("SELECT q FROM Question q WHERE :tag MEMBER OF q.tags")
    Page<Question> findByTagsContaining(@Param("tag") String tag, Pageable pageable);

    @Query("SELECT q FROM Question q WHERE q.status = :status AND :tag MEMBER OF q.tags")
    Page<Question> findByStatusAndTagsContaining(
            @Param("status") QuestionStatus status, @Param("tag") String tag, Pageable pageable);

    Page<Question> findByAuthorId(UUID authorId, Pageable pageable);
}
