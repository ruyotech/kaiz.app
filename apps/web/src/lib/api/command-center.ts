/**
 * Command Center Admin API Functions
 * Manages LLM providers, system prompts, test attachments, settings, and feature flags
 */

import type {
  LlmProvider,
  SystemPrompt,
  TestAttachment,
  CommandCenterSetting,
  FeatureFlag,
} from '@/types/command-center';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp?: string;
}

async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  const result: ApiResponse<T> = await response.json();
  return result.data;
}

// =============== LLM Providers ===============

export async function getAllProviders(token: string): Promise<LlmProvider[]> {
  return fetchApi<LlmProvider[]>('/api/v1/admin/command-center/providers', {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function getProvider(token: string, id: string): Promise<LlmProvider> {
  return fetchApi<LlmProvider>(`/api/v1/admin/command-center/providers/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function createProvider(
  token: string,
  provider: Partial<LlmProvider>
): Promise<LlmProvider> {
  return fetchApi<LlmProvider>('/api/v1/admin/command-center/providers', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(provider),
  });
}

export async function updateProvider(
  token: string,
  id: string,
  provider: Partial<LlmProvider>
): Promise<LlmProvider> {
  return fetchApi<LlmProvider>(`/api/v1/admin/command-center/providers/${id}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(provider),
  });
}

export async function setDefaultProvider(token: string, id: string): Promise<void> {
  return fetchApi<void>(`/api/v1/admin/command-center/providers/${id}/set-default`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function deleteProvider(token: string, id: string): Promise<void> {
  return fetchApi<void>(`/api/v1/admin/command-center/providers/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
}

// =============== System Prompts ===============

export async function getAllPrompts(token: string): Promise<SystemPrompt[]> {
  return fetchApi<SystemPrompt[]>('/api/v1/admin/command-center/prompts', {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function getPromptsByCategory(
  token: string,
  category: string
): Promise<SystemPrompt[]> {
  return fetchApi<SystemPrompt[]>(
    `/api/v1/admin/command-center/prompts/category/${category}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
}

export async function getPrompt(token: string, id: string): Promise<SystemPrompt> {
  return fetchApi<SystemPrompt>(`/api/v1/admin/command-center/prompts/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function getPromptByKey(token: string, key: string): Promise<SystemPrompt> {
  return fetchApi<SystemPrompt>(`/api/v1/admin/command-center/prompts/key/${key}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function createPrompt(
  token: string,
  prompt: Partial<SystemPrompt>
): Promise<SystemPrompt> {
  return fetchApi<SystemPrompt>('/api/v1/admin/command-center/prompts', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(prompt),
  });
}

export async function updatePrompt(
  token: string,
  id: string,
  prompt: Partial<SystemPrompt>
): Promise<SystemPrompt> {
  return fetchApi<SystemPrompt>(`/api/v1/admin/command-center/prompts/${id}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(prompt),
  });
}

export async function deletePrompt(token: string, id: string): Promise<void> {
  return fetchApi<void>(`/api/v1/admin/command-center/prompts/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
}

// =============== Test Attachments ===============

export async function getAllTestAttachments(token: string): Promise<TestAttachment[]> {
  return fetchApi<TestAttachment[]>('/api/v1/admin/command-center/test-attachments', {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function getTestAttachmentsByType(
  token: string,
  type: string
): Promise<TestAttachment[]> {
  return fetchApi<TestAttachment[]>(
    `/api/v1/admin/command-center/test-attachments/type/${type}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
}

export async function getTestAttachment(
  token: string,
  id: string
): Promise<TestAttachment> {
  return fetchApi<TestAttachment>(
    `/api/v1/admin/command-center/test-attachments/${id}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
}

export async function createTestAttachment(
  token: string,
  metadata: Partial<TestAttachment>,
  file?: File
): Promise<TestAttachment> {
  const formData = new FormData();
  
  // Create metadata blob with proper content type
  const metadataBlob = new Blob([JSON.stringify({
    attachmentName: metadata.attachmentName,
    attachmentType: metadata.attachmentType,
    mimeType: metadata.mimeType,
    description: metadata.description || '',
    useCase: metadata.useCase || 'general',
    expectedOutput: null,
    displayOrder: null,
  })], { type: 'application/json' });
  
  formData.append('metadata', metadataBlob);
  
  if (file) {
    formData.append('file', file);
  }

  const url = `${API_BASE_URL}/api/v1/admin/command-center/test-attachments`;
  console.log('Upload URL:', url);
  console.log('Token present:', !!token);
  console.log('Token length:', token?.length);
  console.log('Token prefix:', token?.substring(0, 50) + '...');

  const response = await fetch(url, {
      method: 'POST',
      headers: { 
        Authorization: `Bearer ${token}`,
        // Note: Don't set Content-Type for FormData, browser sets it with boundary
      },
      body: formData,
    }
  );

  console.log('Response status:', response.status);
  console.log('Response headers:', Object.fromEntries(response.headers.entries()));

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Upload error response:', errorText);
    throw new Error(`API Error: ${response.status} - ${errorText}`);
  }

  const result: ApiResponse<TestAttachment> = await response.json();
  return result.data;
}

export async function updateTestAttachment(
  token: string,
  id: string,
  attachment: Partial<TestAttachment>
): Promise<TestAttachment> {
  return fetchApi<TestAttachment>(
    `/api/v1/admin/command-center/test-attachments/${id}`,
    {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(attachment),
    }
  );
}

export async function deleteTestAttachment(token: string, id: string): Promise<void> {
  return fetchApi<void>(`/api/v1/admin/command-center/test-attachments/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function getTestAttachmentDownloadUrl(id: string): string {
  return `${API_BASE_URL}/api/v1/admin/command-center/test-attachments/${id}/download`;
}

// =============== Settings ===============

export async function getAllSettings(token: string): Promise<CommandCenterSetting[]> {
  return fetchApi<CommandCenterSetting[]>('/api/v1/admin/command-center/settings', {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function getSetting(
  token: string,
  key: string
): Promise<CommandCenterSetting> {
  return fetchApi<CommandCenterSetting>(
    `/api/v1/admin/command-center/settings/${key}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
}

export async function updateSetting(
  token: string,
  key: string,
  setting: { settingValue?: string; description?: string; isActive?: boolean }
): Promise<CommandCenterSetting> {
  return fetchApi<CommandCenterSetting>(
    `/api/v1/admin/command-center/settings/${key}`,
    {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(setting),
    }
  );
}

// =============== Feature Flags ===============

export async function getAllFeatureFlags(token: string): Promise<FeatureFlag[]> {
  return fetchApi<FeatureFlag[]>('/api/v1/admin/command-center/feature-flags', {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function getFeatureFlag(
  token: string,
  key: string
): Promise<FeatureFlag> {
  return fetchApi<FeatureFlag>(`/api/v1/admin/command-center/feature-flags/${key}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function updateFeatureFlag(
  token: string,
  key: string,
  flag: {
    isEnabled?: boolean;
    rolloutPercentage?: number;
    allowedUserIds?: string;
    metadata?: string;
  }
): Promise<FeatureFlag> {
  return fetchApi<FeatureFlag>(`/api/v1/admin/command-center/feature-flags/${key}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(flag),
  });
}
