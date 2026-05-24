// OdontoSync — Admin: Settings (Stitch: ca2b18e4)
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity, Modal, TouchableWithoutFeedback, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LogOut, Bell, Clock, MessageSquare, Users, Shield, ChevronRight, X } from 'lucide-react-native';
import { Card } from '@/src/components/ui/Card';
import { Avatar } from '@/src/components/ui/Avatar';
import { Input } from '@/src/components/ui/Input';
import { Button } from '@/src/components/ui/Button';
import { Alert } from '@/src/components/ui/Alert';
import { useAuthStore } from '@/src/stores/authStore';
import { useClinicStore } from '@/src/stores/clinicStore';
import { colors, fonts, fontSizes, spacing } from '@/src/styles/tokens';

export default function SettingsScreen() {
  const { user, logout } = useAuthStore();
  const { config, updateConfig, team } = useClinicStore();
  const [absenceReduction, setAbsenceReduction] = useState(config.absenceReduction);
  const [isTeamModalVisible, setIsTeamModalVisible] = useState(false);
  const [isTemplateModalVisible, setIsTemplateModalVisible] = useState(false);
  const [editingTemplateType, setEditingTemplateType] = useState<'confirmation' | 'cancellation' | null>(null);
  const [templateText, setTemplateText] = useState('');

  const openTemplateModal = (type: 'confirmation' | 'cancellation') => {
    setEditingTemplateType(type);
    setTemplateText(type === 'confirmation' ? config.confirmationTemplate : config.cancellationTemplate);
    setIsTemplateModalVisible(true);
  };

  const saveTemplate = () => {
    if (editingTemplateType === 'confirmation') {
      updateConfig({ confirmationTemplate: templateText });
    } else if (editingTemplateType === 'cancellation') {
      updateConfig({ cancellationTemplate: templateText });
    }
    setIsTemplateModalVisible(false);
  };

  const handleLogout = () => {
    Alert.alert('Sair', 'Tem certeza que deseja sair?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: logout },
    ]);
  };

  const toggleNoShow = (val: boolean) => {
    setAbsenceReduction(val);
    updateConfig({ absenceReduction: val });
  };

  // Limpar nome do Administrador: remover parênteses e pegar no máximo os 2 primeiros nomes
  const rawName = user?.name ?? 'Administrador';
  const cleanName = rawName.replace(/\s*\(.*\)/g, '').trim();
  const nameParts = cleanName.split(' ');
  const displayName = nameParts.slice(0, 2).join(' ');

  return (
    <SafeAreaView style={s.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        <Text style={s.title}>Perfil</Text>

        <Card style={s.profileCard}>
          <View style={s.profileRow}>
            <Avatar name={displayName} size={56} showBorder />
            <View style={{ flex: 1 }}>
              <Text style={s.profileName}>{displayName}</Text>
              <Text style={s.profileRole}>Administrador</Text>
            </View>
          </View>
        </Card>

        <Text style={s.secTitle}>Notificações</Text>
        <Card variant="filled" padding="md" style={s.settingCard}>
          <View style={s.settingRow}>
            <View style={s.settingLeft}>
              <View style={s.settingIcon}><Bell size={18} color={colors.primary} /></View>
              <View><Text style={s.settingLabel}>Redução de Faltas</Text><Text style={s.settingSub}>Lembretes automáticos antes da consulta</Text></View>
            </View>
            <Switch value={absenceReduction} onValueChange={toggleNoShow} trackColor={{ false: colors.surfaceContainerHigh, true: colors.primaryFixed }} thumbColor={absenceReduction ? colors.primary : colors.outline} />
          </View>
          <View style={s.divider} />
          <View style={s.settingRow}>
            <View style={s.settingLeft}>
              <View style={s.settingIcon}><Clock size={18} color={colors.primary} /></View>
              <View><Text style={s.settingLabel}>Lembrete Antecipado</Text><Text style={s.settingSub}>{config.reminderHoursBefore}h antes da consulta</Text></View>
            </View>
            <ChevronRight size={18} color={colors.outline} />
          </View>
        </Card>

        <Text style={s.secTitle}>Templates de Mensagem</Text>
        <Card variant="filled" padding="md" style={s.settingCard}>
          <TouchableOpacity style={s.settingRow} onPress={() => openTemplateModal('confirmation')}>
            <View style={s.settingLeft}>
              <View style={s.settingIcon}><MessageSquare size={18} color={colors.primary} /></View>
              <View style={{ flex: 1 }}><Text style={s.settingLabel}>Confirmação</Text><Text style={s.settingSub} numberOfLines={1}>{config.confirmationTemplate}</Text></View>
            </View>
            <ChevronRight size={18} color={colors.outline} />
          </TouchableOpacity>
          <View style={s.divider} />
          <TouchableOpacity style={s.settingRow} onPress={() => openTemplateModal('cancellation')}>
            <View style={s.settingLeft}>
              <View style={s.settingIcon}><MessageSquare size={18} color={colors.tertiary} /></View>
              <View style={{ flex: 1 }}><Text style={s.settingLabel}>Cancelamento</Text><Text style={s.settingSub} numberOfLines={1}>{config.cancellationTemplate}</Text></View>
            </View>
            <ChevronRight size={18} color={colors.outline} />
          </TouchableOpacity>
        </Card>

        <Text style={s.secTitle}>Equipe</Text>
        <Card variant="filled" padding="md" style={s.settingCard}>
          {team.slice(0, 3).map((m, i) => (
            <View key={m.id}>
              {i > 0 && <View style={s.divider} />}
              <View style={s.settingRow}>
                <View style={s.settingLeft}>
                  <View style={s.settingIcon}><Users size={18} color={colors.primary} /></View>
                  <View><Text style={s.settingLabel}>{m.name}</Text><Text style={s.settingSub}>{m.permissions}</Text></View>
                </View>
                <View style={s.roleBadge}><Text style={s.roleTxt}>{m.role}</Text></View>
              </View>
            </View>
          ))}
          {team.length > 3 && (
            <>
              <View style={s.divider} />
              <TouchableOpacity style={s.seeMoreBtn} onPress={() => setIsTeamModalVisible(true)} activeOpacity={0.7}>
                <Text style={s.seeMoreTxt}>Ver mais equipe ({team.length})</Text>
                <ChevronRight size={16} color={colors.primary} />
              </TouchableOpacity>
            </>
          )}
        </Card>

        <TouchableOpacity style={s.logoutBtn} onPress={handleLogout}>
          <LogOut size={20} color={colors.error} />
          <Text style={s.logoutTxt}>Sair da Conta</Text>
        </TouchableOpacity>

        <Text style={s.version}>Odonto Excell — Admin</Text>
      </ScrollView>

      {/* Modal Visão Geral da Equipe */}
      <Modal
        visible={isTeamModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsTeamModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setIsTeamModalVisible(false)}>
          <View style={s.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={s.modalContent}>
                <View style={s.modalDragHandle} />
                
                <View style={s.modalHeaderRow}>
                  <Text style={s.modalTitle}>Equipe Completa</Text>
                  <TouchableOpacity style={s.closeBtn} onPress={() => setIsTeamModalVisible(false)}>
                    <X size={20} color={colors.outline} />
                  </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.teamModalScroll}>
                  {team.map((m, i) => (
                    <View key={m.id}>
                      {i > 0 && <View style={s.divider} />}
                      <View style={s.settingRow}>
                        <View style={s.settingLeft}>
                          <View style={s.settingIcon}><Users size={18} color={colors.primary} /></View>
                          <View><Text style={s.settingLabel}>{m.name}</Text><Text style={s.settingSub}>{m.permissions}</Text></View>
                        </View>
                        <View style={s.roleBadge}><Text style={s.roleTxt}>{m.role}</Text></View>
                      </View>
                    </View>
                  ))}
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Modal Edição de Template */}
      <Modal
        visible={isTemplateModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsTemplateModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setIsTemplateModalVisible(false)}>
          <View style={s.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={[s.modalContent, { height: '60%' }]}>
                <View style={s.modalDragHandle} />
                
                <View style={s.modalHeaderRow}>
                  <Text style={s.modalTitle}>Editar Mensagem</Text>
                  <TouchableOpacity style={s.closeBtn} onPress={() => setIsTemplateModalVisible(false)}>
                    <X size={20} color={colors.outline} />
                  </TouchableOpacity>
                </View>

                <TextInput
                  style={s.textArea}
                  multiline
                  textAlignVertical="top"
                  value={templateText}
                  onChangeText={setTemplateText}
                  placeholder="Digite a mensagem do template..."
                  placeholderTextColor={colors.outline}
                />

                <View style={s.modalActions}>
                  <TouchableOpacity 
                    style={[s.actionBtn, s.cancelBtn]} 
                    onPress={() => setIsTemplateModalVisible(false)}
                  >
                    <Text style={s.cancelBtnTxt}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[s.actionBtn, s.confirmBtn]} 
                    onPress={saveTemplate}
                  >
                    <Text style={s.confirmBtnTxt}>Confirmar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl },
  title: { fontFamily: fonts.headline, fontSize: fontSizes.headlineMd, fontWeight: '700', color: colors.onSurface, paddingTop: spacing.md, marginBottom: spacing.xl },
  profileCard: { marginBottom: spacing.xl },
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  profileName: { fontFamily: fonts.headline, fontSize: fontSizes.titleLg, fontWeight: '600', color: colors.onSurface },
  profileRole: { fontFamily: fonts.label, fontSize: fontSizes.labelMd, color: colors.primary, marginTop: 2 },
  secTitle: { fontFamily: fonts.headline, fontSize: fontSizes.titleMd, fontWeight: '600', color: colors.onSurface, marginBottom: spacing.sm, marginTop: spacing.md },
  settingCard: { marginBottom: spacing.md },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8 },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  settingIcon: { width: 36, height: 36, borderRadius: 12, backgroundColor: colors.primaryFixed + '30', alignItems: 'center', justifyContent: 'center' },
  settingLabel: { fontFamily: fonts.body, fontSize: fontSizes.bodyMd, color: colors.onSurface, fontWeight: '500' },
  settingSub: { fontFamily: fonts.label, fontSize: fontSizes.labelSm, color: colors.outline, marginTop: 1 },
  divider: { height: 1, backgroundColor: colors.outlineVariant + '30', marginVertical: 8 },
  roleBadge: { backgroundColor: colors.secondaryContainer, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  roleTxt: { fontFamily: fonts.label, fontSize: fontSizes.labelSm, color: colors.onSecondaryContainer, fontWeight: '600', textTransform: 'capitalize' },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 16, backgroundColor: colors.errorContainer, marginTop: spacing.xl, marginBottom: spacing.md },
  logoutTxt: { fontFamily: fonts.label, fontSize: fontSizes.labelLg, color: colors.error, fontWeight: '600' },
  version: { fontFamily: fonts.body, fontSize: fontSizes.labelSm, color: colors.outline, textAlign: 'center' },
  
  seeMoreBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 8 },
  seeMoreTxt: { fontFamily: fonts.label, fontSize: fontSizes.labelMd, color: colors.primary, fontWeight: '600' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.45)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: colors.surfaceContainerLowest, borderTopLeftRadius: 28, borderTopRightRadius: 28, height: '80%', paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.xl },
  modalDragHandle: { width: 40, height: 4, backgroundColor: colors.outlineVariant, borderRadius: 2, alignSelf: 'center', marginBottom: spacing.lg },
  modalHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xl },
  modalTitle: { fontFamily: fonts.headline, fontSize: fontSizes.titleLg, fontWeight: '700', color: colors.onSurface },
  closeBtn: { padding: 8, borderRadius: 20, backgroundColor: colors.surfaceContainerLow },
  teamModalScroll: { paddingBottom: spacing.xl },
  textArea: {
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: 16,
    padding: 16,
    color: colors.onSurface,
    fontFamily: fonts.body,
    fontSize: fontSizes.bodyMd,
    flex: 1,
    marginBottom: spacing.xl,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtn: {
    backgroundColor: colors.surfaceContainerHigh,
  },
  confirmBtn: {
    backgroundColor: colors.primary,
  },
  cancelBtnTxt: {
    fontFamily: fonts.label,
    fontSize: fontSizes.labelLg,
    color: colors.onSurface,
    fontWeight: '600',
  },
  confirmBtnTxt: {
    fontFamily: fonts.label,
    fontSize: fontSizes.labelLg,
    color: colors.onPrimary,
    fontWeight: '600',
  },
});
