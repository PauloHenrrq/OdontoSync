// ============================================================
// OdontoSync — Client: Minhas Consultas
// Lista de consultas do paciente com filtros e cards premium.
// ============================================================

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import {
  Calendar,
  Clock,
  Stethoscope,
  User,
  CalendarCheck,
  CalendarX,
  Inbox,
} from 'lucide-react-native';
import { Badge } from '@/src/components/ui/Badge';
import { useAuthStore } from '@/src/stores/authStore';
import { useAppointmentStore } from '@/src/stores/appointmentStore';
import { useClinicStore } from '@/src/stores/clinicStore';
import { Appointment, AppointmentStatus } from '@/src/types';
import { colors, fonts, fontSizes, spacing, shadows } from '@/src/styles/tokens';

type TabFilter = 'upcoming' | 'history';

const statusBorderColors: Record<string, string> = {
  [AppointmentStatus.PENDING]: '#2E7D32',
  [AppointmentStatus.CONFIRMED]: '#2E7D32', // Verde institucional correspondente a "Agendado"
  [AppointmentStatus.COMPLETED]: '#757575',
  [AppointmentStatus.CANCELLED]: '#C62828',
  [AppointmentStatus.ABSENT]: '#E65100',
};

const formatDatePtBr = (dateStr: string): string => {
  const [year, month, day] = dateStr.split('-');
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  return date.toLocaleDateString('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
};

const AppointmentCard = React.memo(
  ({
    item,
    serviceName,
  }: {
    item: Appointment;
    serviceName: string;
  }) => {
    const borderColor = statusBorderColors[item.status] ?? colors.outline;

    return (
      <View style={[s.card, { borderLeftColor: borderColor }]}>
        <View style={s.cardHeader}>
          <View style={s.cardServiceRow}>
            <View style={[s.cardIconBg, { backgroundColor: borderColor + '1A' }]}>
              <Stethoscope size={18} color={borderColor} />
            </View>
            <Text style={s.cardService} numberOfLines={1}>
              {serviceName}
            </Text>
          </View>
          <Badge variant="status" status={item.status} />
        </View>

        <View style={s.cardBody}>
          <View style={s.cardInfoRow}>
            <Calendar size={14} color={colors.onSurfaceVariant} />
            <Text style={s.cardInfoText}>{formatDatePtBr(item.date)}</Text>
          </View>
          <View style={s.cardInfoRow}>
            <Clock size={14} color={colors.onSurfaceVariant} />
            <Text style={s.cardInfoText}>{item.time}</Text>
          </View>
          <View style={s.cardInfoRow}>
            <User size={14} color={colors.onSurfaceVariant} />
            <Text style={s.cardInfoText}>{item.dentistName}</Text>
          </View>
        </View>

        {item.notes ? (
          <Text style={s.cardNotes} numberOfLines={2}>
            {item.notes}
          </Text>
        ) : null}
      </View>
    );
  }
);

export default function AppointmentsScreen() {
  const { user } = useAuthStore();
  const { getMyAppointments } = useAppointmentStore();
  const { services } = useClinicStore();
  const { tab } = useLocalSearchParams<{ tab?: TabFilter }>();
  const [activeTab, setActiveTab] = useState<TabFilter>('upcoming');

  useEffect(() => {
    if (tab === 'upcoming' || tab === 'history') {
      setActiveTab(tab);
    }
  }, [tab]);

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        useAppointmentStore.getState().fetchAppointments(true),
        useClinicStore.getState().fetchServices(),
      ]);
    } catch (error) {
      console.log('Erro ao atualizar consultas:', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      useAppointmentStore.getState().fetchAppointments(true);
      useClinicStore.getState().fetchServices();
    }, [])
  );

  const myAppointments = user ? getMyAppointments(user.id) : [];
  const today = new Date().toISOString().split('T')[0] ?? '';

  // Auxiliar para detectar consultas expiradas (com margem de 15 min de tolerância)
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

  const filteredAppointments = useMemo(() => {
    if (activeTab === 'upcoming') {
      return myAppointments
        .filter(
          (a) =>
            a.date >= today &&
            !isAppointmentExpired(a.date, a.time) &&
            (a.status === AppointmentStatus.PENDING ||
              a.status === AppointmentStatus.CONFIRMED)
        )
        .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
    }
    return myAppointments
      .filter(
        (a) =>
          a.date < today ||
          isAppointmentExpired(a.date, a.time) ||
          a.status === AppointmentStatus.COMPLETED ||
          a.status === AppointmentStatus.CANCELLED ||
          a.status === AppointmentStatus.ABSENT
      )
      .sort((a, b) => b.date.localeCompare(a.date) || b.time.localeCompare(a.time));
  }, [myAppointments, activeTab, today]);

  const getServiceName = useCallback(
    (serviceId: string): string => {
      return services.find((svc) => svc.id === serviceId)?.name ?? 'Consulta';
    },
    [services]
  );

  const renderItem = useCallback(
    ({ item }: { item: Appointment }) => (
      <AppointmentCard item={item} serviceName={getServiceName(item.serviceId)} />
    ),
    [getServiceName]
  );

  const keyExtractor = useCallback((item: Appointment) => item.id, []);

  const EmptyState = () => (
    <View style={s.empty}>
      <View style={s.emptyIconBg}>
        <Inbox size={40} color={colors.outline} />
      </View>
      <Text style={s.emptyTitle}>
        {activeTab === 'upcoming'
          ? 'Nenhuma consulta agendada'
          : 'Nenhum histórico encontrado'}
      </Text>
      <Text style={s.emptySubtitle}>
        {activeTab === 'upcoming'
          ? 'Suas próximas consultas aparecerão aqui.'
          : 'Consultas realizadas serão exibidas aqui.'}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={s.container}>
      <Text style={s.title}>Minhas Consultas</Text>

      <View style={s.tabs}>
        <TouchableOpacity
          style={[s.tab, activeTab === 'upcoming' && s.tabActive]}
          onPress={() => setActiveTab('upcoming')}
          activeOpacity={0.7}
        >
          <CalendarCheck
            size={16}
            color={activeTab === 'upcoming' ? colors.onPrimary : colors.onSurfaceVariant}
          />
          <Text style={[s.tabText, activeTab === 'upcoming' && s.tabTextActive]}>
            Próximas
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.tab, activeTab === 'history' && s.tabActive]}
          onPress={() => setActiveTab('history')}
          activeOpacity={0.7}
        >
          <CalendarX
            size={16}
            color={activeTab === 'history' ? colors.onPrimary : colors.onSurfaceVariant}
          />
          <Text style={[s.tabText, activeTab === 'history' && s.tabTextActive]}>
            Histórico
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredAppointments}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={s.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={EmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  title: {
    fontFamily: fonts.headline,
    fontSize: fontSizes.headlineMd,
    fontWeight: '700',
    color: colors.onSurface,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  tabs: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    gap: 8,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: colors.surfaceContainerLow,
  },
  tabActive: { backgroundColor: colors.primary },
  tabText: {
    fontFamily: fonts.label,
    fontSize: fontSizes.labelMd,
    color: colors.onSurfaceVariant,
    fontWeight: '500',
  },
  tabTextActive: { color: colors.onPrimary },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl, gap: 12 },
  card: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 20,
    padding: spacing.md,
    borderLeftWidth: 4,
    ...shadows.subtle,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardServiceRow: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  cardIconBg: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardService: {
    fontFamily: fonts.headline,
    fontSize: fontSizes.titleMd,
    fontWeight: '600',
    color: colors.onSurface,
    flex: 1,
  },
  cardBody: { gap: 6, marginBottom: 4 },
  cardInfoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardInfoText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.bodyMd,
    color: colors.onSurfaceVariant,
  },
  cardNotes: {
    fontFamily: fonts.body,
    fontSize: fontSizes.bodySm,
    color: colors.outline,
    fontStyle: 'italic',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.outlineVariant + '40',
  },
  empty: { alignItems: 'center', paddingTop: spacing['2xl'] },
  emptyIconBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontFamily: fonts.headline,
    fontSize: fontSizes.titleLg,
    fontWeight: '600',
    color: colors.onSurface,
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    fontFamily: fonts.body,
    fontSize: fontSizes.bodyMd,
    color: colors.outline,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
});
