package app.kaiz.sensai.infrastructure;

import app.kaiz.sensai.domain.CeremonyStatus;
import app.kaiz.sensai.domain.CeremonyType;
import app.kaiz.sensai.domain.SprintCeremony;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Repository for SprintCeremony entities.
 */
@Repository
public interface SprintCeremonyRepository extends JpaRepository<SprintCeremony, UUID> {

    List<SprintCeremony> findByUserIdAndSprintIdOrderByScheduledAt(UUID userId, String sprintId);

    Optional<SprintCeremony> findByUserIdAndSprintIdAndCeremonyType(
        UUID userId, String sprintId, CeremonyType ceremonyType);

    List<SprintCeremony> findByUserIdAndStatusOrderByScheduledAt(
        UUID userId, CeremonyStatus status);

    @Query("SELECT sc FROM SprintCeremony sc WHERE sc.user.id = :userId " +
           "AND sc.ceremonyType = :type ORDER BY sc.completedAt DESC")
    List<SprintCeremony> findCompletedCeremoniesByType(
        @Param("userId") UUID userId,
        @Param("type") CeremonyType type);

    @Query("SELECT sc FROM SprintCeremony sc WHERE sc.user.id = :userId " +
           "AND sc.status = 'SCHEDULED' AND sc.scheduledAt < CURRENT_TIMESTAMP")
    List<SprintCeremony> findOverdueCeremonies(@Param("userId") UUID userId);

    boolean existsByUserIdAndSprintIdAndCeremonyTypeAndStatus(
        UUID userId, String sprintId, CeremonyType type, CeremonyStatus status);
}
