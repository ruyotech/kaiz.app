/**
 * TypeScript types for Command Center Admin
 */

export interface LlmProvider {
  id: string;
  providerName: string;
  displayName: string;
  providerType: 'ANTHROPIC' | 'OPENAI' | 'GOOGLE' | 'AZURE_OPENAI' | 'CUSTOM';
  apiBaseUrl?: string;
  apiKeyReference?: string;
  defaultModel?: string;
  availableModels?: string; // JSON array string
  maxTokens?: number;
  temperature?: number;
  rateLimitRpm?: number;
  rateLimitTpm?: number;
  isActive: boolean;
  isDefault: boolean;
}

export interface SystemPrompt {
  id: string;
  promptKey: string;
  promptName: string;
  promptCategory:
    | 'COMMAND_CENTER'
    | 'COACH_CHAT'
    | 'SMART_INPUT'
    | 'IMAGE_ANALYSIS'
    | 'VOICE_TRANSCRIPTION'
    | 'DRAFT_GENERATION'
    | 'CLARIFICATION'
    | 'TASK_SUGGESTION'
    | 'CHALLENGE_SUGGESTION'
    | 'CUSTOM';
  promptContent: string;
  variables?: string; // JSON array string
  description?: string;
  version: number;
  isActive: boolean;
}

export interface TestAttachment {
  id: string;
  attachmentName: string;
  attachmentType: 'IMAGE' | 'PDF' | 'AUDIO' | 'VIDEO' | 'DOCUMENT';
  fileUrl?: string;
  hasFileData: boolean;
  mimeType: string;
  fileSizeBytes?: number;
  description?: string;
  useCase?: string;
  expectedOutput?: string; // JSON string
  displayOrder: number;
  isActive: boolean;
}

export interface CommandCenterSetting {
  id: string;
  settingKey: string;
  settingValue: string;
  settingType: 'TEXT' | 'JSON' | 'SECRET' | 'NUMBER' | 'BOOLEAN';
  description?: string;
  isSecret: boolean;
  isActive: boolean;
}

export interface FeatureFlag {
  id: string;
  flagKey: string;
  flagName: string;
  description?: string;
  isEnabled: boolean;
  rolloutPercentage?: number;
  allowedUserIds?: string; // JSON array string
  metadata?: string; // JSON string
}

// Request/Response types for API
export interface CreateLlmProviderRequest {
  providerName: string;
  displayName: string;
  providerType: string;
  apiBaseUrl?: string;
  apiKeyReference?: string;
  defaultModel?: string;
  availableModels?: string;
  maxTokens?: number;
  temperature?: number;
  rateLimitRpm?: number;
  rateLimitTpm?: number;
  isActive: boolean;
}

export interface UpdateLlmProviderRequest {
  displayName?: string;
  apiBaseUrl?: string;
  apiKeyReference?: string;
  defaultModel?: string;
  availableModels?: string;
  maxTokens?: number;
  temperature?: number;
  rateLimitRpm?: number;
  rateLimitTpm?: number;
  isActive?: boolean;
}

export interface CreateSystemPromptRequest {
  promptKey: string;
  promptName: string;
  promptCategory: string;
  promptContent: string;
  variables?: string;
  description?: string;
}

export interface UpdateSystemPromptRequest {
  promptName?: string;
  promptContent?: string;
  variables?: string;
  description?: string;
  isActive?: boolean;
}

export interface CreateTestAttachmentRequest {
  attachmentName: string;
  attachmentType: string;
  fileUrl?: string;
  mimeType?: string;
  description?: string;
  useCase?: string;
  expectedOutput?: string;
  displayOrder?: number;
}

export interface UpdateTestAttachmentRequest {
  attachmentName?: string;
  description?: string;
  useCase?: string;
  expectedOutput?: string;
  displayOrder?: number;
  isActive?: boolean;
}

export interface UpdateSettingRequest {
  settingValue?: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdateFeatureFlagRequest {
  isEnabled?: boolean;
  rolloutPercentage?: number;
  allowedUserIds?: string;
  metadata?: string;
}
