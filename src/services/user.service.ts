import { api } from '@/lib/api';

export const userService = {
  async getProfile() {
    const response = await api.get('/api/v1/users/me');
    return response.data;
  },
  
  async uploadAvatar(file: File) {
    const formData = new FormData();
    formData.append('avatar', file);
    const response = await api.post('/api/v1/users/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }
};
