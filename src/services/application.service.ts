import { api } from '@/lib/api';
import { Company } from './company.service';
import { Resume } from './resume.service';

export interface Application {
  id?: string;
  _id?: string;
  companyId: string;
  companyName?: string;
  companyTitle?: string;
  resumeId: string;
  roleTitle: string;
  status: string; // e.g., 'applied', 'interview', 'rejected'
  createdAt: string;
  updatedAt: string;
  // Included relations if any
  company?: Company;
  resume?: Resume;
}

export const applicationService = {
  async getAll(page = 1, limit = 10) {
    const response = await api.get(`/api/v1/applications?page=${page}&limit=${limit}`);
    return response.data;
  },

  async getById(id: string) {
    const response = await api.get(`/api/v1/applications/${id}`);
    return response.data;
  },

  async create(data: { companyId: string; resumeId: string; roleTitle: string }) {
    const response = await api.post('/api/v1/applications', data);
    return response.data;
  },

  async update(id: string, data: { status: string }) {
    const response = await api.patch(`/api/v1/applications/${id}`, data);
    return response.data;
  },

  async delete(id: string) {
    const response = await api.delete(`/api/v1/applications/${id}`);
    return response.data;
  },
};
