import { api } from '@/lib/api';
import { ResumeBuilderData } from '@/types/resume';

export interface Resume {
  id?: string;
  name: string;
  fileUrl?: string;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
  size?: string;
  isDefault?: boolean;
  parsedText?: string;
  isBuilt?: boolean;
  builderData?: ResumeBuilderData;
}

export const resumeService = {
  async getAll(page = 1, limit = 10) {
    const response = await api.get(`/api/v1/resumes?page=${page}&limit=${limit}`);
    return response.data;
  },

  async getById(id: string) {
    const response = await api.get(`/api/v1/resumes/${id}`);
    return response.data;
  },

  async create(data: { name: string; fileUrl: string }) {
    const response = await api.post('/api/v1/resumes', data);
    return response.data;
  },

  async upload(file: File, name: string) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', name);
    
    // Bypass Next.js API proxy specifically for file uploads to avoid boundary/chunked encoding corruption
    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    const uploadUrl = backendUrl.replace(/\/$/, '') + '/api/v1/resumes/upload';
    
    const response = await api.post(uploadUrl, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async saveBuilderResume(data: ResumeBuilderData) {
    const name = data.personalInfo.fullName
      ? `${data.personalInfo.fullName} – Resume`
      : "Untitled Resume";
    const response = await api.post('/api/v1/resumes', {
      name,
      isBuilt: true,
      builderData: data,
    });
    return response.data;
  },

  async update(id: string, data: Partial<Resume>) {
    const response = await api.patch(`/api/v1/resumes/${id}`, data);
    return response.data;
  },

  async delete(id: string) {
    const response = await api.delete(`/api/v1/resumes/${id}`);
    return response.data;
  },
};
