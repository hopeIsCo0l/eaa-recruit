import apiClient from './client'

export interface AvailabilitySlot {
  id: number
  slotDate: string
  startTime: string
  endTime: string
  booked: boolean
}

export const availabilityApi = {
  getMySlots: () =>
    apiClient.get<{ data: AvailabilitySlot[] }>('/recruiters/availability'),

  createSlots: (slots: { slotDate: string; startTime: string; endTime: string }[]) =>
    apiClient.post('/recruiters/availability/batch', { slots }),

  getAvailableSlots: () =>
    apiClient.get<{ data: AvailabilitySlot[] }>('/availability/available'),

  deleteSlot: (id: number) =>
    apiClient.delete(`/recruiters/availability/${id}`),
}
