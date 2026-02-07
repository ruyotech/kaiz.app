package app.kaiz.admin.infrastructure;

import app.kaiz.admin.domain.KnowledgeCategory;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface KnowledgeCategoryRepository extends JpaRepository<KnowledgeCategory, UUID> {

  Optional<KnowledgeCategory> findBySlug(String slug);

  List<KnowledgeCategory> findAllByStatusOrderByDisplayOrderAsc(String status);

  List<KnowledgeCategory> findAllByOrderByDisplayOrderAsc();

  @Modifying
  @Query("UPDATE KnowledgeCategory c SET c.itemCount = :count WHERE c.id = :categoryId")
  void updateItemCount(@Param("categoryId") UUID categoryId, @Param("count") Integer count);
}
