// ============================================================
// OdontoSync — Schemas de Validação (Autenticação)
// Zod schemas para formulários de login, registro e recuperação.
// ============================================================

import { z } from 'zod';

/** Schema de Login — email ou telefone + senha */
export const loginSchema = z.object({
  emailOrPhone: z
    .string()
    .min(1, 'Campo obrigatório')
    .refine(
      (value) => {
        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        const isPhone = /^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/.test(value);
        return isEmail || isPhone;
      },
      { message: 'Insira um email ou telefone válido' }
    ),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
});

/** Schema de Registro — dados completos do novo usuário */
export const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, 'Nome deve ter pelo menos 2 caracteres')
      .max(100, 'Nome muito longo'),
    email: z.string().email('Email inválido'),
    phone: z
      .string()
      .regex(
        /^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/,
        'Formato: (11) 99999-9999'
      ),
    password: z
      .string()
      .min(6, 'Senha deve ter pelo menos 6 caracteres')
      .regex(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiúscula')
      .regex(/[0-9]/, 'Senha deve conter pelo menos um número'),
    confirmPassword: z.string().min(1, 'Confirme sua senha'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Senhas não coincidem',
    path: ['confirmPassword'],
  });

/** Schema de Recuperação de Senha */
export const forgotPasswordSchema = z.object({
  email: z.string().email('Email inválido'),
});

// Tipos inferidos dos schemas
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
