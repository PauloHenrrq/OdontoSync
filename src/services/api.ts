import AsyncStorage from '@react-native-async-storage/async-storage';

export const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3333/api';

export const api = {
  async get<T>(endpoint: string): Promise<T> {
    return fetchWithAuth(endpoint, { method: 'GET' });
  },

  async post<T>(endpoint: string, body: any): Promise<T> {
    return fetchWithAuth(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
  },

  async put<T>(endpoint: string, body: any): Promise<T> {
    return fetchWithAuth(endpoint, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
  },

  async patch<T>(endpoint: string, body: any): Promise<T> {
    return fetchWithAuth(endpoint, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
  },

  async delete<T>(endpoint: string): Promise<T> {
    return fetchWithAuth(endpoint, { method: 'DELETE' });
  },
};

async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const token = await AsyncStorage.getItem('auth_token');

  const headers = new Headers(options.headers || {});
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401) {
      // Sessão expirada ou token inválido! Limpa as credenciais locais e força o logout
      await AsyncStorage.removeItem('auth_token');
      try {
        const { useAuthStore } = require('../stores/authStore');
        useAuthStore.getState().logout();
      } catch (storeError) {
        // Ignora erros de importação cíclica em tempo de inicialização secundária
      }
    }
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.error || `Request failed with status ${response.status}`);
  }

  return response.json();
}
