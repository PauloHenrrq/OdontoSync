// ============================================================
// OdontoSync — Mock: Usuários
// Dados estáticos para desenvolvimento Design First.
// ============================================================

import { User, UserRole, EntityStatus } from '@/src/types';

export const mockUsers: User[] = [
  {
    id: 'usr_admin_001',
    name: 'Dra. Carolina Mendes',
    email: 'carolina@odontosync.com',
    phone: '(11) 99888-7766',
    role: UserRole.ADMIN,
    status: EntityStatus.ACTIVE,
    avatarUrl: undefined,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-10-10T08:30:00Z',
  },
  {
    id: 'usr_patient_001',
    name: 'Ana Paula Santos',
    email: 'ana.santos@email.com',
    phone: '(11) 98765-4321',
    role: UserRole.PATIENT,
    status: EntityStatus.ACTIVE,
    avatarUrl: undefined,
    createdAt: '2024-03-20T14:00:00Z',
    updatedAt: '2024-10-12T09:15:00Z',
  },
  {
    id: 'usr_patient_002',
    name: 'Mariana Costa',
    email: 'mariana.costa@email.com',
    phone: '(11) 97654-3210',
    role: UserRole.PATIENT,
    status: EntityStatus.ACTIVE,
    avatarUrl: undefined,
    createdAt: '2024-04-10T11:00:00Z',
    updatedAt: '2024-10-14T16:00:00Z',
  },
  {
    id: 'usr_patient_003',
    name: 'Ricardo Alves',
    email: 'ricardo.alves@email.com',
    phone: '(11) 96543-2109',
    role: UserRole.PATIENT,
    status: EntityStatus.ACTIVE,
    avatarUrl: undefined,
    createdAt: '2024-05-05T09:30:00Z',
    updatedAt: '2024-10-13T10:45:00Z',
  },
  {
    id: 'usr_patient_004',
    name: 'Felipe Oliveira',
    email: 'felipe.oliveira@email.com',
    phone: '(11) 95432-1098',
    role: UserRole.PATIENT,
    status: EntityStatus.ACTIVE,
    avatarUrl: undefined,
    createdAt: '2024-06-15T13:00:00Z',
    updatedAt: '2024-10-11T14:30:00Z',
  },
];

/** Credenciais mock para login em desenvolvimento */
export const mockCredentials = [
  { emailOrPhone: 'carolina@odontosync.com', password: 'Admin123', role: UserRole.ADMIN },
  { emailOrPhone: '(11) 99888-7766', password: 'Admin123', role: UserRole.ADMIN },
  { emailOrPhone: 'ana.santos@email.com', password: 'Paciente123', role: UserRole.PATIENT },
  { emailOrPhone: '(11) 98765-4321', password: 'Paciente123', role: UserRole.PATIENT },
];

export const findUserByCredentials = (
  emailOrPhone: string,
  password: string
): User | undefined => {
  const cred = mockCredentials.find(
    (c) => c.emailOrPhone === emailOrPhone && c.password === password
  );
  if (!cred) return undefined;
  return mockUsers.find(
    (u) =>
      u.email === cred.emailOrPhone ||
      u.phone === cred.emailOrPhone
  );
};
