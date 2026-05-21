// ============================================================
// OdontoSync — Tela: Login (Stitch: ceb83a16)
// "Welcome back to your sanctuary."
// ============================================================

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Phone } from 'lucide-react-native';

import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { useAuthStore } from '@/src/stores/authStore';
import { loginSchema, LoginFormData } from '@/src/schemas/auth.schema';
import { colors, fonts, fontSizes, spacing } from '@/src/styles/tokens';

export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoading, error, clearError } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { emailOrPhone: '', password: '' },
  });

  const onSubmit = async (data: LoginFormData) => {
    clearError();
    await login(data.emailOrPhone, data.password);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Logo + Tagline */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <View style={styles.logoIcon}>
              <Text style={styles.logoEmoji}>🦷</Text>
            </View>
          </View>
          <Text style={styles.appName}>Odonto Excell</Text>
          <Text style={styles.tagline}>Bem-vindo de volta</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Controller
            control={control}
            name="emailOrPhone"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Email ou Telefone"
                placeholder="seu@email.com ou (11) 99999-9999"
                value={value}
                onChangeText={onChange}
                keyboardType="email-address"
                autoCapitalize="none"
                error={errors.emailOrPhone?.message}
                leftIcon={<Phone size={20} color={colors.outline} />}
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Senha"
                placeholder="••••••••"
                value={value}
                onChangeText={onChange}
                secureTextEntry={!showPassword}
                error={errors.password?.message}
                rightIcon={
                  showPassword ? (
                    <EyeOff size={20} color={colors.outline} />
                  ) : (
                    <Eye size={20} color={colors.outline} />
                  )
                }
                onRightIconPress={() => setShowPassword(!showPassword)}
              />
            )}
          />

          <TouchableOpacity
            onPress={() => router.push('/(auth)/forgot-password')}
            style={styles.forgotLink}
          >
            <Text style={styles.forgotText}>Esqueceu a senha?</Text>
          </TouchableOpacity>

          {error && <Text style={styles.errorMessage}>{error}</Text>}

          <Button
            title="Entrar"
            onPress={handleSubmit(onSubmit)}
            loading={isLoading}
            fullWidth
            size="lg"
          />

          <TouchableOpacity
            onPress={() => router.push('/(auth)/register')}
            style={styles.registerLink}
          >
            <Text style={styles.registerText}>
              Não tem uma conta?{' '}
              <Text style={styles.registerTextBold}>Cadastre-se</Text>
            </Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Cultivando o Bem-Estar desde 2024</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing['3xl'],
    paddingBottom: spacing.xl,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing['2xl'],
  },
  logoContainer: {
    marginBottom: spacing.lg,
  },
  logoIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primaryFixed + '40',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoEmoji: {
    fontSize: 40,
  },
  appName: {
    fontFamily: fonts.headline,
    fontSize: fontSizes.headlineLg,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  tagline: {
    fontFamily: fonts.body,
    fontSize: fontSizes.bodyLg,
    color: colors.onSurfaceVariant,
  },
  form: {
    width: '100%',
  },
  forgotLink: {
    alignSelf: 'flex-end',
    marginBottom: spacing.lg,
    marginTop: -spacing.sm,
  },
  forgotText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.bodyMd,
    color: colors.primary,
    fontWeight: '500',
  },
  errorMessage: {
    fontFamily: fonts.body,
    fontSize: fontSizes.bodySm,
    color: colors.error,
    textAlign: 'center',
    marginBottom: spacing.md,
    padding: spacing.sm,
    backgroundColor: colors.errorContainer,
    borderRadius: 12,
  },
  registerLink: {
    marginTop: spacing.xl,
    alignItems: 'center',
  },
  registerText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.bodyMd,
    color: colors.onSurfaceVariant,
  },
  registerTextBold: {
    color: colors.primary,
    fontWeight: '600',
  },
  footer: {
    marginTop: 'auto',
    paddingTop: spacing['2xl'],
    alignItems: 'center',
  },
  footerText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.labelSm,
    color: colors.outline,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});
