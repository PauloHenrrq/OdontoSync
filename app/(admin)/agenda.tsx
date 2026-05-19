// OdontoSync — Admin: Agenda (Stitch: 72b64cd6)
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, ChevronRight, Check, X, AlertTriangle } from 'lucide-react-native';
import { Card } from '@/src/components/ui/Card';
import { Badge } from '@/src/components/ui/Badge';
import { Alert } from '@/src/components/ui/Alert';
import { useAppointmentStore } from '@/src/stores/appointmentStore';
import { useClinicStore } from '@/src/stores/clinicStore';
import { AppointmentStatus } from '@/src/types';
import { colors, fonts, fontSizes, spacing } from '@/src/styles/tokens';
import { mockServices } from '@/src/mocks/services';

export default function AgendaScreen() {
  const { appointments, cancelAppointment, updateAppointmentStatus } = useAppointmentStore();
  const { getPatientByPhone } = useClinicStore();
  const [selectedDate, setSelectedDate] = useState('2024-10-15');

  const dates = ['2024-10-14', '2024-10-15', '2024-10-16', '2024-10-17', '2024-10-18'];
  const dayApts = appointments.filter((a) => a.date === selectedDate).sort((a, b) => a.time.localeCompare(b.time));

  const handleAction = (id: string, action: string) => {
    Alert.alert('Confirmar', `Deseja ${action} este agendamento?`, [
      { text: 'Não', style: 'cancel' },
      { text: 'Sim', onPress: () => {
        if (action === 'confirmar') updateAppointmentStatus(id, AppointmentStatus.CONFIRMED);
        if (action === 'cancelar') cancelAppointment(id);
        if (action === 'marcar falta') updateAppointmentStatus(id, AppointmentStatus.ABSENT);
        if (action === 'concluir') updateAppointmentStatus(id, AppointmentStatus.COMPLETED);
      }},
    ]);
  };

  return (
    <SafeAreaView style={s.container}>
      <Text style={s.title}>Agenda da Clínica</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.dateRow}>
        {dates.map((d) => {
          const dt = new Date(d + 'T12:00:00');
          const isActive = d === selectedDate;
          return (
            <TouchableOpacity key={d} style={[s.dateChip, isActive && s.dateChipActive]} onPress={() => setSelectedDate(d)}>
              <Text style={[s.dateDay, isActive && s.dateDayActive]}>{dt.toLocaleDateString('pt-BR', { weekday: 'short' })}</Text>
              <Text style={[s.dateNum, isActive && s.dateNumActive]}>{dt.getDate()}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {dayApts.length > 0 ? dayApts.map((apt) => {
          const svc = mockServices.find((sv) => sv.id === apt.serviceId);
          const patient = apt.userId ? getPatientByPhone(apt.phone) : undefined;
          return (
            <Card key={apt.id} style={s.aptCard} padding="md">
              <View style={s.aptHeader}>
                <Text style={s.aptTime}>{apt.time}</Text>
                <Badge variant="status" status={apt.status} />
              </View>
              <Text style={s.aptName}>{patient?.name ?? apt.phone}</Text>
              <Text style={s.aptSvc}>{svc?.name ?? 'Consulta'} — {apt.dentistName}</Text>
              {apt.notes && <Text style={s.aptNotes}>📋 {apt.notes}</Text>}
              {!apt.userId && <Text style={s.orphan}>📱 Paciente sem app — WhatsApp</Text>}

              {apt.status === AppointmentStatus.PENDING && (
                <View style={s.actions}>
                  <TouchableOpacity style={s.actConfirm} onPress={() => handleAction(apt.id, 'confirmar')}>
                    <Check size={16} color={colors.onPrimary} /><Text style={s.actTxtW}>Confirmar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={s.actCancel} onPress={() => handleAction(apt.id, 'cancelar')}>
                    <X size={16} color={colors.error} /><Text style={s.actTxtR}>Cancelar</Text>
                  </TouchableOpacity>
                </View>
              )}
              {apt.status === AppointmentStatus.CONFIRMED && (
                <View style={s.actions}>
                  <TouchableOpacity style={s.actConfirm} onPress={() => handleAction(apt.id, 'concluir')}>
                    <Check size={16} color={colors.onPrimary} /><Text style={s.actTxtW}>Concluir</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={s.actWarn} onPress={() => handleAction(apt.id, 'marcar falta')}>
                    <AlertTriangle size={16} color="#E65100" /><Text style={s.actTxtO}>No-Show</Text>
                  </TouchableOpacity>
                </View>
              )}
            </Card>
          );
        }) : (
          <Card variant="filled" padding="lg">
            <Text style={{ textAlign: 'center', color: colors.outline, fontFamily: fonts.body }}>Nenhum agendamento neste dia</Text>
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  title: { fontFamily: fonts.headline, fontSize: fontSizes.headlineMd, fontWeight: '700', color: colors.onSurface, paddingHorizontal: spacing.lg, paddingTop: spacing.md, marginBottom: spacing.md },
  dateRow: { paddingHorizontal: spacing.lg, gap: 10, marginBottom: spacing.lg },
  dateChip: { alignItems: 'center', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 16, backgroundColor: colors.surfaceContainerLow },
  dateChipActive: { backgroundColor: colors.primary },
  dateDay: { fontFamily: fonts.label, fontSize: fontSizes.labelSm, color: colors.outline, marginBottom: 4 },
  dateDayActive: { color: colors.onPrimary },
  dateNum: { fontFamily: fonts.headline, fontSize: fontSizes.titleLg, fontWeight: '700', color: colors.onSurface },
  dateNumActive: { color: colors.onPrimary },
  scroll: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl, gap: 12 },
  aptCard: { marginBottom: 0 },
  aptHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  aptTime: { fontFamily: fonts.headline, fontSize: fontSizes.titleMd, fontWeight: '700', color: colors.primary },
  aptName: { fontFamily: fonts.body, fontSize: fontSizes.bodyLg, fontWeight: '600', color: colors.onSurface },
  aptSvc: { fontFamily: fonts.body, fontSize: fontSizes.bodySm, color: colors.onSurfaceVariant, marginTop: 2 },
  aptNotes: { fontFamily: fonts.body, fontSize: fontSizes.bodySm, color: colors.tertiary, marginTop: 6, fontStyle: 'italic' },
  orphan: { fontFamily: fonts.label, fontSize: fontSizes.labelSm, color: '#E65100', marginTop: 6, fontWeight: '500' },
  actions: { flexDirection: 'row', gap: 8, marginTop: 12 },
  actConfirm: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, backgroundColor: colors.primary, borderRadius: 12, paddingVertical: 10 },
  actCancel: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, backgroundColor: colors.errorContainer, borderRadius: 12, paddingVertical: 10 },
  actWarn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, backgroundColor: '#FFF3E0', borderRadius: 12, paddingVertical: 10 },
  actTxtW: { fontFamily: fonts.label, fontSize: fontSizes.labelMd, color: colors.onPrimary, fontWeight: '600' },
  actTxtR: { fontFamily: fonts.label, fontSize: fontSizes.labelMd, color: colors.error, fontWeight: '600' },
  actTxtO: { fontFamily: fonts.label, fontSize: fontSizes.labelMd, color: '#E65100', fontWeight: '600' },
});
