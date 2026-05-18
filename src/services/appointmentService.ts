import { Appointment, AppointmentStatus, BookingDTO } from '@/src/types';
import { mockAppointments } from '@/src/mocks/appointments';
import { mockServices } from '@/src/mocks/services';

export const AppointmentService = {
  getAll: async (): Promise<Appointment[]> => {
    return [...mockAppointments];
  },

  getByUserId: async (userId: string): Promise<Appointment[]> => {
    return mockAppointments.filter((a) => a.userId === userId);
  },

  getByDate: async (date: string): Promise<Appointment[]> => {
    return mockAppointments
      .filter((a) => a.date === date)
      .sort((a, b) => a.time.localeCompare(b.time));
  },

  book: async (userId: string, phone: string, booking: BookingDTO): Promise<Appointment> => {
    // Simula latência de rede
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const service = mockServices.find((s) => s.id === booking.serviceId);

    // TODO: Substituir por chamada real à API
    const newAppointment: Appointment = {
      id: `apt_new_${Date.now()}`,
      phone,
      userId,
      serviceId: booking.serviceId,
      service,
      dentistName: booking.dentistName,
      date: booking.date,
      time: booking.time,
      status: AppointmentStatus.PENDING,
      notes: booking.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return newAppointment;
  },

  updateStatus: async (appointmentId: string, status: AppointmentStatus): Promise<boolean> => {
    // Simula latência de rede
    await new Promise((resolve) => setTimeout(resolve, 500));
    // TODO: Substituir por chamada real à API
    return true;
  }
};
