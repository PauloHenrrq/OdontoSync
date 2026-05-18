// ============================================================
// OdontoSync — UI: Avatar
// Iniciais ou imagem com borda do Design System.
// ============================================================

import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { colors, fonts, fontSizes } from '@/src/styles/tokens';

interface AvatarProps {
  name: string;
  imageUrl?: string;
  size?: number;
  showBorder?: boolean;
}

const getInitials = (name: string): string => {
  const parts = name.split(' ').filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]![0]}${parts[parts.length - 1]![0]}`.toUpperCase();
  }
  return (parts[0]?.[0] ?? '?').toUpperCase();
};

const getColorFromName = (name: string): string => {
  const palette = [
    colors.primary,
    colors.tertiary,
    colors.secondary,
    colors.primaryContainer,
    colors.tertiaryContainer,
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return palette[Math.abs(hash) % palette.length]!;
};

export function Avatar({
  name,
  imageUrl,
  size = 48,
  showBorder = false,
}: AvatarProps) {
  const initials = getInitials(name);
  const bgColor = getColorFromName(name);

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
          backgroundColor: bgColor,
        },
        showBorder && styles.bordered,
      ]}
    >
      <Text
        style={[
          styles.initials,
          { fontSize: size * 0.38 },
        ]}
      >
        {initials}
      </Text>
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
  initials: {
    fontFamily: fonts.headline,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
