package app.kaiz.mindset.application;

import app.kaiz.identity.domain.User;
import app.kaiz.life_wheel.infrastructure.LifeWheelAreaRepository;
import app.kaiz.mindset.application.dto.MindsetContentResponse;
import app.kaiz.mindset.application.dto.MindsetThemeResponse;
import app.kaiz.mindset.application.dto.ToggleFavoriteResponse;
import app.kaiz.mindset.domain.MindsetContent;
import app.kaiz.mindset.domain.MindsetTheme;
import app.kaiz.mindset.domain.UserMindsetFavorite;
import app.kaiz.mindset.infrastructure.MindsetContentRepository;
import app.kaiz.mindset.infrastructure.MindsetThemeRepository;
import app.kaiz.mindset.infrastructure.UserMindsetFavoriteRepository;
import app.kaiz.shared.exception.ResourceNotFoundException;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class MindsetService {

  private static final int FEED_SIZE = 20;
  private static final int INTERVENTION_WEIGHT_THRESHOLD = 50;
  private static final double INTERVENTION_RATIO = 0.4;

  private final MindsetContentRepository contentRepository;
  private final MindsetThemeRepository themeRepository;
  private final UserMindsetFavoriteRepository favoriteRepository;
  private final LifeWheelAreaRepository lifeWheelAreaRepository;
  private final MindsetMapper mapper;

  // ── Content Queries ─────────────────────────────────────────────────────

  public Page<MindsetContentResponse> getAllContent(UUID userId, Pageable pageable) {
    log.debug("Fetching all mindset content: userId={}, page={}", userId, pageable.getPageNumber());
    Page<MindsetContent> page = contentRepository.findAll(pageable);
    return page.map(content -> enrichWithFavoriteInfo(content, userId));
  }

  public MindsetContentResponse getContentById(UUID id, UUID userId) {
    MindsetContent content =
        contentRepository
            .findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("MindsetContent", id.toString()));
    return enrichWithFavoriteInfo(content, userId);
  }

  public Page<MindsetContentResponse> getContentByDimension(
      String lifeWheelAreaId, UUID userId, Pageable pageable) {
    log.debug("Fetching mindset content by dimension: areaId={}", lifeWheelAreaId);
    Page<MindsetContent> page = contentRepository.findByLifeWheelAreaId(lifeWheelAreaId, pageable);
    return page.map(content -> enrichWithFavoriteInfo(content, userId));
  }

  // ── Favorites ───────────────────────────────────────────────────────────

  public Page<MindsetContentResponse> getFavorites(UUID userId, Pageable pageable) {
    log.debug("Fetching favorites: userId={}", userId);
    Page<UserMindsetFavorite> favPage = favoriteRepository.findByUserId(userId, pageable);
    return favPage.map(
        fav -> {
          MindsetContent content = fav.getContent();
          long count = favoriteRepository.countByContentId(content.getId());
          return mapper.toContentResponse(content, true, count);
        });
  }

  @Transactional
  public ToggleFavoriteResponse toggleFavorite(UUID userId, UUID contentId) {
    MindsetContent content =
        contentRepository
            .findById(contentId)
            .orElseThrow(
                () -> new ResourceNotFoundException("MindsetContent", contentId.toString()));

    boolean exists = favoriteRepository.existsByUserIdAndContentId(userId, contentId);

    if (exists) {
      favoriteRepository.deleteByUserIdAndContentId(userId, contentId);
      log.info("Mindset favorite removed: userId={}, contentId={}", userId, contentId);
    } else {
      User userRef = new User();
      userRef.setId(userId);
      UserMindsetFavorite favorite =
          UserMindsetFavorite.builder()
              .user(userRef)
              .content(content)
              .savedAt(Instant.now())
              .build();
      favoriteRepository.save(favorite);
      log.info("Mindset favorite added: userId={}, contentId={}", userId, contentId);
    }

    boolean nowFavorite = !exists;
    long count = favoriteRepository.countByContentId(contentId);
    return new ToggleFavoriteResponse(nowFavorite, count);
  }

  // ── Curated Feed (Contextual Injection Engine) ──────────────────────────

  public List<MindsetContentResponse> getFeed(UUID userId, List<String> weakDimensions) {
    log.info("Generating mindset feed: userId={}, weakDimensions={}", userId, weakDimensions);

    List<MindsetContent> allContent = contentRepository.findAllOrderByInterventionWeight();

    if (allContent.isEmpty()) {
      log.warn("No mindset content available for feed generation");
      return List.of();
    }

    List<MindsetContent> feed =
        (weakDimensions == null || weakDimensions.isEmpty())
            ? selectRandomSubset(allContent, FEED_SIZE)
            : buildTargetedFeed(allContent, weakDimensions);

    log.info("Feed generated: size={}", feed.size());
    return feed.stream().map(c -> enrichWithFavoriteInfo(c, userId)).toList();
  }

  private List<MindsetContent> selectRandomSubset(List<MindsetContent> source, int maxSize) {
    List<MindsetContent> shuffled = new ArrayList<>(source);
    fisherYatesShuffle(shuffled);
    return shuffled.subList(0, Math.min(maxSize, shuffled.size()));
  }

  private List<MindsetContent> buildTargetedFeed(
      List<MindsetContent> allContent, List<String> weakDimensions) {
    List<MindsetContent> interventionPool =
        allContent.stream()
            .filter(
                c ->
                    c.getInterventionWeight() >= INTERVENTION_WEIGHT_THRESHOLD
                        && c.getLifeWheelArea() != null
                        && weakDimensions.contains(c.getLifeWheelArea().getId()))
            .collect(Collectors.toCollection(ArrayList::new));

    List<MindsetContent> genericPool =
        allContent.stream()
            .filter(c -> !interventionPool.contains(c))
            .collect(Collectors.toCollection(ArrayList::new));

    fisherYatesShuffle(interventionPool);
    fisherYatesShuffle(genericPool);

    int interventionCount =
        Math.min((int) Math.ceil(FEED_SIZE * INTERVENTION_RATIO), interventionPool.size());
    int genericCount = Math.min(FEED_SIZE - interventionCount, genericPool.size());

    List<MindsetContent> feed = new ArrayList<>();
    feed.addAll(interventionPool.subList(0, interventionCount));
    feed.addAll(genericPool.subList(0, genericCount));
    fisherYatesShuffle(feed);
    return feed;
  }

  // ── Themes ──────────────────────────────────────────────────────────────

  @Cacheable("mindsetThemes")
  public List<MindsetThemeResponse> getAllThemes() {
    log.debug("Fetching all mindset themes");
    return themeRepository.findAll().stream().map(mapper::toThemeResponse).toList();
  }

  public MindsetThemeResponse getThemeById(UUID id) {
    MindsetTheme theme =
        themeRepository
            .findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("MindsetTheme", id.toString()));
    return mapper.toThemeResponse(theme);
  }

  public MindsetThemeResponse getThemeByName(String name) {
    MindsetTheme theme =
        themeRepository
            .findByName(name)
            .orElseThrow(() -> new ResourceNotFoundException("MindsetTheme", name));
    return mapper.toThemeResponse(theme);
  }

  // ── Private Helpers ─────────────────────────────────────────────────────

  private MindsetContentResponse enrichWithFavoriteInfo(MindsetContent content, UUID userId) {
    boolean isFavorite = favoriteRepository.existsByUserIdAndContentId(userId, content.getId());
    long count = favoriteRepository.countByContentId(content.getId());
    return mapper.toContentResponse(content, isFavorite, count);
  }

  private <T> void fisherYatesShuffle(List<T> list) {
    ThreadLocalRandom random = ThreadLocalRandom.current();
    for (int i = list.size() - 1; i > 0; i--) {
      int j = random.nextInt(i + 1);
      T temp = list.get(i);
      list.set(i, list.get(j));
      list.set(j, temp);
    }
  }
}
