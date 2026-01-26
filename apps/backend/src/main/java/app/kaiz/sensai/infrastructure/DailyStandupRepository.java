package app.kaiz.sensai.infrastructure;

import app.kaiz.sensai.domain.DailyStandup;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Repository for DailyStandup entities.
 */
@Repository
public interface DailyStandupRepository extends JpaRepository<DailyStandup, UUID> {

    Optional<DailyStandup> findByUserIdAndStandupDate(UUID userId, LocalDate standupDate);

    List<DailyStandup> findByUserIdAndStandupDateBetweenOrderByStandupDateDesc(
        UUID userId, LocalDate startDate, LocalDate endDate);

    @Query("SELECT ds FROM DailyStandup ds WHERE ds.user.id = :userId " +
           "AND ds.standupDate >= :startDate ORDER BY ds.standupDate DESC")
    List<DailyStandup> findRecentStandups(
        @Param("userId") UUID userId, 
        @Param("startDate") LocalDate startDate);

    @Query("SELECT COUNT(ds) FROM DailyStandup ds WHERE ds.user.id = :userId " +
           "AND ds.standupDate BETWEEN :startDate AND :endDate AND ds.completedAt IS NOT NULL")
    int countCompletedStandups(
        @Param("userId") UUID userId,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate);

    @Query("SELECT AVG(ds.moodScore) FROM DailyStandup ds WHERE ds.user.id = :userId " +
           "AND ds.standupDate BETWEEN :startDate AND :endDate AND ds.moodScore IS NOT NULL")
    Double getAverageMoodScore(
        @Param("userId") UUID userId,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate);

    @Query("SELECT AVG(ds.energyLevel) FROM DailyStandup ds WHERE ds.user.id = :userId " +
           "AND ds.standupDate BETWEEN :startDate AND :endDate AND ds.energyLevel IS NOT NULL")
    Double getAverageEnergyLevel(
        @Param("userId") UUID userId,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate);

    boolean existsByUserIdAndStandupDate(UUID userId, LocalDate standupDate);
}
