import { api } from '@/lib/api';

export const aiService = {
  async generate(data: { type: string; payload: any }) {
    const response = await api.post('/api/v1/ai/generate', data);
    return response.data;
  }
};
