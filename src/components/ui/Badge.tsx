// ============================================================
// OdontoSync — UI: Badge
// Indicador numérico e status para notificações e estados.
// ============================================================

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fonts, fontSizes } from '@/src/styles/tokens';
import { AppointmentStatus } from '@/src/types';

interface BadgeProps {
  count?: number;
  variant?: 'notification' | 'status';
  status?: AppointmentStatus;
  size?: 'sm' | 'md';
}

const statusConfig: Record<AppointmentStatus, { bg: string; text: string; label: string }> = {
  [AppointmentStatus.PENDING]: {
    bg: '#E8F5E9',
    text: '#2E7D32',
    label: 'Agendado',
  },
  [AppointmentStatus.CONFIRMED]: {
    bg: '#E8F5E9',
    text: '#2E7D32',
    label: 'Agendado',
  },
  [AppointmentStatus.COMPLETED]: {
    bg: '#E8F5E9',
    text: '#2E7D32',
    label: 'Concluído',
  },
  [AppointmentStatus.CANCELLED]: {
    bg: colors.errorContainer,
    text: colors.error,
    label: 'Cancelado',
  },
  [AppointmentStatus.ABSENT]: {
    bg: '#FCE4EC',
    text: '#C62828',
    label: 'Faltou',
  },
};

export function Badge({ count, variant = 'notification', status, size = 'sm' }: BadgeProps) {
  if (variant === 'status' && status) {
    const config = statusConfig[status];
    return (
      <View style={[styles.statusBadge, { backgroundColor: config.bg }]}>
        <Text style={[styles.statusText, { color: config.text }]}>
          {config.label}
        </Text>
      </View>
    );
  }

  if (!count || count <= 0) return null;

  return (
    <View style={[styles.countBadge, size === 'md' && styles.countBadgeMd]}>
      <Text style={[styles.countText, size === 'md' && styles.countTextMd]}>
        {count > 99 ? '99+' : count}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  countBadge: {
    backgroundColor: colors.error,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  countBadgeMd: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
  },
  countText: {
    color: colors.onError,
    fontFamily: fonts.label,
    fontSize: 10,
    fontWeight: '700',
  },
  countTextMd: {
    fontSize: 12,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontFamily: fonts.label,
    fontSize: fontSizes.labelSm,
    fontWeight: '600',
  },
});
