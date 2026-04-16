import apiClient from './client'

export interface User {
  id: number
  email: string
  fullName: string
  role: string
  active: boolean
  createdAt: string
}

export interface CreateRecruiterRequest {
  fullName: string
  email: string
  password: string
}

export interface AuditLog {
  id: number
  entityType: string
  entityId: number
  oldStatus?: string
  newStatus: string
  changedByEmail?: string
  changedAt: string
  reason?: string
}

export interface AiModel {
  id: number
  modelVersion: string
  description?: string
  active: boolean
  activatedAt: string
  createdAt: string
}

export interface SystemHealth {
  database: { up: boolean; activeConnections: number; idleConnections: number }
  redis: { up: boolean; info: string }
  kafka: { up: boolean; details: string }
  uptimeSeconds: number
}

export const adminApi = {
  listUsers: () =>
    apiClient.get<{ data: User[] }>('/admin/users'),

  createRecruiter: (data: CreateRecruiterRequest) =>
    apiClient.post('/admin/recruiters', data),

  setUserStatus: (id: number, active: boolean) =>
    apiClient.patch(`/admin/users/${id}/status`, { active }),

  getAuditLogs: (page = 0, size = 20) =>
    apiClient.get<{ data: AuditLog[] }>('/admin/audit-logs', { params: { page, size } }),

  getSystemHealth: () =>
    apiClient.get<{ data: SystemHealth }>('/admin/system/health'),

  getAnalytics: () =>
    apiClient.get<{ data: { jobs: { jobTitle: string; total: number; avgScore: number; selected: number; rejected: number; waitlisted: number }[] } }>('/analytics/export'),

  listAiModels: () =>
    apiClient.get<{ data: AiModel[] }>('/admin/ai-models'),

  getActiveAiModel: () =>
    apiClient.get<{ data: AiModel }>('/admin/ai-models/active'),

  registerAiModel: (modelVersion: string, description: string) =>
    apiClient.post<{ data: AiModel }>('/admin/ai-models', { modelVersion, description }),

  activateAiModel: (id: number) =>
    apiClient.post<{ data: AiModel }>(`/admin/ai-models/${id}/activate`),
}
