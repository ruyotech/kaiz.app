package com.kaiz.lifeos.challenge.infrastructure;

import com.kaiz.lifeos.challenge.domain.ChallengeTemplate;
import com.kaiz.lifeos.challenge.domain.Difficulty;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ChallengeTemplateRepository extends JpaRepository<ChallengeTemplate, String> {

  List<ChallengeTemplate> findAllByOrderByPopularityScoreDesc();

  List<ChallengeTemplate> findByLifeWheelAreaIdOrderByPopularityScoreDesc(String lifeWheelAreaId);

  List<ChallengeTemplate> findByDifficultyOrderByPopularityScoreDesc(Difficulty difficulty);
}
