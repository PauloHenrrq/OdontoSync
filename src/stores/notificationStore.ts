// ============================================================
// OdontoSync — Notification Store (Zustand)
// ============================================================

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Notification, CareTip, NotificationChannel, NotificationStatus } from '@/src/types';
import { mockNotifications, mockCareTips } from '@/src/mocks/notifications';
import { NotificationApiService } from '@/src/services/notificationApiService';

interface NotificationState {
  notifications: Notification[];
  careTips: CareTip[];
  unreadCount: number;

  fetchNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  addNotification: (title: string, message: string) => void;
  getNotificationsByPhone: (phone: string) => Notification[];
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [...mockNotifications],
      careTips: [...mockCareTips],
      unreadCount: mockNotifications.filter((n) => !n.read).length,

      fetchNotifications: async () => {
        const serverNotifications = await NotificationApiService.getAll();
        set((state) => {
          const existingIds = new Set(serverNotifications.map((n) => n.id));
          const localOnly = state.notifications.filter((n) => !existingIds.has(n.id));
          const merged = [...serverNotifications, ...localOnly].sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          return {
            notifications: merged,
            unreadCount: merged.filter((n) => !n.read).length,
          };
        });
      },

      markAsRead: (notificationId) => {
        NotificationApiService.markAsRead(notificationId).catch(() => {});
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
        NotificationApiService.markAllAsRead().catch(() => {});
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
          unreadCount: 0,
        }));
      },

      addNotification: (title, message) => {
        set((state) => {
          const newNotification: Notification = {
            id: `ntf_${Date.now()}`,
            phone: '',
            channel: NotificationChannel.PUSH,
            title,
            message,
            read: false,
            createdAt: new Date().toISOString(),
            status: NotificationStatus.SENT,
          };
          const updated = [newNotification, ...state.notifications];
          return {
            notifications: updated,
            unreadCount: updated.filter((n) => !n.read).length,
          };
        });
      },

      getNotificationsByPhone: (phone) => {
        return get().notifications.filter((n) => n.phone === phone);
      },
    }),
    {
      name: 'odontosync-notifications',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        notifications: state.notifications,
        unreadCount: state.unreadCount,
      }),
    }
  )
);
