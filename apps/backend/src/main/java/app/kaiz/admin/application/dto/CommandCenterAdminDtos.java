package app.kaiz.admin.application.dto;

import java.util.UUID;

/** DTOs for Command Center Admin endpoints. */
public final class CommandCenterAdminDtos {

  private CommandCenterAdminDtos() {}

  // =============== LLM Provider DTOs ===============

  public record LlmProviderResponse(
      UUID id,
      String providerName,
      String displayName,
      String providerType,
      String apiBaseUrl,
      String apiKeyReference,
      String defaultModel,
      String availableModels,
      Integer maxTokens,
      Double temperature,
      Integer rateLimitRpm,
      Integer rateLimitTpm,
      boolean isActive,
      boolean isDefault) {}

  public record CreateLlmProviderRequest(
      String providerName,
      String displayName,
      String providerType,
      String apiBaseUrl,
      String apiKeyReference,
      String defaultModel,
      String availableModels,
      Integer maxTokens,
      Double temperature,
      Integer rateLimitRpm,
      Integer rateLimitTpm,
      boolean isActive) {}

  public record UpdateLlmProviderRequest(
      String displayName,
      String apiBaseUrl,
      String apiKeyReference,
      String defaultModel,
      String availableModels,
      Integer maxTokens,
      Double temperature,
      Integer rateLimitRpm,
      Integer rateLimitTpm,
      Boolean isActive) {}

  // =============== System Prompt DTOs ===============

  public record SystemPromptResponse(
      UUID id,
      String promptKey,
      String promptName,
      String promptCategory,
      String promptContent,
      String variables,
      String description,
      Integer version,
      boolean isActive) {}

  public record CreateSystemPromptRequest(
      String promptKey,
      String promptName,
      String promptCategory,
      String promptContent,
      String variables,
      String description) {}

  public record UpdateSystemPromptRequest(
      String promptName,
      String promptContent,
      String variables,
      String description,
      Boolean isActive) {}

  // =============== Test Attachment DTOs ===============

  public record TestAttachmentResponse(
      UUID id,
      String attachmentName,
      String attachmentType,
      String fileUrl,
      boolean hasFileData,
      String mimeType,
      Long fileSizeBytes,
      String description,
      String useCase,
      String expectedOutput,
      Integer displayOrder,
      boolean isActive) {}

  public record CreateTestAttachmentRequest(
      String attachmentName,
      String attachmentType,
      String fileUrl,
      String mimeType,
      String description,
      String useCase,
      String expectedOutput,
      Integer displayOrder) {}

  public record UpdateTestAttachmentRequest(
      String attachmentName,
      String description,
      String useCase,
      String expectedOutput,
      Integer displayOrder,
      Boolean isActive) {}

  // =============== Setting DTOs ===============

  public record SettingResponse(
      UUID id,
      String settingKey,
      String settingValue,
      String settingType,
      String description,
      boolean isSecret,
      boolean isActive) {}

  public record UpdateSettingRequest(String settingValue, String description, Boolean isActive) {}

  // =============== Feature Flag DTOs ===============

  public record FeatureFlagResponse(
      UUID id,
      String flagKey,
      String flagName,
      String description,
      boolean isEnabled,
      Integer rolloutPercentage,
      String allowedUserIds,
      String metadata) {}

  public record UpdateFeatureFlagRequest(
      Boolean isEnabled, Integer rolloutPercentage, String allowedUserIds, String metadata) {}
}
