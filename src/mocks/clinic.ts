// ============================================================
// OdontoSync — Mock: Dados da Clínica
// ============================================================

import { ClinicConfig, DashboardKPIs, TeamMember } from '@/src/types';

export const mockClinicConfig: ClinicConfig = {
  id: 'clinic_001',
  name: 'Odonto Excell',
  address: 'Av. Paulista, 1000 - São Paulo, SP',
  phone: '(11) 3333-4444',
  logoUrl: undefined,
  absenceReduction: true,
  reminderHoursBefore: '24',
  confirmationTemplate:
    'Olá {nome}! Sua consulta na Odonto Excell está confirmada para {data} às {hora}. Caso precise reagendar, acesse o app ou ligue para {telefone}.',
  cancellationTemplate:
    'Olá {nome}, notamos que sua consulta de {data} foi cancelada. Gostaríamos de reagendar. Acesse o app ou fale conosco.',
};

export const mockDashboardKPIs: DashboardKPIs = {
  confirmedToday: 24,
  pendingContact: 8,
  absenceRate: 4.2,
};

export const mockTeamMembers: TeamMember[] = [
  {
    id: 'team_001',
    name: 'Administrador Geral',
    role: 'admin',
    permissions: 'Acesso total ao sistema',
  },
  {
    id: 'team_002',
    name: 'Recepção',
    role: 'receptionist',
    permissions: 'Agendamentos e Cadastro',
  },
];
