// ============================================================
// OdontoSync — Clinic Store (Zustand)
// Gerencia configuração da clínica e dados administrativos.
// Conectado à API real — dados carregados do banco PostgreSQL.
// ============================================================

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { ClinicConfig, DashboardKPIs, DentalService, TeamMember, User } from '@/src/types';
import { mockDashboardKPIs, mockTeamMembers } from '@/src/mocks/clinic';
import { ClinicService } from '@/src/services/clinicService';

export interface ClinicState {
  config: ClinicConfig;
  kpis: DashboardKPIs;
  team: TeamMember[];
  patients: User[];
  services: DentalService[];
  isLoading: boolean;
}

export interface ClinicActions {
  // Fetch actions (API)
  fetchConfig: (force?: boolean) => Promise<void>;
  fetchPatients: (force?: boolean) => Promise<void>;
  fetchServices: (force?: boolean) => Promise<void>;

  // Admin actions
  updateConfig: (partial: Partial<ClinicConfig>) => void;
  searchPatients: (query: string) => User[];
  getPatientByPhone: (phone: string) => User | undefined;
}

export type ClinicStore = ClinicState & ClinicActions;

// Configuração padrão (fallback caso a API não responda)
const defaultConfig: ClinicConfig = {
  id: '',
  name: 'Odonto Excell',
  absenceReduction: true,
  reminderHoursBefore: '24',
  confirmationTemplate: '',
  cancellationTemplate: '',
};

export const useClinicStore = create<ClinicStore>()(
  subscribeWithSelector((set, get) => ({
    // State
    config: { ...defaultConfig },
    kpis: { ...mockDashboardKPIs },
    team: [...mockTeamMembers],
    patients: [],
    services: [],
    isLoading: false,

    // Actions
    fetchConfig: async (force = false) => {
      // Se não for carregamento forçado e já possuir config carregada (id preenchido), economiza rede
      if (!force && get().config.id) {
        return;
      }
      try {
        const config = await ClinicService.getConfig();
        if (config) {
          set({ config });
        }
      } catch (err) {
        // Fallback silencioso em caso de erro de rede ou sessão expirada
      }
    },

    fetchPatients: async (force = false) => {
      // Se não for carregamento forçado e já possuir pacientes locais, economiza rede
      if (!force && get().patients.length > 0) {
        return;
      }
      try {
        const patients = await ClinicService.getPatients();
        set({ patients });
      } catch (err) {
        // Fallback silencioso em caso de erro de rede ou sessão expirada
      }
    },

    fetchServices: async (force = false) => {
      // Se não for carregamento forçado e já possuir serviços locais, economiza rede
      if (!force && get().services.length > 0) {
        return;
      }
      try {
        const services = await ClinicService.getServices();
        set({ services });
      } catch (err) {
        // Fallback silencioso em caso de erro de rede ou sessão expirada
      }
    },

    updateConfig: (partial) => {
      const currentConfig = get().config;
      const updatedConfig = { ...currentConfig, ...partial };
      set({ config: updatedConfig });

      // Persistir no banco de dados via API
      if (currentConfig.id) {
        ClinicService.updateConfig(currentConfig.id, partial).catch((err) =>
          console.error('Failed to persist config update:', err)
        );
      }
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
      const cleanPhone = phone.replace(/\D/g, '');
      return get().patients.find((p) => p.phone.replace(/\D/g, '') === cleanPhone);
    },
  }))
);
