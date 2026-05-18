// ============================================================
// OdontoSync — Mock: Agendamentos
// ============================================================

import { Appointment, AppointmentStatus } from '@/src/types';

export const mockAppointments: Appointment[] = [
  {
    id: 'apt_001',
    phone: '(11) 97654-3210',
    userId: 'usr_patient_002',
    serviceId: 'svc_001',
    dentistName: 'Dra. Carolina Mendes',
    date: '2024-10-15',
    time: '08:30',
    status: AppointmentStatus.CONFIRMED,
    notes: 'Paciente com sensibilidade nos dentes posteriores.',
    createdAt: '2024-10-10T08:00:00Z',
    updatedAt: '2024-10-12T10:00:00Z',
  },
  {
    id: 'apt_002',
    phone: '(11) 96543-2109',
    userId: 'usr_patient_003',
    serviceId: 'svc_002',
    dentistName: 'Dr. Julian Smith',
    date: '2024-10-15',
    time: '09:15',
    status: AppointmentStatus.CONFIRMED,
    createdAt: '2024-10-08T14:00:00Z',
    updatedAt: '2024-10-08T14:00:00Z',
  },
  {
    id: 'apt_003',
    phone: '(11) 98765-4321',
    userId: 'usr_patient_001',
    serviceId: 'svc_003',
    dentistName: 'Dra. Carolina Mendes',
    date: '2024-10-15',
    time: '10:00',
    status: AppointmentStatus.PENDING,
    createdAt: '2024-10-09T09:30:00Z',
    updatedAt: '2024-10-09T09:30:00Z',
  },
  {
    id: 'apt_004',
    phone: '(11) 95432-1098',
    userId: 'usr_patient_004',
    serviceId: 'svc_004',
    dentistName: 'Dr. Rafael Lima',
    date: '2024-10-15',
    time: '11:30',
    status: AppointmentStatus.PENDING,
    createdAt: '2024-10-07T11:00:00Z',
    updatedAt: '2024-10-07T11:00:00Z',
  },
  {
    id: 'apt_005',
    phone: '(11) 98765-4321',
    userId: 'usr_patient_001',
    serviceId: 'svc_005',
    dentistName: 'Dr. Julian Smith',
    date: '2024-10-20',
    time: '14:30',
    status: AppointmentStatus.CONFIRMED,
    createdAt: '2024-10-05T16:00:00Z',
    updatedAt: '2024-10-12T08:00:00Z',
  },
  {
    id: 'apt_006',
    phone: '(11) 98765-4321',
    userId: 'usr_patient_001',
    serviceId: 'svc_001',
    dentistName: 'Dra. Carolina Mendes',
    date: '2024-09-20',
    time: '09:00',
    status: AppointmentStatus.COMPLETED,
    createdAt: '2024-09-15T10:00:00Z',
    updatedAt: '2024-09-20T10:00:00Z',
  },
  {
    id: 'apt_007',
    phone: '(11) 94321-0987',
    // userId ausente — agendamento "órfão" (paciente sem conta)
    serviceId: 'svc_008',
    dentistName: 'Dr. Julian Smith',
    date: '2024-10-16',
    time: '15:00',
    status: AppointmentStatus.PENDING,
    notes: 'Paciente sem app — contato via WhatsApp.',
    createdAt: '2024-10-14T12:00:00Z',
    updatedAt: '2024-10-14T12:00:00Z',
  },
];

/** Filtra agendamentos de um paciente pelo ID */
export const getAppointmentsByUser = (userId: string): Appointment[] =>
  mockAppointments.filter((a) => a.userId === userId);

/** Filtra agendamentos de uma data específica */
export const getAppointmentsByDate = (date: string): Appointment[] =>
  mockAppointments.filter((a) => a.date === date);

/** Próximo agendamento de um paciente */
export const getNextAppointment = (userId: string): Appointment | undefined => {
  const now = new Date().toISOString().split('T')[0];
  return mockAppointments
    .filter(
      (a) =>
        a.userId === userId &&
        a.date >= (now ?? '') &&
        (a.status === AppointmentStatus.CONFIRMED || a.status === AppointmentStatus.PENDING)
    )
    .sort((a, b) => a.date.localeCompare(b.date))[0];
};
