package app.kaiz.challenge.infrastructure;

import app.kaiz.challenge.domain.Challenge;
import app.kaiz.challenge.domain.ChallengeStatus;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ChallengeRepository extends JpaRepository<Challenge, UUID> {

  List<Challenge> findByUserIdOrderByCreatedAtDesc(UUID userId);

  List<Challenge> findByUserIdAndStatusOrderByCreatedAtDesc(UUID userId, ChallengeStatus status);

  Optional<Challenge> findByIdAndUserId(UUID id, UUID userId);

  @Query(
      "SELECT c FROM Challenge c LEFT JOIN FETCH c.participants LEFT JOIN FETCH c.entries WHERE"
          + " c.id = :id AND c.user.id = :userId")
  Optional<Challenge> findByIdAndUserIdWithDetails(
      @Param("id") UUID id, @Param("userId") UUID userId);

  @Query(
      "SELECT c FROM Challenge c WHERE c.user.id = :userId AND c.lifeWheelArea.id = :areaId ORDER"
          + " BY c.createdAt DESC")
  List<Challenge> findByUserIdAndLifeWheelAreaId(
      @Param("userId") UUID userId, @Param("areaId") String areaId);

  @Query("SELECT COUNT(c) FROM Challenge c WHERE c.user.id = :userId AND c.status = :status")
  long countByUserIdAndStatus(
      @Param("userId") UUID userId, @Param("status") ChallengeStatus status);

  @Query(
      "SELECT c FROM Challenge c WHERE c.status = 'ACTIVE' AND c.user.id = :userId ORDER BY"
          + " c.startDate DESC")
  List<Challenge> findActiveChallengesByUserId(@Param("userId") UUID userId);
}
