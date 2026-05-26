// OdontoSync — Client Home (Stitch: 0766f16f)
import React, { useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CalendarPlus, Clock, UserCircle, Heart, Bell, Stethoscope } from 'lucide-react-native';
import { Card } from '@/src/components/ui/Card';
import { Badge } from '@/src/components/ui/Badge';
import { useAuthStore } from '@/src/stores/authStore';
import { useAppointmentStore } from '@/src/stores/appointmentStore';
import { useNotificationStore } from '@/src/stores/notificationStore';
import { useClinicStore } from '@/src/stores/clinicStore';
import { colors, fonts, fontSizes, spacing, shadows } from '@/src/styles/tokens';

export default function ClientHomeScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { getNextAppointment } = useAppointmentStore();
  const { unreadCount } = useNotificationStore();
  const { services } = useClinicStore();

  useFocusEffect(
    useCallback(() => {
      useAppointmentStore.getState().fetchAppointments();
      useClinicStore.getState().fetchServices();
    }, [])
  );

  const firstName = user?.name.split(' ')[0] ?? 'Paciente';
  const nextApt = user ? getNextAppointment(user.id) : undefined;
  const service = nextApt ? services.find((s) => s.id === nextApt.serviceId) : undefined;

  const quickActions = [
    { icon: CalendarPlus, label: 'Agendar', color: colors.primary, route: '/(client)/booking' as const },
    { icon: Clock, label: 'Histórico', color: colors.tertiary, route: '/(client)/profile' as const },
    { icon: Heart, label: 'Dicas', color: '#E91E63', route: '/(client)/alerts' as const },
    { icon: UserCircle, label: 'Perfil', color: colors.secondary, route: '/(client)/profile' as const },
  ];

  return (
    <SafeAreaView style={s.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        <View style={s.header}>
          <View>
            <Text style={s.greeting}>Olá, {firstName}!</Text>
            <Text style={s.sub}>Seu sorriso está em boas mãos</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/(client)/alerts')} style={s.bell}>
            <Bell size={24} color={colors.onSurface} />
            {unreadCount > 0 && <View style={s.bellBadge}><Badge count={unreadCount} /></View>}
          </TouchableOpacity>
        </View>

        <Card style={{ marginBottom: spacing.lg, backgroundColor: colors.primaryContainer }}>
          <Text style={s.secTitle}>Próximo Agendamento</Text>
          {nextApt ? (
            <View style={{ gap: 12 }}>
              <View style={s.aptRow}>
                <View style={{ flex: 1 }}>
                  <Text style={s.aptLabel}>Data e Horário</Text>
                  <Text style={s.aptVal}>{new Date(nextApt.date + 'T12:00:00').toLocaleDateString('pt-BR')}, {nextApt.time}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.aptLabel}>Dentista</Text>
                  <Text style={s.aptVal}>{nextApt.dentistName}</Text>
                </View>
              </View>
              {service && (
                <View style={s.chip}>
                  <Stethoscope size={14} color={colors.primary} />
                  <Text style={s.chipTxt}>{service.name}</Text>
                </View>
              )}
              <Badge variant="status" status={nextApt.status} />
            </View>
          ) : (
            <View style={{ alignItems: 'center', padding: 16 }}>
              <Text style={s.sub}>Nenhum agendamento próximo</Text>
              <TouchableOpacity onPress={() => router.push('/(client)/booking')}>
                <Text style={[s.chipTxt, { marginTop: 8 }]}>Agendar agora →</Text>
              </TouchableOpacity>
            </View>
          )}
        </Card>

        <View style={{ marginBottom: spacing.lg }}>
          <Text style={s.secTitle}>Seu Tratamento</Text>
          <Card variant="filled" padding="md">
            <View style={{ height: 8, backgroundColor: colors.surfaceContainerHigh, borderRadius: 4, overflow: 'hidden', marginBottom: 6 }}>
              <View style={{ height: '100%', width: '65%', backgroundColor: colors.primary, borderRadius: 4 }} />
            </View>
            <Text style={[s.chipTxt, { marginBottom: 4 }]}>65% concluído</Text>
            <Text style={s.sub}>Acompanhamento Ortodôntico</Text>
          </Card>
        </View>

        <View>
          <Text style={s.secTitle}>Acesso Rápido</Text>
          <View style={s.grid}>
            {quickActions.map((a) => (
              <TouchableOpacity key={a.label} style={s.gridItem} onPress={() => router.push(a.route)} activeOpacity={0.7}>
                <View style={[s.gridIcon, { backgroundColor: a.color + '1A' }]}>
                  <a.icon size={24} color={a.color} />
                </View>
                <Text style={s.gridLabel}>{a.label}</Text>
              </TouchableOpacity>
            ))}
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
  bell: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.surfaceContainerLow, alignItems: 'center', justifyContent: 'center' },
  bellBadge: { position: 'absolute', top: 6, right: 6 },
  secTitle: { fontFamily: fonts.headline, fontSize: fontSizes.titleLg, fontWeight: '600', color: colors.onSurface, marginBottom: spacing.md },
  aptRow: { flexDirection: 'row', gap: spacing.lg },
  aptLabel: { fontFamily: fonts.label, fontSize: fontSizes.labelSm, color: colors.onPrimaryContainer, opacity: 0.7, marginBottom: 4 },
  aptVal: { fontFamily: fonts.body, fontSize: fontSizes.bodyLg, color: colors.onPrimaryContainer, fontWeight: '600' },
  chip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF80', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 16, alignSelf: 'flex-start', gap: 6 },
  chipTxt: { fontFamily: fonts.label, fontSize: fontSizes.labelMd, color: colors.primary, fontWeight: '500' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  gridItem: { width: '47%', alignItems: 'center', backgroundColor: colors.surfaceContainerLowest, borderRadius: 24, paddingVertical: spacing.lg, ...shadows.subtle },
  gridIcon: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm },
  gridLabel: { fontFamily: fonts.label, fontSize: fontSizes.labelLg, color: colors.onSurface, fontWeight: '500' },
});
