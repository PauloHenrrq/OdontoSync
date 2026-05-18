// ============================================================
// OdontoSync — Clinic Store (Zustand)
// Gerencia configuração da clínica e dados administrativos.
// ============================================================

import { create } from 'zustand';
import { ClinicConfig, DashboardKPIs, TeamMember } from '@/src/types';
import { mockClinicConfig, mockDashboardKPIs, mockTeamMembers } from '@/src/mocks/clinic';
import { mockUsers } from '@/src/mocks/users';
import { User, UserRole } from '@/src/types';

interface ClinicState {
  config: ClinicConfig;
  kpis: DashboardKPIs;
  team: TeamMember[];
  patients: User[];

  // Admin actions
  updateConfig: (partial: Partial<ClinicConfig>) => void;
  searchPatients: (query: string) => User[];
  getPatientByPhone: (phone: string) => User | undefined;
}

export const useClinicStore = create<ClinicState>((set, get) => ({
  config: { ...mockClinicConfig },
  kpis: { ...mockDashboardKPIs },
  team: [...mockTeamMembers],
  patients: mockUsers.filter((u) => u.role === UserRole.PATIENT),

  updateConfig: (partial) => {
    set((state) => ({
      config: { ...state.config, ...partial },
    }));
  },

  searchPatients: (query) => {
    const q = query.toLowerCase();
    return get().patients.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.phone.includes(q) ||
        p.email.toLowerCase().includes(q)
    );
  },

  getPatientByPhone: (phone) => {
    return get().patients.find((p) => p.phone === phone);
  },
}));
