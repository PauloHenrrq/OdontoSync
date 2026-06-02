import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '@/src/types';
import { api } from './api';

export const AuthService = {
  login: async (emailOrPhone: string, password: string): Promise<User> => {
    const response = await api.post<{ token: string; user: User }>('/auth/login', {
      emailOrPhone,
      password,
    });
    
    await AsyncStorage.setItem('auth_token', response.token);
    return response.user;
  },

  sendOtp: async (phone: string): Promise<{ success: boolean; devCode?: string; error?: string }> => {
    try {
      const response = await api.post<{ success: boolean; devCode?: string }>('/auth/send-otp', {
        phone,
      });
      return response;
    } catch (error: any) {
      return { success: false, error: error.message || 'Erro ao enviar código.' };
    }
  },

  register: async (name: string, email: string, phone: string, password: string, code: string): Promise<User | null> => {
    try {
      const response = await api.post<{ token: string; user: User }>('/auth/register', {
        name,
        email,
        phone,
        password,
        code,
      });
      
      await AsyncStorage.setItem('auth_token', response.token);
      return response.user;
    } catch (error) {
      throw error; // Propaga o erro real para capturar a mensagem correta na UI
    }
  },

  logout: async (): Promise<void> => {
    await AsyncStorage.removeItem('auth_token');
  }
};
