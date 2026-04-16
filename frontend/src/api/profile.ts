import apiClient from './client'

export interface CandidateProfile {
  heightCm?: number
  weightKg?: number
  degree?: string
  fieldOfStudy?: string
  graduationYear?: number
  phoneNumber?: string
}

export const profileApi = {
  get: () =>
    apiClient.get<{ data: CandidateProfile }>('/candidates/profile'),

  update: (data: CandidateProfile) =>
    apiClient.put('/candidates/profile', data),
}
