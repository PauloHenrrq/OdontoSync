// OdontoSync — Admin: Dashboard (Stitch: bb6e9a0c)
import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { CalendarCheck, Clock, AlertTriangle, TrendingDown, Plus, Phone, ChevronRight } from 'lucide-react-native';
import { KPICard } from '@/src/components/ui/KPICard';
import { Card } from '@/src/components/ui/Card';
import { Avatar } from '@/src/components/ui/Avatar';
import { Badge } from '@/src/components/ui/Badge';
import { Button } from '@/src/components/ui/Button';
import { useAuthStore } from '@/src/stores/authStore';
import { useAppointmentStore } from '@/src/stores/appointmentStore';
import { useClinicStore } from '@/src/stores/clinicStore';
import { AppointmentStatus } from '@/src/types';
import { colors, fonts, fontSizes, spacing } from '@/src/styles/tokens';

export default function AdminDashboard() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { appointments } = useAppointmentStore();
  const { services } = useClinicStore();

  useFocusEffect(
    useCallback(() => {
      // Sincroniza dados frescos do banco real ao focar na tela Início (Dashboard)
      useAppointmentStore.getState().fetchAppointments();
      useClinicStore.getState().fetchPatients();
      useClinicStore.getState().fetchServices();
      useClinicStore.getState().fetchConfig();
    }, [])
  );

  const [timeRange, setTimeRange] = useState<'today' | 'overall'>('today');

  const getTodayStr = () => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };
  const today = getTodayStr();
  
  // Pegamos os agendamentos do dia
  const todayApts = appointments.filter((a) => a.date === today).sort((a, b) => a.time.localeCompare(b.time));
  const upcomingApts = todayApts.slice(0, 4);
  const firstName = user?.name.split(' ')[0] ?? 'Admin';

  // Cálculos Funcionais dos KPIs — Hoje
  const confirmedToday = todayApts.filter(a => a.status === AppointmentStatus.CONFIRMED || a.status === AppointmentStatus.COMPLETED).length;
  const pendingToday = todayApts.filter(a => a.status === AppointmentStatus.PENDING).length;
  
  const totalToday = todayApts.filter(a => a.status !== AppointmentStatus.CANCELLED).length;
  const absentToday = todayApts.filter(a => a.status === AppointmentStatus.ABSENT).length;
  const absenceRate = totalToday > 0 ? Math.round((absentToday / totalToday) * 100) : 0;

  // Cálculos Funcionais dos KPIs — Geral (Anual/Histórico Completo)
  const confirmedOverall = appointments.filter(a => a.status === AppointmentStatus.CONFIRMED || a.status === AppointmentStatus.COMPLETED).length;
  const pendingOverall = appointments.filter(a => a.status === AppointmentStatus.PENDING).length;
  
  const totalOverall = appointments.filter(a => a.status !== AppointmentStatus.CANCELLED).length;
  const absentOverall = appointments.filter(a => a.status === AppointmentStatus.ABSENT).length;
  const absenceRateOverall = totalOverall > 0 ? Math.round((absentOverall / totalOverall) * 100) : 0;

  return (
    <SafeAreaView style={s.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        <View style={s.header}>
          <View>
            <Text style={s.greeting}>Olá, {firstName}</Text>
            <Text style={s.sub}>Visão Geral</Text>
          </View>
          <Avatar name={user?.name ?? 'Admin'} size={44} showBorder />
        </View>

        <View style={s.tabContainer}>
          <TouchableOpacity 
            style={[s.tabItem, timeRange === 'today' && s.tabActiveItem]} 
            onPress={() => setTimeRange('today')}
            activeOpacity={0.8}
          >
            <Text style={[s.tabText, timeRange === 'today' && s.tabActiveText]}>Hoje</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[s.tabItem, timeRange === 'overall' && s.tabActiveItem]} 
            onPress={() => setTimeRange('overall')}
            activeOpacity={0.8}
          >
            <Text style={[s.tabText, timeRange === 'overall' && s.tabActiveText]}>Geral (Anual)</Text>
          </TouchableOpacity>
        </View>

        <View style={s.kpiRow}>
          <KPICard 
            value={timeRange === 'today' ? confirmedToday : confirmedOverall} 
            label={timeRange === 'today' ? "Confirmados Hoje" : "Confirmados Geral"} 
            icon={<CalendarCheck size={20} color={colors.primary} />} 
          />
          <KPICard 
            value={timeRange === 'today' ? pendingToday : pendingOverall} 
            label={timeRange === 'today' ? "Agendados Hoje" : "Agendados Geral"} 
            icon={<Clock size={20} color="#2E7D32" />} 
            color="#2E7D32" 
          />
          <KPICard 
            value={`${timeRange === 'today' ? absenceRate : absenceRateOverall}%`} 
            label={timeRange === 'today' ? "Taxa de Faltas Hoje" : "Faltas Geral"} 
            icon={<TrendingDown size={20} color={colors.error} />} 
            color={colors.error} 
          />
        </View>

        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={s.secTitle}>Agenda de Hoje</Text>
            <TouchableOpacity onPress={() => router.push('/(admin)/agenda')}>
              <Text style={s.seeAll}>Ver tudo</Text>
            </TouchableOpacity>
          </View>

          {upcomingApts.length > 0 ? upcomingApts.map((apt) => {
            const svc = services.find((s) => s.id === apt.serviceId) || apt.service;
            return (
              <Card key={apt.id} style={s.aptCard} padding="md">
                <View style={s.aptRow}>
                  <View style={s.timeCol}>
                    <Text style={s.aptTime}>{apt.time}</Text>
                  </View>
                  <View style={s.aptInfo}>
                    <Text style={s.aptPatient}>{apt.user?.name ?? '📱 ' + apt.phone}</Text>
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

          {todayApts.length > 4 && (
            <TouchableOpacity 
              style={s.seeMoreBtn} 
              onPress={() => router.push('/(admin)/agenda')} 
              activeOpacity={0.7}
            >
              <Text style={s.seeMoreTxt}>Ver mais {todayApts.length - 4} agendamentos</Text>
              <ChevronRight size={16} color={colors.primary} />
            </TouchableOpacity>
          )}
        </View>

        <View style={s.section}>
          <Text style={s.secTitle}>Ações Rápidas</Text>
          <View style={s.actionsRow}>
            <TouchableOpacity 
              style={s.actionBtn} 
              onPress={() => router.push('/(admin)/agenda?openNew=true')}
              activeOpacity={0.8}
            >
              <Plus size={20} color={colors.onPrimary} />
              <Text style={s.actionTxt}>Novo Agendamento</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[s.actionBtn, { backgroundColor: colors.secondaryContainer }]}
              onPress={() => router.push('/(admin)/patients')}
              activeOpacity={0.8}
            >
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceContainer,
    borderRadius: 24,
    padding: 4,
    marginBottom: spacing.lg,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabActiveItem: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontFamily: fonts.label,
    fontSize: fontSizes.labelMd,
    color: colors.onSurfaceVariant,
    fontWeight: '600',
  },
  tabActiveText: {
    color: colors.onPrimary,
  },
  kpiRow: { flexDirection: 'row', gap: 10, marginBottom: spacing.xl },
  section: { marginBottom: spacing.xl },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  secTitle: { fontFamily: fonts.headline, fontSize: fontSizes.titleLg, fontWeight: '600', color: colors.onSurface },
  seeAll: { fontFamily: fonts.label, fontSize: fontSizes.labelLg, color: colors.primary, fontWeight: '500' },
  aptCard: { marginBottom: 10 },
  aptRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  timeCol: { alignItems: 'center', minWidth: 50 },
  aptTime: { fontFamily: fonts.headline, fontSize: fontSizes.titleMd, fontWeight: '700', color: colors.primary },
  aptInfo: { flex: 1 },
  aptPatient: { fontFamily: fonts.body, fontSize: fontSizes.bodyMd, fontWeight: '600', color: colors.onSurface },
  aptService: { fontFamily: fonts.body, fontSize: fontSizes.bodySm, color: colors.onSurfaceVariant, marginTop: 2 },
  aptDentist: { fontFamily: fonts.label, fontSize: fontSizes.labelSm, color: colors.outline, marginTop: 2 },
  actionsRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
  actionTxt: { fontFamily: fonts.label, fontSize: fontSizes.labelMd, color: colors.onPrimary, fontWeight: '600' },
  seeMoreBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, marginTop: 4 },
  seeMoreTxt: { fontFamily: fonts.label, fontSize: fontSizes.labelMd, color: colors.primary, fontWeight: '600' },
});
