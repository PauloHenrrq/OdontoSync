// OdontoSync — Client: Profile (Stitch: a3f71b04)
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LogOut, ChevronRight, History, Settings, Shield, HelpCircle, User } from 'lucide-react-native';
import { Card } from '@/src/components/ui/Card';
import { Avatar } from '@/src/components/ui/Avatar';
import { Badge } from '@/src/components/ui/Badge';
import { Alert } from '@/src/components/ui/Alert';
import { useAuthStore } from '@/src/stores/authStore';
import { useAppointmentStore } from '@/src/stores/appointmentStore';
import { colors, fonts, fontSizes, spacing } from '@/src/styles/tokens';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { getMyAppointments } = useAppointmentStore();

  const appointments = user ? getMyAppointments(user.id) : [];
  const completedCount = appointments.filter((a) => a.status === 'COMPLETED').length;
  const upcomingCount = appointments.filter((a) => a.status === 'CONFIRMED' || a.status === 'PENDING').length;

  const handleLogout = () => {
    Alert.alert('Sair', 'Tem certeza que deseja sair?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: () => logout() },
    ]);
  };

  const menuItems = [
    { icon: History, label: 'Histórico de Consultas', count: completedCount },
    { icon: User, label: 'Dados Pessoais' },
    { icon: Shield, label: 'Privacidade e Segurança' },
    { icon: Settings, label: 'Configurações' },
    { icon: HelpCircle, label: 'Ajuda e Suporte' },
  ];

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
            <Text style={[s.statVal, { color: colors.tertiary }]}>⭐ 4.8</Text>
            <Text style={s.statLabel}>Avaliação</Text>
          </View>
        </View>

        <View style={s.menuSection}>
          {menuItems.map((item) => (
            <TouchableOpacity key={item.label} style={s.menuItem} activeOpacity={0.7}>
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

        <Text style={s.version}>OdontoSync v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

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
