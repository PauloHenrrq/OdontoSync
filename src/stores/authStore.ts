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
  sendOtp: (phone: string) => Promise<{ success: boolean; devCode?: string; error?: string }>;
  register: (name: string, email: string, phone: string, password: string, code: string) => Promise<boolean>;
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

        try {
          const user = await AuthService.login(emailOrPhone, password);
          set({ user, isAuthenticated: true, isLoading: false, error: null });
          return true;
        } catch (err: any) {
          set({
            isLoading: false,
            error: err.message || 'Credenciais inválidas. Verifique email/telefone e senha.',
          });
          return false;
        }
      },

      sendOtp: async (phone) => {
        set({ isLoading: true, error: null });
        const result = await AuthService.sendOtp(phone);
        set({ isLoading: false });
        return result;
      },

      register: async (name, email, phone, password, code) => {
        set({ isLoading: true, error: null });

        try {
          const newUser = await AuthService.register(name, email, phone, password, code);

          if (!newUser) {
            set({
              isLoading: false,
              error: 'Não foi possível concluir o cadastro.',
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
        } catch (err: any) {
          set({
            isLoading: false,
            error: err.message || 'Código de verificação incorreto ou inválido.',
          });
          return false;
        }
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
