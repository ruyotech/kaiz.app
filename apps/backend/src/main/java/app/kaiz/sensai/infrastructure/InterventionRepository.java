package app.kaiz.sensai.infrastructure;

import app.kaiz.sensai.domain.Intervention;
import app.kaiz.sensai.domain.InterventionType;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Repository for Intervention entities.
 */
@Repository
public interface InterventionRepository extends JpaRepository<Intervention, UUID> {

    List<Intervention> findByUserIdAndIsActiveTrueOrderByTriggeredAtDesc(UUID userId);

    Page<Intervention> findByUserIdOrderByTriggeredAtDesc(UUID userId, Pageable pageable);

    List<Intervention> findByUserIdAndInterventionTypeAndIsActiveTrue(
        UUID userId, InterventionType type);

    @Query("SELECT i FROM Intervention i WHERE i.user.id = :userId " +
           "AND i.triggeredAt >= :since ORDER BY i.triggeredAt DESC")
    List<Intervention> findRecentInterventions(
        @Param("userId") UUID userId,
        @Param("since") Instant since);

    @Query("SELECT COUNT(i) FROM Intervention i WHERE i.user.id = :userId " +
           "AND i.triggeredAt >= :since")
    int countInterventionsSince(
        @Param("userId") UUID userId,
        @Param("since") Instant since);

    @Query("SELECT COUNT(i) FROM Intervention i WHERE i.user.id = :userId " +
           "AND i.triggeredAt >= :since AND i.acknowledgedAt IS NOT NULL")
    int countAcknowledgedInterventionsSince(
        @Param("userId") UUID userId,
        @Param("since") Instant since);

    @Query("SELECT i.interventionType, COUNT(i) FROM Intervention i " +
           "WHERE i.user.id = :userId AND i.triggeredAt >= :since " +
           "GROUP BY i.interventionType")
    List<Object[]> countByTypeSince(
        @Param("userId") UUID userId,
        @Param("since") Instant since);

    boolean existsByUserIdAndInterventionTypeAndIsActiveTrue(
        UUID userId, InterventionType type);
}
