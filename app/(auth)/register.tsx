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
  Image,
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

const maskPhone = (val: string) => {
  let v = val.replace(/\D/g, '');
  if (v.length > 11) v = v.slice(0, 11);
  if (v.length === 0) return '';
  if (v.length <= 2) return `(${v}`;
  if (v.length <= 6) return `(${v.slice(0, 2)}) ${v.slice(2)}`;
  if (v.length <= 10) return `(${v.slice(0, 2)}) ${v.slice(2, 6)}-${v.slice(6)}`;
  return `(${v.slice(0, 2)}) ${v.slice(2, 7)}-${v.slice(7)}`;
};

export default function RegisterScreen() {
  const router = useRouter();
  const { sendOtp, isLoading, error, clearError } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

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

  const onInvalid = (formErrors: any) => {
    const firstErrorField = Object.keys(formErrors)[0];
    if (firstErrorField) {
      const errorMsg = formErrors[firstErrorField]?.message || 'Verifique os campos digitados.';
      RNAlert.alert('Preenchimento Inválido', `${errorMsg}`);
    }
  };

  const onSubmit = async (data: RegisterFormData) => {
    clearError();
    const cleanPhone = data.phone.replace(/\D/g, '');
    const response = await sendOtp(cleanPhone);

    if (response.success) {
      router.push({
        pathname: '/(auth)/verify-otp',
        params: {
          name: data.name,
          email: data.email,
          phone: data.phone,
          password: data.password,
          tempOtpCode: response.devCode || '',
        }
      });
    } else {
      RNAlert.alert('Erro', response.error || 'Não foi possível enviar o código de verificação.');
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
          <View style={styles.logoContainer}>
            <Image
              source={require('../../assets/images/Logo-OdontoSync.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.title}>Criar Conta</Text>
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
                onChangeText={(text) => onChange(maskPhone(text))}
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

          {!!error ? <Text style={styles.errorMessage}>{error}</Text> : null}

          <Button
            title="Registrar"
            onPress={handleSubmit(onSubmit, onInvalid)}
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
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
  },
  backButton: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  header: {
    alignItems: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  logoContainer: {
    marginBottom: spacing.sm,
  },
  logoImage: {
    width: 100,
    height: 100,
  },
  title: {
    fontFamily: fonts.headline,
    fontSize: fontSizes.headlineLg,
    fontWeight: '700',
    color: colors.onSurface,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: fontSizes.bodyLg,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
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
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '500',
  },
  otpLabel: {
    fontFamily: fonts.label,
    fontSize: fontSizes.labelMd,
    color: colors.onSurfaceVariant,
    marginBottom: 12,
    textAlign: 'center',
    fontWeight: '600',
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 12,
    paddingHorizontal: 4,
  },
  otpBox: {
    width: 44,
    height: 54,
    borderRadius: 12,
    backgroundColor: colors.surfaceContainerLow,
    borderWidth: 1.5,
    borderColor: colors.outlineVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpBoxFocused: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceContainer,
    borderWidth: 2,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  otpBoxFilled: {
    borderColor: colors.primary + '80',
    backgroundColor: colors.surfaceContainerLowest,
  },
  otpDigit: {
    fontFamily: fonts.headline,
    fontSize: 22,
    fontWeight: '700',
    color: colors.outline,
  },
  otpDigitFilled: {
    color: colors.primary,
  },
  hiddenInput: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
});
