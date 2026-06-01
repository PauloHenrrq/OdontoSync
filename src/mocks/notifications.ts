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
    title: 'Bem-vindo à Odonto Excell',
    message: 'Sempre cuidando do seu sorriso! Oferecemos atendimento humanizado, tecnologia de ponta e tratamentos especializados para transformar a sua saúde bucal.',
    read: false,
    sentAt: '2026-05-27T08:00:00Z',
    status: NotificationStatus.SENT,
    createdAt: '2026-05-27T08:00:00Z',
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
