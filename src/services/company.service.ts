import { api } from '@/lib/api';

export interface Company {
  id?: string;
  name: string;
  website?: string;
  hrEmails?: string[];
  tags?: string[];
  logoUrl?: string;
  linkedinUrl?: string;
  topSkills?: string[];
  hiringRoles?: string[];
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

  async create(data: { name: string; website?: string; hrEmails?: string[]; tags?: string[]; logoUrl?: string; linkedinUrl?: string; topSkills?: string[]; hiringRoles?: string[] }) {
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
  
  async getTopSkills(limit = 15) {
    const response = await api.get(`/api/v1/companies/skills?limit=${limit}`);
    return response.data;
  }
};
