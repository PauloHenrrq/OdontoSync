import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '@/src/types';
import { api } from './api';

export const AuthService = {
  login: async (emailOrPhone: string, password: string): Promise<User | null> => {
    try {
      const response = await api.post<{ token: string; user: User }>('/auth/login', {
        emailOrPhone,
        password,
      });
      
      await AsyncStorage.setItem('auth_token', response.token);
      return response.user;
    } catch (error) {
      console.error('Login error:', error);
      return null;
    }
  },

  register: async (name: string, email: string, phone: string, password: string): Promise<User | null> => {
    try {
      const response = await api.post<{ token: string; user: User }>('/auth/register', {
        name,
        email,
        phone,
        password,
      });
      
      await AsyncStorage.setItem('auth_token', response.token);
      return response.user;
    } catch (error) {
      console.error('Register error:', error);
      return null;
    }
  },

  logout: async (): Promise<void> => {
    await AsyncStorage.removeItem('auth_token');
  }
};
