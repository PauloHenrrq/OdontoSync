import { User, UserRole } from '@/src/types';
import { findUserByCredentials, mockUsers } from '@/src/mocks/users';

export const AuthService = {
  login: async (emailOrPhone: string, password: string): Promise<User | null> => {
    // Simula latência de rede
    await new Promise((resolve) => setTimeout(resolve, 800));

    // TODO: Substituir por chamada real à API
    const user = findUserByCredentials(emailOrPhone, password);
    return user || null;
  },

  register: async (name: string, email: string, phone: string, _password: string): Promise<User | null> => {
    // Simula latência de rede
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Verifica se email ou telefone já existe no mock
    const exists = mockUsers.find((u) => u.email === email || u.phone === phone);
    if (exists) return null;

    // TODO: Substituir por chamada real à API
    const newUser: User = {
      id: `usr_new_${Date.now()}`,
      name,
      email,
      phone,
      role: UserRole.PATIENT,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return newUser;
  },
};
