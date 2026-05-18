// ============================================================
// OdontoSync — Tela: Forgot Password (Stitch: e0cab0a2)
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
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react-native';

import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { forgotPasswordSchema, ForgotPasswordFormData } from '@/src/schemas/auth.schema';
import { colors, fonts, fontSizes, spacing } from '@/src/styles/tokens';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (_data: ForgotPasswordFormData) => {
    setIsLoading(true);
    // Simula envio
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsLoading(false);
    setEmailSent(true);
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
        {/* Back Button */}
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color={colors.onSurface} />
        </TouchableOpacity>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Recuperar Senha</Text>
          <Text style={styles.subtitle}>
            Informe seu email e enviaremos um link para redefinir sua senha.
          </Text>
        </View>

        {emailSent ? (
          /* Feedback de sucesso */
          <View style={styles.successContainer}>
            <View style={styles.successIcon}>
              <CheckCircle size={48} color={colors.primary} />
            </View>
            <Text style={styles.successTitle}>Email Enviado!</Text>
            <Text style={styles.successText}>
              Verifique sua caixa de entrada e siga as instruções para
              redefinir sua senha.
            </Text>
            <Button
              title="Voltar ao Login"
              onPress={() => router.replace('/(auth)/login')}
              fullWidth
              size="lg"
            />
          </View>
        ) : (
          /* Form */
          <View style={styles.form}>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Email"
                  placeholder="seu@email.com"
                  value={value}
                  onChangeText={onChange}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  error={errors.email?.message}
                  leftIcon={<Mail size={20} color={colors.outline} />}
                />
              )}
            />

            <Button
              title="Enviar Link de Recuperação"
              onPress={handleSubmit(onSubmit)}
              loading={isLoading}
              fullWidth
              size="lg"
            />
          </View>
        )}
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
    paddingTop: spacing['2xl'],
    paddingBottom: spacing.xl,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    fontFamily: fonts.headline,
    fontSize: fontSizes.headlineLg,
    fontWeight: '700',
    color: colors.onSurface,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: fontSizes.bodyLg,
    color: colors.onSurfaceVariant,
    lineHeight: 24,
  },
  form: {
    width: '100%',
  },
  successContainer: {
    alignItems: 'center',
    paddingTop: spacing.xl,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primaryFixed + '40',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  successTitle: {
    fontFamily: fonts.headline,
    fontSize: fontSizes.headlineSm,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  successText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.bodyLg,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 24,
  },
});
