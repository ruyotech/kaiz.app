package app.kaiz.mindset.infrastructure;

import app.kaiz.mindset.domain.UserMindsetFavorite;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface UserMindsetFavoriteRepository extends JpaRepository<UserMindsetFavorite, UUID> {

  Page<UserMindsetFavorite> findByUserId(UUID userId, Pageable pageable);

  Optional<UserMindsetFavorite> findByUserIdAndContentId(UUID userId, UUID contentId);

  boolean existsByUserIdAndContentId(UUID userId, UUID contentId);

  @Modifying
  @Query(
      "DELETE FROM UserMindsetFavorite f WHERE f.user.id = :userId AND f.content.id = :contentId")
  void deleteByUserIdAndContentId(UUID userId, UUID contentId);

  @Modifying
  @Query("DELETE FROM UserMindsetFavorite f WHERE f.content.id = :contentId")
  void deleteByContentId(UUID contentId);

  long countByContentId(UUID contentId);
}
