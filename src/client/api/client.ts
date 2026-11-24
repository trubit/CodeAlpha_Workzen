import { ResponseEnvelope } from '../../shared/types/index.js';

export interface ApiClientConfig {
  baseUrl: string;
  timeoutMs?: number;
}

const DEFAULT_CONFIG: ApiClientConfig = {
  baseUrl: (import.meta as any).env?.VITE_API_URL || '/api/v1',
  timeoutMs: 15000
};

export class ApiError extends Error {
  code: string;
  statusCode: number;
  details?: any;

  constructor(message: string, code: string = 'API_ERROR', statusCode: number = 500, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

export class WorkzenApiClient {
  private baseUrl: string;
  private timeoutMs: number;
  private token: string | null = null;
  private activeOrgId: string | null = null;
  private activeWorkspaceId: string | null = null;
  private onAuthErrorCallback: (() => void) | null = null;
  private isRefreshing = false;
  private refreshPromise: Promise<string | null> | null = null;

  private async tryRefreshToken(): Promise<string | null> {
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }
    this.isRefreshing = true;
    this.refreshPromise = (async () => {
      try {
        const refreshUrl = `${this.baseUrl}/auth/refresh-token`;
        const res = await fetch(refreshUrl, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });
        if (!res.ok) return null;
        const json = await res.json();
        if (json.success && json.data?.accessToken) {
          this.setAuthToken(json.data.accessToken);
          return json.data.accessToken as string;
        }
        return null;
      } catch {
        return null;
      } finally {
        this.isRefreshing = false;
        this.refreshPromise = null;
      }
    })();
    return this.refreshPromise;
  }

  constructor(config: ApiClientConfig = DEFAULT_CONFIG) {
    this.baseUrl = config.baseUrl;
    this.timeoutMs = config.timeoutMs || 15000;
    if (typeof window !== 'undefined') {
      const savedToken = localStorage.getItem('workzen_auth_token');
      if (savedToken) {
        this.token = savedToken;
      }
    }
  }

  setAuthToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('workzen_auth_token', token);
      } else {
        localStorage.removeItem('workzen_auth_token');
      }
    }
  }

  getAuthToken(): string | null {
    return this.token;
  }

  setOnAuthError(callback: () => void) {
    this.onAuthErrorCallback = callback;
  }

  setActiveOrganisation(orgId: string | null) {
    this.activeOrgId = orgId;
  }

  setActiveWorkspace(wsId: string | null) {
    this.activeWorkspaceId = wsId;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ResponseEnvelope<T>> {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(options.headers as Record<string, string>)
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    if (this.activeOrgId) {
      headers['X-Organisation-Id'] = this.activeOrgId;
    }

    if (this.activeWorkspaceId) {
      headers['X-Workspace-Id'] = this.activeWorkspaceId;
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(url, {
        credentials: 'include',
        ...options,
        headers,
        signal: controller.signal
      });

      clearTimeout(timer);

      const data: ResponseEnvelope<T> = await response.json().catch(() => ({
        success: response.ok,
        error: {
          code: response.ok ? 'OK' : 'UNKNOWN_ERROR',
          message: response.statusText || 'Unexpected server response'
        }
      }));

      if (!response.ok || !data.success) {
        if (response.status === 401) {
          // If 401 on regular endpoint (not auth endpoint), attempt transparent session refresh
          if (
            !endpoint.includes('/auth/login') &&
            !endpoint.includes('/auth/register') &&
            !endpoint.includes('/auth/refresh-token')
          ) {
            const newToken = await this.tryRefreshToken();
            if (newToken) {
              // Retry original request once with fresh access token
              return this.request<T>(endpoint, options);
            }
          }

          // If refresh failed or unauthorized on auth route, purge stale credentials and notify
          this.setAuthToken(null);
          this.activeOrgId = null;
          this.activeWorkspaceId = null;
          if (this.onAuthErrorCallback) {
            this.onAuthErrorCallback();
          }
        }

        throw new ApiError(
          data.error?.message || `Request failed with status ${response.status}`,
          data.error?.code || `HTTP_${response.status}`,
          response.status,
          data.error?.details
        );
      }

      return data;
    } catch (err: any) {
      clearTimeout(timer);
      if (err.name === 'AbortError') {
        throw new ApiError('Request timed out. Please check your connection.', 'TIMEOUT', 408);
      }
      if (err instanceof ApiError) {
        throw err;
      }
      const friendlyMessage =
        err.message === 'Failed to fetch'
          ? 'Unable to connect to the server. Please check your connection and try again.'
          : err.message || 'Unable to complete network request. Please try again.';
      throw new ApiError(friendlyMessage, 'NETWORK_ERROR', 0);
    }
  }

  get<T>(endpoint: string, options?: RequestInit): Promise<ResponseEnvelope<T>> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  post<T>(endpoint: string, body?: any, options?: RequestInit): Promise<ResponseEnvelope<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined
    });
  }

  put<T>(endpoint: string, body?: any, options?: RequestInit): Promise<ResponseEnvelope<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined
    });
  }

  delete<T>(endpoint: string, options?: RequestInit): Promise<ResponseEnvelope<T>> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  patch<T>(endpoint: string, body?: any, options?: RequestInit): Promise<ResponseEnvelope<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined
    });
  }

  // Phase 6: Organization API Endpoints
  async createOrganisation(data: any): Promise<ResponseEnvelope<any>> {
    return this.post('/organizations', data);
  }

  async listOrganisations(): Promise<ResponseEnvelope<any>> {
    if (!this.token) {
      return { success: false, data: { organisations: [] } };
    }
    return this.get('/organizations');
  }

  async getCurrentUser(): Promise<ResponseEnvelope<any>> {
    return this.get('/auth/me');
  }

  async getOrganisation(id: string): Promise<ResponseEnvelope<any>> {
    return this.get(`/organizations/${id}`);
  }

  async updateOrganisation(id: string, data: any): Promise<ResponseEnvelope<any>> {
    return this.patch(`/organizations/${id}`, data);
  }

  async updateOrganisationSettings(id: string, data: any): Promise<ResponseEnvelope<any>> {
    return this.patch(`/organizations/${id}/settings`, data);
  }

  async updateOrganisationLogo(id: string, logoUrl: string): Promise<ResponseEnvelope<any>> {
    return this.patch(`/organizations/${id}/logo`, { logoUrl });
  }

  async selectOrganisation(id: string): Promise<ResponseEnvelope<any>> {
    this.setActiveOrganisation(id);
    return this.post<any>(`/organizations/${id}/select`);
  }

  async transferOrganisationOwnership(id: string, newOwnerId: string): Promise<ResponseEnvelope<any>> {
    return this.post(`/organizations/${id}/transfer-ownership`, {
      newOwnerId,
      confirmation: 'TRANSFER'
    });
  }

  async deleteOrganisation(id: string, orgNameConfirmation: string): Promise<ResponseEnvelope<any>> {
    return this.request(`/organizations/${id}`, {
      method: 'DELETE',
      body: JSON.stringify({ orgNameConfirmation })
    });
  }

  async listOrganisationMembers(id: string): Promise<ResponseEnvelope<any>> {
    return this.get(`/organizations/${id}/members`);
  }

  // Phase 7: Workspace API Endpoints
  async listWorkspaces(orgId: string): Promise<ResponseEnvelope<any>> {
    return this.get(`/workspaces?organisationId=${orgId}`);
  }

  async createWorkspace(orgId: string, data: any): Promise<ResponseEnvelope<any>> {
    return this.post(`/workspaces`, { ...data, organisationId: orgId });
  }

  async getWorkspace(id: string): Promise<ResponseEnvelope<any>> {
    return this.get(`/workspaces/${id}`);
  }

  async updateWorkspace(id: string, data: any): Promise<ResponseEnvelope<any>> {
    return this.patch(`/workspaces/${id}`, data);
  }

  async updateWorkspaceSettings(id: string, data: any): Promise<ResponseEnvelope<any>> {
    return this.patch(`/workspaces/${id}/settings`, data);
  }

  async selectWorkspace(id: string): Promise<ResponseEnvelope<any>> {
    this.setActiveWorkspace(id);
    return this.post<any>(`/workspaces/${id}/select`);
  }

  async archiveWorkspace(id: string, confirmationName: string): Promise<ResponseEnvelope<any>> {
    return this.post(`/workspaces/${id}/archive`, { confirmationName });
  }

  async restoreWorkspace(id: string): Promise<ResponseEnvelope<any>> {
    return this.post(`/workspaces/${id}/restore`);
  }

  // Phase 9: Team Management API Endpoints
  async listTeamMembers(
    orgId: string,
    params?: {
      search?: string;
      role?: string;
      status?: string;
      workspaceId?: string;
      page?: number;
      limit?: number;
    }
  ): Promise<ResponseEnvelope<any>> {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.role) query.set('role', params.role);
    if (params?.status) query.set('status', params.status);
    if (params?.workspaceId) query.set('workspaceId', params.workspaceId);
    if (params?.page) query.set('page', params.page.toString());
    if (params?.limit) query.set('limit', params.limit.toString());
    const qs = query.toString();
    return this.get(`/organizations/${orgId}/team/members${qs ? `?${qs}` : ''}`);
  }

  async getTeamMember(orgId: string, memberId: string): Promise<ResponseEnvelope<any>> {
    return this.get(`/organizations/${orgId}/team/members/${memberId}`);
  }

  async updateTeamMemberRole(orgId: string, memberId: string, role: string): Promise<ResponseEnvelope<any>> {
    return this.patch(`/organizations/${orgId}/team/members/${memberId}/role`, { role });
  }

  async updateTeamMemberStatus(orgId: string, memberId: string, status: string): Promise<ResponseEnvelope<any>> {
    return this.patch(`/organizations/${orgId}/team/members/${memberId}/status`, { status });
  }

  async removeTeamMember(orgId: string, memberId: string): Promise<ResponseEnvelope<any>> {
    return this.request(`/organizations/${orgId}/team/members/${memberId}`, { method: 'DELETE' });
  }

  async updateTeamMemberWorkspaces(
    orgId: string,
    memberId: string,
    workspaces: { workspaceId: string; role?: string }[]
  ): Promise<ResponseEnvelope<any>> {
    return this.patch(`/organizations/${orgId}/team/members/${memberId}/workspaces`, { workspaces });
  }

  async createTeamInvitation(
    orgId: string,
    data: { email: string; role?: string; workspaceIds?: string[] }
  ): Promise<ResponseEnvelope<any>> {
    return this.post(`/organizations/${orgId}/team/invitations`, data);
  }

  async listTeamInvitations(orgId: string, status?: string): Promise<ResponseEnvelope<any>> {
    return this.get(`/organizations/${orgId}/team/invitations${status ? `?status=${status}` : ''}`);
  }

  async resendTeamInvitation(orgId: string, invitationId: string): Promise<ResponseEnvelope<any>> {
    return this.post(`/organizations/${orgId}/team/invitations/${invitationId}/resend`);
  }

  async cancelTeamInvitation(orgId: string, invitationId: string): Promise<ResponseEnvelope<any>> {
    return this.request(`/organizations/${orgId}/team/invitations/${invitationId}`, { method: 'DELETE' });
  }

  async verifyInvitation(token: string): Promise<ResponseEnvelope<any>> {
    return this.get(`/invitations/verify?token=${encodeURIComponent(token)}`);
  }

  async acceptInvitation(token: string): Promise<ResponseEnvelope<any>> {
    return this.post(`/invitations/accept`, { token });
  }

  async getTeamAuditHistory(orgId: string, limit?: number): Promise<ResponseEnvelope<any>> {
    return this.get(`/organizations/${orgId}/team/audit${limit ? `?limit=${limit}` : ''}`);
  }

  // Phase 10: Enterprise Dashboard API Integration
  async getDashboardOverview(query?: { workspaceId?: string; dateRange?: string; projectId?: string }): Promise<ResponseEnvelope<any>> {
    const params = new URLSearchParams();
    if (query?.workspaceId) params.append('workspaceId', query.workspaceId);
    if (query?.dateRange) params.append('dateRange', query.dateRange);
    if (query?.projectId) params.append('projectId', query.projectId);
    const qs = params.toString();
    return this.get(`/dashboard/overview${qs ? `?${qs}` : ''}`);
  }

  async getDashboardMyTasks(query?: { workspaceId?: string; status?: string; priority?: string; limit?: number }): Promise<ResponseEnvelope<any>> {
    const params = new URLSearchParams();
    if (query?.workspaceId) params.append('workspaceId', query.workspaceId);
    if (query?.status) params.append('status', query.status);
    if (query?.priority) params.append('priority', query.priority);
    if (query?.limit) params.append('limit', query.limit.toString());
    const qs = params.toString();
    return this.get(`/dashboard/my-tasks${qs ? `?${qs}` : ''}`);
  }

  async getDashboardActivity(query?: { workspaceId?: string; limit?: number }): Promise<ResponseEnvelope<any>> {
    const params = new URLSearchParams();
    if (query?.workspaceId) params.append('workspaceId', query.workspaceId);
    if (query?.limit) params.append('limit', query.limit.toString());
    const qs = params.toString();
    return this.get(`/dashboard/activity${qs ? `?${qs}` : ''}`);
  }

  async getDashboardAnalytics(query?: { workspaceId?: string; dateRange?: string }): Promise<ResponseEnvelope<any>> {
    const params = new URLSearchParams();
    if (query?.workspaceId) params.append('workspaceId', query.workspaceId);
    if (query?.dateRange) params.append('dateRange', query.dateRange);
    const qs = params.toString();
    return this.get(`/dashboard/analytics${qs ? `?${qs}` : ''}`);
  }

  // Phase 11 & 12: Project Management & Project Members
  async listProjects(query?: any): Promise<ResponseEnvelope<any>> {
    const params = new URLSearchParams();
    if (query?.workspaceId) params.append('workspaceId', query.workspaceId);
    if (query?.status) params.append('status', query.status);
    if (query?.priority) params.append('priority', query.priority);
    if (query?.search) params.append('search', query.search);
    if (query?.visibility) params.append('visibility', query.visibility);
    if (query?.sortBy) params.append('sortBy', query.sortBy);
    if (query?.sortOrder) params.append('sortOrder', query.sortOrder);
    if (query?.page) params.append('page', query.page.toString());
    if (query?.limit) params.append('limit', query.limit.toString());
    if (query?.isArchived !== undefined) params.append('isArchived', query.isArchived.toString());
    const qs = params.toString();
    return this.get(`/projects${qs ? `?${qs}` : ''}`);
  }

  async getProject(id: string): Promise<ResponseEnvelope<any>> {
    return this.get(`/projects/${id}`);
  }

  async createProject(data: any): Promise<ResponseEnvelope<any>> {
    return this.post('/projects', data);
  }

  async updateProject(id: string, data: any): Promise<ResponseEnvelope<any>> {
    return this.patch(`/projects/${id}`, data);
  }

  async updateProjectStatus(id: string, status: string): Promise<ResponseEnvelope<any>> {
    return this.patch(`/projects/${id}/status`, { status });
  }

  async updateProjectPriority(id: string, priority: string): Promise<ResponseEnvelope<any>> {
    return this.patch(`/projects/${id}/priority`, { priority });
  }

  async transferProjectOwner(id: string, newOwnerId: string): Promise<ResponseEnvelope<any>> {
    return this.post(`/projects/${id}/transfer-owner`, { newOwnerId });
  }

  async archiveProject(id: string, confirmationName: string): Promise<ResponseEnvelope<any>> {
    return this.post(`/projects/${id}/archive`, { confirmationName });
  }

  async restoreProject(id: string): Promise<ResponseEnvelope<any>> {
    return this.post(`/projects/${id}/restore`);
  }

  async deleteProject(id: string, confirmationName: string): Promise<ResponseEnvelope<any>> {
    return this.request(`/projects/${id}`, {
      method: 'DELETE',
      body: JSON.stringify({ confirmationName })
    });
  }

  async getProjectActivity(id: string, limit?: number): Promise<ResponseEnvelope<any>> {
    return this.get(`/projects/${id}/activity${limit ? `?limit=${limit}` : ''}`);
  }

  // Phase 12: Project Members & Collaboration API Endpoints
  async listProjectMembers(
    projectId: string,
    query?: { search?: string; role?: string; page?: number; limit?: number }
  ): Promise<ResponseEnvelope<any>> {
    const params = new URLSearchParams();
    if (query?.search) params.append('search', query.search);
    if (query?.role) params.append('role', query.role);
    if (query?.page) params.append('page', query.page.toString());
    if (query?.limit) params.append('limit', query.limit.toString());
    const qs = params.toString();
    return this.get(`/projects/${projectId}/members${qs ? `?${qs}` : ''}`);
  }

  async getEligibleOrganisationMembers(projectId: string, search?: string): Promise<ResponseEnvelope<any>> {
    const qs = search ? `?search=${encodeURIComponent(search)}` : '';
    return this.get(`/projects/${projectId}/eligible-members${qs}`);
  }

  async addProjectMembers(
    projectId: string,
    memberIds: string[],
    role: 'lead' | 'contributor' | 'observer' = 'contributor'
  ): Promise<ResponseEnvelope<any>> {
    return this.post(`/projects/${projectId}/members`, { memberIds, role });
  }

  async updateProjectMemberRole(
    projectId: string,
    memberId: string,
    role: 'lead' | 'contributor' | 'observer'
  ): Promise<ResponseEnvelope<any>> {
    return this.patch(`/projects/${projectId}/members/${memberId}/role`, { role });
  }

  async removeProjectMember(projectId: string, memberId: string): Promise<ResponseEnvelope<any>> {
    return this.delete(`/projects/${projectId}/members/${memberId}`);
  }

  async getProjectMemberActivity(projectId: string, limit?: number): Promise<ResponseEnvelope<any>> {
    return this.get(`/projects/${projectId}/members/activity${limit ? `?limit=${limit}` : ''}`);
  }

  // Phase 13: Project Kanban Board API Endpoints
  async getKanbanBoard(projectId: string, query?: any): Promise<ResponseEnvelope<any>> {
    const params = new URLSearchParams();
    if (query?.search) params.append('search', query.search);
    if (query?.assigneeId) params.append('assigneeId', query.assigneeId);
    if (query?.priority) params.append('priority', query.priority);
    if (query?.dueDate) params.append('dueDate', query.dueDate);
    if (query?.sortBy) params.append('sortBy', query.sortBy);
    const qs = params.toString();
    return this.get(`/projects/${projectId}/kanban${qs ? `?${qs}` : ''}`);
  }

  async createKanbanTask(projectId: string, data: any): Promise<ResponseEnvelope<any>> {
    return this.post(`/projects/${projectId}/tasks`, data);
  }

  async moveKanbanTask(
    projectId: string,
    taskId: string,
    targetStatus: string,
    targetOrder?: number
  ): Promise<ResponseEnvelope<any>> {
    return this.patch(`/projects/${projectId}/kanban/tasks/${taskId}/move`, {
      targetStatus,
      targetOrder
    });
  }

  async reorderKanbanColumn(
    projectId: string,
    status: string,
    orderedTaskIds: string[]
  ): Promise<ResponseEnvelope<any>> {
    return this.patch(`/projects/${projectId}/kanban/reorder`, {
      status,
      orderedTaskIds
    });
  }

  // Phase 14: Task Management Endpoints
  async listTasks(query?: any): Promise<ResponseEnvelope<any>> {
    const params = new URLSearchParams();
    if (query?.projectId) params.append('projectId', query.projectId);
    if (query?.workspaceId) params.append('workspaceId', query.workspaceId);
    if (query?.status) params.append('status', query.status);
    if (query?.priority) params.append('priority', query.priority);
    if (query?.assigneeId) params.append('assigneeId', query.assigneeId);
    if (query?.search) params.append('search', query.search);
    if (query?.dueDate) params.append('dueDate', query.dueDate);
    if (query?.isArchived !== undefined) params.append('isArchived', String(query.isArchived));
    if (query?.page) params.append('page', String(query.page));
    if (query?.limit) params.append('limit', String(query.limit));
    if (query?.sortBy) params.append('sortBy', query.sortBy);
    if (query?.sortOrder) params.append('sortOrder', query.sortOrder);
    const qs = params.toString();
    return this.get(`/tasks${qs ? `?${qs}` : ''}`);
  }

  async getTask(taskId: string): Promise<ResponseEnvelope<any>> {
    return this.get(`/tasks/${taskId}`);
  }

  async createTask(data: any): Promise<ResponseEnvelope<any>> {
    return this.post('/tasks', data);
  }

  async updateTask(taskId: string, data: any): Promise<ResponseEnvelope<any>> {
    return this.patch(`/tasks/${taskId}`, data);
  }

  async updateTaskStatus(taskId: string, status: string): Promise<ResponseEnvelope<any>> {
    return this.patch(`/tasks/${taskId}/status`, { status });
  }

  async updateTaskPriority(taskId: string, priority: string): Promise<ResponseEnvelope<any>> {
    return this.patch(`/tasks/${taskId}/priority`, { priority });
  }

  async assignTask(taskId: string, assigneeIds: string[]): Promise<ResponseEnvelope<any>> {
    return this.patch(`/tasks/${taskId}/assignees`, { assigneeIds });
  }

  async archiveTask(taskId: string): Promise<ResponseEnvelope<any>> {
    return this.post(`/tasks/${taskId}/archive`, {});
  }

  async restoreTask(taskId: string): Promise<ResponseEnvelope<any>> {
    return this.post(`/tasks/${taskId}/restore`, {});
  }

  async deleteTask(taskId: string): Promise<ResponseEnvelope<any>> {
    return this.delete(`/tasks/${taskId}`);
  }

  async getTaskActivity(taskId: string, limit?: number): Promise<ResponseEnvelope<any>> {
    return this.get(`/tasks/${taskId}/activity${limit ? `?limit=${limit}` : ''}`);
  }

  // Phase 15: Subtasks & Dependencies
  async createSubtask(taskId: string, data: any): Promise<ResponseEnvelope<any>> {
    return this.post(`/tasks/${taskId}/subtasks`, data);
  }

  async getSubtasks(taskId: string): Promise<ResponseEnvelope<any>> {
    return this.get(`/tasks/${taskId}/subtasks`);
  }

  async addDependency(taskId: string, prerequisiteTaskId: string): Promise<ResponseEnvelope<any>> {
    return this.post(`/tasks/${taskId}/dependencies`, { prerequisiteTaskId });
  }

  async removeDependency(taskId: string, prerequisiteTaskId: string): Promise<ResponseEnvelope<any>> {
    return this.delete(`/tasks/${taskId}/dependencies/${prerequisiteTaskId}`);
  }

  async getDependencies(taskId: string): Promise<ResponseEnvelope<any>> {
    return this.get(`/tasks/${taskId}/dependencies`);
  }

  // Phase 16: Task Comments & Discussions
  async getTaskComments(taskId: string, query?: { page?: number; limit?: number; parentId?: string }): Promise<ResponseEnvelope<any>> {
    const params = new URLSearchParams();
    if (query?.page) params.set('page', query.page.toString());
    if (query?.limit) params.set('limit', query.limit.toString());
    if (query?.parentId) params.set('parentId', query.parentId);
    const qs = params.toString();
    return this.get(`/tasks/${taskId}/comments${qs ? `?${qs}` : ''}`);
  }

  async createTaskComment(
    taskId: string,
    data: { content: string; parentId?: string | null; mentions?: string[] }
  ): Promise<ResponseEnvelope<any>> {
    return this.post(`/tasks/${taskId}/comments`, data);
  }

  async updateComment(commentId: string, data: { content: string }): Promise<ResponseEnvelope<any>> {
    return this.patch(`/comments/${commentId}`, data);
  }

  async deleteComment(commentId: string): Promise<ResponseEnvelope<any>> {
    return this.delete(`/comments/${commentId}`);
  }

  async getMentionableMembers(taskId: string, search?: string): Promise<ResponseEnvelope<any>> {
    return this.get(`/tasks/${taskId}/mentionable-members${search ? `?search=${encodeURIComponent(search)}` : ''}`);
  }

  // Convenience Health Checker
  async checkHealth(): Promise<ResponseEnvelope<any>> {
    return this.get('/health');
  }
}

export const apiClient = new WorkzenApiClient();

