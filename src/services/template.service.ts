import { api } from '@/lib/api';

export interface Template {
  id?: string;
  name: string;
  subject: string;
  body: string;
  plainText?: string;
  linkLabel?: string;
  linkUrl?: string;
  placeholders?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export const templateService = {
  async create(data: { name: string; subject: string; body: string; plainText?: string; linkLabel?: string; linkUrl?: string; placeholders?: string[] }) {
    const response = await api.post('/api/v1/templates', data);
    return response.data;
  },

  async getAll(page = 1, limit = 10) {
    const response = await api.get(`/api/v1/templates?page=${page}&limit=${limit}`);
    return response.data;
  },

  async getById(id: string) {
    const response = await api.get(`/api/v1/templates/${id}`);
    return response.data;
  },

  async update(id: string, data: Partial<Template>) {
    const response = await api.patch(`/api/v1/templates/${id}`, data);
    return response.data;
  },

  async delete(id: string) {
    const response = await api.delete(`/api/v1/templates/${id}`);
    return response.data;
  },
};
