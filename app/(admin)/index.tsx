// OdontoSync — Admin: Dashboard (Stitch: bb6e9a0c)
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { CalendarCheck, Clock, AlertTriangle, TrendingDown, Plus, Phone } from 'lucide-react-native';
import { KPICard } from '@/src/components/ui/KPICard';
import { Card } from '@/src/components/ui/Card';
import { Avatar } from '@/src/components/ui/Avatar';
import { Badge } from '@/src/components/ui/Badge';
import { Button } from '@/src/components/ui/Button';
import { useAuthStore } from '@/src/stores/authStore';
import { useAppointmentStore } from '@/src/stores/appointmentStore';
import { useClinicStore } from '@/src/stores/clinicStore';
import { colors, fonts, fontSizes, spacing } from '@/src/styles/tokens';
import { mockServices } from '@/src/mocks/services';

export default function AdminDashboard() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { kpis } = useClinicStore();
  const { appointments } = useAppointmentStore();

  const today = new Date().toISOString().split('T')[0] ?? '';
  const todayApts = appointments.filter((a) => a.date === '2024-10-15').sort((a, b) => a.time.localeCompare(b.time));
  const upcomingApts = todayApts.slice(0, 4);
  const firstName = user?.name.split(' ')[0] ?? 'Admin';

  return (
    <SafeAreaView style={s.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        <View style={s.header}>
          <View>
            <Text style={s.greeting}>Bom dia, {firstName}!</Text>
            <Text style={s.sub}>Visão Geral</Text>
          </View>
          <Avatar name={user?.name ?? 'Admin'} size={44} showBorder />
        </View>

        <View style={s.kpiRow}>
          <KPICard value={kpis.confirmedToday} label="Confirmados" icon={<CalendarCheck size={20} color={colors.primary} />} />
          <KPICard value={kpis.pendingContact} label="Pendentes" icon={<Clock size={20} color="#E65100" />} color="#E65100" />
          <KPICard value={`${kpis.absenceRate}%`} label="Taxa de Faltas" icon={<TrendingDown size={20} color={colors.error} />} color={colors.error} />
        </View>

        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={s.secTitle}>Agenda de Hoje</Text>
            <TouchableOpacity onPress={() => router.push('/(admin)/agenda')}>
              <Text style={s.seeAll}>Ver tudo</Text>
            </TouchableOpacity>
          </View>

          {upcomingApts.length > 0 ? upcomingApts.map((apt) => {
            const svc = mockServices.find((s) => s.id === apt.serviceId);
            return (
              <Card key={apt.id} style={s.aptCard} padding="md">
                <View style={s.aptRow}>
                  <View style={s.timeCol}>
                    <Text style={s.aptTime}>{apt.time}</Text>
                    <Text style={s.aptDuration}>{svc?.duration ?? 30}min</Text>
                  </View>
                  <View style={s.aptInfo}>
                    <Text style={s.aptPatient}>{apt.userId ? 'Paciente Vinculado' : '📱 ' + apt.phone}</Text>
                    <Text style={s.aptService}>{svc?.name ?? 'Consulta'}</Text>
                    <Text style={s.aptDentist}>{apt.dentistName}</Text>
                  </View>
                  <Badge variant="status" status={apt.status} />
                </View>
              </Card>
            );
          }) : (
            <Card variant="filled" padding="lg">
              <Text style={{ textAlign: 'center', color: colors.outline }}>Nenhum agendamento hoje</Text>
            </Card>
          )}
        </View>

        <View style={s.section}>
          <Text style={s.secTitle}>Ações Rápidas</Text>
          <View style={s.actionsRow}>
            <TouchableOpacity style={s.actionBtn}>
              <Plus size={20} color={colors.onPrimary} />
              <Text style={s.actionTxt}>Novo Agendamento</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.actionBtn, { backgroundColor: colors.secondaryContainer }]}>
              <Phone size={20} color={colors.onSecondaryContainer} />
              <Text style={[s.actionTxt, { color: colors.onSecondaryContainer }]}>Contato WhatsApp</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: spacing.md, marginBottom: spacing.xl },
  greeting: { fontFamily: fonts.headline, fontSize: fontSizes.headlineMd, fontWeight: '700', color: colors.onSurface },
  sub: { fontFamily: fonts.body, fontSize: fontSizes.bodyMd, color: colors.onSurfaceVariant, marginTop: 2 },
  kpiRow: { flexDirection: 'row', gap: 10, marginBottom: spacing.xl },
  section: { marginBottom: spacing.xl },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  secTitle: { fontFamily: fonts.headline, fontSize: fontSizes.titleLg, fontWeight: '600', color: colors.onSurface },
  seeAll: { fontFamily: fonts.label, fontSize: fontSizes.labelLg, color: colors.primary, fontWeight: '500' },
  aptCard: { marginBottom: 10 },
  aptRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  timeCol: { alignItems: 'center', minWidth: 50 },
  aptTime: { fontFamily: fonts.headline, fontSize: fontSizes.titleMd, fontWeight: '700', color: colors.primary },
  aptDuration: { fontFamily: fonts.label, fontSize: fontSizes.labelSm, color: colors.outline },
  aptInfo: { flex: 1 },
  aptPatient: { fontFamily: fonts.body, fontSize: fontSizes.bodyMd, fontWeight: '600', color: colors.onSurface },
  aptService: { fontFamily: fonts.body, fontSize: fontSizes.bodySm, color: colors.onSurfaceVariant, marginTop: 2 },
  aptDentist: { fontFamily: fonts.label, fontSize: fontSizes.labelSm, color: colors.outline, marginTop: 2 },
  actionsRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: colors.primary, borderRadius: 16, paddingVertical: 14 },
  actionTxt: { fontFamily: fonts.label, fontSize: fontSizes.labelLg, color: colors.onPrimary, fontWeight: '600' },
});
