// ============================================================
// OdontoSync — Mock: Serviços Odontológicos
// ============================================================

import { DentalService } from '@/src/types';

export const mockServices: DentalService[] = [
  {
    id: 'svc_001',
    name: 'Limpeza e Profilaxia',
    duration: 45,
    description: 'Limpeza profissional com remoção de tártaro e polimento.',
    icon: 'sparkles',
  },
  {
    id: 'svc_002',
    name: 'Avaliação Ortodôntica',
    duration: 60,
    description: 'Consulta completa para avaliação de tratamento ortodôntico.',
    icon: 'scan',
  },
  {
    id: 'svc_003',
    name: 'Tratamento de Canal',
    duration: 90,
    description: 'Tratamento endodôntico para preservação do dente.',
    icon: 'heart-pulse',
  },
  {
    id: 'svc_004',
    name: 'Restauração',
    duration: 60,
    description: 'Restauração em resina composta para dentes danificados.',
    icon: 'shield-check',
  },
  {
    id: 'svc_005',
    name: 'Clareamento Dental',
    duration: 75,
    description: 'Clareamento profissional para um sorriso mais branco.',
    icon: 'sun',
  },
  {
    id: 'svc_006',
    name: 'Extração',
    duration: 45,
    description: 'Extração dentária com anestesia local.',
    icon: 'minus-circle',
  },
  {
    id: 'svc_007',
    name: 'Implante Dental',
    duration: 120,
    description: 'Implante de titânio para substituição de dentes perdidos.',
    icon: 'plus-circle',
  },
  {
    id: 'svc_008',
    name: 'Consulta de Retorno',
    duration: 30,
    description: 'Acompanhamento pós-tratamento.',
    icon: 'refresh-cw',
  },
];

export const mockDentists = [
  'Dr. Julian Smith',
  'Dra. Carolina Mendes',
  'Dr. Rafael Lima',
  'Dra. Beatriz Souza',
];

export const mockTimeSlots = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30',
];
