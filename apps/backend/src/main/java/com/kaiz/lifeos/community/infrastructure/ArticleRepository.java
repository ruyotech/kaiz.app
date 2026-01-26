package com.kaiz.lifeos.community.infrastructure;

import com.kaiz.lifeos.community.domain.Article;
import com.kaiz.lifeos.community.domain.ArticleCategory;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/** Repository for Article entity. */
@Repository
public interface ArticleRepository extends JpaRepository<Article, UUID> {

    Page<Article> findByIsPublished(Boolean isPublished, Pageable pageable);

    Page<Article> findByCategoryAndIsPublished(
            ArticleCategory category, Boolean isPublished, Pageable pageable);

    @Query(
            "SELECT a FROM Article a WHERE a.isPublished = :published AND :tag MEMBER OF a.tags")
    Page<Article> findByIsPublishedAndTagsContaining(
            @Param("published") Boolean published, @Param("tag") String tag, Pageable pageable);

    @Query(
            "SELECT a FROM Article a WHERE a.isPublished = :published AND a.category = :category AND :tag MEMBER OF a.tags")
    Page<Article> findByIsPublishedAndCategoryAndTagsContaining(
            @Param("published") Boolean published,
            @Param("category") ArticleCategory category,
            @Param("tag") String tag,
            Pageable pageable);

    Page<Article> findByAuthorId(UUID authorId, Pageable pageable);

    Page<Article> findByIsFeaturedTrue(Pageable pageable);

    Optional<Article> findFirstByIsFeaturedTrueOrderByCreatedAtDesc();
}
