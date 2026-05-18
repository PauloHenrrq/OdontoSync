// ============================================================
// OdontoSync — Notification Store (Zustand)
// ============================================================

import { create } from 'zustand';
import { Notification, CareTip } from '@/src/types';
import { mockNotifications, mockCareTips } from '@/src/mocks/notifications';

interface NotificationState {
  notifications: Notification[];
  careTips: CareTip[];
  unreadCount: number;

  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  getNotificationsByPhone: (phone: string) => Notification[];
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [...mockNotifications],
  careTips: [...mockCareTips],
  unreadCount: mockNotifications.filter((n) => !n.read).length,

  markAsRead: (notificationId) => {
    set((state) => {
      const updated = state.notifications.map((n) =>
        n.id === notificationId ? { ...n, read: true } : n
      );
      return {
        notifications: updated,
        unreadCount: updated.filter((n) => !n.read).length,
      };
    });
  },

  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    }));
  },

  getNotificationsByPhone: (phone) => {
    return get().notifications.filter((n) => n.phone === phone);
  },
}));
