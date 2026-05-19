// ============================================================
// OdontoSync — Auth Store (Zustand)
// Gerencia autenticação, sessão e navegação por role (RBAC).
// ============================================================

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, UserRole } from '@/src/types';
import { AuthService } from '@/src/services/authService';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (emailOrPhone: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, phone: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (emailOrPhone, password) => {
        set({ isLoading: true, error: null });

        const user = await AuthService.login(emailOrPhone, password);

        if (user) {
          set({ user, isAuthenticated: true, isLoading: false, error: null });
          return true;
        }

        set({
          isLoading: false,
          error: 'Credenciais inválidas. Verifique email/telefone e senha.',
        });
        return false;
      },

      register: async (name, email, phone, password) => {
        set({ isLoading: true, error: null });

        const newUser = await AuthService.register(name, email, phone, password);

        if (!newUser) {
          set({
            isLoading: false,
            error: 'Email ou telefone já cadastrado.',
          });
          return false;
        }

        set({
          user: newUser,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        return true;
      },

      logout: async () => {
        await AuthService.logout();
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'odontosync-auth',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
