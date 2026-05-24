import { api } from '@/lib/api';

export interface Company {
  id?: string;
  _id?: string;
  name: string;
  website?: string;
  hrEmails?: string[];
  tags?: string[];
  status?: string;
  createdAt: string;
  updatedAt: string;
}

export const companyService = {
  async getAll(page = 1, limit = 10) {
    const response = await api.get(`/api/v1/companies?page=${page}&limit=${limit}`);
    return response.data;
  },

  async getById(id: string) {
    const response = await api.get(`/api/v1/companies/${id}`);
    return response.data;
  },

  async create(data: { name: string; website?: string; hrEmails?: string[]; tags?: string[] }) {
    const response = await api.post('/api/v1/companies', data);
    return response.data;
  },

  async update(id: string, data: Partial<Company>) {
    const response = await api.patch(`/api/v1/companies/${id}`, data);
    return response.data;
  },

  async delete(id: string) {
    const response = await api.delete(`/api/v1/companies/${id}`);
    return response.data;
  },
};
