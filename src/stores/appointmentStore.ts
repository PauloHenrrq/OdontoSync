// ============================================================
// OdontoSync — Appointment Store (Zustand)
// Gerencia agendamentos do paciente e da clínica.
// ============================================================

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import {
  Appointment,
  AppointmentStatus,
  BookingDTO,
} from '@/src/types';
import { AppointmentService } from '@/src/services/appointmentService';

export interface AppointmentState {
  appointments: Appointment[];
  isLoading: boolean;
}

export interface AppointmentActions {
  // Load actions
  fetchAppointments: () => Promise<void>;

  // Patient actions
  getMyAppointments: (userId: string) => Appointment[];
  getNextAppointment: (userId: string) => Appointment | undefined;
  bookAppointment: (userId: string, phone: string, booking: BookingDTO) => Promise<boolean>;
  cancelAppointment: (appointmentId: string) => Promise<void>;
  updateAppointmentStatus: (appointmentId: string, status: AppointmentStatus) => Promise<void>;

  // Admin actions
  getTodayAppointments: (date: string) => Appointment[];
}

export type AppointmentStore = AppointmentState & AppointmentActions;

export const useAppointmentStore = create<AppointmentStore>()(
  subscribeWithSelector((set, get) => ({
    // State
    appointments: [],
    isLoading: false,

    // Actions
    fetchAppointments: async () => {
      set({ isLoading: true });
      const rawAppointments = await AppointmentService.getAll();
      // Normaliza datas ISO completas (ex: "2026-05-21T10:00:00.000Z") para "YYYY-MM-DD"
      const appointments = rawAppointments.map((a) => ({
        ...a,
        date: a.date?.includes('T') ? a.date.split('T')[0] : a.date,
      }));
      set({ appointments, isLoading: false });
    },

    getMyAppointments: (userId) => {
      return get().appointments.filter((a) => a.userId === userId);
    },

    getNextAppointment: (userId) => {
      const today = new Date().toISOString().split('T')[0] ?? '';
      return get()
        .appointments.filter(
          (a) =>
            a.userId === userId &&
            a.date >= today &&
            (a.status === AppointmentStatus.CONFIRMED ||
              a.status === AppointmentStatus.PENDING)
        )
        .sort((a, b) => a.date.localeCompare(b.date))[0];
    },

    bookAppointment: async (userId, phone, booking) => {
      set({ isLoading: true });
      const newAppointment = await AppointmentService.book(userId, phone, booking);

      if (newAppointment) {
        // Normaliza a data retornada pela API para bater com o filtro local (YYYY-MM-DD)
        newAppointment.date = newAppointment.date?.includes('T')
          ? newAppointment.date.split('T')[0]
          : newAppointment.date;

        set((state) => ({
          appointments: [...state.appointments, newAppointment],
          isLoading: false,
        }));
        return true;
      }
      
      set({ isLoading: false });
      return false;
    },

    cancelAppointment: async (appointmentId) => {
      await get().updateAppointmentStatus(appointmentId, AppointmentStatus.CANCELLED);
    },

    getTodayAppointments: (date) => {
      return get()
        .appointments.filter((a) => a.date === date)
        .sort((a, b) => a.time.localeCompare(b.time));
    },

    updateAppointmentStatus: async (appointmentId, status) => {
      const success = await AppointmentService.updateStatus(appointmentId, status);
      if (success) {
        set((state) => ({
          appointments: state.appointments.map((a) =>
            a.id === appointmentId
              ? { ...a, status, updatedAt: new Date().toISOString() }
              : a
          ),
        }));
      }
    },
  }))
);
