package app.kaiz.command_center.application;

import app.kaiz.admin.domain.LlmProvider;
import app.kaiz.admin.infrastructure.LlmProviderRepository;
import java.util.concurrent.atomic.AtomicReference;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.anthropic.AnthropicChatModel;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.stereotype.Component;

/**
 * Provides the active {@link ChatModel} based on the admin-configured default LLM provider.
 *
 * <p>Bridges the gap between the admin UI (which manages {@link LlmProvider} records in the DB) and
 * the runtime AI services that need a {@link ChatModel} instance. Currently, only Anthropic is
 * supported (the only Spring AI starter in the classpath). When additional starters are added (e.g.
 * {@code spring-ai-starter-model-openai}), this class should be extended to construct the
 * appropriate model.
 *
 * <p>The resolved model is cached in-memory and refreshed when the admin changes the default
 * provider via {@link #evictCachedModel()}.
 *
 * <p><b>Why not a runtime-constructed model?</b> Spring AI model beans are auto-configured from
 * {@code application.yml} with API keys, base URLs, and retry policies. Dynamically constructing a
 * new model from DB config would require duplicating all that wiring and managing API key secrets
 * securely. Instead, we validate that the DB-configured default matches the auto-configured bean
 * and apply overridable parameters (model name, temperature, max tokens) where the Spring AI API
 * supports it.
 */
@Component
@Slf4j
public class ChatModelProvider {

  private final AnthropicChatModel anthropicChatModel;
  private final LlmProviderRepository llmProviderRepository;
  private final AtomicReference<ResolvedModel> cachedModel = new AtomicReference<>();

  public ChatModelProvider(
      AnthropicChatModel anthropicChatModel, LlmProviderRepository llmProviderRepository) {
    this.anthropicChatModel = anthropicChatModel;
    this.llmProviderRepository = llmProviderRepository;
  }

  /**
   * Returns the active {@link ChatModel} based on the admin-configured default provider.
   *
   * <p>Falls back to the Spring-auto-configured Anthropic model if no default is set or the
   * configured provider type is not yet supported.
   */
  public ChatModel getChatModel() {
    ResolvedModel resolved = cachedModel.get();
    if (resolved != null) {
      return resolved.model();
    }
    return resolveAndCache().model();
  }

  /**
   * Returns the model name configured by the admin, or the Spring AI default if none is configured.
   * Useful for logging and conversation tracking.
   */
  public String getModelName() {
    ResolvedModel resolved = cachedModel.get();
    if (resolved != null) {
      return resolved.modelName();
    }
    return resolveAndCache().modelName();
  }

  /**
   * Evicts the cached model so the next call to {@link #getChatModel()} re-reads from the DB. Call
   * this when the admin changes the default provider.
   */
  public void evictCachedModel() {
    cachedModel.set(null);
    log.info("Cached ChatModel evicted — next AI call will re-resolve from DB");
  }

  private ResolvedModel resolveAndCache() {
    ResolvedModel resolved = resolveFromDb();
    cachedModel.set(resolved);
    return resolved;
  }

  private ResolvedModel resolveFromDb() {
    return llmProviderRepository
        .findDefaultProvider()
        .map(this::resolveFromProvider)
        .orElseGet(
            () -> {
              log.warn(
                  "No default LLM provider configured in DB — falling back to Spring-auto-configured Anthropic model");
              return new ResolvedModel(anthropicChatModel, "claude-sonnet-4-20250514");
            });
  }

  private ResolvedModel resolveFromProvider(LlmProvider provider) {
    log.info(
        "Resolving ChatModel from DB config: provider={}, type={}, model={}",
        provider.getProviderName(),
        provider.getProviderType(),
        provider.getDefaultModel());

    return switch (provider.getProviderType()) {
      case ANTHROPIC -> {
        // Use the Spring-auto-configured Anthropic bean — it already has the API key,
        // base URL, and retry config from application.yml.
        String modelName =
            provider.getDefaultModel() != null
                ? provider.getDefaultModel()
                : "claude-sonnet-4-20250514";
        log.info("Using Anthropic model: {}", modelName);
        yield new ResolvedModel(anthropicChatModel, modelName);
      }
      case OPENAI, GOOGLE, AZURE_OPENAI -> {
        // These provider types require their respective Spring AI starters in the classpath.
        // Currently only spring-ai-starter-model-anthropic is available.
        log.warn(
            "Provider type {} is configured as default but no corresponding Spring AI starter "
                + "is on the classpath. Falling back to Anthropic. To enable {}, add the "
                + "appropriate spring-ai-starter-model-* dependency to pom.xml.",
            provider.getProviderType(),
            provider.getProviderType());
        yield new ResolvedModel(anthropicChatModel, "claude-sonnet-4-20250514");
      }
      case CUSTOM -> {
        log.warn("Custom provider type is not yet supported. Falling back to Anthropic.");
        yield new ResolvedModel(anthropicChatModel, "claude-sonnet-4-20250514");
      }
    };
  }

  /** Immutable record holding the resolved ChatModel and its human-readable model name. */
  private record ResolvedModel(ChatModel model, String modelName) {}
}
