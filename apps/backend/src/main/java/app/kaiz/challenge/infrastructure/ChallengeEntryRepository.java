package app.kaiz.challenge.infrastructure;

import app.kaiz.challenge.domain.ChallengeEntry;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ChallengeEntryRepository extends JpaRepository<ChallengeEntry, UUID> {

  List<ChallengeEntry> findByChallengeIdOrderByEntryDateDesc(UUID challengeId);

  List<ChallengeEntry> findByChallengeIdAndUserIdOrderByEntryDateDesc(
      UUID challengeId, UUID userId);

  Optional<ChallengeEntry> findByChallengeIdAndUserIdAndEntryDate(
      UUID challengeId, UUID userId, LocalDate entryDate);

  @Query(
      "SELECT e FROM ChallengeEntry e WHERE e.challenge.id = :challengeId AND e.user.id = :userId"
          + " AND e.entryDate BETWEEN :startDate AND :endDate ORDER BY e.entryDate ASC")
  List<ChallengeEntry> findByDateRange(
      @Param("challengeId") UUID challengeId,
      @Param("userId") UUID userId,
      @Param("startDate") LocalDate startDate,
      @Param("endDate") LocalDate endDate);

  long countByChallengeIdAndUserId(UUID challengeId, UUID userId);

  @Query(
      "SELECT COUNT(e) FROM ChallengeEntry e WHERE e.challenge.id = :challengeId AND e.user.id ="
          + " :userId AND (e.valueBoolean = true OR e.valueNumeric >= :targetValue)")
  long countSuccessfulEntries(
      @Param("challengeId") UUID challengeId,
      @Param("userId") UUID userId,
      @Param("targetValue") java.math.BigDecimal targetValue);
}
