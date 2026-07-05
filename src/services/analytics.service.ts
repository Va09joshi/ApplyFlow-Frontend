import { api } from '@/lib/api';

export interface Analytics {
  id?: string;
  metricDate: string;
  sentCount: number;
  responsesCount: number;
  interviewsCount?: number;
  createdAt: string;
  updatedAt: string;
}

export const analyticsService = {
  async create(data: { metricDate: string; sentCount: number; responsesCount: number }) {
    const response = await api.post('/api/v1/analytics', data);
    return response.data;
  },

  async getAll(page = 1, limit = 10) {
    const response = await api.get(`/api/v1/analytics?page=${page}&limit=${limit}`);
    return response.data;
  },

  async getById(id: string) {
    const response = await api.get(`/api/v1/analytics/${id}`);
    return response.data;
  },

  async update(id: string, data: Partial<Analytics>) {
    const response = await api.patch(`/api/v1/analytics/${id}`, data);
    return response.data;
  },

  async delete(id: string) {
    const response = await api.delete(`/api/v1/analytics/${id}`);
    return response.data;
  },
};
