package app.kaiz.shared.config;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Rate limiting configuration using Bucket4j. Provides per-user rate-limited buckets for AI
 * endpoints that call external providers (Claude).
 */
@Configuration
@Slf4j
public class RateLimitConfig {

  @Bean
  @ConfigurationProperties(prefix = "rate-limit")
  public RateLimitProperties rateLimitProperties() {
    return new RateLimitProperties();
  }

  /** Holds rate-limit YAML properties for auth and api tiers. */
  public static class RateLimitProperties {
    private TierConfig auth = new TierConfig(5, 5, 60);
    private TierConfig api = new TierConfig(100, 100, 60);
    private TierConfig ai = new TierConfig(10, 10, 3600); // 10 requests per hour for AI

    public TierConfig getAuth() {
      return auth;
    }

    public void setAuth(TierConfig auth) {
      this.auth = auth;
    }

    public TierConfig getApi() {
      return api;
    }

    public void setApi(TierConfig api) {
      this.api = api;
    }

    public TierConfig getAi() {
      return ai;
    }

    public void setAi(TierConfig ai) {
      this.ai = ai;
    }
  }

  public static class TierConfig {
    private int capacity;
    private int refillTokens;
    private int refillDuration; // seconds

    public TierConfig() {}

    public TierConfig(int capacity, int refillTokens, int refillDuration) {
      this.capacity = capacity;
      this.refillTokens = refillTokens;
      this.refillDuration = refillDuration;
    }

    public int getCapacity() {
      return capacity;
    }

    public void setCapacity(int capacity) {
      this.capacity = capacity;
    }

    public int getRefillTokens() {
      return refillTokens;
    }

    public void setRefillTokens(int refillTokens) {
      this.refillTokens = refillTokens;
    }

    public int getRefillDuration() {
      return refillDuration;
    }

    public void setRefillDuration(int refillDuration) {
      this.refillDuration = refillDuration;
    }
  }

  /**
   * Per-user bucket cache for AI rate limiting. Each user gets their own bucket with the AI tier
   * limits (default: 10 req/hour).
   */
  @Bean
  public AIRateLimiter aiRateLimiter(RateLimitProperties props) {
    return new AIRateLimiter(props.getAi());
  }

  public static class AIRateLimiter {
    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();
    private final TierConfig config;

    public AIRateLimiter(TierConfig config) {
      this.config = config;
    }

    public Bucket resolveBucket(String userId) {
      return buckets.computeIfAbsent(userId, k -> createBucket());
    }

    public boolean tryConsume(String userId) {
      return resolveBucket(userId).tryConsume(1);
    }

    private Bucket createBucket() {
      Bandwidth limit =
          Bandwidth.builder()
              .capacity(config.getCapacity())
              .refillGreedy(
                  config.getRefillTokens(), Duration.ofSeconds(config.getRefillDuration()))
              .build();
      return Bucket.builder().addLimit(limit).build();
    }
  }
}
