package app.kaiz.admin.infrastructure;

import app.kaiz.admin.domain.crm.Lead;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface LeadRepository extends JpaRepository<Lead, UUID> {

  Optional<Lead> findByEmail(String email);

  boolean existsByEmail(String email);

  Page<Lead> findByStatus(Lead.LeadStatus status, Pageable pageable);

  Page<Lead> findByLifecycleStage(Lead.LifecycleStage stage, Pageable pageable);

  Page<Lead> findByAssignedToId(UUID adminUserId, Pageable pageable);

  @Query("SELECT l FROM Lead l WHERE l.status = :status AND l.assignedTo.id = :adminId")
  Page<Lead> findByStatusAndAssignedTo(
      @Param("status") Lead.LeadStatus status, @Param("adminId") UUID adminId, Pageable pageable);

  @Query(
      "SELECT l FROM Lead l WHERE "
          + "(:status IS NULL OR l.status = :status) AND "
          + "(:source IS NULL OR l.source = :source) AND "
          + "(:assignedToId IS NULL OR l.assignedTo.id = :assignedToId)")
  Page<Lead> findWithFilters(
      @Param("status") Lead.LeadStatus status,
      @Param("source") String source,
      @Param("assignedToId") UUID assignedToId,
      Pageable pageable);

  @Query(
      "SELECT l FROM Lead l WHERE l.email LIKE %:query% OR l.fullName LIKE %:query% OR l.company LIKE %:query%")
  Page<Lead> search(@Param("query") String query, Pageable pageable);

  // Stats queries
  @Query("SELECT COUNT(l) FROM Lead l WHERE l.status = :status")
  long countByStatus(@Param("status") Lead.LeadStatus status);

  @Query("SELECT COUNT(l) FROM Lead l WHERE l.convertedAt IS NOT NULL AND l.convertedAt >= :since")
  long countConversions(@Param("since") Instant since);

  @Query("SELECT l.source, COUNT(l) FROM Lead l WHERE l.source IS NOT NULL GROUP BY l.source")
  List<Object[]> countBySource();

  @Query("SELECT l.status, COUNT(l) FROM Lead l GROUP BY l.status")
  List<Object[]> countByStatusGrouped();

  // Recent leads
  List<Lead> findTop10ByOrderByCreatedAtDesc();

  // High priority leads without recent activity
  @Query(
      "SELECT l FROM Lead l WHERE l.priority = 'HIGH' OR l.priority = 'URGENT' "
          + "AND (l.lastActivityAt IS NULL OR l.lastActivityAt < :threshold) "
          + "AND l.status NOT IN ('WON', 'LOST')")
  List<Lead> findHighPriorityNeedingAttention(@Param("threshold") Instant threshold);
}
