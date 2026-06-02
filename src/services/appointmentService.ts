import { Appointment, AppointmentStatus, BookingDTO } from '@/src/types';
import { api } from './api';

export const AppointmentService = {
  getAll: async (): Promise<Appointment[]> => {
    try {
      const response = await api.get<{ appointments: Appointment[] }>('/appointments');
      return response.appointments;
    } catch (error) {
      return [];
    }
  },

  getByDate: async (date: string): Promise<Appointment[]> => {
    try {
      const response = await api.get<{ appointments: Appointment[] }>(`/appointments/by-date/${date}`);
      return response.appointments;
    } catch (error) {
      return [];
    }
  },

  book: async (userId: string, phone: string, booking: BookingDTO): Promise<Appointment | null> => {
    try {
      const response = await api.post<{ appointment: Appointment }>('/appointments', {
        ...booking,
        phone,
      });
      return response.appointment;
    } catch (error) {
      return null;
    }
  },

  updateStatus: async (appointmentId: string, status: AppointmentStatus): Promise<boolean> => {
    try {
      await api.patch(`/appointments/${appointmentId}/status`, { status });
      return true;
    } catch (error) {
      return false;
    }
  }
};
