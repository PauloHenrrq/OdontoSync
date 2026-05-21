// ============================================================
// OdontoSync — Mock: Notificações e Dicas de Cuidados
// ============================================================

import {
  Notification,
  NotificationChannel,
  NotificationStatus,
  CareTip,
} from '@/src/types';

export const mockNotifications: Notification[] = [
  {
    id: 'ntf_001',
    phone: '(11) 98765-4321',
    channel: NotificationChannel.PUSH,
    title: 'Consulta Confirmada',
    message: 'Sua consulta com Dra. Carolina em 15/10 às 10:00 foi confirmada.',
    read: false,
    sentAt: '2024-10-13T10:00:00Z',
    status: NotificationStatus.SENT,
    createdAt: '2024-10-13T10:00:00Z',
  },
  {
    id: 'ntf_002',
    phone: '(11) 98765-4321',
    channel: NotificationChannel.PUSH,
    title: 'Lembrete de Consulta',
    message: 'Não esqueça! Amanhã às 10:00 você tem consulta na Odonto Excell.',
    read: false,
    sentAt: '2024-10-14T18:00:00Z',
    status: NotificationStatus.SENT,
    createdAt: '2024-10-14T18:00:00Z',
  },
  {
    id: 'ntf_003',
    phone: '(11) 98765-4321',
    channel: NotificationChannel.PUSH,
    title: 'Avaliação Disponível',
    message: 'Como foi sua última visita? Avalie sua experiência e ajude-nos a melhorar.',
    read: true,
    sentAt: '2024-09-21T09:00:00Z',
    status: NotificationStatus.SENT,
    createdAt: '2024-09-21T09:00:00Z',
  },
  {
    id: 'ntf_004',
    phone: '(11) 98765-4321',
    channel: NotificationChannel.PUSH,
    title: 'Retorno Recomendado',
    message: 'Já faz 6 meses desde sua última limpeza. Que tal agendar seu retorno?',
    read: true,
    sentAt: '2024-09-25T11:00:00Z',
    status: NotificationStatus.SENT,
    createdAt: '2024-09-25T11:00:00Z',
  },
];

export const mockCareTips: CareTip[] = [
  {
    id: 'tip_001',
    title: 'Escovação Ideal',
    description:
      'Escove os dentes pelo menos 3 vezes ao dia, com movimentos circulares suaves. Use cerdas macias para proteger o esmalte.',
    icon: 'sparkles',
    category: 'Higiene Diária',
  },
  {
    id: 'tip_002',
    title: 'Fio Dental Diário',
    description:
      'O fio dental remove até 40% da placa bacteriana. Use uma vez ao dia, preferencialmente antes de dormir.',
    icon: 'ribbon',
    category: 'Higiene Diária',
  },
  {
    id: 'tip_003',
    title: 'Alimentos que Fortalecem',
    description:
      'Leite, queijo e vegetais verdes são ricos em cálcio e ajudam na saúde dos dentes e gengivas.',
    icon: 'apple',
    category: 'Alimentação',
  },
  {
    id: 'tip_004',
    title: 'Protetor Bucal',
    description:
      'Se você pratica esportes de contato, use protetor bucal para evitar fraturas e lesões.',
    icon: 'shield',
    category: 'Prevenção',
  },
  {
    id: 'tip_005',
    title: 'Visitas Regulares',
    description:
      'Consultas a cada 6 meses permitem detectar problemas precocemente e manter a saúde em dia.',
    icon: 'calendar',
    category: 'Prevenção',
  },
];
