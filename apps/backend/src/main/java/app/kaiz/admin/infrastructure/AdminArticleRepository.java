package app.kaiz.admin.infrastructure;

import app.kaiz.admin.domain.AdminArticle;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AdminArticleRepository extends JpaRepository<AdminArticle, UUID> {
  Optional<AdminArticle> findBySlug(String slug);

  boolean existsBySlug(String slug);

  List<AdminArticle> findByStatusOrderByPublishedAtDesc(String status);
}
