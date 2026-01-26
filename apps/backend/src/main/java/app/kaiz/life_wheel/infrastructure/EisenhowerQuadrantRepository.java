package app.kaiz.life_wheel.infrastructure;

import app.kaiz.life_wheel.domain.EisenhowerQuadrant;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface EisenhowerQuadrantRepository extends JpaRepository<EisenhowerQuadrant, String> {

  @Query("SELECT e FROM EisenhowerQuadrant e ORDER BY e.displayOrder")
  List<EisenhowerQuadrant> findAllOrderByDisplayOrder();
}
