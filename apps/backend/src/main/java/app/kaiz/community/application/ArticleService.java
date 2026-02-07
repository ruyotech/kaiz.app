package app.kaiz.community.application;

import app.kaiz.community.application.dto.ArticleResponse;
import app.kaiz.community.application.dto.CommunityMemberResponse;
import app.kaiz.community.application.dto.CreateArticleRequest;
import app.kaiz.community.domain.ActivityType;
import app.kaiz.community.domain.Article;
import app.kaiz.community.domain.ArticleCategory;
import app.kaiz.community.domain.CommunityMember;
import app.kaiz.community.infrastructure.ArticleRepository;
import app.kaiz.community.infrastructure.CommunityMemberRepository;
import app.kaiz.shared.exception.ResourceNotFoundException;
import java.time.Instant;
import java.util.ArrayList;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Handles community article CRUD, likes, and view tracking. */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ArticleService {

  private final ArticleRepository articleRepository;
  private final CommunityMemberRepository memberRepository;
  private final CommunityActivityService activityService;

  @Transactional(readOnly = true)
  public Page<ArticleResponse> getArticles(
      ArticleCategory category, String tag, int page, int size) {
    Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "publishedAt"));
    Page<Article> articles;

    if (category != null && tag != null) {
      articles =
          articleRepository.findByIsPublishedAndCategoryAndTagsContaining(
              true, category, tag, pageable);
    } else if (category != null) {
      articles = articleRepository.findByCategoryAndIsPublished(category, true, pageable);
    } else if (tag != null) {
      articles = articleRepository.findByIsPublishedAndTagsContaining(true, tag, pageable);
    } else {
      articles = articleRepository.findByIsPublished(true, pageable);
    }

    return articles.map(this::toArticleResponse);
  }

  @Transactional(readOnly = true)
  public ArticleResponse getArticle(UUID articleId) {
    Article article =
        articleRepository
            .findById(articleId)
            .orElseThrow(() -> new ResourceNotFoundException("Article not found: " + articleId));
    article.incrementViewCount();
    articleRepository.save(article);
    return toArticleResponse(article);
  }

  public ArticleResponse createArticle(UUID authorId, CreateArticleRequest request) {
    CommunityMember author =
        memberRepository
            .findById(authorId)
            .orElseThrow(() -> new ResourceNotFoundException("Member not found: " + authorId));

    Article article =
        Article.builder()
            .author(author)
            .title(request.title())
            .excerpt(request.excerpt())
            .content(request.content())
            .category(request.category())
            .coverImageUrl(request.coverImageUrl())
            .tags(request.tags() != null ? new ArrayList<>(request.tags()) : new ArrayList<>())
            .isPublished(request.isPublished() != null ? request.isPublished() : false)
            .publishedAt(
                request.isPublished() != null && request.isPublished() ? Instant.now() : null)
            .readTimeMinutes(calculateReadTime(request.content()))
            .build();

    article = articleRepository.save(article);

    if (article.getIsPublished()) {
      author.setTemplatesShared(author.getTemplatesShared() + 1);
      memberRepository.save(author);
      activityService.recordActivity(
          author, ActivityType.STORY_POSTED, "Published article: " + article.getTitle());
    }

    return toArticleResponse(article);
  }

  public void likeArticle(UUID articleId, UUID memberId) {
    Article article =
        articleRepository
            .findById(articleId)
            .orElseThrow(() -> new ResourceNotFoundException("Article not found: " + articleId));
    article.toggleLike(memberId);
    articleRepository.save(article);
  }

  ArticleResponse toArticleResponse(Article article) {
    CommunityMemberResponse authorResponse =
        CommunityMemberMapper.toMemberResponse(article.getAuthor());
    return new ArticleResponse(
        article.getId(),
        article.getTitle(),
        article.getExcerpt(),
        article.getContent(),
        article.getCategory().name(),
        article.getCoverImageUrl(),
        authorResponse,
        article.getPublishedAt(),
        article.getIsPublished(),
        article.getIsFeatured(),
        article.getReadTimeMinutes(),
        article.getViewCount(),
        article.getLikeCount(),
        article.getTags(),
        article.getCreatedAt());
  }

  private int calculateReadTime(String content) {
    if (content == null) return 1;
    int wordCount = content.split("\\s+").length;
    return Math.max(1, wordCount / 200);
  }
}
