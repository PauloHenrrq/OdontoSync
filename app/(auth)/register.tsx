// ============================================================
// OdontoSync — Tela: Register (Stitch: 355299ec)
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
import { Eye, EyeOff, User, Mail, Phone, ArrowLeft } from 'lucide-react-native';

import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { useAuthStore } from '@/src/stores/authStore';
import { registerSchema, RegisterFormData } from '@/src/schemas/auth.schema';
import { colors, fonts, fontSizes, spacing } from '@/src/styles/tokens';

import { Alert as RNAlert } from 'react-native';

export default function RegisterScreen() {
  const router = useRouter();
  const { register: registerUser, sendOtp, isLoading, error, clearError } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  // Estados de verificação OTP
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [tempOtpCode, setTempOtpCode] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    clearError();

    // Se o código OTP ainda não foi enviado, solicita primeiro
    if (!isOtpSent) {
      const cleanPhone = data.phone.replace(/\D/g, '');
      const response = await sendOtp(cleanPhone);
      if (response.success) {
        setIsOtpSent(true);
        if (response.devCode) {
          setTempOtpCode(response.devCode);
        }
        RNAlert.alert(
          'Código Enviado',
          'Enviamos um código de confirmação de 6 dígitos para o seu WhatsApp cadastrado!'
        );
      } else {
        RNAlert.alert('Erro', response.error || 'Não foi possível enviar o código de verificação.');
      }
      return;
    }

    if (otpCode.length !== 6) {
      RNAlert.alert('Atenção', 'Por favor, digite o código de 6 dígitos recebido.');
      return;
    }

    // Com o código enviado, realiza o registro completo
    const success = await registerUser(data.name, data.email, data.phone, data.password, otpCode);
    if (success) {
      // O redirecionamento é feito automaticamente pelo useProtectedRoute
    }
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
          <Text style={styles.title}>Criar Conta</Text>
          <Text style={styles.subtitle}>
            A excelência em seu sorriso.
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Nome Completo"
                placeholder="Ana Paula Santos"
                value={value}
                onChangeText={onChange}
                autoCapitalize="words"
                error={errors.name?.message}
                leftIcon={<User size={20} color={colors.outline} />}
              />
            )}
          />

          <Controller
            control={control}
            name="phone"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Telefone"
                placeholder="(11) 99999-9999"
                value={value}
                onChangeText={onChange}
                keyboardType="phone-pad"
                error={errors.phone?.message}
                leftIcon={<Phone size={20} color={colors.outline} />}
              />
            )}
          />

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

          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Confirmar Senha"
                placeholder="••••••••"
                value={value}
                onChangeText={onChange}
                secureTextEntry={!showPassword}
                error={errors.confirmPassword?.message}
              />
            )}
          />

          {isOtpSent && (
            <View style={{ marginBottom: 16 }}>
              <Input
                label="Código de Verificação WhatsApp"
                placeholder="Digite o código de 6 dígitos"
                value={otpCode}
                onChangeText={setOtpCode}
                keyboardType="number-pad"
                maxLength={6}
              />
              <Text style={styles.helperText}>
                {tempOtpCode ? `Ambiente de Teste: Use o código ${tempOtpCode}` : 'Código enviado via WhatsApp'}
              </Text>
            </View>
          )}

          {error && <Text style={styles.errorMessage}>{error}</Text>}

          <Button
            title={isOtpSent ? "Confirmar e Criar Conta" : "Enviar Código WhatsApp"}
            onPress={handleSubmit(onSubmit)}
            loading={isLoading}
            fullWidth
            size="lg"
          />

          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.loginLink}
          >
            <Text style={styles.loginText}>
              Já tem conta?{' '}
              <Text style={styles.loginTextBold}>Entrar</Text>
            </Text>
          </TouchableOpacity>
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
    marginBottom: spacing.lg,
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
  },
  form: {
    width: '100%',
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
  loginLink: {
    marginTop: spacing.xl,
    alignItems: 'center',
  },
  loginText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.bodyMd,
    color: colors.onSurfaceVariant,
  },
  loginTextBold: {
    color: colors.primary,
    fontWeight: '600',
  },
  helperText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.bodySm,
    color: colors.primary,
    marginTop: 4,
    marginLeft: 4,
    fontWeight: '500',
  },
});
