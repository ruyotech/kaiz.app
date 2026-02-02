package app.kaiz.admin.repository;

import app.kaiz.admin.domain.KnowledgeItem;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface KnowledgeItemRepository extends JpaRepository<KnowledgeItem, UUID> {

  Optional<KnowledgeItem> findBySlug(String slug);

  List<KnowledgeItem> findByCategoryIdOrderByDisplayOrderAsc(UUID categoryId);

  List<KnowledgeItem> findByStatusOrderByDisplayOrderAsc(String status);

  List<KnowledgeItem> findByCategoryIdAndStatusOrderByDisplayOrderAsc(
      UUID categoryId, String status);

  List<KnowledgeItem> findByFeaturedTrueAndStatus(String status);

  Page<KnowledgeItem> findByStatus(String status, Pageable pageable);

  @Query(
      "SELECT i FROM KnowledgeItem i WHERE i.status = :status AND "
          + "(LOWER(i.title) LIKE LOWER(CONCAT('%', :query, '%')) OR "
          + "LOWER(i.summary) LIKE LOWER(CONCAT('%', :query, '%')) OR "
          + "LOWER(i.searchKeywords) LIKE LOWER(CONCAT('%', :query, '%')))")
  List<KnowledgeItem> searchByKeywords(
      @Param("query") String query, @Param("status") String status);

  @Query(
      "SELECT i FROM KnowledgeItem i WHERE "
          + "(LOWER(i.title) LIKE LOWER(CONCAT('%', :query, '%')) OR "
          + "LOWER(i.summary) LIKE LOWER(CONCAT('%', :query, '%')) OR "
          + "LOWER(i.searchKeywords) LIKE LOWER(CONCAT('%', :query, '%')))")
  List<KnowledgeItem> searchAll(@Param("query") String query);

  Long countByCategoryIdAndStatus(UUID categoryId, String status);

  @Modifying
  @Query("UPDATE KnowledgeItem i SET i.viewCount = i.viewCount + 1 WHERE i.id = :id")
  void incrementViewCount(@Param("id") UUID id);

  @Modifying
  @Query("UPDATE KnowledgeItem i SET i.helpfulCount = i.helpfulCount + 1 WHERE i.id = :id")
  void incrementHelpfulCount(@Param("id") UUID id);
}
