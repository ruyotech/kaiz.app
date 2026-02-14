package app.kaiz.admin.application;

import app.kaiz.admin.domain.SystemPrompt;
import app.kaiz.admin.infrastructure.SystemPromptRepository;
import app.kaiz.shared.exception.BadRequestException;
import app.kaiz.shared.exception.ResourceNotFoundException;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Manages prompt version lifecycle: version incrementing on content updates,
 * activation/deactivation toggles, and rollback to any previous version (via prompt key history).
 *
 * <p>Each content update auto-increments the version number. Activation toggles control which
 * prompt version is live. Rollback creates a new version with the content of a previous one.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class PromptVersioningService {

  private final SystemPromptRepository promptRepository;

  /**
   * Create a new version of a prompt by updating its content. Auto-increments version number.
   *
   * @param promptId the existing prompt to version
   * @param newContent the updated prompt content
   * @param changeNote optional note describing what changed
   * @return the updated prompt with incremented version
   */
  @Transactional
  @CacheEvict(value = "systemPrompts", allEntries = true)
  public SystemPrompt createNewVersion(UUID promptId, String newContent, String changeNote) {
    SystemPrompt prompt =
        promptRepository
            .findById(promptId)
            .orElseThrow(() -> new ResourceNotFoundException("SystemPrompt", promptId.toString()));

    int oldVersion = prompt.getVersion();
    prompt.setPromptContent(newContent);
    prompt.setVersion(oldVersion + 1);

    if (changeNote != null) {
      String desc = prompt.getDescription();
      prompt.setDescription(
          desc != null
              ? desc + "\n[v" + prompt.getVersion() + "] " + changeNote
              : "[v" + prompt.getVersion() + "] " + changeNote);
    }

    SystemPrompt saved = promptRepository.save(prompt);
    log.info(
        "Prompt versioned: key={}, v{} -> v{}",
        prompt.getPromptKey(),
        oldVersion,
        saved.getVersion());
    return saved;
  }

  /**
   * Activate or deactivate a prompt.
   *
   * @param promptId the prompt to toggle
   * @param active true to activate, false to deactivate
   */
  @Transactional
  @CacheEvict(value = "systemPrompts", allEntries = true)
  public void setActive(UUID promptId, boolean active) {
    SystemPrompt prompt =
        promptRepository
            .findById(promptId)
            .orElseThrow(() -> new ResourceNotFoundException("SystemPrompt", promptId.toString()));

    prompt.setActive(active);
    promptRepository.save(prompt);
    log.info(
        "Prompt {} {}: key={}",
        active ? "activated" : "deactivated",
        promptId,
        prompt.getPromptKey());
  }

  /**
   * Rollback a prompt to a specific version. Since we don't store full version history, rollback
   * works by finding a prompt key, cloning its content from the specified source, and creating a
   * new version.
   *
   * <p>For now, rollback restores the content from another prompt ID (e.g., a backup copy or
   * previously exported prompt). In production, a full audit trail table would be better.
   *
   * @param promptId the prompt to rollback
   * @param sourcePromptId the prompt whose content to restore from
   * @return the rolled-back prompt with a new version number
   */
  @Transactional
  @CacheEvict(value = "systemPrompts", allEntries = true)
  public SystemPrompt rollbackFrom(UUID promptId, UUID sourcePromptId) {
    SystemPrompt target =
        promptRepository
            .findById(promptId)
            .orElseThrow(() -> new ResourceNotFoundException("SystemPrompt", promptId.toString()));

    SystemPrompt source =
        promptRepository
            .findById(sourcePromptId)
            .orElseThrow(
                () ->
                    new ResourceNotFoundException(
                        "Source SystemPrompt", sourcePromptId.toString()));

    if (!target.getPromptKey().equals(source.getPromptKey())) {
      throw new BadRequestException(
          "Rollback source must have the same prompt key. Target: "
              + target.getPromptKey()
              + ", Source: "
              + source.getPromptKey());
    }

    int oldVersion = target.getVersion();
    target.setPromptContent(source.getPromptContent());
    target.setVersion(oldVersion + 1);
    target.setDescription(
        (target.getDescription() != null ? target.getDescription() + "\n" : "")
            + "[v"
            + target.getVersion()
            + "] Rolled back from source v"
            + source.getVersion());

    SystemPrompt saved = promptRepository.save(target);
    log.info(
        "Prompt rolled back: key={}, v{} -> v{} (from source {})",
        target.getPromptKey(),
        oldVersion,
        saved.getVersion(),
        sourcePromptId);
    return saved;
  }

  /**
   * Get all prompts grouped by category, ordered by key.
   *
   * @return all prompts
   */
  public List<SystemPrompt> getAllPromptsGrouped() {
    return promptRepository.findAllByOrderByPromptCategoryAscPromptNameAsc();
  }

  /**
   * Get version info for a specific prompt.
   *
   * @param promptKey the prompt key
   * @return the prompt (or throw)
   */
  public SystemPrompt getByKey(String promptKey) {
    return promptRepository
        .findByPromptKey(promptKey)
        .orElseThrow(() -> new ResourceNotFoundException("SystemPrompt", promptKey));
  }
}
