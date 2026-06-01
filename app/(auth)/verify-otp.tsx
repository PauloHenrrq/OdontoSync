// ============================================================
// OdontoSync — Tela: Verificação OTP (Estilo Premium iFood/Uber)
// ============================================================

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert as RNAlert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';

import { Button } from '@/src/components/ui/Button';
import { useAuthStore } from '@/src/stores/authStore';
import { colors, fonts, fontSizes, spacing } from '@/src/styles/tokens';

export default function VerifyOtpScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { register: registerUser, isLoading, error, clearError } = useAuthStore();

  // Dados do formulário de cadastro repassados via rota
  const name = params.name ? String(params.name) : '';
  const email = params.email ? String(params.email) : '';
  const phone = params.phone ? String(params.phone) : '';
  const password = params.password ? String(params.password) : '';
  const tempOtpCode = params.tempOtpCode ? String(params.tempOtpCode) : null;

  // Estado do código OTP
  const [otpCode, setOtpCode] = useState('');
  const otpInputRef = useRef<any>(null);

  // Limpa erros residuais da autenticação ao entrar na tela
  useEffect(() => {
    clearError();
  }, []);

  // Ao carregar a tela, foca automaticamente o teclado no input de OTP
  useEffect(() => {
    const timer = setTimeout(() => {
      otpInputRef.current?.focus();
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  const handleVerifyAndRegister = async () => {
    clearError();

    if (otpCode.length !== 6) {
      RNAlert.alert('Atenção', 'Por favor, insira o código de 6 dígitos recebido.');
      return;
    }

    const success = await registerUser(name, email, phone, password, otpCode);
    if (success) {
      RNAlert.alert('Sucesso', 'Sua conta foi criada com sucesso!');
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
        {/* Botão de Voltar */}
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color={colors.onSurface} />
        </TouchableOpacity>

        {/* Cabeçalho */}
        <View style={styles.header}>
          <Text style={styles.title}>Confirmar WhatsApp</Text>
          <Text style={styles.subtitle}>
            Insira o código de verificação enviado para o número {phone}
          </Text>
        </View>

        {/* Caixa com o Grid de OTP */}
        <View style={styles.form}>
          <Text style={styles.otpLabel}>Código de Verificação</Text>
          
          <View style={styles.otpRow}>
            {Array.from({ length: 6 }).map((_, idx) => {
              const digit = otpCode[idx] || '';
              const isFocused = idx === otpCode.length;
              return (
                <TouchableOpacity
                  key={idx}
                  activeOpacity={0.85}
                  style={[
                    styles.otpBox,
                    isFocused && styles.otpBoxFocused,
                    digit !== '' && styles.otpBoxFilled
                  ]}
                  onPress={() => otpInputRef.current?.focus()}
                >
                  <Text style={[
                    styles.otpDigit,
                    digit !== '' && styles.otpDigitFilled
                  ]}>
                    {digit}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Input Oculto de OTP */}
          <TextInput
            ref={otpInputRef}
            value={otpCode}
            onChangeText={(text) => {
              const clean = text.replace(/\D/g, '').slice(0, 6);
              setOtpCode(clean);
            }}
            keyboardType="number-pad"
            maxLength={6}
            style={styles.hiddenInput}
          />

          {/* Dica de Desenvolvimento / Teste */}
          {tempOtpCode ? (
            <Text style={styles.helperText}>
              Ambiente de Teste: Use o código <Text style={styles.helperTextBold}>{tempOtpCode}</Text>
            </Text>
          ) : (
            <Text style={styles.helperText}>
              O código pode levar até 1 minuto para chegar.
            </Text>
          )}

          {/* Mensagem de Erro da API */}
          {!!error ? <Text style={styles.errorMessage}>{error}</Text> : null}

          {/* Botão Enviar */}
          <View style={styles.submitBtn}>
            <Button
              title="Enviar"
              onPress={handleVerifyAndRegister}
              loading={isLoading}
              fullWidth
              size="lg"
            />
          </View>
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
    lineHeight: 24,
  },
  form: {
    width: '100%',
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
  helperText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.bodySm,
    color: colors.onSurfaceVariant,
    marginTop: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
  helperTextBold: {
    color: colors.primary,
    fontWeight: '700',
  },
  errorMessage: {
    fontFamily: fonts.body,
    fontSize: fontSizes.bodySm,
    color: colors.error,
    textAlign: 'center',
    marginTop: 16,
    padding: spacing.sm,
    backgroundColor: colors.errorContainer,
    borderRadius: 12,
  },
  submitBtn: {
    marginTop: 28,
  },
});
