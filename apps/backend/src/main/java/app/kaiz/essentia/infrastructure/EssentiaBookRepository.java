package app.kaiz.essentia.infrastructure;

import app.kaiz.essentia.domain.Difficulty;
import app.kaiz.essentia.domain.EssentiaBook;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface EssentiaBookRepository extends JpaRepository<EssentiaBook, UUID> {

  @Query("SELECT b FROM EssentiaBook b WHERE b.lifeWheelArea.id = :lifeWheelAreaId")
  List<EssentiaBook> findByLifeWheelAreaId(String lifeWheelAreaId);

  @Query(
      "SELECT b FROM EssentiaBook b WHERE b.lifeWheelArea.id = :lifeWheelAreaId AND b.isPublished = true")
  List<EssentiaBook> findPublishedByLifeWheelAreaId(String lifeWheelAreaId);

  List<EssentiaBook> findByCategory(String category);

  List<EssentiaBook> findByDifficulty(Difficulty difficulty);

  @Query("SELECT b FROM EssentiaBook b WHERE b.isPublished = true ORDER BY b.rating DESC")
  List<EssentiaBook> findAllOrderByRating();

  @Query("SELECT b FROM EssentiaBook b WHERE b.isPublished = true ORDER BY b.completionCount DESC")
  List<EssentiaBook> findAllOrderByPopularity();

  @Query(
      "SELECT DISTINCT b.category FROM EssentiaBook b WHERE b.category IS NOT NULL ORDER BY b.category")
  List<String> findAllCategories();

  @Query(
      "SELECT b FROM EssentiaBook b WHERE b.isFeatured = true AND b.isPublished = true ORDER BY b.rating DESC")
  List<EssentiaBook> findFeaturedBooks();

  @Query("SELECT b FROM EssentiaBook b WHERE b.isPublished = true")
  List<EssentiaBook> findAllPublished();
}
