import { api } from '@/lib/api';

export interface Job {
  id?: string;
  id?: string;
  title: string;
  companyName?: string;
  company?: string;
  companyLogoUrl?: string;
  location?: string;
  salary?: string;
  linkedinUrl?: string;
  applyUrl?: string;
  verified?: boolean;
  status: string;
  notes?: string;
  postedAt?: string;
  experienceLevel?: string;
  employmentType?: string;
  level?: string;
  createdAt: string;
  updatedAt: string;
}

export const jobsService = {
  async getAll(page = 1, limit = 20) {
    const response = await api.get(`/api/v1/jobs?page=${page}&limit=${limit}`);
    return response.data;
  },

  async getById(id: string) {
    const response = await api.get(`/api/v1/jobs/${id}`);
    return response.data;
  },

  async generateSuggestions(payload: { 
    resumeId?: string; 
    targetRole?: string; 
    location?: string; 
    count?: number;
    employmentType?: string;
    experienceLevel?: string;
    preferredCompanies?: string[];
    avoidCompanies?: string[];
    skills?: string[];
  }) {
    const response = await api.post('/api/v1/jobs/suggestions', payload);
    return response.data;
  },

  async save(job: Partial<Job>) {
    const response = await api.post('/api/v1/jobs/save', job);
    return response.data;
  },

  async update(id: string, data: Partial<Job>) {
    const response = await api.patch(`/api/v1/jobs/${id}`, data);
    return response.data;
  },

  async delete(id: string) {
    const response = await api.delete(`/api/v1/jobs/${id}`);
    return response.data;
  },
};
