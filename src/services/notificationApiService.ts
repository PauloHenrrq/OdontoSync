// ============================================================
// OdontoSync — Patient Notification API Service
// Endpoints de sincronização de alertas do paciente.
// ============================================================

import { api } from './api';
import { Notification } from '@/src/types';

export const NotificationApiService = {
  async getAll(): Promise<Notification[]> {
    try {
      const data = await api.get<{ notifications: Notification[] }>('/notifications');
      return data.notifications || [];
    } catch (error) {
      console.error('[NotificationApiService.getAll] Error:', error);
      return [];
    }
  },

  async markAsRead(id: string): Promise<boolean> {
    try {
      await api.patch(`/notifications/${id}/read`, {});
      return true;
    } catch (error) {
      console.error('[NotificationApiService.markAsRead] Error:', error);
      return false;
    }
  },

  async markAllAsRead(): Promise<boolean> {
    try {
      await api.patch('/notifications/read-all', {});
      return true;
    } catch (error) {
      console.error('[NotificationApiService.markAllAsRead] Error:', error);
      return false;
    }
  },
};
