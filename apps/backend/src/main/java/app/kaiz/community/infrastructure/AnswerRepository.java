package app.kaiz.community.infrastructure;

import app.kaiz.community.domain.Answer;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/** Repository for Answer entity. */
@Repository
public interface AnswerRepository extends JpaRepository<Answer, UUID> {

  List<Answer> findByQuestionId(UUID questionId);

  List<Answer> findByAuthorId(UUID authorId);

  List<Answer> findByQuestionIdOrderByUpvoteCountDesc(UUID questionId);
}
