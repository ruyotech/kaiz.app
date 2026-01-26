package app.kaiz.sensai.infrastructure;

import app.kaiz.sensai.domain.LifeWheelMetric;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Repository for LifeWheelMetric entities.
 */
@Repository
public interface LifeWheelMetricRepository extends JpaRepository<LifeWheelMetric, UUID> {

    /**
     * Find all metrics for a user
     */
    List<LifeWheelMetric> findByUserId(UUID userId);

    /**
     * Find a specific metric for a user and life wheel area
     */
    Optional<LifeWheelMetric> findByUserIdAndLifeWheelAreaId(UUID userId, String lifeWheelAreaId);

    /**
     * Find neglected dimensions (score < 3)
     */
    @Query("SELECT m FROM LifeWheelMetric m WHERE m.user.id = :userId AND m.score < 3")
    List<LifeWheelMetric> findNeglectedDimensions(@Param("userId") UUID userId);

    /**
     * Find dominant dimensions (score >= 8)
     */
    @Query("SELECT m FROM LifeWheelMetric m WHERE m.user.id = :userId AND m.score >= 8")
    List<LifeWheelMetric> findDominantDimensions(@Param("userId") UUID userId);

    /**
     * Calculate average score across all dimensions for a user
     */
    @Query("SELECT AVG(m.score) FROM LifeWheelMetric m WHERE m.user.id = :userId")
    Double calculateAverageScore(@Param("userId") UUID userId);
}
