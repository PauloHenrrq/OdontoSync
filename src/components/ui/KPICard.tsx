// ============================================================
// OdontoSync — UI: KPICard
// Card de indicador para o Dashboard Admin.
// ============================================================

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, borderRadius, fonts, fontSizes, shadows } from '@/src/styles/tokens';

interface KPICardProps {
  value: string | number;
  label: string;
  icon?: React.ReactNode;
  color?: string;
}

export function KPICard({ value, label, icon, color = colors.primary }: KPICardProps) {
  return (
    <View style={[styles.container, shadows.subtle]}>
      <View style={[styles.iconContainer, { backgroundColor: color + '1A' }]}>
        {icon}
      </View>
      <Text style={[styles.value, { color }]}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: borderRadius.md,
    padding: 16,
    alignItems: 'center',
    minWidth: 100,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  value: {
    fontFamily: fonts.headline,
    fontSize: fontSizes.headlineMd,
    fontWeight: '700',
  },
  label: {
    fontFamily: fonts.body,
    fontSize: fontSizes.labelSm,
    color: colors.onSurfaceVariant,
    marginTop: 4,
    textAlign: 'center',
  },
});
