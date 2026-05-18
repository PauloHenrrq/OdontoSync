// ============================================================
// OdontoSync — UI: Input
// Estilo "Inset" com estados visuais do Design System.
// ============================================================

import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  TouchableOpacity,
} from 'react-native';
import { colors, borderRadius, fonts, fontSizes } from '@/src/styles/tokens';

interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
}

export function Input({
  label,
  error,
  leftIcon,
  rightIcon,
  onRightIconPress,
  ...props
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.inputWrapper,
          isFocused && styles.inputFocused,
          error ? styles.inputError : undefined,
        ]}
      >
        {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}
        <TextInput
          style={[
            styles.input,
            leftIcon ? { paddingLeft: 0 } : undefined,
          ]}
          placeholderTextColor={colors.outline}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        {rightIcon && (
          <TouchableOpacity
            onPress={onRightIconPress}
            style={styles.iconRight}
          >
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: '100%',
  },
  label: {
    fontFamily: fonts.label,
    fontSize: fontSizes.labelLg,
    color: colors.onSurface,
    marginBottom: 8,
    fontWeight: '500',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: 'transparent',
    paddingHorizontal: 16,
  },
  inputFocused: {
    borderColor: colors.primaryFixedDim,
  },
  inputError: {
    borderColor: colors.error,
  },
  input: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: fontSizes.bodyLg,
    color: colors.onSurface,
    paddingVertical: 14,
    paddingLeft: 4,
  },
  iconLeft: {
    marginRight: 12,
  },
  iconRight: {
    marginLeft: 12,
    padding: 4,
  },
  errorText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.bodySm,
    color: colors.error,
    marginTop: 4,
    marginLeft: 4,
  },
});
