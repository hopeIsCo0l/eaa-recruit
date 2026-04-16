import apiClient from './client'

export interface JobPosting {
  id: number
  title: string
  description: string
  minHeightCm: number
  minWeightKg: number
  requiredDegree: string
  openDate: string
  closeDate: string
  examDate: string
  status: 'DRAFT' | 'OPEN' | 'CLOSED' | 'EXAM_SCHEDULED' | 'ARCHIVED'
}

export interface CreateJobRequest {
  title: string
  description: string
  minHeightCm: number
  minWeightKg: number
  requiredDegree: string
  openDate: string
  closeDate: string
  examDate: string
}

export const jobsApi = {
  list: (params?: { status?: string }) =>
    apiClient.get<{ data: JobPosting[] }>('/jobs', { params }),

  get: (id: number) =>
    apiClient.get<{ data: JobPosting }>(`/jobs/${id}`),

  create: (data: CreateJobRequest) =>
    apiClient.post<{ data: JobPosting }>('/jobs', data),

  archive: (id: number) =>
    apiClient.post(`/admin/jobs/${id}/archive`),
}
