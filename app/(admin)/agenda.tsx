// ============================================================
// OdontoSync — Admin: Agenda
// Painel de agendamentos diários com picker dinâmico e modal calendário.
// ============================================================

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, ChevronRight, Check, X, AlertTriangle, Calendar } from 'lucide-react-native';
import { Card } from '@/src/components/ui/Card';
import { Badge } from '@/src/components/ui/Badge';
import { Alert } from '@/src/components/ui/Alert';
import { useAppointmentStore } from '@/src/stores/appointmentStore';
import { useClinicStore } from '@/src/stores/clinicStore';
import { AppointmentStatus } from '@/src/types';
import { colors, fonts, fontSizes, spacing } from '@/src/styles/tokens';
import { mockServices } from '@/src/mocks/services';

/** Formata data para YYYY-MM-DD */
const formatDateStr = (date: Date): string => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const getTodayStr = (): string => formatDateStr(new Date());

/** Retorna 5 dias em torno de uma data de referência */
const get5Days = (refDateStr: string): string[] => {
  const days = [];
  for (let i = -2; i <= 2; i++) {
    const d = new Date(refDateStr + 'T12:00:00');
    d.setDate(d.getDate() + i);
    days.push(formatDateStr(d));
  }
  return days;
};

/** Retorna quantidade de dias num mês */
const getDaysInMonth = (year: number, month: number): number => {
  return new Date(year, month + 1, 0).getDate();
};

/** Monta a grade de dias de um determinado mês */
const getMonthDaysGrid = (monthDate: Date): (Date | null)[] => {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const totalDays = getDaysInMonth(year, month);
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Dom, 1 = Seg, ...

  const grid: (Date | null)[] = [];
  for (let i = 0; i < firstDayIndex; i++) {
    grid.push(null);
  }
  for (let i = 1; i <= totalDays; i++) {
    grid.push(new Date(year, month, i));
  }
  return grid;
};

// Cores institucionais para acompanhar os status nos cartões
const statusColors: Record<AppointmentStatus, string> = {
  [AppointmentStatus.PENDING]: '#E65100', // Laranja médico
  [AppointmentStatus.CONFIRMED]: colors.primary, // Verde teal principal
  [AppointmentStatus.COMPLETED]: '#2E7D32', // Verde conclusão
  [AppointmentStatus.CANCELLED]: colors.error, // Vermelho erro
  [AppointmentStatus.ABSENT]: '#C62828', // Vermelho escuro (Falta)
};

export default function AgendaScreen() {
  const { appointments, cancelAppointment, updateAppointmentStatus } = useAppointmentStore();
  const { getPatientByPhone } = useClinicStore();

  // Estados de data iniciados sempre na data real de hoje
  const [selectedDate, setSelectedDate] = useState(getTodayStr);
  const [centerDate, setCenterDate] = useState(getTodayStr);

  // Estados de controle do Modal de Calendário
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentMonthRef, setCurrentMonthRef] = useState(() => new Date());

  // Garante que, ao abrir a tela (mount), as datas são resetadas para o dia atual de hoje
  useEffect(() => {
    const today = getTodayStr();
    setSelectedDate(today);
    setCenterDate(today);
    setCurrentMonthRef(new Date());
  }, []);

  const dates = get5Days(centerDate);
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

  const handlePrevMonth = () => {
    const prev = new Date(currentMonthRef);
    prev.setMonth(prev.getMonth() - 1);
    setCurrentMonthRef(prev);
  };

  const handleNextMonth = () => {
    const next = new Date(currentMonthRef);
    next.setMonth(next.getMonth() + 1);
    setCurrentMonthRef(next);
  };

  const monthDays = getMonthDaysGrid(currentMonthRef);
  const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <SafeAreaView style={s.container}>
      <Text style={s.title}>Agenda da Clínica</Text>

      {/* Cabeçalho da Data Formatada */}
      <View style={s.dateHeader}>
        <View style={s.dateHeaderTitleCol}>
          <Text style={s.dateHeaderLabel}>Data Selecionada</Text>
          <Text style={s.dateHeaderVal}>
            {new Date(selectedDate + 'T12:00:00').toLocaleDateString('pt-BR', {
              day: 'numeric',
              month: 'long',
            })}
          </Text>
        </View>
      </View>

      {/* Seletor Horizontal de 5 dias em torno da data central */}
      <View style={{ marginBottom: spacing.xs }}>
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
      </View>

      {/* Ver Calendário posicionado na direita em baixo das datas atuais */}
      <View style={s.calendarBtnRow}>
        <TouchableOpacity style={s.calendarBtn} onPress={() => setIsModalVisible(true)} activeOpacity={0.7}>
          <Calendar size={16} color={colors.primary} />
          <Text style={s.calendarBtnTxt}>Ver Calendário</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {dayApts.length > 0 ? dayApts.map((apt) => {
          const svc = mockServices.find((sv) => sv.id === apt.serviceId);
          const patient = apt.userId ? getPatientByPhone(apt.phone) : undefined;
          return (
            <Card 
              key={apt.id} 
              style={[s.aptCard, { borderLeftWidth: 4, borderLeftColor: statusColors[apt.status] }]} 
              padding="md"
            >
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
                    <AlertTriangle size={16} color="#E65100" /><Text style={s.actTxtO}>Falta</Text>
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

      {/* Modal de Calendário Completo */}
      <Modal
        visible={isModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={s.modalOverlay}>
          <View style={s.modalContent}>
            {/* Cabeçalho do Modal */}
            <View style={s.modalHeader}>
              <TouchableOpacity onPress={handlePrevMonth} style={s.monthNavBtn} activeOpacity={0.7}>
                <ChevronLeft size={20} color={colors.primary} />
              </TouchableOpacity>
              <Text style={s.modalTitle}>
                {currentMonthRef.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
              </Text>
              <TouchableOpacity onPress={handleNextMonth} style={s.monthNavBtn} activeOpacity={0.7}>
                <ChevronRight size={20} color={colors.primary} />
              </TouchableOpacity>
            </View>

            {/* Dias da semana */}
            <View style={s.weekdayRow}>
              {weekdays.map((w, idx) => (
                <Text key={idx} style={s.weekdayTxt}>{w}</Text>
              ))}
            </View>

            {/* Grade de dias */}
            <View style={s.daysGrid}>
              {monthDays.map((day, idx) => {
                if (!day) {
                  return <View key={`empty-${idx}`} style={s.dayCellEmpty} />;
                }

                const dayStr = formatDateStr(day);
                const isSelected = dayStr === selectedDate;
                const isToday = dayStr === getTodayStr();

                return (
                  <TouchableOpacity
                    key={dayStr}
                    style={[
                      s.dayCell,
                      isSelected && s.dayCellSelected,
                      isToday && !isSelected && s.dayCellToday,
                    ]}
                    onPress={() => {
                      setSelectedDate(dayStr);
                      setCenterDate(dayStr);
                      setIsModalVisible(false);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        s.dayCellTxt,
                        isSelected && s.dayCellTxtSelected,
                        isToday && !isSelected && s.dayCellTxtToday,
                      ]}
                    >
                      {day.getDate()}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Botão de Fechar */}
            <TouchableOpacity
              style={s.modalCloseBtn}
              onPress={() => setIsModalVisible(false)}
              activeOpacity={0.7}
            >
              <Text style={s.modalCloseBtnTxt}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  title: { fontFamily: fonts.headline, fontSize: fontSizes.headlineMd, fontWeight: '700', color: colors.onSurface, paddingHorizontal: spacing.lg, paddingTop: spacing.md, marginBottom: 24 },
  
  // Estilos do cabeçalho de data
  dateHeader: { paddingHorizontal: spacing.lg, marginBottom: 12 },
  dateHeaderTitleCol: { flex: 1 },
  dateHeaderLabel: { fontFamily: fonts.label, fontSize: fontSizes.labelSm, color: colors.outline, textTransform: 'uppercase', letterSpacing: 0.5 },
  dateHeaderVal: { fontFamily: fonts.headline, fontSize: fontSizes.titleMd, fontWeight: '700', color: colors.primary, textTransform: 'capitalize', marginTop: 10 },
  
  calendarBtnRow: { flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: spacing.lg, marginBottom: spacing.md },
  calendarBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: 14, borderRadius: 12, backgroundColor: colors.primaryFixed + '40' },
  calendarBtnTxt: { fontFamily: fonts.label, fontSize: 14, color: colors.primary, fontWeight: '600' },

  dateRow: { paddingHorizontal: spacing.lg, gap: 10 },
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
  
  // Botões centralizados nos cartões da agenda atual
  actions: { flexDirection: 'row', gap: 8, marginTop: 12, justifyContent: 'center' },
  actConfirm: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, backgroundColor: colors.primary, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 20 },
  actCancel: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, backgroundColor: colors.errorContainer, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 20 },
  actWarn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, backgroundColor: '#FFF3E0', borderRadius: 12, paddingVertical: 10, paddingHorizontal: 20 },
  actTxtW: { fontFamily: fonts.label, fontSize: fontSizes.labelMd, color: colors.onPrimary, fontWeight: '600' },
  actTxtR: { fontFamily: fonts.label, fontSize: fontSizes.labelMd, color: colors.error, fontWeight: '600' },
  actTxtO: { fontFamily: fonts.label, fontSize: fontSizes.labelMd, color: '#E65100', fontWeight: '600' },

  // Estilos do Modal de Calendário
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.45)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { width: '100%', maxWidth: 340, backgroundColor: colors.surfaceContainerLowest, borderRadius: 24, padding: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  monthNavBtn: { padding: 6, borderRadius: 12, backgroundColor: colors.surfaceContainer },
  modalTitle: { fontFamily: fonts.headline, fontSize: fontSizes.titleMd, fontWeight: '700', color: colors.onSurface, textTransform: 'capitalize' },
  weekdayRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  weekdayTxt: { flex: 1, textAlign: 'center', fontFamily: fonts.label, fontSize: 11, color: colors.outline, fontWeight: '600' },
  daysGrid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 6 },
  dayCell: { width: `${100 / 7}%`, aspectRatio: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 20 },
  dayCellSelected: { backgroundColor: colors.primary },
  dayCellToday: { borderWidth: 1.5, borderColor: colors.primaryFixedDim },
  dayCellEmpty: { width: `${100 / 7}%`, aspectRatio: 1 },
  dayCellTxt: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.onSurface },
  dayCellTxtSelected: { color: colors.onPrimary, fontWeight: '700' },
  dayCellTxtToday: { color: colors.primary, fontWeight: '700' },
  modalCloseBtn: { marginTop: 16, paddingVertical: 12, borderRadius: 16, backgroundColor: colors.surfaceContainerLow, alignItems: 'center' },
  modalCloseBtnTxt: { fontFamily: fonts.label, fontSize: fontSizes.labelLg, color: colors.outline, fontWeight: '600' },
});
