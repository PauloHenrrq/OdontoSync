// OdontoSync — Admin: Settings (Stitch: ca2b18e4)
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LogOut, Bell, Clock, MessageSquare, Users, Shield, ChevronRight } from 'lucide-react-native';
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

  return (
    <SafeAreaView style={s.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        <Text style={s.title}>Configurações</Text>

        <Card style={s.profileCard}>
          <View style={s.profileRow}>
            <Avatar name={user?.name ?? 'Admin'} size={56} showBorder />
            <View style={{ flex: 1 }}>
              <Text style={s.profileName}>{user?.name}</Text>
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
          <TouchableOpacity style={s.settingRow}>
            <View style={s.settingLeft}>
              <View style={s.settingIcon}><MessageSquare size={18} color={colors.primary} /></View>
              <View style={{ flex: 1 }}><Text style={s.settingLabel}>Confirmação</Text><Text style={s.settingSub} numberOfLines={1}>{config.confirmationTemplate.substring(0, 50)}...</Text></View>
            </View>
            <ChevronRight size={18} color={colors.outline} />
          </TouchableOpacity>
          <View style={s.divider} />
          <TouchableOpacity style={s.settingRow}>
            <View style={s.settingLeft}>
              <View style={s.settingIcon}><MessageSquare size={18} color={colors.tertiary} /></View>
              <View style={{ flex: 1 }}><Text style={s.settingLabel}>Cancelamento</Text><Text style={s.settingSub} numberOfLines={1}>{config.cancellationTemplate.substring(0, 50)}...</Text></View>
            </View>
            <ChevronRight size={18} color={colors.outline} />
          </TouchableOpacity>
        </Card>

        <Text style={s.secTitle}>Equipe</Text>
        <Card variant="filled" padding="md" style={s.settingCard}>
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
        </Card>

        <TouchableOpacity style={s.logoutBtn} onPress={handleLogout}>
          <LogOut size={20} color={colors.error} />
          <Text style={s.logoutTxt}>Sair da Conta</Text>
        </TouchableOpacity>

        <Text style={s.version}>OdontoSync v1.0.0 — Admin</Text>
      </ScrollView>
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
});
