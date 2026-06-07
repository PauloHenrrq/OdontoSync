// ============================================================
// OdontoSync — UI: Avatar
// Ícone de usuário ou imagem com borda do Design System.
// ============================================================

import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { User } from 'lucide-react-native';
import { colors } from '@/src/styles/tokens';

interface AvatarProps {
  name: string;
  imageUrl?: string;
  size?: number;
  showBorder?: boolean;
}

export function Avatar({
  name,
  imageUrl,
  size = 48,
  showBorder = false,
}: AvatarProps) {
  if (imageUrl) {
    return (
      <View
        style={[
          styles.container,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
          },
          showBorder && styles.bordered,
        ]}
      >
        <Image
          source={{ uri: imageUrl }}
          style={{
            width: size - (showBorder ? 4 : 0),
            height: size - (showBorder ? 4 : 0),
            borderRadius: size / 2,
          }}
        />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: colors.primaryFixed + '50', // Tom do app translúcido
        },
        showBorder && styles.bordered,
      ]}
    >
      <User size={size * 0.5} color={colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  bordered: {
    borderWidth: 2,
    borderColor: colors.primaryFixedDim,
  },
});
