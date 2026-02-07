package app.kaiz.shared.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import java.util.List;
import java.util.concurrent.TimeUnit;
import org.springframework.cache.CacheManager;
import org.springframework.cache.caffeine.CaffeineCache;
import org.springframework.cache.support.SimpleCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Centralized cache configuration with named Caffeine caches.
 *
 * <p>Each cache has explicit TTL and max-size bounds to prevent memory leaks. Caches are grouped by
 * staleness tolerance:
 *
 * <ul>
 *   <li><b>Static data (30 min)</b> — rarely changes: life wheel areas, quadrants, mindset themes
 *   <li><b>Admin-managed (15 min)</b> — changes via admin panel: site content, FAQs, prompts
 *   <li><b>Per-user (5 min)</b> — user-specific, moderate churn: sprint, preferences
 * </ul>
 */
@Configuration
public class CacheConfig {

  @Bean
  public CacheManager cacheManager() {
    SimpleCacheManager cacheManager = new SimpleCacheManager();
    cacheManager.setCaches(
        List.of(
            // ── Static data (30 min TTL, 100 max entries) ──
            buildCache("lifeWheelAreas", 30, 100),
            buildCache("eisenhowerQuadrants", 30, 100),
            buildCache("mindsetThemes", 30, 100),
            buildCache("mindsetContent", 30, 200),
            buildCache("challengeTemplates", 30, 200),
            buildCache("essentiaBooks", 30, 200),
            buildCache("essentiaCategories", 30, 50),
            buildCache("globalTemplates", 30, 200),

            // ── Admin-managed data (15 min TTL, 50 max entries) ──
            buildCache("siteContent", 15, 50),
            buildCache("faqs", 15, 50),
            buildCache("features", 15, 50),
            buildCache("pricing", 15, 50),
            buildCache("systemPrompts", 15, 50),
            buildCache("knowledgeCategories", 15, 100),
            buildCache("knowledgeItems", 15, 200),

            // ── Per-user data (5 min TTL, 500 max entries) ──
            buildCache("currentSprint", 5, 500)));
    return cacheManager;
  }

  private CaffeineCache buildCache(String name, int ttlMinutes, int maxSize) {
    return new CaffeineCache(
        name,
        Caffeine.newBuilder()
            .expireAfterWrite(ttlMinutes, TimeUnit.MINUTES)
            .maximumSize(maxSize)
            .recordStats()
            .build());
  }
}
