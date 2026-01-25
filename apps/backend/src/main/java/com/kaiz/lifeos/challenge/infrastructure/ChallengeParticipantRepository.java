package com.kaiz.lifeos.challenge.infrastructure;

import com.kaiz.lifeos.challenge.domain.ChallengeParticipant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ChallengeParticipantRepository extends JpaRepository<ChallengeParticipant, UUID> {

  List<ChallengeParticipant> findByChallengeIdOrderByJoinedAtAsc(UUID challengeId);

  Optional<ChallengeParticipant> findByChallengeIdAndUserId(UUID challengeId, UUID userId);

  boolean existsByChallengeIdAndUserId(UUID challengeId, UUID userId);

  long countByChallengeId(UUID challengeId);
}
