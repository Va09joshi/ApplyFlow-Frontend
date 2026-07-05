import { api } from '@/lib/api';

export interface GmailStatus {
  id: string;
  email: string;
  name: string;
  avatar: string;
  provider: string;
  isDeleted: boolean;
  createdAt: string;
  expiresAt: string;
}

export interface EmailPayload {
  to: string;
  subject: string;
  body?: string;
  html?: string;
  plainText: string;
  fromEmail: string;
  contentType: string;
  useTemplate?: boolean;
  insertResumeLink?: boolean;
  resumeUrl?: string;
  resumeLinkLabel?: string;
  attachResume?: boolean;
  attachments?: { name: string; url: string }[];
}

export const emailService = {
  async queue(data: EmailPayload) {
    const response = await api.post('/api/v1/emails/queue', data);
    return response.data;
  },

  async preview(data: EmailPayload) {
    const response = await api.post('/api/v1/emails/preview', data);
    return response.data;
  },

  async getAuthUrl() {
    const response = await api.get('/api/v1/gmail/connect', {
      params: { _t: Date.now() },
      headers: { 'Cache-Control': 'no-cache' }
    });
    return response.data;
  },

  async getStatus(): Promise<{ success: boolean; data: GmailStatus | null }> {
    try {
      const response = await api.get('/api/v1/gmail/status', {
        params: { _t: Date.now() },
        headers: { 'Cache-Control': 'no-cache' }
      });
      const data = response.data;
      console.log('[Gmail Status] Raw backend response:', JSON.stringify(data));
      
      if (data?.success && data?.data?.connected && data?.data?.accounts?.length > 0) {
        const account = data.data.accounts[0];
        // Ensure id is available since the frontend might expect it
        if (account.id) {
          
        }
        return { success: true, data: account as GmailStatus };
      }
      
      return { success: false, data: null };
    } catch {
      return { success: false, data: null };
    }
  },

  async handleCallback(code: string, state?: string | null): Promise<{ success: boolean; message: string; data: GmailStatus | null }> {
    try {
      const url = state ? `/api/v1/gmail/callback?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}` : `/api/v1/gmail/callback?code=${encodeURIComponent(code)}`;
      const response = await api.get(url);
      return response.data;
    } catch {
      return { success: false, message: 'Failed to connect Gmail', data: null };
    }
  },

  async disconnect(): Promise<{ success: boolean }> {
    try {
      const response = await api.delete('/api/v1/gmail/disconnect');
      return response.data;
    } catch {
      return { success: false };
    }
  },

  async bulkCsv(
    file: File,
    options?: {
      useTemplate?: boolean;
      attachResume?: boolean;
      insertResumeLink?: boolean;
      resumeLinkLabel?: string;
      resumeId?: string;
      contentType?: string;
    }
  ) {
    const formData = new FormData();
    formData.append('file', file);
    if (options) {
      if (options.useTemplate !== undefined) formData.append('useTemplate', String(options.useTemplate));
      if (options.attachResume !== undefined) formData.append('attachResume', String(options.attachResume));
      if (options.insertResumeLink !== undefined) formData.append('insertResumeLink', String(options.insertResumeLink));
      if (options.resumeLinkLabel !== undefined) formData.append('resumeLinkLabel', options.resumeLinkLabel);
      if (options.resumeId !== undefined) formData.append('resumeId', options.resumeId);
      if (options.contentType !== undefined) formData.append('contentType', options.contentType);
    }
    const response = await api.post('/api/v1/emails/bulk-csv', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }
};
