// ============================================================
// OdontoSync — Admin: Agenda
// Painel de agendamentos diários com picker dinâmico e modal calendário.
// ============================================================

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TouchableWithoutFeedback, TextInput, Animated, LayoutAnimation, Platform, UIManager } from 'react-native';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, ChevronRight, Check, X, AlertTriangle, Calendar, Plus, ChevronDown } from 'lucide-react-native';
import { Card } from '@/src/components/ui/Card';
import { Badge } from '@/src/components/ui/Badge';
import { Alert } from '@/src/components/ui/Alert';
import { useAppointmentStore } from '@/src/stores/appointmentStore';
import { useClinicStore } from '@/src/stores/clinicStore';
import { AppointmentStatus } from '@/src/types';
import { colors, fonts, fontSizes, spacing } from '@/src/styles/tokens';

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

const maskPhone = (val: string) => {
  let v = val.replace(/\D/g, '');
  if (v.length > 11) v = v.slice(0, 11);
  if (v.length === 0) return '';
  if (v.length <= 2) return `(${v}`;
  if (v.length <= 6) return `(${v.slice(0, 2)}) ${v.slice(2)}`;
  if (v.length <= 10) return `(${v.slice(0, 2)}) ${v.slice(2, 6)}-${v.slice(6)}`;
  return `(${v.slice(0, 2)}) ${v.slice(2, 7)}-${v.slice(7)}`;
};

const maskDate = (val: string) => {
  let v = val.replace(/\D/g, '');
  if (v.length > 8) v = v.slice(0, 8);
  if (v.length === 0) return '';
  if (v.length <= 2) return v;
  if (v.length <= 4) return `${v.slice(0, 2)}/${v.slice(2)}`;
  return `${v.slice(0, 2)}/${v.slice(2, 4)}/${v.slice(4)}`;
};

const maskTime = (val: string) => {
  let v = val.replace(/\D/g, '');
  if (v.length > 4) v = v.slice(0, 4);
  if (v.length === 0) return '';
  if (v.length <= 2) return v;
  return `${v.slice(0, 2)}:${v.slice(2)}`;
};

export default function AgendaScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { appointments, cancelAppointment, updateAppointmentStatus, bookAppointment } = useAppointmentStore();
  const { getPatientByPhone, patients, services } = useClinicStore();

  // Estados de data iniciados sempre na data real de hoje
  const [selectedDate, setSelectedDate] = useState(getTodayStr);
  const [centerDate, setCenterDate] = useState(getTodayStr);

  // Estados de controle dos Modais
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [calendarTarget, setCalendarTarget] = useState<'main' | 'newApt'>('main');
  const [currentMonthRef, setCurrentMonthRef] = useState(() => new Date());
  
  const [isNewAptModalVisible, setIsNewAptModalVisible] = useState(false);
  const [newApt, setNewApt] = useState({ phone: '', name: '', dentist: 'Dr. Paulo', serviceId: '', date: '', time: '' });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showServiceDropdown, setShowServiceDropdown] = useState(false);
  
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const toggleServiceDropdown = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowServiceDropdown(!showServiceDropdown);
    Animated.timing(rotateAnim, {
      toValue: !showServiceDropdown ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg']
  });

  const phoneSuggestions = newApt.phone.replace(/\D/g, '').length >= 2 
    ? patients.filter(p => p.phone.replace(/\D/g, '').includes(newApt.phone.replace(/\D/g, ''))).slice(0, 3)
    : [];

  // Garante que, ao abrir a tela (mount), as datas são resetadas para o dia atual de hoje
  useEffect(() => {
    const today = getTodayStr();
    setSelectedDate(today);
    setCenterDate(today);
    setCurrentMonthRef(new Date());
  }, []);

  useEffect(() => {
    if (params.openNew === 'true') {
      setIsNewAptModalVisible(true);
      // Limpa os params para evitar que abra de novo em re-renders acidentais
      router.setParams({ openNew: '' });
    }
  }, [params.openNew]);

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

      {/* Ver Calendário posicionado na esquerda em baixo das datas atuais */}
      <View style={s.calendarBtnRow}>
        <TouchableOpacity style={s.calendarBtn} onPress={() => setIsModalVisible(true)} activeOpacity={0.7}>
          <Calendar size={16} color={colors.primary} />
          <Text style={s.calendarBtnTxt}>Ver Calendário</Text>
        </TouchableOpacity>
      </View>

      {/* Título Estático "Agenda Atual" */}
      <View style={s.listHeader}>
        <Text style={s.listHeaderTitle}>Agenda Atual</Text>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        style={s.scrollContainer}
        contentContainerStyle={s.scroll}
      >
        {dayApts.length > 0 ? dayApts.map((apt) => {
          const svc = services.find((sv) => sv.id === apt.serviceId) || apt.service;
          const patient = apt.user ?? (apt.userId ? getPatientByPhone(apt.phone) : undefined);
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

      {/* Modal de Novo Agendamento */}
      <Modal
        visible={isNewAptModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsNewAptModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setIsNewAptModalVisible(false)}>
          <View style={s.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={s.modalContentApt}>
                <View style={s.modalDragHandle} />
                <View style={s.modalHeaderRow}>
                  <Text style={s.modalTitleApt}>Novo Agendamento</Text>
                  <TouchableOpacity style={s.closeBtnApt} onPress={() => setIsNewAptModalVisible(false)}>
                    <X size={20} color={colors.outline} />
                  </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.formScroll} keyboardShouldPersistTaps="handled">
                  <Text style={s.inputLabel}>Telefone do Paciente</Text>
                  <TextInput 
                    style={s.textInput} 
                    placeholder="Ex: (11) 90000-0000" 
                    placeholderTextColor={colors.outline} 
                    keyboardType="numeric"
                    value={newApt.phone} 
                    onChangeText={(t) => {
                      setNewApt({...newApt, phone: maskPhone(t), name: ''});
                      if (!showSuggestions) {
                        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                        setShowSuggestions(true);
                      }
                    }} 
                    onFocus={() => {
                      if (!showSuggestions) {
                        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                        setShowSuggestions(true);
                      }
                    }}
                  />
                  {showSuggestions && phoneSuggestions.length > 0 && (
                    <View style={s.suggestionsBox}>
                      {phoneSuggestions.map(p => (
                        <TouchableOpacity 
                          key={p.id} 
                          style={s.suggestionItem}
                          onPress={() => {
                            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                            setNewApt({...newApt, phone: p.phone, name: p.name});
                            setShowSuggestions(false);
                          }}
                        >
                          <Text style={s.suggestionName}>{p.name}</Text>
                          <Text style={s.suggestionPhone}>{p.phone}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                  {newApt.name !== '' && (
                    <Text style={s.identifiedPatientTxt}>Paciente Identificado: {newApt.name}</Text>
                  )}

                  <Text style={s.inputLabel}>Serviço</Text>
                  <TouchableOpacity 
                    style={s.textInput} 
                    onPress={toggleServiceDropdown}
                    activeOpacity={0.8}
                  >
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={{ fontFamily: fonts.body, fontSize: fontSizes.bodyMd, color: colors.onSurface }}>
                        {services.find(s => s.id === newApt.serviceId)?.name || 'Selecione um serviço'}
                      </Text>
                      <Animated.View style={{ transform: [{ rotate: spin }] }}>
                        <ChevronDown size={20} color={colors.onSurfaceVariant} />
                      </Animated.View>
                    </View>
                  </TouchableOpacity>

                  {showServiceDropdown && (
                    <View style={s.suggestionsBox}>
                      {services.map(svc => (
                        <TouchableOpacity 
                          key={svc.id} 
                          style={s.suggestionItem}
                          onPress={() => {
                            setNewApt({...newApt, serviceId: svc.id});
                            toggleServiceDropdown();
                          }}
                        >
                          <Text style={s.suggestionName}>{svc.name}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}

                  <Text style={s.inputLabel}>Data da Consulta</Text>
                  <View style={s.dateInputWrap}>
                    <TextInput 
                      style={[s.textInput, { flex: 1, paddingRight: 50 }]} 
                      placeholder="DD/MM/AAAA" 
                      placeholderTextColor={colors.outline} 
                      keyboardType="numeric"
                      value={newApt.date} 
                      onChangeText={(t) => setNewApt({...newApt, date: maskDate(t)})} 
                    />
                    <TouchableOpacity 
                      style={s.dateIconBtn} 
                      onPress={() => {
                        setCalendarTarget('newApt');
                        setIsModalVisible(true);
                      }}
                    >
                      <Calendar size={20} color={colors.primary} />
                    </TouchableOpacity>
                  </View>

                  <Text style={s.inputLabel}>Horário</Text>
                  <TextInput 
                    style={s.textInput} 
                    placeholder="00:00" 
                    placeholderTextColor={colors.outline} 
                    keyboardType="numeric"
                    value={newApt.time} 
                    onChangeText={(t) => setNewApt({...newApt, time: maskTime(t)})} 
                  />

                  <TouchableOpacity 
                    style={s.saveBtn} 
                    onPress={async () => { 
                      if (!newApt.phone || !newApt.date || !newApt.time || !newApt.serviceId) {
                        Alert.alert('Atenção', 'Preencha todos os campos obrigatórios para prosseguir.');
                        return;
                      }

                      // Converte data DD/MM/YYYY para YYYY-MM-DD
                      const dateParts = newApt.date.split('/');
                      const isoDate = dateParts.length === 3 
                        ? `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`
                        : newApt.date;

                      // Limpa o telefone para buscar no banco
                      const cleanPhone = newApt.phone.replace(/\D/g, '');
                      const linkedPatient = getPatientByPhone(cleanPhone);

                      const success = await bookAppointment(
                        linkedPatient?.id ?? '',
                        cleanPhone,
                        {
                          serviceId: newApt.serviceId,
                          dentistName: newApt.dentist,
                          date: isoDate,
                          time: newApt.time,
                        }
                      );

                      if (success) {
                        Alert.alert('Sucesso', 'Agendamento salvo com sucesso!');
                        setNewApt({ phone: '', name: '', dentist: 'Dr. Paulo', serviceId: '', date: '', time: '' });
                        setIsNewAptModalVisible(false);
                      } else {
                        Alert.alert('Erro', 'Não foi possível salvar o agendamento. Tente novamente.');
                      }
                    }} 
                    activeOpacity={0.8}
                  >
                    <Check size={20} color={colors.onPrimary} />
                    <Text style={s.saveBtnTxt}>Salvar Agendamento</Text>
                  </TouchableOpacity>
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Modal de Calendário Completo (Abaixo do Novo Agendamento para sobrepor ele) */}
      <Modal
        visible={isModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setIsModalVisible(false)}>
          <View style={s.modalOverlay}>
            <TouchableWithoutFeedback>
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
                          const dayStr = formatDateStr(day);
                          if (calendarTarget === 'main') {
                            setSelectedDate(dayStr);
                            setCenterDate(dayStr);
                          } else {
                            const parts = dayStr.split('-');
                            setNewApt({...newApt, date: `${parts[2]}/${parts[1]}/${parts[0]}`});
                          }
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
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Botão Flutuante de Novo Agendamento (FAB) */}
      <TouchableOpacity 
        style={s.fab} 
        onPress={() => setIsNewAptModalVisible(true)}
        activeOpacity={0.85}
      >
        <Plus size={28} color={colors.onPrimary} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  title: { fontFamily: fonts.headline, fontSize: fontSizes.headlineMd, fontWeight: '700', color: colors.onSurface, paddingHorizontal: spacing.lg, paddingTop: spacing.md, marginBottom: 28 },
  
  // Estilos do cabeçalho de data
  dateHeader: { paddingHorizontal: spacing.lg, marginBottom: 16 },
  dateHeaderTitleCol: { flex: 1 },
  dateHeaderLabel: { fontFamily: fonts.label, fontSize: fontSizes.labelSm, color: colors.outline, textTransform: 'uppercase', letterSpacing: 0.5 },
  dateHeaderVal: { fontFamily: fonts.headline, fontSize: fontSizes.titleMd, fontWeight: '700', color: colors.primary, textTransform: 'capitalize', marginTop: 10 },
  
  calendarBtnRow: { flexDirection: 'row', justifyContent: 'flex-start', paddingHorizontal: spacing.lg, marginBottom: 24 },
  calendarBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 10, paddingHorizontal: 16, borderRadius: 12, backgroundColor: colors.primaryFixed + '40' },
  calendarBtnTxt: { fontFamily: fonts.label, fontSize: 14, color: colors.primary, fontWeight: '600' },

  listHeader: { paddingHorizontal: spacing.lg, paddingTop: 16, paddingBottom: 8, marginBottom: 12 },
  listHeaderTitle: { fontFamily: fonts.headline, fontSize: fontSizes.titleLg, fontWeight: '700', color: colors.onSurface },
  scrollContainer: { flex: 1 },

  dateRow: { paddingHorizontal: spacing.lg, gap: 10 },
  dateChip: { alignItems: 'center', paddingVertical: 12, paddingHorizontal: 18, borderRadius: 16, backgroundColor: colors.surfaceContainer, borderWidth: 1.5, borderColor: colors.surfaceContainerHigh },
  dateChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  dateDay: { fontFamily: fonts.label, fontSize: fontSizes.labelSm, color: colors.onSurfaceVariant, marginBottom: 4 },
  dateDayActive: { color: colors.onPrimary },
  dateNum: { fontFamily: fonts.headline, fontSize: fontSizes.titleLg, fontWeight: '700', color: colors.onSurface },
  dateNumActive: { color: colors.onPrimary },
  
  scroll: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl, gap: 16 },
  aptCard: { marginBottom: 0 },
  aptHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  aptTime: { fontFamily: fonts.headline, fontSize: fontSizes.titleMd, fontWeight: '700', color: colors.primary },
  aptName: { fontFamily: fonts.body, fontSize: fontSizes.bodyLg, fontWeight: '600', color: colors.onSurface },
  aptSvc: { fontFamily: fonts.body, fontSize: fontSizes.bodySm, color: colors.onSurfaceVariant, marginTop: 6 },
  aptNotes: { fontFamily: fonts.body, fontSize: fontSizes.bodySm, color: colors.tertiary, marginTop: 8, fontStyle: 'italic' },
  orphan: { fontFamily: fonts.label, fontSize: fontSizes.labelSm, color: '#E65100', marginTop: 8, fontWeight: '500' },
  
  // Botões centralizados nos cartões da agenda atual com maior respiro táctil
  actions: { flexDirection: 'row', gap: 10, marginTop: 18, justifyContent: 'center' },
  actConfirm: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: colors.primary, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 24 },
  actCancel: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: colors.errorContainer, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 24 },
  actWarn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: '#FFF3E0', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 24 },
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
  modalCloseBtnTxt: { fontFamily: fonts.label, fontSize: fontSizes.labelLg, color: colors.onSurface, fontWeight: '600' },

  // Estilos do Modal de Novo Agendamento
  modalDragHandle: { width: 36, height: 5, borderRadius: 2.5, backgroundColor: colors.outlineVariant, alignSelf: 'center', marginBottom: 12 },
  modalContentApt: { backgroundColor: colors.surfaceContainerLowest, borderTopLeftRadius: 28, borderTopRightRadius: 28, height: '85%', paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.xl },
  modalHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xl },
  modalTitleApt: { fontFamily: fonts.headline, fontSize: fontSizes.titleLg, fontWeight: '700', color: colors.onSurface },
  closeBtnApt: { padding: 8, borderRadius: 20, backgroundColor: colors.surfaceContainerLow },
  formScroll: { paddingBottom: spacing.xl },
  inputLabel: { fontFamily: fonts.label, fontSize: fontSizes.labelMd, color: colors.onSurfaceVariant, marginBottom: 8, marginTop: 12 },
  textInput: { backgroundColor: colors.surfaceContainerLow, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontFamily: fonts.body, fontSize: fontSizes.bodyMd, color: colors.onSurface },
  pickerWrap: { 
    backgroundColor: colors.surfaceContainerLow, 
    borderRadius: 12, 
    overflow: 'hidden',
    justifyContent: 'center',
    height: 54,
  },
  picker: { 
    height: 54, 
    width: '100%',
    color: colors.onSurface, 
    backgroundColor: 'transparent',
    borderWidth: 0,
    paddingHorizontal: 16,
    outlineStyle: 'none' as any
  },
  saveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: colors.primary, borderRadius: 16, paddingVertical: 16, marginTop: spacing['2xl'] },
  saveBtnTxt: { fontFamily: fonts.label, fontSize: fontSizes.labelLg, color: colors.onPrimary, fontWeight: '700' },
  
  suggestionsBox: { backgroundColor: colors.surfaceContainer, borderRadius: 12, marginTop: 4, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  suggestionItem: { paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.surfaceContainerHigh },
  suggestionName: { fontFamily: fonts.headline, fontSize: fontSizes.bodyMd, fontWeight: '600', color: colors.onSurface },
  suggestionPhone: { fontFamily: fonts.body, fontSize: fontSizes.bodySm, color: colors.onSurfaceVariant, marginTop: 2 },
  identifiedPatientTxt: { fontFamily: fonts.label, fontSize: fontSizes.labelSm, color: colors.primary, marginTop: 8, fontWeight: '600' },
  
  dateInputWrap: { flexDirection: 'row', alignItems: 'center' },
  dateIconBtn: { position: 'absolute', right: 16, padding: 4 },
  
  // Botão Flutuante Premium (FAB)
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 5,
    elevation: 8,
  },
});
