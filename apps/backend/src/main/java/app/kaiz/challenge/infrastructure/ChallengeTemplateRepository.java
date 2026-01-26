package app.kaiz.challenge.infrastructure;

import app.kaiz.challenge.domain.ChallengeTemplate;
import app.kaiz.challenge.domain.Difficulty;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ChallengeTemplateRepository extends JpaRepository<ChallengeTemplate, String> {

  List<ChallengeTemplate> findAllByOrderByPopularityScoreDesc();

  List<ChallengeTemplate> findByLifeWheelAreaIdOrderByPopularityScoreDesc(String lifeWheelAreaId);

  List<ChallengeTemplate> findByDifficultyOrderByPopularityScoreDesc(Difficulty difficulty);
}
