// ============================================================
// OdontoSync — Clinic Service
// Integração com a API para configurações, serviços e pacientes.
// ============================================================

import { ClinicConfig, DentalService, User } from '@/src/types';
import { api } from './api';

export const ClinicService = {
  getConfig: async (): Promise<ClinicConfig | null> => {
    try {
      const response = await api.get<{ config: ClinicConfig }>('/clinic/config');
      return response.config;
    } catch (error) {
      console.error('Failed to get clinic config:', error);
      return null;
    }
  },

  updateConfig: async (id: string, body: Partial<ClinicConfig>): Promise<ClinicConfig | null> => {
    try {
      const response = await api.patch<{ config: ClinicConfig }>(`/clinic/config/${id}`, body);
      return response.config;
    } catch (error) {
      console.error('Failed to update clinic config:', error);
      return null;
    }
  },

  getServices: async (): Promise<DentalService[]> => {
    try {
      const response = await api.get<{ services: DentalService[] }>('/clinic/services');
      return response.services;
    } catch (error) {
      console.error('Failed to get services:', error);
      return [];
    }
  },

  getPatients: async (): Promise<User[]> => {
    try {
      const response = await api.get<{ patients: User[] }>('/patients');
      return response.patients;
    } catch (error) {
      console.error('Failed to get patients:', error);
      return [];
    }
  },
};
