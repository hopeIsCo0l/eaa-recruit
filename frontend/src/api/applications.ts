import apiClient from './client'

export type ApplicationStatus =
  | 'SUBMITTED'
  | 'AI_SCREENING'
  | 'HARD_FILTER_FAILED'
  | 'EXAM_AUTHORIZED'
  | 'EXAM_COMPLETED'
  | 'SHORTLISTED'
  | 'INTERVIEW_SCHEDULED'
  | 'SELECTED'
  | 'REJECTED'
  | 'WAITLISTED'

export interface Application {
  id: number
  jobId: number
  jobTitle: string
  candidateName?: string
  status: ApplicationStatus
  cvRelevanceScore?: number
  examScore?: number
  hardFilterPassed?: boolean
  finalScore?: number
  submittedAt: string
  interviewSlotDate?: string
  interviewSlotTime?: string
}

export interface FeedbackReport {
  applicationId: number
  jobTitle: string
  status: ApplicationStatus
  cvRelevanceScore?: number
  examScore?: number
  hardFilterPassed?: boolean
  finalScore?: number
  xaiReportUrl?: string
  decisionNotes?: string
}

export const applicationsApi = {
  submit: (jobId: number, cv: File) => {
    const form = new FormData()
    form.append('jobId', String(jobId))
    form.append('cv', cv)
    return apiClient.post<{ data: Application }>('/applications', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  list: () =>
    apiClient.get<{ data: Application[] }>('/applications/my'),

  get: (id: number) =>
    apiClient.get<{ data: Application }>(`/applications/${id}`),

  getFeedback: (id: number) =>
    apiClient.get<{ data: FeedbackReport }>(`/applications/${id}/feedback`),

  bookSlot: (id: number, slotId: number) =>
    apiClient.post(`/applications/${id}/book-slot`, { slotId }),

  shortlist: (applicationIds: number[]) =>
    apiClient.post('/applications/shortlist', { applicationIds }),

  recordDecision: (id: number, decision: string, notes?: string) =>
    apiClient.post(`/applications/${id}/decision`, { decision, notes }),

  getXaiReport: (id: number) =>
    apiClient.get(`/applications/${id}/xai-report`, { responseType: 'blob' }),

  listByJob: (jobId: number) =>
    apiClient.get<{ data: Application[] }>(`/applications`, { params: { jobId } }),

  authorizeExamBatch: (examId: number, applicationIds: number[]) =>
    apiClient.post(`/exams/${examId}/authorize-batch`, { applicationIds }),

  authorizeExam: (applicationIds: number[]) =>
    apiClient.post('/applications/authorize-exam', { applicationIds }),
}
