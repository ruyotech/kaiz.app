package app.kaiz.essentia.infrastructure;

import app.kaiz.essentia.domain.EssentiaUserProgress;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface EssentiaUserProgressRepository extends JpaRepository<EssentiaUserProgress, UUID> {

  @Query("SELECT p FROM EssentiaUserProgress p WHERE p.user.id = :userId")
  List<EssentiaUserProgress> findByUserId(UUID userId);

  @Query("SELECT p FROM EssentiaUserProgress p WHERE p.user.id = :userId AND p.book.id = :bookId")
  Optional<EssentiaUserProgress> findByUserIdAndBookId(UUID userId, UUID bookId);

  @Query("SELECT p FROM EssentiaUserProgress p WHERE p.user.id = :userId AND p.isCompleted = true")
  List<EssentiaUserProgress> findCompletedByUserId(UUID userId);

  @Query("SELECT p FROM EssentiaUserProgress p WHERE p.user.id = :userId AND p.isFavorite = true")
  List<EssentiaUserProgress> findFavoritesByUserId(UUID userId);

  @Query("SELECT p FROM EssentiaUserProgress p WHERE p.user.id = :userId AND p.isCompleted = false AND p.currentCardIndex > 0")
  List<EssentiaUserProgress> findInProgressByUserId(UUID userId);
}
