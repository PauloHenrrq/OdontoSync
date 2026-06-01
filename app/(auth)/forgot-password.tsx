// ============================================================
// OdontoSync — Tela: Forgot Password (Stitch: e0cab0a2)
// Fluxo 100% integrado dentro do app com verificação OTP.
// ============================================================

import React, { useState, useEffect } from 'react';
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
import {
  ArrowLeft,
  Mail,
  CheckCircle,
  Lock,
  Eye,
  EyeOff,
  KeyRound,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react-native';

import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { api } from '@/src/services/api';
import { colors, fonts, fontSizes, spacing, borderRadius } from '@/src/styles/tokens';

type RecoveryStep = 'email' | 'code' | 'password' | 'success';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [step, setStep] = useState<RecoveryStep>('email');
  const [isLoading, setIsLoading] = useState(false);

  // States dos formulários
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const [timer, setTimer] = useState(59);

  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Timer para o envio do OTP
  useEffect(() => {
    if (step !== 'code' || timer === 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [step, timer]);

  // Handler do E-mail (Passo 1)
  const handleEmailSubmit = async () => {
    setEmailError('');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const cleanEmail = email.trim().toLowerCase();

    if (!email.trim()) {
      setEmailError('E-mail é obrigatório');
      return;
    }
    if (!emailRegex.test(cleanEmail)) {
      setEmailError('Insira um e-mail válido');
      return;
    }

    setIsLoading(true);
    try {
      // Realiza a validação física no banco de dados real
      await api.post('/auth/verify-email', { email: cleanEmail });
      
      // Salva o e-mail higienizado no estado
      setEmail(cleanEmail);
      
      // Se passar, prossegue com o timer e vai para a etapa de verificação OTP
      setTimer(59);
      setStep('code');
    } catch (err: any) {
      setEmailError(err.message || 'Usuário não encontrado');
    } finally {
      setIsLoading(false);
    }
  };

  // Handler do Código OTP (Passo 2)
  const handleCodeSubmit = async () => {
    setCodeError('');
    if (!code.trim()) {
      setCodeError('O código é obrigatório');
      return;
    }
    if (code.length < 6) {
      setCodeError('Insira o código de 6 dígitos');
      return;
    }
    const isOTPValid = /^\d{6}$/.test(code);
    if (!isOTPValid) {
      setCodeError('O código deve conter apenas números');
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/auth/verify-code', { email: email.trim().toLowerCase(), code });
      setStep('password');
    } catch (err: any) {
      setCodeError(err.message || 'Código de verificação inválido ou expirado');
    } finally {
      setIsLoading(false);
    }
  };

  // Handler da Nova Senha (Passo 3)
  const handlePasswordSubmit = async () => {
    setPasswordError('');
    setConfirmPasswordError('');

    let hasError = false;
    if (password.length < 6) {
      setPasswordError('A senha deve ter pelo menos 6 caracteres');
      hasError = true;
    }
    if (!confirmPassword) {
      setConfirmPasswordError('Confirme sua senha');
      hasError = true;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError('As senhas não coincidem');
      hasError = true;
    }

    if (hasError) return;

    setIsLoading(true);
    try {
      await api.post('/auth/reset-password', {
        email: email.trim().toLowerCase(),
        password,
        code
      });
      setStep('success');
    } catch (err: any) {
      setPasswordError(err.message || 'Erro ao redefinir a senha. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (timer > 0) return;
    setIsLoading(true);
    try {
      await api.post('/auth/verify-email', { email: email.trim().toLowerCase() });
      setTimer(59);
      setCode('');
      setCodeError('');
    } catch (err: any) {
      setCodeError(err.message || 'Erro ao reenviar o código');
    } finally {
      setIsLoading(false);
    }
  };


  const renderStepContent = () => {
    switch (step) {
      case 'email':
        return (
          <View>
            <View style={styles.header}>
              <Text style={styles.title}>Recuperar Senha</Text>
              <Text style={styles.subtitle}>
                Informe seu e-mail e enviaremos um código de verificação para redefinir sua senha.
              </Text>
            </View>

            <Input
              label="E-mail"
              placeholder="seu@email.com"
              value={email}
              onChangeText={(txt) => {
                setEmail(txt);
                if (emailError) setEmailError('');
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              error={emailError}
              leftIcon={<Mail size={20} color={colors.outline} />}
            />

            <View style={{ marginTop: spacing.sm }}>
              <Button
                title="Enviar Código"
                onPress={handleEmailSubmit}
                loading={isLoading}
                fullWidth
                size="lg"
                rightIcon={<ArrowRight size={20} color={colors.onPrimary} />}
              />
            </View>
          </View>
        );
      case 'code':
        return (
          <View>
            <View style={styles.header}>
              <Text style={styles.title}>Insira o Código</Text>
              <Text style={styles.subtitle}>
                Digite o código de 6 dígitos enviado para o e-mail:
              </Text>
              <Text style={[styles.subtitle, { fontWeight: '600', color: colors.onSurface, marginTop: 4 }]}>
                {email}
              </Text>
            </View>

            <Input
              label="Código de Verificação"
              placeholder="Digite os 6 números"
              value={code}
              onChangeText={(txt) => {
                setCode(txt.replace(/\D/g, '').slice(0, 6));
                if (codeError) setCodeError('');
              }}
              keyboardType="number-pad"
              autoCapitalize="none"
              error={codeError}
              leftIcon={<ShieldCheck size={20} color={colors.outline} />}
            />

            <View style={styles.resendContainer}>
              <Text style={styles.resendTxt}>Não recebeu o código?</Text>
              <TouchableOpacity onPress={handleResendCode} disabled={timer > 0}>
                <Text style={[styles.resendAction, timer > 0 ? { color: colors.outline } : {}]}>
                  {timer > 0 ? `Reenviar em ${timer}s` : 'Reenviar Código'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={{ marginTop: spacing.sm }}>
              <Button
                title="Confirmar Código"
                onPress={handleCodeSubmit}
                loading={isLoading}
                fullWidth
                size="lg"
                rightIcon={<ArrowRight size={20} color={colors.onPrimary} />}
              />
            </View>
          </View>
        );
      case 'password':
        return (
          <View>
            <View style={styles.header}>
              <Text style={styles.title}>Nova Senha</Text>
              <Text style={styles.subtitle}>
                Crie uma nova senha forte para acessar sua conta com segurança.
              </Text>
            </View>

            <Input
              label="Nova Senha"
              placeholder="Digite pelo menos 6 caracteres"
              value={password}
              onChangeText={(txt) => {
                setPassword(txt);
                if (passwordError) setPasswordError('');
              }}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              error={passwordError}
              leftIcon={<Lock size={20} color={colors.outline} />}
              rightIcon={showPassword ? <EyeOff size={20} color={colors.outline} /> : <Eye size={20} color={colors.outline} />}
              onRightIconPress={() => setShowPassword(!showPassword)}
            />

            <Input
              label="Confirmar Nova Senha"
              placeholder="Confirme sua nova senha"
              value={confirmPassword}
              onChangeText={(txt) => {
                setConfirmPassword(txt);
                if (confirmPasswordError) setConfirmPasswordError('');
              }}
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
              error={confirmPasswordError}
              leftIcon={<KeyRound size={20} color={colors.outline} />}
              rightIcon={showConfirmPassword ? <EyeOff size={20} color={colors.outline} /> : <Eye size={20} color={colors.outline} />}
              onRightIconPress={() => setShowConfirmPassword(!showConfirmPassword)}
            />

            <View style={{ marginTop: spacing.sm }}>
              <Button
                title="Redefinir Senha"
                onPress={handlePasswordSubmit}
                loading={isLoading}
                fullWidth
                size="lg"
                rightIcon={<ArrowRight size={20} color={colors.onPrimary} />}
              />
            </View>
          </View>
        );
      case 'success':
        return (
          <View style={styles.successContainer}>
            <View style={styles.successIcon}>
              <CheckCircle size={48} color={colors.primary} />
            </View>
            <Text style={styles.successTitle}>Senha Redefinida!</Text>
            <Text style={styles.successText}>
              Sua senha foi redefinida com sucesso. Agora você já pode acessar a plataforma utilizando suas novas credenciais.
            </Text>
            <Button
              title="Ir para o Login"
              onPress={() => router.replace('/(auth)/login')}
              fullWidth
              size="lg"
              rightIcon={<ArrowRight size={20} color={colors.onPrimary} />}
            />
          </View>
        );
      default:
        return null;
    }
  };

  const showBackButton = step !== 'success';
  const showProgressBar = step !== 'success';

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
        {showBackButton ? (
          <TouchableOpacity
            onPress={() => {
              if (step === 'email') router.back();
              else if (step === 'code') setStep('email');
              else if (step === 'password') setStep('code');
            }}
            style={styles.backButton}
          >
            <ArrowLeft size={24} color={colors.onSurface} />
          </TouchableOpacity>
        ) : null}

        {showProgressBar ? (
          <View style={styles.progressBar}>
            <View style={[styles.progressStep, styles.stepActive]} />
            <View style={[styles.progressLine, (step === 'code' || step === 'password') ? styles.stepActive : {}]} />
            <View style={[styles.progressStep, (step === 'code' || step === 'password') ? styles.stepActive : {}]} />
            <View style={[styles.progressLine, step === 'password' ? styles.stepActive : {}]} />
            <View style={[styles.progressStep, step === 'password' ? styles.stepActive : {}]} />
          </View>
        ) : null}

        {renderStepContent()}
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
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
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
  progressBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.xl,
  },
  progressStep: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.surfaceContainerHigh,
  },
  progressLine: {
    flex: 1,
    height: 3,
    backgroundColor: colors.surfaceContainerHigh,
    marginHorizontal: 4,
  },
  stepActive: {
    backgroundColor: colors.primary,
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
  helperText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.bodySm,
    color: colors.outline,
    marginTop: -8,
    marginBottom: spacing.md,
    marginLeft: 4,
  },
  resendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing.lg,
    marginLeft: 4,
  },
  resendTxt: {
    fontFamily: fonts.body,
    fontSize: fontSizes.bodyMd,
    color: colors.onSurfaceVariant,
  },
  resendAction: {
    fontFamily: fonts.label,
    fontSize: fontSizes.labelLg,
    color: colors.primary,
    fontWeight: '600',
  },
  submitBtn: {
    marginTop: spacing.sm,
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
