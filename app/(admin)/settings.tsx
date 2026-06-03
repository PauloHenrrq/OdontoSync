// OdontoSync — Admin: Settings (Stitch: ca2b18e4)
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity, Modal, TouchableWithoutFeedback, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LogOut, Bell, Clock, MessageSquare, Users, Shield, ChevronRight, X, AlertTriangle } from 'lucide-react-native';
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

  // Estados do Modal de Lembrete Antecipado (Multiseleção)
  const [isReminderModalVisible, setIsReminderModalVisible] = useState(false);
  const [selectedHours, setSelectedHours] = useState<number[]>([]);
  const [customHoursText, setCustomHoursText] = useState('');

  // Parser de horas selecionadas: converte "24,72" para [24, 72]
  const parseHoursList = (hoursStr: string): number[] => {
    if (!hoursStr) return [];
    return hoursStr
      .split(',')
      .map((h) => parseInt(h.trim(), 10))
      .filter((h) => !isNaN(h) && h > 0)
      .sort((a, b) => a - b);
  };

  const openTemplateModal = (type: 'confirmation' | 'cancellation') => {
    setEditingTemplateType(type);
    setTemplateText(type === 'confirmation' ? config.confirmationTemplate : config.cancellationTemplate);
    setIsTemplateModalVisible(true);
  };

  const insertPlaceholder = (placeholder: string) => {
    setTemplateText((prev) => prev + placeholder);
  };

  const openReminderModal = () => {
    const list = parseHoursList(config.reminderHoursBefore);
    setSelectedHours(list);
    setCustomHoursText('');
    setIsReminderModalVisible(true);
  };

  const saveTemplate = () => {
    if (editingTemplateType === 'confirmation') {
      updateConfig({ confirmationTemplate: templateText });
    } else if (editingTemplateType === 'cancellation') {
      updateConfig({ cancellationTemplate: templateText });
    }
    setIsTemplateModalVisible(false);
  };

  const toggleReminderHour = (hour: number) => {
    setSelectedHours((prev) => {
      const exists = prev.includes(hour);
      if (exists) {
        if (prev.length > 1) {
          return prev.filter((h) => h !== hour).sort((a, b) => a - b);
        } else {
          Alert.alert('Atenção', 'É necessário manter pelo menos um lembrete ativo.');
          return prev;
        }
      } else {
        return [...prev, hour].sort((a, b) => a - b);
      }
    });
  };

  const addCustomHour = () => {
    const hour = parseInt(customHoursText, 10);
    if (isNaN(hour) || hour <= 0) {
      Alert.alert('Erro', 'Por favor, digite um valor válido em horas.');
      return;
    }
    if (selectedHours.includes(hour)) {
      Alert.alert('Atenção', 'Este horário já está adicionado.');
      return;
    }
    setSelectedHours((prev) => [...prev, hour].sort((a, b) => a - b));
    setCustomHoursText('');
  };

  const saveReminderConfig = () => {
    if (selectedHours.length === 0) {
      Alert.alert('Erro', 'Por favor, adicione pelo menos um horário de lembrete.');
      return;
    }
    const hoursStr = selectedHours.join(',');
    updateConfig({ reminderHoursBefore: hoursStr });
    setIsReminderModalVisible(false);
  };

  const formatReminderHoursText = (hoursStr: string): string => {
    const list = parseHoursList(hoursStr);
    if (list.length === 0) return 'Nenhum alerta ativo';
    
    const formatted = list.map((h) => {
      if (h >= 24 && h % 24 === 0) {
        const days = h / 24;
        return `${days} ${days === 1 ? 'dia' : 'dias'}`;
      }
      return `${h}h`;
    });

    if (formatted.length === 1) return `Alertar recepção ${formatted[0]} antes`;
    
    const last = formatted.pop();
    return `Alertar recepção ${formatted.join(', ')} e ${last} antes`;
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
              <View style={{ flex: 1 }}><Text style={s.settingLabel}>Redução de Faltas</Text><Text style={s.settingSub}>Lembretes automáticos antes da consulta</Text></View>
            </View>
            <Switch value={absenceReduction} onValueChange={toggleNoShow} trackColor={{ false: colors.surfaceContainerHigh, true: colors.primaryFixed }} thumbColor={absenceReduction ? colors.primary : colors.outline} />
          </View>
          <View style={s.divider} />
          <TouchableOpacity style={s.settingRow} onPress={openReminderModal} activeOpacity={0.7}>
            <View style={s.settingLeft}>
              <View style={s.settingIcon}><Clock size={18} color={colors.primary} /></View>
              <View style={{ flex: 1 }}><Text style={s.settingLabel}>Alerta para a Recepção</Text><Text style={s.settingSub}>{formatReminderHoursText(config.reminderHoursBefore)}</Text></View>
            </View>
            <ChevronRight size={18} color={colors.outline} />
          </TouchableOpacity>
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
              <View style={[s.modalContent, { height: '65%' }]}>
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

                <Text style={s.suggestionLabel}>Toque para inserir campos recomendados:</Text>
                <View style={s.suggestionChipsRow}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                    <TouchableOpacity style={s.suggestChip} onPress={() => insertPlaceholder('[NOME]')}>
                      <Text style={s.suggestChipTxt}>[NOME]</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={s.suggestChip} onPress={() => insertPlaceholder('[DATA]')}>
                      <Text style={s.suggestChipTxt}>[DATA]</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={s.suggestChip} onPress={() => insertPlaceholder('[HORA]')}>
                      <Text style={s.suggestChipTxt}>[HORA]</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={s.suggestChip} onPress={() => insertPlaceholder('[CLINICA]')}>
                      <Text style={s.suggestChipTxt}>[CLINICA]</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={s.suggestChip} onPress={() => insertPlaceholder('[TELEFONE]')}>
                      <Text style={s.suggestChipTxt}>[TELEFONE]</Text>
                    </TouchableOpacity>
                  </ScrollView>
                </View>

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

      {/* Modal Configuração de Alertas para a Recepção */}
      <Modal
        visible={isReminderModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsReminderModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setIsReminderModalVisible(false)}>
          <View style={s.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={[s.modalContent, { height: 'auto', maxHeight: '90%' }]}>
                <View style={s.modalDragHandle} />
                
                <View style={s.modalHeaderRow}>
                  <Text style={s.modalTitle}>Alertas para a Recepção</Text>
                  <TouchableOpacity style={s.closeBtn} onPress={() => setIsReminderModalVisible(false)}>
                    <X size={20} color={colors.outline} />
                  </TouchableOpacity>
                </View>

                {!absenceReduction && (
                  <View style={s.warningBox}>
                    <AlertTriangle size={20} color={colors.error} />
                    <Text style={s.warningTxt}>
                      A opção "Redução de Faltas" está desativada. Ative-a para visualizar os alertas de contato para a recepção.
                    </Text>
                  </View>
                )}

                <View style={s.infoBox}>
                  <Text style={s.infoTxt}>
                    Selecione com quanta antecedência a recepção será alertada sobre os agendamentos para realizar o contato e confirmar a consulta.
                  </Text>
                </View>

                <Text style={[s.secTitle, { marginTop: 0, marginBottom: 12 }]}>Alertas Ativos</Text>
                {selectedHours.length === 0 ? (
                  <Text style={{ fontFamily: fonts.body, fontSize: fontSizes.bodySm, color: colors.outline, marginBottom: spacing.md, fontStyle: 'italic' }}>
                    Nenhum alerta adicionado.
                  </Text>
                ) : (
                  <View style={s.activeChipsContainer}>
                    {selectedHours.map((h) => {
                      const label = h >= 24 && h % 24 === 0 ? `${h / 24}d` : `${h}h`;
                      return (
                        <View key={h} style={s.activeChip}>
                          <Text style={s.activeChipTxt}>{label}</Text>
                          <TouchableOpacity style={s.activeChipRemove} onPress={() => toggleReminderHour(h)} activeOpacity={0.7}>
                            <X size={10} color={colors.primary} />
                          </TouchableOpacity>
                        </View>
                      );
                    })}
                  </View>
                )}

                <Text style={[s.secTitle, { marginTop: 0, marginBottom: 12 }]}>Atalhos Rápidos</Text>
                <View style={s.presetGrid}>
                  {[
                    { label: '1h', value: 1 },
                    { label: '2h', value: 2 },
                    { label: '6h', value: 6 },
                    { label: '12h', value: 12 },
                    { label: '1 dia', value: 24 },
                    { label: '3 dias', value: 72 },
                    { label: '7 dias', value: 168 },
                  ].map((p) => {
                    const isActive = selectedHours.includes(p.value);
                    return (
                      <TouchableOpacity
                        key={p.value}
                        style={[s.presetChip, isActive && s.presetChipActive]}
                        onPress={() => toggleReminderHour(p.value)}
                      >
                        <Text style={[s.presetChipTxt, isActive && s.presetChipTxtActive]}>
                          {p.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <Text style={[s.secTitle, { marginTop: 0, marginBottom: 12 }]}>Customizar Alerta</Text>
                <View style={s.customInputRow}>
                  <Clock size={18} color={colors.primary} />
                  <TextInput
                    style={s.customInput}
                    keyboardType="numeric"
                    value={customHoursText}
                    onChangeText={setCustomHoursText}
                    placeholder="Ex: 48 (2 dias)"
                    placeholderTextColor={colors.outline}
                  />
                  <TouchableOpacity style={s.addCustomBtn} onPress={addCustomHour} activeOpacity={0.8}>
                    <Text style={s.addCustomBtnTxt}>+ Adicionar</Text>
                  </TouchableOpacity>
                </View>

                <View style={s.modalActions}>
                  <TouchableOpacity 
                    style={[s.actionBtn, s.cancelBtn]} 
                    onPress={() => setIsReminderModalVisible(false)}
                  >
                    <Text style={s.cancelBtnTxt}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[s.actionBtn, s.confirmBtn]} 
                    onPress={saveReminderConfig}
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
  presetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: spacing.xl,
  },
  presetChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: colors.outlineVariant + '30',
    alignItems: 'center',
    justifyContent: 'center',
  },
  presetChipActive: {
    backgroundColor: colors.primaryContainer,
    borderColor: colors.primary,
  },
  presetChipTxt: {
    fontFamily: fonts.label,
    fontSize: fontSizes.labelSm,
    color: colors.onSurface,
    fontWeight: '500',
  },
  presetChipTxtActive: {
    color: colors.onPrimaryContainer,
    fontWeight: '600',
  },
  customInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: spacing.xl,
    backgroundColor: colors.surfaceContainerLow,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
  },
  customInput: {
    flex: 1,
    height: 40,
    fontFamily: fonts.body,
    fontSize: fontSizes.bodyMd,
    color: colors.onSurface,
  },
  addCustomBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addCustomBtnTxt: {
    fontFamily: fonts.label,
    fontSize: fontSizes.labelSm,
    color: colors.onPrimary,
    fontWeight: '600',
  },
  activeChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: spacing.xl,
  },
  activeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingLeft: 12,
    paddingRight: 8,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: colors.primary + '15',
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  activeChipTxt: {
    fontFamily: fonts.label,
    fontSize: fontSizes.labelMd,
    color: colors.primary,
    fontWeight: '600',
  },
  activeChipRemove: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.primary + '25',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoBox: {
    backgroundColor: colors.primaryContainer + '20',
    borderRadius: 16,
    padding: 16,
    marginBottom: spacing.xl,
  },
  infoTxt: {
    fontFamily: fonts.body,
    fontSize: fontSizes.bodySm,
    color: colors.onSurfaceVariant,
    lineHeight: 18,
  },
  warningBox: {
    backgroundColor: colors.errorContainer + '30',
    borderRadius: 16,
    padding: 16,
    marginBottom: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  warningTxt: {
    fontFamily: fonts.body,
    fontSize: fontSizes.bodySm,
    color: colors.error,
    flex: 1,
    lineHeight: 18,
  },
  suggestionLabel: {
    fontFamily: fonts.label,
    fontSize: fontSizes.labelSm,
    color: colors.outline,
    marginTop: spacing.sm,
    marginBottom: 6,
  },
  suggestionChipsRow: {
    marginBottom: spacing.lg,
  },
  suggestChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: colors.primaryFixed + '25',
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  suggestChipTxt: {
    fontFamily: fonts.label,
    fontSize: fontSizes.labelSm,
    color: colors.primary,
    fontWeight: '700',
  },
});
