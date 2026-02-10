/**
 * Command Center Service
 * Handles AI chat, smart input, drafts, and admin settings
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import {
  SmartInputRequest,
  SmartInputResponse,
  SmartInputAttachment,
  DraftActionRequest,
  DraftActionResponse,
  DraftPreview,
  TestAttachment,
  LlmProvider,
  SystemPrompt,
  ClarificationAnswer,
} from '../types/commandCenter';

// ============================================================================
// Configuration
// ============================================================================

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://kaiz-api-213334506754.us-central1.run.app';
const ACCESS_TOKEN_KEY = 'accessToken'; // Must match api.ts

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// ============================================================================
// Auth Helper
// ============================================================================

async function getAuthHeaders(): Promise<Record<string, string>> {
  const token = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
  if (token) {
    console.log('[CommandCenter] Token attached');
  } else {
    console.warn('[CommandCenter] No token found!');
  }
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// ============================================================================
// Command Center Service
// ============================================================================

export const commandCenterService = {
  // ==========================================================================
  // Smart Input / Chat
  // ==========================================================================

  /**
   * Send a message to the AI and get a response
   * Supports text, attachments, and voice transcription
   */
  async sendMessage(
    text: string | null,
    attachments: SmartInputAttachment[] = [],
    sessionId?: string
  ): Promise<ApiResponse<SmartInputResponse>> {
    console.log('[CommandCenter] Sending message...');
    console.log('[CommandCenter] Text:', text);
    console.log('[CommandCenter] Attachments:', attachments.length);
    console.log('[CommandCenter] Session:', sessionId);
    
    // Debug: Log each attachment details
    if (attachments.length > 0) {
      attachments.forEach((att, i) => {
        console.log(`[CommandCenter] Attachment[${i}]:`, JSON.stringify(att));
      });
    }

    try {
      const headers = await getAuthHeaders();

      // Use JSON endpoint for simplicity
      const request: SmartInputRequest = {
        text: text || undefined,
        attachments: attachments.length > 0 ? attachments : undefined,
        sessionId,
      };
      
      console.log('[CommandCenter] Full request:', JSON.stringify(request, null, 2));

      const response = await fetch(`${API_BASE_URL}/api/v1/command-center/smart-input`, {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[CommandCenter] Error:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('[CommandCenter] Response:', data);
      return data;
    } catch (error: any) {
      console.error('[CommandCenter] Error:', error);
      return {
        success: false,
        error: error.message || 'Failed to send message',
      };
    }
  },

  /**
   * Send multipart message with file attachments
   * Used when attaching images/files from device
   */
  async sendMessageWithFiles(
    text: string | null,
    files: Array<{ uri: string; name: string; mimeType: string }>,
    sessionId?: string
  ): Promise<ApiResponse<SmartInputResponse>> {
    console.log('[CommandCenter] Sending with files...');

    try {
      const headers = await getAuthHeaders();
      const formData = new FormData();

      if (text) {
        formData.append('text', text);
      }

      if (sessionId) {
        formData.append('sessionId', sessionId);
      }

      for (const file of files) {
        formData.append('attachments', {
          uri: file.uri,
          name: file.name,
          type: file.mimeType,
        } as any);
      }

      const response = await fetch(`${API_BASE_URL}/api/v1/command-center/process`, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      console.error('[CommandCenter] Error:', error);
      return {
        success: false,
        error: error.message || 'Failed to send message with files',
      };
    }
  },

  /**
   * Submit answers to clarification questions
   */
  async submitClarification(
    sessionId: string,
    answers: ClarificationAnswer[]
  ): Promise<ApiResponse<SmartInputResponse>> {
    console.log('[CommandCenter] Submitting clarification...');

    try {
      const headers = await getAuthHeaders();

      const response = await fetch(`${API_BASE_URL}/api/v1/command-center/smart-input/clarify`, {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          answers: answers.reduce((acc, a) => ({ ...acc, [a.fieldKey]: a.value }), {}),
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      console.error('[CommandCenter] Error:', error);
      return {
        success: false,
        error: error.message || 'Failed to submit clarification',
      };
    }
  },

  /**
   * Confirm or reject AI alternative suggestion
   */
  async confirmAlternative(
    sessionId: string,
    accepted: boolean
  ): Promise<ApiResponse<SmartInputResponse>> {
    console.log('[CommandCenter] Confirming alternative:', accepted);

    try {
      const headers = await getAuthHeaders();

      const response = await fetch(
        `${API_BASE_URL}/api/v1/command-center/smart-input/${sessionId}/confirm-alternative?accepted=${accepted}`,
        {
          method: 'POST',
          headers,
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      console.error('[CommandCenter] Error:', error);
      return {
        success: false,
        error: error.message || 'Failed to confirm alternative',
      };
    }
  },

  /**
   * Save draft as task with PENDING_APPROVAL status
   * This saves the AI-generated draft directly to the tasks table
   * for later approval by the user.
   */
  async saveToPending(
    sessionId: string
  ): Promise<ApiResponse<{ taskId: string; status: string; message: string }>> {
    console.log('[CommandCenter] Saving to pending:', sessionId);

    try {
      const headers = await getAuthHeaders();

      const response = await fetch(
        `${API_BASE_URL}/api/v1/command-center/smart-input/${sessionId}/save-to-pending`,
        {
          method: 'POST',
          headers,
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('[CommandCenter] Save result:', data);
      return data;
    } catch (error: any) {
      console.error('[CommandCenter] Error saving to pending:', error);
      return {
        success: false,
        error: error.message || 'Failed to save to pending',
      };
    }
  },

  /**
   * Create pending task directly from draft data
   * This bypasses session lookup and sends draft fields directly.
   * Useful when session has expired or user has edited fields.
   */
  async createPendingFromDraft(
    draftData: {
      draftType: string;
      title: string;
      description?: string;
      dueDate?: string; // yyyy-MM-dd
      priority?: string;
      storyPoints?: number;
      estimatedMinutes?: number;
      eisenhowerQuadrantId?: string;
      lifeWheelAreaId?: string;
      category?: string;
      tags?: string[];
      isRecurring?: boolean;
      date?: string; // yyyy-MM-dd
      startTime?: string; // HH:mm
      endTime?: string; // HH:mm
      location?: string;
      isAllDay?: boolean;
      attendees?: string[];
    }
  ): Promise<ApiResponse<{ taskId: string; status: string; message: string }>> {
    console.log('[CommandCenter] Creating pending from draft data:', draftData.title);

    try {
      const headers = await getAuthHeaders();

      const response = await fetch(
        `${API_BASE_URL}/api/v1/command-center/drafts/create-pending`,
        {
          method: 'POST',
          headers: {
            ...headers,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(draftData),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('[CommandCenter] Create pending result:', data);
      return data;
    } catch (error: any) {
      console.error('[CommandCenter] Error creating pending:', error);
      return {
        success: false,
        error: error.message || 'Failed to create pending task',
      };
    }
  },

  // ==========================================================================
  // Draft Actions
  // ==========================================================================

  /**
   * Approve a draft - creates the actual entity
   */
  async approveDraft(draftId: string): Promise<ApiResponse<DraftActionResponse>> {
    console.log('[CommandCenter] Approving draft:', draftId);

    try {
      const headers = await getAuthHeaders();

      const response = await fetch(`${API_BASE_URL}/api/v1/command-center/drafts/${draftId}/action`, {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          draftId,
          action: 'APPROVE',
          modifiedDraft: null,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('[CommandCenter] Draft approved:', data);
      return data;
    } catch (error: any) {
      console.error('[CommandCenter] Error:', error);
      return {
        success: false,
        error: error.message || 'Failed to approve draft',
      };
    }
  },

  /**
   * Reject a draft
   */
  async rejectDraft(draftId: string): Promise<ApiResponse<DraftActionResponse>> {
    console.log('[CommandCenter] Rejecting draft:', draftId);

    try {
      const headers = await getAuthHeaders();

      const response = await fetch(`${API_BASE_URL}/api/v1/command-center/drafts/${draftId}/action`, {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          draftId,
          action: 'REJECT',
          modifiedDraft: null,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      console.error('[CommandCenter] Error:', error);
      return {
        success: false,
        error: error.message || 'Failed to reject draft',
      };
    }
  },

  /**
   * Modify and approve a draft
   */
  async modifyAndApproveDraft(
    draftId: string,
    modifiedDraft: Partial<DraftPreview['draft']>
  ): Promise<ApiResponse<DraftActionResponse>> {
    console.log('[CommandCenter] Modifying draft:', draftId);

    try {
      const headers = await getAuthHeaders();

      const response = await fetch(`${API_BASE_URL}/api/v1/command-center/drafts/${draftId}/action`, {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          draftId,
          action: 'MODIFY',
          modifiedDraft,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      console.error('[CommandCenter] Error:', error);
      return {
        success: false,
        error: error.message || 'Failed to modify draft',
      };
    }
  },

  /**
   * Get all pending drafts (legacy - from PendingDraft table)
   */
  async getPendingDrafts(): Promise<ApiResponse<DraftPreview[]>> {
    console.log('[CommandCenter] Fetching pending drafts...');

    try {
      const headers = await getAuthHeaders();

      const response = await fetch(`${API_BASE_URL}/api/v1/command-center/drafts/pending`, {
        method: 'GET',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      console.error('[CommandCenter] Error:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch pending drafts',
      };
    }
  },

  /**
   * Get all tasks with PENDING_APPROVAL status
   * This is the new approach where AI drafts are saved directly as tasks
   */
  async getPendingApprovalTasks(): Promise<ApiResponse<any[]>> {
    console.log('[CommandCenter] Fetching pending approval tasks...');

    try {
      const headers = await getAuthHeaders();

      const response = await fetch(`${API_BASE_URL}/api/v1/tasks/status/PENDING_APPROVAL`, {
        method: 'GET',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('[CommandCenter] Pending tasks:', data);
      return data;
    } catch (error: any) {
      console.error('[CommandCenter] Error fetching pending tasks:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch pending tasks',
      };
    }
  },

  /**
   * Approve a pending task - changes status from PENDING_APPROVAL to TODO
   */
  async approvePendingTask(taskId: string): Promise<ApiResponse<any>> {
    console.log('[CommandCenter] Approving pending task:', taskId);

    try {
      const headers = await getAuthHeaders();

      const response = await fetch(`${API_BASE_URL}/api/v1/tasks/${taskId}/status`, {
        method: 'PATCH',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'TODO' }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('[CommandCenter] Task approved:', data);
      return data;
    } catch (error: any) {
      console.error('[CommandCenter] Error approving task:', error);
      return {
        success: false,
        error: error.message || 'Failed to approve task',
      };
    }
  },

  /**
   * Reject a pending task - deletes the task
   */
  async rejectPendingTask(taskId: string): Promise<ApiResponse<void>> {
    console.log('[CommandCenter] Rejecting pending task:', taskId);

    try {
      const headers = await getAuthHeaders();

      const response = await fetch(`${API_BASE_URL}/api/v1/tasks/${taskId}`, {
        method: 'DELETE',
        headers,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      return { success: true };
    } catch (error: any) {
      console.error('[CommandCenter] Error rejecting task:', error);
      return {
        success: false,
        error: error.message || 'Failed to reject task',
      };
    }
  },

  // ==========================================================================
  // Test Attachments (for simulator testing)
  // ==========================================================================

  /**
   * Get test attachments uploaded via admin
   */
  async getTestAttachments(type?: string): Promise<ApiResponse<TestAttachment[]>> {
    console.log('[CommandCenter] Fetching test attachments...');

    try {
      const headers = await getAuthHeaders();
      const url = type 
        ? `${API_BASE_URL}/api/v1/command-center/test-attachments?type=${type}`
        : `${API_BASE_URL}/api/v1/command-center/test-attachments`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      console.error('[CommandCenter] Error:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch test attachments',
      };
    }
  },

  /**
   * Download test attachment data
   */
  async downloadTestAttachment(attachmentId: string): Promise<ApiResponse<{ data: string; mimeType: string }>> {
    console.log('[CommandCenter] Downloading test attachment:', attachmentId);

    try {
      const headers = await getAuthHeaders();

      const response = await fetch(
        `${API_BASE_URL}/api/v1/command-center/test-attachments/${attachmentId}/download`,
        {
          method: 'GET',
          headers,
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const blob = await response.blob();
      const mimeType = response.headers.get('content-type') || 'application/octet-stream';
      
      // Convert blob to base64
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = (reader.result as string).split(',')[1];
          resolve({
            success: true,
            data: { data: base64, mimeType },
          });
        };
        reader.readAsDataURL(blob);
      });
    } catch (error: any) {
      console.error('[CommandCenter] Error:', error);
      return {
        success: false,
        error: error.message || 'Failed to download attachment',
      };
    }
  },

  // ==========================================================================
  // Settings (from admin)
  // ==========================================================================

  /**
   * Get active LLM providers
   */
  async getActiveProviders(): Promise<ApiResponse<LlmProvider[]>> {
    console.log('[CommandCenter] Fetching providers...');

    try {
      const headers = await getAuthHeaders();

      const response = await fetch(`${API_BASE_URL}/api/v1/command-center/settings/providers`, {
        method: 'GET',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        // Fallback - providers might not be exposed to regular users
        return { success: true, data: [] };
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      console.error('[CommandCenter] Error:', error);
      return { success: true, data: [] };
    }
  },

  /**
   * Get feature flags
   */
  async getFeatureFlags(): Promise<ApiResponse<Record<string, boolean>>> {
    console.log('[CommandCenter] Fetching feature flags...');

    try {
      const headers = await getAuthHeaders();

      const response = await fetch(`${API_BASE_URL}/api/v1/command-center/settings/features`, {
        method: 'GET',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        // Default flags
        return {
          success: true,
          data: {
            voice_input_enabled: true,
            image_input_enabled: true,
            file_input_enabled: true,
            clarification_enabled: true,
          },
        };
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      console.error('[CommandCenter] Error:', error);
      return {
        success: true,
        data: {
          voice_input_enabled: true,
          image_input_enabled: true,
          file_input_enabled: true,
          clarification_enabled: true,
        },
      };
    }
  },
};

export default commandCenterService;
