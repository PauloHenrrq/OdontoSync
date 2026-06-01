// ============================================================
// OdontoSync — Client: Perfil do Paciente
// Menu com modais funcionais para cada seção.
// ============================================================

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import {
  LogOut,
  ChevronRight,
  History,
  Settings,
  Shield,
  HelpCircle,
  User,
  X,
  Phone,
  Mail,
  Bell,
  Lock,
  MessageCircle,
  FileText,
  Eye,
  EyeOff,
  KeyRound,
} from 'lucide-react-native';
import { Card } from '@/src/components/ui/Card';
import { Avatar } from '@/src/components/ui/Avatar';
import { Alert } from '@/src/components/ui/Alert';
import { Input } from '@/src/components/ui/Input';
import { Button } from '@/src/components/ui/Button';
import { api } from '@/src/services/api';
import { useAuthStore } from '@/src/stores/authStore';
import { useAppointmentStore } from '@/src/stores/appointmentStore';
import { useClinicStore } from '@/src/stores/clinicStore';
import { colors, fonts, fontSizes, spacing } from '@/src/styles/tokens';

type ModalType = 'personal' | 'privacy' | 'settings' | 'help' | 'changePassword' | null;

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { getMyAppointments } = useAppointmentStore();
  const { config } = useClinicStore();
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [pushEnabled, setPushEnabled] = useState(true);
  const [reminderEnabled, setReminderEnabled] = useState(true);

  // Estados do Modal Alterar Senha
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const [currentPasswordError, setCurrentPasswordError] = useState('');
  const [newPasswordError, setNewPasswordError] = useState('');
  const [confirmNewPasswordError, setConfirmNewPasswordError] = useState('');

  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmNewPass, setShowConfirmNewPass] = useState(false);

  const closeModal = () => {
    setActiveModal(null);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
    setCurrentPasswordError('');
    setNewPasswordError('');
    setConfirmNewPasswordError('');
  };

  const handleChangePassword = async () => {
    setCurrentPasswordError('');
    setNewPasswordError('');
    setConfirmNewPasswordError('');

    let hasError = false;

    if (!currentPassword) {
      setCurrentPasswordError('A senha atual é obrigatória');
      hasError = true;
    }
    if (newPassword.length < 6) {
      setNewPasswordError('A nova senha deve ter pelo menos 6 caracteres');
      hasError = true;
    }
    if (!confirmNewPassword) {
      setConfirmNewPasswordError('Confirme sua nova senha');
      hasError = true;
    } else if (newPassword !== confirmNewPassword) {
      setConfirmNewPasswordError('As novas senhas não coincidem');
      hasError = true;
    }

    if (hasError) return;

    setIsChangingPassword(true);
    try {
      await api.post('/auth/change-password', {
        currentPassword,
        newPassword,
      });

      Alert.alert('Sucesso', 'Sua senha foi alterada com sucesso! Um e-mail de notificação de segurança foi enviado para a sua caixa de entrada.');
      closeModal();
    } catch (err: any) {
      setCurrentPasswordError(err.message || 'Erro ao alterar a senha. Verifique se a senha atual está correta.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      useAppointmentStore.getState().fetchAppointments();
    }, [])
  );

  const appointments = user ? getMyAppointments(user.id) : [];

  const isAppointmentExpired = (dateStr: string, timeStr: string): boolean => {
    try {
      const [year, month, day] = dateStr.split('-').map(Number);
      const [hours, minutes] = timeStr.split(':').map(Number);
      const appointmentTime = new Date(year, month - 1, day, hours, minutes);
      const limitTime = new Date(appointmentTime.getTime() + 15 * 60 * 1000);
      return new Date() > limitTime;
    } catch {
      return false;
    }
  };

  const completedCount = appointments.filter(
    (a) => a.status === 'COMPLETED' || (a.status !== 'CANCELLED' && isAppointmentExpired(a.date, a.time))
  ).length;

  const upcomingCount = appointments.filter(
    (a) => (a.status === 'CONFIRMED' || a.status === 'PENDING') && !isAppointmentExpired(a.date, a.time)
  ).length;
  const memberSince = user?.createdAt ? new Date(user.createdAt).getFullYear() : new Date().getFullYear();

  const handleLogout = () => {
    Alert.alert('Sair', 'Tem certeza que deseja sair?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: () => logout() },
    ]);
  };

  const menuItems: { icon: typeof History; label: string; count?: number; action: () => void }[] = [
    { icon: History, label: 'Histórico de Consultas', count: completedCount, action: () => router.push('/(client)/appointments') },
    { icon: User, label: 'Dados Pessoais', action: () => setActiveModal('personal') },
    { icon: Shield, label: 'Privacidade e Segurança', action: () => setActiveModal('privacy') },
    { icon: Settings, label: 'Configurações', action: () => setActiveModal('settings') },
    { icon: HelpCircle, label: 'Ajuda e Suporte', action: () => setActiveModal('help') },
  ];

  // ── Modal Header reutilizável ──
  const ModalHeader = ({ title }: { title: string }) => (
    <View style={m.header}>
      <Text style={m.title}>{title}</Text>
      <TouchableOpacity onPress={closeModal} style={m.closeBtn}>
        <X size={22} color={colors.onSurface} />
      </TouchableOpacity>
    </View>
  );

  // ── Linha de informação reutilizável ──
  const InfoRow = ({ icon: Icon, label, value }: { icon: typeof Phone; label: string; value: string }) => (
    <View style={m.infoRow}>
      <View style={m.infoIconBg}>
        <Icon size={18} color={colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={m.infoLabel}>{label}</Text>
        <Text style={m.infoValue}>{value}</Text>
      </View>
    </View>
  );

  // ── Toggle reutilizável ──
  const ToggleRow = ({ icon: Icon, label, value, onToggle }: { icon: typeof Bell; label: string; value: boolean; onToggle: (v: boolean) => void }) => (
    <View style={m.toggleRow}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
        <View style={m.infoIconBg}>
          <Icon size={18} color={colors.primary} />
        </View>
        <Text style={m.toggleLabel}>{label}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: colors.surfaceContainerHigh, true: colors.primaryFixed }}
        thumbColor={value ? colors.primary : colors.outline}
      />
    </View>
  );

  return (
    <SafeAreaView style={s.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        <Text style={s.title}>Perfil</Text>

        <Card style={s.profileCard}>
          <View style={s.profileRow}>
            <Avatar name={user?.name ?? 'User'} size={64} showBorder />
            <View style={s.profileInfo}>
              <Text style={s.profileName}>{user?.name}</Text>
              <Text style={s.profilePhone}>{user?.phone}</Text>
              <Text style={s.profileEmail}>{user?.email}</Text>
            </View>
          </View>
        </Card>

        <View style={s.stats}>
          <View style={s.stat}>
            <Text style={s.statVal}>{upcomingCount}</Text>
            <Text style={s.statLabel}>Próximas</Text>
          </View>
          <View style={s.divider} />
          <View style={s.stat}>
            <Text style={s.statVal}>{completedCount}</Text>
            <Text style={s.statLabel}>Realizadas</Text>
          </View>
          <View style={s.divider} />
          <View style={s.stat}>
            <Text style={[s.statVal, { color: colors.tertiary }]}>{memberSince}</Text>
            <Text style={s.statLabel}>Desde</Text>
          </View>
        </View>

        <View style={s.menuSection}>
          {menuItems.map((item) => (
            <TouchableOpacity key={item.label} style={s.menuItem} activeOpacity={0.7} onPress={item.action}>
              <View style={s.menuLeft}>
                <View style={s.menuIcon}><item.icon size={20} color={colors.primary} /></View>
                <Text style={s.menuLabel}>{item.label}</Text>
              </View>
              <View style={s.menuRight}>
                {item.count !== undefined && (
                  <View style={s.menuCount}><Text style={s.menuCountTxt}>{item.count}</Text></View>
                )}
                <ChevronRight size={18} color={colors.outline} />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={s.logoutBtn} onPress={handleLogout}>
          <LogOut size={20} color={colors.error} />
          <Text style={s.logoutTxt}>Sair da Conta</Text>
        </TouchableOpacity>

        <Text style={s.version}>Odonto Excell v1.0.0</Text>
      </ScrollView>

      {/* ══════════ MODAL: Dados Pessoais ══════════ */}
      <Modal visible={activeModal === 'personal'} transparent animationType="slide" onRequestClose={closeModal}>
        <TouchableWithoutFeedback onPress={closeModal}><View style={m.overlay} /></TouchableWithoutFeedback>
        <View style={m.sheet}>
          <ModalHeader title="Dados Pessoais" />
          <ScrollView showsVerticalScrollIndicator={false}>
            <InfoRow icon={User} label="Nome Completo" value={user?.name ?? '—'} />
            <InfoRow icon={Mail} label="E-mail" value={user?.email ?? '—'} />
            <InfoRow icon={Phone} label="Telefone" value={user?.phone ?? '—'} />
            <View style={m.notice}>
              <Text style={m.noticeText}>
                Para alterar seus dados, entre em contato com a recepção da clínica.
              </Text>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* ══════════ MODAL: Privacidade e Segurança ══════════ */}
      <Modal visible={activeModal === 'privacy'} transparent animationType="slide" onRequestClose={closeModal}>
        <TouchableWithoutFeedback onPress={closeModal}><View style={m.overlay} /></TouchableWithoutFeedback>
        <View style={m.sheet}>
          <ModalHeader title="Privacidade e Segurança" />
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={m.sectionCard}>
              <View style={m.sectionIcon}>
                <Lock size={22} color={colors.primary} />
              </View>
              <Text style={m.sectionTitle}>Proteção da Conta</Text>
              <Text style={m.sectionDesc}>
                Sua conta está protegida com autenticação via e-mail e senha criptografada. Seus dados são armazenados em servidores seguros com criptografia end-to-end.
              </Text>
              <TouchableOpacity
                style={m.changePasswordInlineBtn}
                onPress={() => setActiveModal('changePassword')}
                activeOpacity={0.7}
              >
                <Lock size={16} color={colors.primary} />
                <Text style={m.changePasswordInlineTxt}>Alterar Senha de Acesso</Text>
              </TouchableOpacity>
            </View>
            <View style={m.sectionCard}>
              <View style={m.sectionIcon}>
                <FileText size={22} color={colors.primary} />
              </View>
              <Text style={m.sectionTitle}>Uso dos Dados</Text>
              <Text style={m.sectionDesc}>
                Utilizamos seus dados exclusivamente para gerenciar seus agendamentos e enviar lembretes de consultas. Nenhuma informação é compartilhada com terceiros.
              </Text>
            </View>
            <View style={m.sectionCard}>
              <View style={m.sectionIcon}>
                <Shield size={22} color={colors.primary} />
              </View>
              <Text style={m.sectionTitle}>Seus Direitos (LGPD)</Text>
              <Text style={m.sectionDesc}>
                Conforme a Lei Geral de Proteção de Dados, você pode solicitar acesso, correção ou exclusão dos seus dados pessoais a qualquer momento entrando em contato com a clínica.
              </Text>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* ══════════ MODAL: Alterar Senha ══════════ */}
      <Modal visible={activeModal === 'changePassword'} transparent animationType="slide" onRequestClose={closeModal}>
        <TouchableWithoutFeedback onPress={() => setActiveModal('privacy')}><View style={m.overlay} /></TouchableWithoutFeedback>
        <View style={[m.sheet, { height: '75%' }]}>
          <View style={m.modalHeader}>
            <Text style={m.modalTitle}>Alterar Senha</Text>
            <TouchableOpacity onPress={() => setActiveModal('privacy')} style={m.closeBtn}>
              <X size={20} color={colors.outline} />
            </TouchableOpacity>
          </View>
          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <Text style={m.modalDesc}>
              Para sua segurança, digite a sua senha atual antes de cadastrar uma nova combinação.
            </Text>

            <Input
              label="Senha Atual"
              placeholder="Digite sua senha atual"
              value={currentPassword}
              onChangeText={(txt) => {
                setCurrentPassword(txt);
                if (currentPasswordError) setCurrentPasswordError('');
              }}
              secureTextEntry={!showCurrentPass}
              autoCapitalize="none"
              error={currentPasswordError}
              leftIcon={<Lock size={18} color={colors.outline} />}
              rightIcon={showCurrentPass ? <EyeOff size={18} color={colors.outline} /> : <Eye size={18} color={colors.outline} />}
              onRightIconPress={() => setShowCurrentPass(!showCurrentPass)}
            />

            <Input
              label="Nova Senha"
              placeholder="Mínimo de 6 caracteres"
              value={newPassword}
              onChangeText={(txt) => {
                setNewPassword(txt);
                if (newPasswordError) setNewPasswordError('');
              }}
              secureTextEntry={!showNewPass}
              autoCapitalize="none"
              error={newPasswordError}
              leftIcon={<Lock size={18} color={colors.outline} />}
              rightIcon={showNewPass ? <EyeOff size={18} color={colors.outline} /> : <Eye size={18} color={colors.outline} />}
              onRightIconPress={() => setShowNewPass(!showNewPass)}
            />

            <Input
              label="Confirmar Nova Senha"
              placeholder="Confirme a nova senha"
              value={confirmNewPassword}
              onChangeText={(txt) => {
                setConfirmNewPassword(txt);
                if (confirmNewPasswordError) setConfirmNewPasswordError('');
              }}
              secureTextEntry={!showConfirmNewPass}
              autoCapitalize="none"
              error={confirmNewPasswordError}
              leftIcon={<KeyRound size={18} color={colors.outline} />}
              rightIcon={showConfirmNewPass ? <EyeOff size={18} color={colors.outline} /> : <Eye size={18} color={colors.outline} />}
              onRightIconPress={() => setShowConfirmNewPass(!showConfirmNewPass)}
            />

            <View style={{ marginTop: spacing.md }}>
              <Button
                title="Salvar Nova Senha"
                onPress={handleChangePassword}
                loading={isChangingPassword}
                fullWidth
                size="lg"
              />
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* ══════════ MODAL: Configurações ══════════ */}
      <Modal visible={activeModal === 'settings'} transparent animationType="slide" onRequestClose={closeModal}>
        <TouchableWithoutFeedback onPress={closeModal}><View style={m.overlay} /></TouchableWithoutFeedback>
        <View style={m.sheet}>
          <ModalHeader title="Configurações" />
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={m.groupTitle}>Notificações</Text>
            <ToggleRow icon={Bell} label="Notificações Push" value={pushEnabled} onToggle={setPushEnabled} />
            <ToggleRow icon={MessageCircle} label="Lembretes de Consulta" value={reminderEnabled} onToggle={setReminderEnabled} />
            <View style={m.notice}>
              <Text style={m.noticeText}>
                Os lembretes são enviados via WhatsApp no horário configurado pela clínica antes da consulta.
              </Text>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* ══════════ MODAL: Ajuda e Suporte ══════════ */}
      <Modal visible={activeModal === 'help'} transparent animationType="slide" onRequestClose={closeModal}>
        <TouchableWithoutFeedback onPress={closeModal}><View style={m.overlay} /></TouchableWithoutFeedback>
        <View style={m.sheet}>
          <ModalHeader title="Ajuda e Suporte" />
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={m.groupTitle}>Perguntas Frequentes</Text>

            <View style={m.faqItem}>
              <Text style={m.faqQ}>Como agendar uma consulta?</Text>
              <Text style={m.faqA}>
                O agendamento é feito diretamente pela recepção da clínica, via telefone ou WhatsApp. Após confirmado, a consulta aparecerá na sua aba "Consultas".
              </Text>
            </View>
            <View style={m.faqItem}>
              <Text style={m.faqQ}>Como cancelar uma consulta?</Text>
              <Text style={m.faqA}>
                Para cancelar, entre em contato com a recepção com pelo menos 24 horas de antecedência pelo telefone ou WhatsApp da clínica.
              </Text>
            </View>
            <View style={m.faqItem}>
              <Text style={m.faqQ}>Como alterar meus dados?</Text>
              <Text style={m.faqA}>
                Solicite a alteração diretamente na recepção da clínica durante sua próxima visita ou via WhatsApp.
              </Text>
            </View>

            <Text style={[m.groupTitle, { marginTop: spacing.lg }]}>Contato da Clínica</Text>
            <InfoRow icon={Phone} label="Telefone" value={config.phone ?? '(11) 99999-9999'} />
            <InfoRow icon={Mail} label="E-mail" value="contato@odontoexcell.com" />
          </ScrollView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ══════════ Estilos da Tela ══════════

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl },
  title: { fontFamily: fonts.headline, fontSize: fontSizes.headlineMd, fontWeight: '700', color: colors.onSurface, paddingTop: spacing.md, marginBottom: spacing.xl },
  profileCard: { marginBottom: spacing.lg },
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  profileInfo: { flex: 1 },
  profileName: { fontFamily: fonts.headline, fontSize: fontSizes.titleLg, fontWeight: '600', color: colors.onSurface },
  profilePhone: { fontFamily: fonts.body, fontSize: fontSizes.bodyMd, color: colors.primary, marginTop: 2 },
  profileEmail: { fontFamily: fonts.body, fontSize: fontSizes.bodySm, color: colors.onSurfaceVariant, marginTop: 2 },
  stats: { flexDirection: 'row', backgroundColor: colors.surfaceContainerLowest, borderRadius: 20, padding: spacing.lg, marginBottom: spacing.lg, justifyContent: 'space-around', alignItems: 'center' },
  stat: { alignItems: 'center' },
  statVal: { fontFamily: fonts.headline, fontSize: fontSizes.headlineSm, fontWeight: '700', color: colors.primary },
  statLabel: { fontFamily: fonts.label, fontSize: fontSizes.labelSm, color: colors.onSurfaceVariant, marginTop: 4 },
  divider: { width: 1, height: 32, backgroundColor: colors.outlineVariant + '40' },
  menuSection: { gap: 4, marginBottom: spacing.xl },
  menuItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 8 },
  menuLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  menuIcon: { width: 36, height: 36, borderRadius: 12, backgroundColor: colors.primaryFixed + '30', alignItems: 'center', justifyContent: 'center' },
  menuLabel: { fontFamily: fonts.body, fontSize: fontSizes.bodyLg, color: colors.onSurface },
  menuRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  menuCount: { backgroundColor: colors.surfaceContainerHigh, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 },
  menuCountTxt: { fontFamily: fonts.label, fontSize: fontSizes.labelSm, color: colors.onSurfaceVariant, fontWeight: '600' },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 16, backgroundColor: colors.errorContainer, marginBottom: spacing.lg },
  logoutTxt: { fontFamily: fonts.label, fontSize: fontSizes.labelLg, color: colors.error, fontWeight: '600' },
  version: { fontFamily: fonts.body, fontSize: fontSizes.labelSm, color: colors.outline, textAlign: 'center' },
});

// ══════════ Estilos dos Modais ══════════

const m = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: '75%',
    backgroundColor: colors.surfaceContainerLowest,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant + '40',
    marginBottom: spacing.md,
  },
  title: { fontFamily: fonts.headline, fontSize: fontSizes.titleLg, fontWeight: '600', color: colors.onSurface },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant + '20',
  },
  infoIconBg: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.primaryFixed + '30',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoLabel: { fontFamily: fonts.label, fontSize: fontSizes.labelSm, color: colors.outline },
  infoValue: { fontFamily: fonts.body, fontSize: fontSizes.bodyLg, color: colors.onSurface, fontWeight: '500', marginTop: 2 },
  notice: {
    backgroundColor: colors.primaryContainer + '20',
    borderRadius: 12,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  noticeText: { fontFamily: fonts.body, fontSize: fontSizes.bodySm, color: colors.onSurfaceVariant, lineHeight: 18 },
  groupTitle: {
    fontFamily: fonts.headline,
    fontSize: fontSizes.titleMd,
    fontWeight: '600',
    color: colors.onSurface,
    marginBottom: spacing.sm,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant + '20',
  },
  toggleLabel: { fontFamily: fonts.body, fontSize: fontSizes.bodyLg, color: colors.onSurface },
  sectionCard: {
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: 12,
  },
  sectionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryFixed + '30',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  sectionTitle: { fontFamily: fonts.headline, fontSize: fontSizes.titleMd, fontWeight: '600', color: colors.onSurface, marginBottom: 4 },
  sectionDesc: { fontFamily: fonts.body, fontSize: fontSizes.bodyMd, color: colors.onSurfaceVariant, lineHeight: 22 },
  faqItem: {
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: 10,
  },
  faqQ: { fontFamily: fonts.headline, fontSize: fontSizes.titleSm, fontWeight: '600', color: colors.onSurface, marginBottom: 4 },
  faqA: { fontFamily: fonts.body, fontSize: fontSizes.bodyMd, color: colors.onSurfaceVariant, lineHeight: 22 },
  changePasswordInlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.primary + '15',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginTop: spacing.md,
    alignSelf: 'flex-start',
  },
  changePasswordInlineTxt: {
    fontFamily: fonts.label,
    fontSize: fontSizes.labelMd,
    color: colors.primary,
    fontWeight: '600',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant + '40',
    marginBottom: spacing.md,
  },
  modalTitle: { fontFamily: fonts.headline, fontSize: fontSizes.titleLg, fontWeight: '600', color: colors.onSurface },
  modalDesc: { fontFamily: fonts.body, fontSize: fontSizes.bodyMd, color: colors.onSurfaceVariant, lineHeight: 22, marginBottom: spacing.md },
});
