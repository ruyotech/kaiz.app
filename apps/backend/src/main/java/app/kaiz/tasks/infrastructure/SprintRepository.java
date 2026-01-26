package app.kaiz.tasks.infrastructure;

import app.kaiz.tasks.domain.Sprint;
import app.kaiz.tasks.domain.SprintStatus;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface SprintRepository extends JpaRepository<Sprint, String> {

  List<Sprint> findByYearOrderByWeekNumberAsc(int year);

  Optional<Sprint> findByWeekNumberAndYear(int weekNumber, int year);

  Optional<Sprint> findByStatus(SprintStatus status);

  @Query("SELECT s FROM Sprint s WHERE s.status = :status ORDER BY s.year ASC, s.weekNumber ASC")
  List<Sprint> findAllByStatusOrderByDate(@Param("status") SprintStatus status);

  @Query(
      "SELECT s FROM Sprint s WHERE s.year = :year AND s.weekNumber >= :weekNumber ORDER BY"
          + " s.weekNumber ASC")
  List<Sprint> findUpcomingSprints(@Param("year") int year, @Param("weekNumber") int weekNumber);
}
