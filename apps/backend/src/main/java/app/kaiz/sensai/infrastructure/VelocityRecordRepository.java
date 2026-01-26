package app.kaiz.sensai.infrastructure;

import app.kaiz.sensai.domain.VelocityRecord;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Repository for VelocityRecord entities.
 */
@Repository
public interface VelocityRecordRepository extends JpaRepository<VelocityRecord, UUID> {

    Optional<VelocityRecord> findByUserIdAndSprintId(UUID userId, String sprintId);

    List<VelocityRecord> findByUserIdOrderBySprintStartDateDesc(UUID userId, Pageable pageable);

    @Query("SELECT vr FROM VelocityRecord vr WHERE vr.user.id = :userId " +
           "ORDER BY vr.sprintStartDate DESC")
    List<VelocityRecord> findRecentVelocityRecords(
        @Param("userId") UUID userId, 
        Pageable pageable);

    @Query("SELECT AVG(vr.completedPoints) FROM VelocityRecord vr " +
           "WHERE vr.user.id = :userId")
    Double getAverageCompletedPoints(@Param("userId") UUID userId);

    @Query("SELECT AVG(vr.completionRate) FROM VelocityRecord vr " +
           "WHERE vr.user.id = :userId")
    Double getAverageCompletionRate(@Param("userId") UUID userId);

    @Query("SELECT MAX(vr.completedPoints) FROM VelocityRecord vr " +
           "WHERE vr.user.id = :userId")
    Integer getBestSprintPoints(@Param("userId") UUID userId);

    @Query("SELECT SUM(vr.completedPoints) FROM VelocityRecord vr " +
           "WHERE vr.user.id = :userId")
    Integer getTotalPointsDelivered(@Param("userId") UUID userId);

    @Query("SELECT COUNT(vr) FROM VelocityRecord vr WHERE vr.user.id = :userId")
    int countSprints(@Param("userId") UUID userId);

    @Query("SELECT COUNT(vr) FROM VelocityRecord vr WHERE vr.user.id = :userId " +
           "AND vr.isOvercommitted = true")
    int countOvercommittedSprints(@Param("userId") UUID userId);
}
