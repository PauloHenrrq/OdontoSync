// ============================================================
// OdontoSync — UI: Card
// Nesting strategy — surface layering sem borders.
// ============================================================

import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { colors, borderRadius, shadows, spacing } from '@/src/styles/tokens';

interface CardProps {
  children: React.ReactNode;
  variant?: 'elevated' | 'filled' | 'outlined';
  style?: StyleProp<ViewStyle>;
  padding?: keyof typeof spacing;
}

export function Card({
  children,
  variant = 'elevated',
  style,
  padding = 'lg',
}: CardProps) {
  return (
    <View
      style={[
        styles.base,
        variantStyles[variant],
        { padding: spacing[padding] },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const variantStyles: Record<string, ViewStyle> = {
  elevated: {
    backgroundColor: colors.surfaceContainerLowest,
    ...shadows.subtle,
  },
  filled: {
    backgroundColor: colors.surfaceContainerLow,
  },
  outlined: {
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: colors.outlineVariant + '26', // 15% opacity
  },
};

const styles = StyleSheet.create({
  base: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
});
