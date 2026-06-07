// ============================================================
// OdontoSync — Tipos Globais do Domínio
// Contratos de dados que definem a estrutura de todo o sistema.
// O telefone é o Elo Central que conecta entidades.
// ============================================================

/** Perfis de acesso no sistema RBAC */
export enum UserRole {
  PATIENT = 'PATIENT',
  ADMIN = 'ADMIN',
}

/** Status genérico para soft-delete (nunca deletar registros) */
export enum EntityStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

/** Ciclo de vida de um agendamento */
export enum AppointmentStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  ABSENT = 'ABSENT',
}

/** Canal de envio de notificação */
export enum NotificationChannel {
  PUSH = 'PUSH',
  WHATSAPP = 'WHATSAPP',
}

/** Status de envio da notificação */
export enum NotificationStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  FAILED = 'FAILED',
}

// ============================================================
// Entidades
// ============================================================

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string; // Elo Central — identificador universal
  role: UserRole;
  status: EntityStatus;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DentalService {
  id: string;
  name: string;
  duration: number; // minutos
  description?: string;
  icon?: string;
}

export interface Appointment {
  id: string;
  phone: string; // Elo Central — vínculo por telefone
  userId?: string; // Nullable — pode ser agendamento "órfão"
  user?: User;
  serviceId: string;
  service?: DentalService;
  dentistName: string;
  date: string; // ISO 8601
  time: string; // HH:mm
  status: AppointmentStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  phone: string;
  channel: NotificationChannel;
  title: string;
  message: string;
  read: boolean;
  sentAt?: string;
  status: NotificationStatus;
  createdAt: string;
}

export interface CareTip {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: string;
}

export interface ClinicConfig {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  logoUrl?: string;
  absenceReduction: boolean;
  reminderHoursBefore: string;
  confirmationTemplate: string;
  cancellationTemplate: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  permissions: string;
}

// ============================================================
// DTOs (Data Transfer Objects) para formulários
// ============================================================

export interface LoginDTO {
  emailOrPhone: string;
  password: string;
}

export interface RegisterDTO {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

export interface BookingDTO {
  serviceId: string;
  dentistName: string;
  date: string;
  time: string;
  notes?: string;
  patientName?: string;
}

// ============================================================
// KPIs para o Dashboard Admin
// ============================================================

export interface DashboardKPIs {
  confirmedToday: number;
  pendingContact: number;
  absenceRate: number;
}
