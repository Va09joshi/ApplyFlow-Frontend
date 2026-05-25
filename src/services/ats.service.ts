import { api } from '@/lib/api';

export interface ATSRecord {
  id?: string;
  _id?: string;
  resumeId: string;
  jobDescription: string;
  matchPercent: number; // Changed from matchScore
  scoreBreakdown: {
    skills: number;
    experience: number;
    education: number;
    keywords: number;
  };
  matchedKeywords: string[];
  missingKeywords?: string[];
  feedback?: string;
  strengths?: string[];
  weaknesses: string[];
  recommendations: string[];
  suggestions: string[];
  createdAt: string;
}

export const atsService = {
  async analyze(data: { resumeId: string; jobDescription: string }) {
    const response = await api.post('/api/v1/ats/analyze', data);
    return response.data;
  },

  async getAll(page = 1, limit = 10) {
    const response = await api.get(`/api/v1/ats?page=${page}&limit=${limit}`);
    return response.data;
  },

  async getById(id: string) {
    const response = await api.get(`/api/v1/ats/${id}`);
    return response.data;
  },
};
