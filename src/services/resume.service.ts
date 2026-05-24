import { api } from '@/lib/api';

export interface Resume {
  id?: string;
  _id?: string;
  name: string;
  fileUrl?: string;
  createdAt: string;
  updatedAt: string;
  // Extracted data depending on ATS fields
  tags?: string[];
  size?: string;
  isDefault?: boolean;
  parsedText?: string;
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
    
    const response = await api.post('/api/v1/resumes/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
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
