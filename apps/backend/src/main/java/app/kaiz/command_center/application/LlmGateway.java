package app.kaiz.command_center.application;

import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.stereotype.Component;

/**
 * Gateway to the LLM layer. Wraps {@link ChatModelProvider} with:
 *
 * <ul>
 *   <li>Retry logic (3 attempts with exponential backoff)
 *   <li>Circuit breaker (trips after 5 consecutive failures, resets after 60s)
 *   <li>Token usage tracking (input/output/total)
 *   <li>Latency metrics
 * </ul>
 *
 * <p>Bucket4j rate limiting is applied at the controller level, not here.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class LlmGateway {

  private static final int MAX_RETRIES = 3;
  private static final long INITIAL_BACKOFF_MS = 500;
  private static final int CIRCUIT_BREAKER_THRESHOLD = 5;
  private static final long CIRCUIT_BREAKER_RESET_MS = 60_000;

  private final ChatModelProvider chatModelProvider;

  // Circuit breaker state
  private final AtomicInteger consecutiveFailures = new AtomicInteger(0);
  private volatile long circuitOpenedAt = 0;

  // Metrics (simple in-memory counters — Phase 8 exposes via /admin API)
  private final AtomicLong totalCalls = new AtomicLong(0);
  private final AtomicLong totalFailures = new AtomicLong(0);
  private final AtomicLong totalInputTokens = new AtomicLong(0);
  private final AtomicLong totalOutputTokens = new AtomicLong(0);
  private final AtomicLong totalLatencyMs = new AtomicLong(0);

  /**
   * Call the LLM with retry and circuit breaker protection.
   *
   * @param systemMessage the system prompt
   * @param userMessage the user message
   * @return the LLM response text
   * @throws LlmException if all retries are exhausted or circuit is open
   */
  public String call(Message systemMessage, Message userMessage) {
    checkCircuitBreaker();

    totalCalls.incrementAndGet();
    String modelName = chatModelProvider.getModelName();
    log.info("LLM call: model={}", modelName);

    Exception lastException = null;
    for (int attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      long startTime = System.currentTimeMillis();
      try {
        Prompt prompt = new Prompt(List.of(systemMessage, userMessage));
        ChatResponse response = chatModelProvider.getChatModel().call(prompt);

        long elapsed = System.currentTimeMillis() - startTime;
        totalLatencyMs.addAndGet(elapsed);

        // Track token usage
        if (response.getMetadata() != null && response.getMetadata().getUsage() != null) {
          var usage = response.getMetadata().getUsage();
          totalInputTokens.addAndGet(usage.getPromptTokens());
          totalOutputTokens.addAndGet(usage.getCompletionTokens());
          log.info(
              "LLM response: model={}, inputTokens={}, outputTokens={}, elapsed={}ms",
              modelName,
              usage.getPromptTokens(),
              usage.getCompletionTokens(),
              elapsed);
        } else {
          log.info(
              "LLM response: model={}, elapsed={}ms (no token usage metadata)", modelName, elapsed);
        }

        // Reset circuit breaker on success
        consecutiveFailures.set(0);

        String text =
            response.getResult() != null && response.getResult().getOutput() != null
                ? response.getResult().getOutput().getText()
                : "";
        return text;

      } catch (Exception e) {
        lastException = e;
        long elapsed = System.currentTimeMillis() - startTime;
        log.warn(
            "LLM call failed: model={}, attempt={}/{}, elapsed={}ms, error={}",
            modelName,
            attempt,
            MAX_RETRIES,
            elapsed,
            e.getMessage());

        if (attempt < MAX_RETRIES) {
          long backoff = INITIAL_BACKOFF_MS * (1L << (attempt - 1)); // Exponential backoff
          try {
            Thread.sleep(backoff);
          } catch (InterruptedException ie) {
            Thread.currentThread().interrupt();
            throw new LlmException("LLM call interrupted", ie);
          }
        }
      }
    }

    // All retries exhausted
    totalFailures.incrementAndGet();
    int failures = consecutiveFailures.incrementAndGet();
    if (failures >= CIRCUIT_BREAKER_THRESHOLD) {
      circuitOpenedAt = System.currentTimeMillis();
      log.error(
          "Circuit breaker OPENED after {} consecutive failures. Will reset in {}s",
          failures,
          CIRCUIT_BREAKER_RESET_MS / 1000);
    }

    throw new LlmException("LLM call failed after " + MAX_RETRIES + " attempts", lastException);
  }

  /** Get current gateway metrics (for admin dashboard). */
  public GatewayMetrics getMetrics() {
    return new GatewayMetrics(
        totalCalls.get(),
        totalFailures.get(),
        totalInputTokens.get(),
        totalOutputTokens.get(),
        totalLatencyMs.get(),
        consecutiveFailures.get(),
        circuitOpenedAt > 0
            && (System.currentTimeMillis() - circuitOpenedAt) < CIRCUIT_BREAKER_RESET_MS);
  }

  /** Reset metrics (for testing or admin reset). */
  public void resetMetrics() {
    totalCalls.set(0);
    totalFailures.set(0);
    totalInputTokens.set(0);
    totalOutputTokens.set(0);
    totalLatencyMs.set(0);
    consecutiveFailures.set(0);
    circuitOpenedAt = 0;
    log.info("LLM gateway metrics reset");
  }

  // ── Internal ──

  private void checkCircuitBreaker() {
    if (circuitOpenedAt > 0) {
      long elapsed = System.currentTimeMillis() - circuitOpenedAt;
      if (elapsed < CIRCUIT_BREAKER_RESET_MS) {
        long remainingSeconds = (CIRCUIT_BREAKER_RESET_MS - elapsed) / 1000;
        throw new LlmException(
            "Circuit breaker is OPEN. AI service temporarily unavailable. Try again in "
                + remainingSeconds
                + " seconds.");
      }
      // Reset circuit breaker after cooldown
      log.info("Circuit breaker RESET after {}s cooldown", elapsed / 1000);
      circuitOpenedAt = 0;
      consecutiveFailures.set(0);
    }
  }

  /** Gateway metrics snapshot. */
  public record GatewayMetrics(
      long totalCalls,
      long totalFailures,
      long totalInputTokens,
      long totalOutputTokens,
      long totalLatencyMs,
      int consecutiveFailures,
      boolean circuitOpen) {

    public double avgLatencyMs() {
      return totalCalls > 0 ? (double) totalLatencyMs / totalCalls : 0;
    }

    public double failureRate() {
      return totalCalls > 0 ? (double) totalFailures / totalCalls : 0;
    }
  }

  /** Unchecked exception for LLM failures. */
  public static class LlmException extends RuntimeException {
    public LlmException(String message) {
      super(message);
    }

    public LlmException(String message, Throwable cause) {
      super(message, cause);
    }
  }
}
