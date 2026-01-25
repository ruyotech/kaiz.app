import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080';

interface ApiResponse<T> {
  data: T;
  success: boolean;
  errors?: string[];
}

interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async getHeaders(): Promise<HeadersInit> {
    const token = await AsyncStorage.getItem('accessToken');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers = await this.getHeaders();
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Try to refresh token
        const refreshed = await this.refreshToken();
        if (refreshed) {
          // Retry the request
          const newHeaders = await this.getHeaders();
          const retryResponse = await fetch(`${this.baseUrl}${endpoint}`, {
            ...options,
            headers: {
              ...newHeaders,
              ...options.headers,
            },
          });
          if (retryResponse.ok) {
            return retryResponse.json();
          }
        }
        // Token refresh failed, clear tokens
        await AsyncStorage.multiRemove(['accessToken', 'refreshToken']);
        throw new Error('Session expired. Please login again.');
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Request failed with status ${response.status}`);
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  private async refreshToken(): Promise<boolean> {
    const refreshToken = await AsyncStorage.getItem('refreshToken');
    if (!refreshToken) {
      return false;
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/v1/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        await AsyncStorage.setItem('accessToken', data.accessToken);
        await AsyncStorage.setItem('refreshToken', data.refreshToken);
        return true;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
    }

    return false;
  }

  get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  put<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  patch<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

const apiClient = new ApiClient(API_BASE_URL);

// ============= Auth API =============
export const authApi = {
  async login(email: string, password: string) {
    const data = await apiClient.post<{
      accessToken: string;
      refreshToken: string;
      user: any;
    }>('/api/v1/auth/login', { email, password });

    await AsyncStorage.setItem('accessToken', data.accessToken);
    await AsyncStorage.setItem('refreshToken', data.refreshToken);
    return data.user;
  },

  async register(email: string, password: string, fullName: string) {
    const data = await apiClient.post<{
      accessToken: string;
      refreshToken: string;
      user: any;
    }>('/api/v1/auth/register', { email, password, fullName });

    await AsyncStorage.setItem('accessToken', data.accessToken);
    await AsyncStorage.setItem('refreshToken', data.refreshToken);
    return data.user;
  },

  async logout() {
    try {
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      if (refreshToken) {
        await apiClient.post('/api/v1/auth/logout', { refreshToken });
      }
    } finally {
      await AsyncStorage.multiRemove(['accessToken', 'refreshToken']);
    }
  },

  async getCurrentUser() {
    return apiClient.get<any>('/api/v1/auth/me');
  },
};

// ============= Life Wheel API =============
export const lifeWheelApi = {
  async getLifeWheelAreas() {
    return apiClient.get<any[]>('/api/v1/life-wheel-areas');
  },

  async getEisenhowerQuadrants() {
    return apiClient.get<any[]>('/api/v1/eisenhower-quadrants');
  },
};

// ============= Sprint API =============
export const sprintApi = {
  async getSprints(year?: number) {
    const params = year ? `?year=${year}` : '';
    return apiClient.get<any[]>(`/api/v1/sprints${params}`);
  },

  async getCurrentSprint() {
    return apiClient.get<any>('/api/v1/sprints/current');
  },

  async getSprintById(id: string) {
    return apiClient.get<any>(`/api/v1/sprints/${id}`);
  },

  async getUpcomingSprints(limit: number = 4) {
    return apiClient.get<any[]>(`/api/v1/sprints/upcoming?limit=${limit}`);
  },
};

// ============= Epic API =============
export const epicApi = {
  async getEpics(status?: string) {
    const params = status ? `?status=${status}` : '';
    return apiClient.get<any[]>(`/api/v1/epics${params}`);
  },

  async getEpicById(id: string) {
    return apiClient.get<any>(`/api/v1/epics/${id}`);
  },

  async createEpic(data: any) {
    return apiClient.post<any>('/api/v1/epics', data);
  },

  async updateEpic(id: string, data: any) {
    return apiClient.put<any>(`/api/v1/epics/${id}`, data);
  },

  async deleteEpic(id: string) {
    return apiClient.delete(`/api/v1/epics/${id}`);
  },
};

// ============= Task API =============
export const taskApi = {
  async getTasks(page: number = 0, size: number = 20) {
    return apiClient.get<PaginatedResponse<any>>(`/api/v1/tasks?page=${page}&size=${size}`);
  },

  async getTasksBySprint(sprintId: string) {
    return apiClient.get<any[]>(`/api/v1/tasks/sprint/${sprintId}`);
  },

  async getTasksByEpic(epicId: string) {
    return apiClient.get<any[]>(`/api/v1/tasks/epic/${epicId}`);
  },

  async getTasksByStatus(status: string) {
    return apiClient.get<any[]>(`/api/v1/tasks/status/${status}`);
  },

  async getDraftTasks() {
    return apiClient.get<any[]>('/api/v1/tasks/drafts');
  },

  async getBacklogTasks() {
    return apiClient.get<any[]>('/api/v1/tasks/backlog');
  },

  async getTaskById(id: string) {
    return apiClient.get<any>(`/api/v1/tasks/${id}`);
  },

  async createTask(data: any) {
    return apiClient.post<any>('/api/v1/tasks', data);
  },

  async updateTask(id: string, data: any) {
    return apiClient.put<any>(`/api/v1/tasks/${id}`, data);
  },

  async updateTaskStatus(id: string, status: string) {
    return apiClient.patch<any>(`/api/v1/tasks/${id}/status`, { status });
  },

  async deleteTask(id: string) {
    return apiClient.delete(`/api/v1/tasks/${id}`);
  },

  async getTaskHistory(taskId: string) {
    return apiClient.get<any[]>(`/api/v1/tasks/${taskId}/history`);
  },

  async getTaskComments(taskId: string) {
    return apiClient.get<any[]>(`/api/v1/tasks/${taskId}/comments`);
  },

  async addTaskComment(taskId: string, data: { commentText: string; isAiGenerated?: boolean }) {
    return apiClient.post<any>(`/api/v1/tasks/${taskId}/comments`, data);
  },
};

// ============= Template API =============
export const templateApi = {
  async getTemplates() {
    return apiClient.get<any[]>('/api/v1/templates');
  },

  async getTemplateById(id: string) {
    return apiClient.get<any>(`/api/v1/templates/${id}`);
  },

  async createTemplate(data: any) {
    return apiClient.post<any>('/api/v1/templates', data);
  },

  async updateTemplate(id: string, data: any) {
    return apiClient.put<any>(`/api/v1/templates/${id}`, data);
  },

  async deleteTemplate(id: string) {
    return apiClient.delete(`/api/v1/templates/${id}`);
  },
};

// ============= Challenge API =============
export const challengeApi = {
  async getChallengeTemplates(lifeWheelAreaId?: string) {
    const params = lifeWheelAreaId ? `?lifeWheelAreaId=${lifeWheelAreaId}` : '';
    return apiClient.get<any[]>(`/api/v1/challenges/templates${params}`);
  },

  async getChallengeTemplateById(id: string) {
    return apiClient.get<any>(`/api/v1/challenges/templates/${id}`);
  },

  async getChallenges(status?: string) {
    const params = status ? `?status=${status}` : '';
    return apiClient.get<any[]>(`/api/v1/challenges${params}`);
  },

  async getActiveChallenges() {
    return apiClient.get<any[]>('/api/v1/challenges/active');
  },

  async getChallengeById(id: string) {
    return apiClient.get<any>(`/api/v1/challenges/${id}`);
  },

  async createChallenge(data: any) {
    return apiClient.post<any>('/api/v1/challenges', data);
  },

  async updateChallenge(id: string, data: any) {
    return apiClient.put<any>(`/api/v1/challenges/${id}`, data);
  },

  async deleteChallenge(id: string) {
    return apiClient.delete(`/api/v1/challenges/${id}`);
  },

  async getChallengeEntries(challengeId: string) {
    return apiClient.get<any[]>(`/api/v1/challenges/${challengeId}/entries`);
  },

  async logChallengeEntry(challengeId: string, data: {
    entryDate: string;
    valueNumeric?: number;
    valueBoolean?: boolean;
    note?: string;
  }) {
    return apiClient.post<any>(`/api/v1/challenges/${challengeId}/entries`, data);
  },

  async inviteParticipant(challengeId: string, data: {
    userId: string;
    isAccountabilityPartner?: boolean;
  }) {
    return apiClient.post<any>(`/api/v1/challenges/${challengeId}/participants`, data);
  },
};

// ============= Notification API =============
export const notificationApi = {
  async getNotifications(page: number = 0, size: number = 20) {
    return apiClient.get<PaginatedResponse<any>>(`/api/v1/notifications?page=${page}&size=${size}`);
  },

  async getUnreadNotifications() {
    return apiClient.get<any[]>('/api/v1/notifications/unread');
  },

  async getUnreadCount() {
    const result = await apiClient.get<{ count: number }>('/api/v1/notifications/unread-count');
    return result.count;
  },

  async markAsRead(id: string) {
    return apiClient.put<any>(`/api/v1/notifications/${id}/read`, {});
  },

  async markAllAsRead() {
    return apiClient.put('/api/v1/notifications/read-all', {});
  },
};

// ============= Unified API Export =============
export const api = {
  auth: authApi,
  lifeWheel: lifeWheelApi,
  sprints: sprintApi,
  epics: epicApi,
  tasks: taskApi,
  templates: templateApi,
  challenges: challengeApi,
  notifications: notificationApi,
};

export default api;
