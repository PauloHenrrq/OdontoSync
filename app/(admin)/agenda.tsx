// ============================================================
// OdontoSync — Admin: Agenda
// Painel de agendamentos diários com picker dinâmico e modal calendário.
// ============================================================

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TouchableWithoutFeedback, TextInput, Animated, LayoutAnimation, Platform, UIManager, ActivityIndicator, Linking } from 'react-native';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { ChevronLeft, ChevronRight, Check, X, AlertTriangle, Calendar, Plus, ChevronDown, ChevronUp, Bell, Phone, Clock } from 'lucide-react-native';
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
  [AppointmentStatus.PENDING]: '#2E7D32', // Verde Agendado
  [AppointmentStatus.CONFIRMED]: '#2E7D32', // Verde Agendado (Auto-confirmado)
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
  
  // Se o primeiro dígito for >= 3, adiciona o prefixo '0' (ex: '8' vira '08')
  if (v.length === 1 && parseInt(v, 10) >= 3) {
    v = '0' + v;
  }
  
  if (v.length > 4) v = v.slice(0, 4);
  if (v.length === 0) return '';
  
  // Limita os primeiros dois dígitos (horas) até 23
  if (v.length >= 2) {
    let hh = parseInt(v.slice(0, 2), 10);
    if (hh > 23) {
      hh = 23;
    }
    v = String(hh).padStart(2, '0') + v.slice(2);
  }
  
  // Limita os dois últimos dígitos (minutos) até 59
  if (v.length >= 4) {
    let mm = parseInt(v.slice(2, 4), 10);
    if (mm > 59) {
      mm = 59;
    }
    v = v.slice(0, 2) + String(mm).padStart(2, '0');
  }
  
  if (v.length <= 2) return v;
  return `${v.slice(0, 2)}:${v.slice(2)}`;
};

export default function AgendaScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { appointments, cancelAppointment, updateAppointmentStatus, bookAppointment, isLoading } = useAppointmentStore();
  const { getPatientByPhone, patients, services, config } = useClinicStore();

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
  const [validationErrors, setValidationErrors] = useState<Record<string, boolean>>({});
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estados para Sino de Notificação e Lembretes
  const [isNotificationModalVisible, setIsNotificationModalVisible] = useState(false);
  const [isContactModalVisible, setIsContactModalVisible] = useState(false);
  const [selectedPatientForContact, setSelectedPatientForContact] = useState<any>(null);
  const [selectedAptForContact, setSelectedAptForContact] = useState<any>(null);
  const [selectedTemplateType, setSelectedTemplateType] = useState<'confirmation' | 'cancellation'>('confirmation');
  const [editedMessageText, setEditedMessageText] = useState('');
  const [isRefAptsExpanded, setIsRefAptsExpanded] = useState(false);

  // Agendamentos do paciente selecionado (ordenados do mais recente para o mais antigo)
  const patientHistory = selectedPatientForContact
    ? appointments.filter(a => a.userId === selectedPatientForContact.id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    : [];

  useEffect(() => {
    if (selectedPatientForContact && selectedTemplateType) {
      const template = selectedTemplateType === 'confirmation' 
        ? config.confirmationTemplate || 'Olá [NOME], confirmamos sua consulta em [DATA] às [HORA].'
        : config.cancellationTemplate || 'Olá [NOME], lamentamos, mas sua consulta em [DATA] às [HORA] foi cancelada.';
      
      const formatted = formatTemplate(
        template,
        selectedPatientForContact.name,
        selectedAptForContact?.date,
        selectedAptForContact?.time
      );
      setEditedMessageText(formatted);
    }
  }, [selectedTemplateType, selectedAptForContact, selectedPatientForContact, config]);
  // IDs de agendamentos cujo lembrete já foi tratado pela recepcionista nesta sessão
  const [dismissedReminderIds, setDismissedReminderIds] = useState<Set<string>>(new Set());

  const getDaysDifference = (aptDateStr: string): number => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const aptDate = new Date(aptDateStr + 'T12:00:00');
    aptDate.setHours(0, 0, 0, 0);
    const diffTime = aptDate.getTime() - today.getTime();
    return Math.round(diffTime / (1000 * 60 * 60 * 24));
  };

  // Parser de horas selecionadas para dias antes da consulta
  const activeReminderDays = (() => {
    const hoursStr = config.reminderHoursBefore;
    if (!hoursStr) return [1]; // padrão de fallback é 1 dia (amanhã)
    return hoursStr
      .split(',')
      .map((h) => parseInt(h.trim(), 10))
      .filter((h) => !isNaN(h) && h > 0)
      .map((h) => Math.max(1, Math.round(h / 24))) // Garante no mínimo 1 dia para ser lembrete antecipado
      .filter((v, i, self) => self.indexOf(v) === i); // remove duplicatas
  })();

  // Filtra agendamentos nos períodos configurados que ainda não foram dispensados
  // Apenas pacientes SEM cadastro completo precisam de lembrete manual, EXCETO se o agendamento for marcado como URGENTE nas observações
  const pendingReminders = appointments.filter((a) => {
    if (a.status !== AppointmentStatus.PENDING && a.status !== AppointmentStatus.CONFIRMED) {
      return false;
    }
    if (dismissedReminderIds.has(a.id)) {
      return false;
    }

    const isUrgent = a.notes?.toUpperCase().includes('URGENTE') ?? false;
    
    // Se não for urgente, filtra apenas pacientes sem cadastro completo
    if (!isUrgent) {
      const patient = getPatientByPhone(a.phone) ?? a.user;
      const hasCompleteRegistration = patient && patient.email && !patient.email.startsWith('sem-email-');
      if (hasCompleteRegistration) {
        return false;
      }
    }

    const diffDays = getDaysDifference(a.date);
    return activeReminderDays.includes(diffDays);
  });

  const pendingRemindersCount = pendingReminders.length;

  const formatTemplate = (template: string, patientName: string, aptDate?: string, aptTime?: string) => {
    let msg = template;
    
    // Expressões regulares case-insensitive para suportar {nome}, [NOME], {NOME}, [nome], etc.
    const nameRegex = /[\{\[]nome[\}\]]/gi;
    const phoneRegex = /[\{\[]telefone[\}\]]/gi;
    const dateRegex = /[\{\[]data[\}\]]/gi;
    const timeRegex = /[\{\[]hora[\}\]]/gi;
    const clinicRegex = /[\{\[]clinica[\}\]]/gi;

    msg = msg.replace(nameRegex, patientName);
    msg = msg.replace(phoneRegex, config.phone || '');
    msg = msg.replace(clinicRegex, config.name || 'OdontoSync');
    
    if (aptDate) {
      const dateObj = new Date(aptDate + 'T12:00:00');
      const formattedDate = dateObj.toLocaleDateString('pt-BR');
      msg = msg.replace(dateRegex, formattedDate);
    } else {
      msg = msg.replace(dateRegex, '[Data]');
    }

    if (aptTime) {
      msg = msg.replace(timeRegex, aptTime);
    } else {
      msg = msg.replace(timeRegex, '[Hora]');
    }

    return msg;
  };
  
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const mainScrollRef = useRef<ScrollView>(null);
  const [showGoToTop, setShowGoToTop] = useState(false);

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

  const closeNewAptModal = () => {
    setIsNewAptModalVisible(false);
    setValidationErrors({});
  };

  const phoneSuggestions = newApt.phone.replace(/\D/g, '').length >= 2 
    ? patients.filter(p => p.phone.replace(/\D/g, '').includes(newApt.phone.replace(/\D/g, ''))).slice(0, 3)
    : [];

  // Sincroniza pacientes, configurações e agendamentos sempre que a tela recebe foco
  useFocusEffect(
    useCallback(() => {
      useClinicStore.getState().fetchPatients(true);
      useClinicStore.getState().fetchConfig(true);
      useAppointmentStore.getState().fetchAppointments(true);
    }, [])
  );

  // Relógio interno para re-avaliar o atraso das consultas em tempo real na tela
  const [currentTime, setCurrentTime] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 15000); // Executa a cada 15 segundos para atualizar a tela sem requisição de rede
    return () => clearInterval(timer);
  }, []);

  // Garante que, ao abrir a tela (mount), as datas são resetadas para o dia atual de hoje
  useEffect(() => {
    const today = getTodayStr();
    setSelectedDate(today);
    setCenterDate(today);
    setCurrentMonthRef(new Date());
  }, []);

  useEffect(() => {
    if (params.openNew === 'true') {
      const phone = params.phone ? String(params.phone) : '';
      const name = params.name ? String(params.name) : '';
      
      setNewApt({
        phone: maskPhone(phone),
        name: name,
        dentist: 'Dr. Paulo',
        serviceId: '',
        date: '',
        time: ''
      });
      
      setIsNewAptModalVisible(true);
      // Limpa os params para evitar que abra de novo em re-renders acidentais
      router.setParams({ openNew: '', phone: '', name: '' });
    }
  }, [params.openNew, params.phone, params.name]);

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
      {/* Seta/Barra reservada no topo para voltar ao início ao rolar */}
      {showGoToTop && (
        <View style={s.stickyTopBar}>
          <TouchableOpacity
            style={s.goToTopBtn}
            onPress={() => mainScrollRef.current?.scrollTo({ x: 0, y: 0, animated: true })}
            activeOpacity={0.8}
          >
            <ChevronUp size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>
      )}

      <ScrollView
        ref={mainScrollRef}
        showsVerticalScrollIndicator={false}
        onScroll={(event) => {
          const offsetY = event.nativeEvent.contentOffset.y;
          if (offsetY > 150) {
            setShowGoToTop(true);
          } else {
            setShowGoToTop(false);
          }
        }}
        scrollEventThrottle={16}
        style={s.container}
        contentContainerStyle={{ paddingBottom: spacing.xl }}
      >
        {/* Top Header Row */}
        <View style={s.headerRow}>
          <Text style={s.title}>Agenda da Clínica</Text>
          <TouchableOpacity 
            style={s.bellBtn} 
            activeOpacity={0.7} 
            onPress={() => setIsNotificationModalVisible(true)}
          >
            <Bell size={24} color={colors.primary} />
            {pendingRemindersCount > 0 && (
              <View style={s.bellBadge}>
                <Text style={s.bellBadgeTxt}>{pendingRemindersCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

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
          <View style={s.dateRow}>
            {dates.map((d) => {
              const dt = new Date(d + 'T12:00:00');
              const isActive = d === selectedDate;
              const hasAptOnDay = appointments.some(a => a.date === d && a.status !== 'CANCELLED');
              return (
                <TouchableOpacity key={d} style={[s.dateChip, isActive && s.dateChipActive]} onPress={() => setSelectedDate(d)}>
                  <Text style={[s.dateDay, isActive && s.dateDayActive]}>{dt.toLocaleDateString('pt-BR', { weekday: 'short' })}</Text>
                  <Text style={[s.dateNum, isActive && s.dateNumActive]}>{dt.getDate()}</Text>
                  {hasAptOnDay && (
                    <View style={[s.greenDot, isActive && s.greenDotActive]} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Ver Calendário posicionado na esquerda em baixo das datas atuais */}
        <View style={s.calendarBtnRow}>
          <TouchableOpacity 
            style={s.calendarBtn} 
            onPress={() => {
              setCalendarTarget('main');
              setIsModalVisible(true);
            }} 
            activeOpacity={0.7}
          >
            <Calendar size={16} color={colors.primary} />
            <Text style={s.calendarBtnTxt}>Ver Calendário</Text>
          </TouchableOpacity>
        </View>

        {/* Banner Inteligente de Lembretes */}
        {pendingRemindersCount > 0 ? (
          <TouchableOpacity 
            style={s.smartBanner}
            activeOpacity={0.85}
            onPress={() => setIsNotificationModalVisible(true)}
          >
            <AlertTriangle size={20} color="#E65100" />
            <View style={{ flex: 1 }}>
              <Text style={s.smartBannerTitle}>Ações Requeridas Hoje</Text>
              <Text style={s.smartBannerSub}>Você possui {pendingRemindersCount} {pendingRemindersCount === 1 ? 'lembrete pendente' : 'lembretes pendentes'} nos períodos configurados.</Text>
            </View>
            <ChevronRight size={18} color="#E65100" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={s.smartBannerSuccess}
            activeOpacity={0.85}
            onPress={() => setIsNotificationModalVisible(true)}
          >
            <Check size={20} color="#2E7D32" />
            <View style={{ flex: 1 }}>
              <Text style={s.smartBannerSuccessTitle}>Tudo sob Controle!</Text>
              <Text style={s.smartBannerSuccessSub}>Todos os lembretes nos prazos configurados já foram enviados ou estão em dia.</Text>
            </View>
            <ChevronRight size={18} color="#2E7D32" />
          </TouchableOpacity>
        )}

        {/* Título Estático "Agenda Atual" */}
        <View style={s.listHeader}>
          <Text style={s.listHeaderTitle}>Agenda Atual</Text>
        </View>

        {/* Lista de agendamentos dentro de View normal (estendendo o scroll da tela inteira) */}
        <View style={s.scrollContainer}>
          <View style={s.scroll}>
            {dayApts.length > 0 ? dayApts.map((apt) => {
              const svc = services.find((sv) => sv.id === apt.serviceId) || apt.service;
              const patient = apt.user ?? (apt.userId ? getPatientByPhone(apt.phone) : undefined);

              // Calcula se passou de 30 minutos do horário marcado ou se é de dia anterior
              const now = currentTime;
              const aptDateTime = new Date(`${apt.date}T${apt.time}:00`);
              const diffMinutes = (now.getTime() - aptDateTime.getTime()) / (1000 * 60);
              const isPast30Min = diffMinutes > 30;

              const aptDateOnly = new Date(apt.date + 'T00:00:00');
              const todayDateOnly = new Date();
              todayDateOnly.setHours(0, 0, 0, 0);
              aptDateOnly.setHours(0, 0, 0, 0);
              const isPast1Day = todayDateOnly.getTime() - aptDateOnly.getTime() >= (1000 * 60 * 60 * 24);

              const isAutoCompleted = (apt.status === AppointmentStatus.PENDING || apt.status === AppointmentStatus.CONFIRMED) && isPast30Min;
              const cardBorderColor = isAutoCompleted ? '#78909C' : statusColors[apt.status];
              const displayStatus = isAutoCompleted ? AppointmentStatus.COMPLETED : apt.status;

              return (
                <Card 
                  key={apt.id} 
                  style={[s.aptCard, { borderLeftWidth: 4, borderLeftColor: cardBorderColor }]} 
                  padding="md"
                >
                  <View style={s.aptHeader}>
                    <Text style={s.aptTime}>{apt.time}</Text>
                    <Badge variant="status" status={displayStatus} />
                  </View>
                  <Text style={s.aptName}>{patient?.name ?? apt.phone}</Text>
                  <Text style={s.aptSvc}>{svc?.name ?? 'Consulta'} — {apt.dentistName}</Text>
                  {apt.notes && <Text style={s.aptNotes}>📋 {apt.notes}</Text>}
                  {!apt.userId && <Text style={s.orphan}>📱 Paciente sem app — WhatsApp</Text>}

                  {/* Mostra botões apenas se não for dia passado, e se o status for pendente/confirmado */}
                  {!isPast1Day && (apt.status === AppointmentStatus.PENDING || apt.status === AppointmentStatus.CONFIRMED) && (
                    <View style={s.actions}>
                      <TouchableOpacity style={[s.actWarn, { flex: 1 }]} onPress={() => handleAction(apt.id, 'marcar falta')}>
                        <AlertTriangle size={16} color="#E65100" /><Text style={s.actTxtO}>Marcar Falta</Text>
                      </TouchableOpacity>
                      {!isPast30Min && (
                        <TouchableOpacity style={[s.actCancel, { flex: 1 }]} onPress={() => handleAction(apt.id, 'cancelar')}>
                          <X size={16} color={colors.error} /><Text style={s.actTxtR}>Cancelar</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
                </Card>
              );
            }) : (
              <Card variant="filled" padding="lg">
                <Text style={{ textAlign: 'center', color: colors.outline, fontFamily: fonts.body }}>Nenhum agendamento neste dia</Text>
              </Card>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Modal de Novo Agendamento */}
      <Modal
        visible={isNewAptModalVisible}
        transparent
        animationType="slide"
        onRequestClose={closeNewAptModal}
      >
        <TouchableWithoutFeedback onPress={closeNewAptModal}>
          <View style={s.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={s.modalContentApt}>
                <View style={s.modalDragHandle} />
                <View style={s.modalHeaderRow}>
                  <Text style={s.modalTitleApt}>Novo Agendamento</Text>
                  <TouchableOpacity style={s.closeBtnApt} onPress={closeNewAptModal}>
                    <X size={20} color={colors.outline} />
                  </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.formScroll} keyboardShouldPersistTaps="handled">
                  <Text style={s.inputLabel}>Telefone do Paciente <Text style={{ color: colors.error }}>*</Text></Text>
                  <TextInput 
                    style={[s.textInput, validationErrors.phone && s.textInputError]} 
                    placeholder="Ex: (11) 90000-0000" 
                    placeholderTextColor={colors.outline} 
                    keyboardType="numeric"
                    value={newApt.phone} 
                    onChangeText={(t) => {
                      setNewApt({...newApt, phone: maskPhone(t), name: ''});
                      setValidationErrors(prev => ({ ...prev, phone: false }));
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
                            setValidationErrors(prev => ({ ...prev, phone: false }));
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

                  {/* Alerta amigável de Paciente Órfão */}
                  {newApt.phone.replace(/\D/g, '').length === 11 && !getPatientByPhone(newApt.phone.replace(/\D/g, '')) && (
                    <View>
                      <View style={s.orphanWarning}>
                        <AlertTriangle size={16} color="#E65100" />
                        <Text style={s.orphanWarningTxt}>
                          Telefone não vinculado a nenhum paciente cadastrado
                        </Text>
                      </View>
                      
                      <Text style={s.inputLabel}>Nome do Paciente (Opcional)</Text>
                      <TextInput 
                        style={s.textInput} 
                        placeholder="Ex: Maria Souza" 
                        placeholderTextColor={colors.outline} 
                        value={newApt.name} 
                        onChangeText={(t) => setNewApt({...newApt, name: t})} 
                      />
                    </View>
                  )}

                  <Text style={s.inputLabel}>Serviço <Text style={{ color: colors.error }}>*</Text></Text>
                  <TouchableOpacity 
                    style={[s.textInput, validationErrors.serviceId && s.textInputError]} 
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
                            setValidationErrors(prev => ({ ...prev, serviceId: false }));
                            toggleServiceDropdown();
                          }}
                        >
                          <Text style={s.suggestionName}>{svc.name}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}

                  <Text style={s.inputLabel}>Data da Consulta <Text style={{ color: colors.error }}>*</Text></Text>
                  <View style={[s.dateInputWrap, validationErrors.date && s.textInputError]}>
                    <TextInput 
                      style={[s.textInput, { flex: 1, paddingRight: 50 }]} 
                      placeholder="DD/MM/AAAA" 
                      placeholderTextColor={colors.outline} 
                      keyboardType="numeric"
                      value={newApt.date} 
                      onChangeText={(t) => {
                        setNewApt({...newApt, date: maskDate(t)});
                        setValidationErrors(prev => ({ ...prev, date: false }));
                      }} 
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

                  <Text style={s.inputLabel}>Horário <Text style={{ color: colors.error }}>*</Text></Text>
                  <TextInput 
                    style={[s.textInput, validationErrors.time && s.textInputError]} 
                    placeholder="00:00" 
                    placeholderTextColor={colors.outline} 
                    keyboardType="numeric"
                    value={newApt.time} 
                    onChangeText={(t) => {
                      setNewApt({...newApt, time: maskTime(t)});
                      setValidationErrors(prev => ({ ...prev, time: false }));
                    }} 
                  />

                  <TouchableOpacity 
                    style={[s.saveBtn, isSubmitting && { backgroundColor: colors.outline, opacity: 0.8 }]} 
                    disabled={isSubmitting}
                    onPress={async () => { 
                      const errors: Record<string, boolean> = {};
                      if (!newApt.phone) errors.phone = true;
                      if (!newApt.date) errors.date = true;
                      if (!newApt.time) errors.time = true;
                      if (!newApt.serviceId) errors.serviceId = true;

                      if (Object.keys(errors).length > 0) {
                        setValidationErrors(errors);
                        Alert.alert('Atenção', 'Preencha todos os campos obrigatórios em vermelho para prosseguir.');
                        return;
                      }

                      // Validação rigorosa de data
                      const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
                      const match = newApt.date.match(dateRegex);
                      if (!match) {
                        Alert.alert('Atenção', 'Por favor, insira a data no formato DD/MM/AAAA.');
                        return;
                      }

                      const day = parseInt(match[1], 10);
                      const month = parseInt(match[2], 10) - 1; // 0-indexed
                      const year = parseInt(match[3], 10);

                      const dateObj = new Date(year, month, day, 12, 0, 0); // Evita timezone offset shifting
                      if (
                        dateObj.getFullYear() !== year ||
                        dateObj.getMonth() !== month ||
                        dateObj.getDate() !== day
                      ) {
                        Alert.alert('Atenção', 'Por favor, insira uma data válida.');
                        return;
                      }

                      const isoDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                      const todayStr = getTodayStr(); // YYYY-MM-DD
                      if (isoDate < todayStr) {
                        Alert.alert('Atenção', 'A data do agendamento não pode ser anterior a hoje.');
                        return;
                      }

                      // Validação rigorosa do horário (HH:MM de 00:00 a 23:59)
                      const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;
                      if (!timeRegex.test(newApt.time)) {
                        Alert.alert('Atenção', 'Por favor, insira um horário válido no formato HH:MM (de 00:00 a 23:59).');
                        return;
                      }

                      // Limpa o telefone para buscar no banco
                      const cleanPhone = newApt.phone.replace(/\D/g, '');
                      const linkedPatient = getPatientByPhone(cleanPhone);

                      setIsSubmitting(true);
                      const success = await bookAppointment(
                        linkedPatient?.id ?? '',
                        cleanPhone,
                        {
                          serviceId: newApt.serviceId,
                          dentistName: newApt.dentist,
                          date: isoDate,
                          time: newApt.time,
                          patientName: !linkedPatient ? newApt.name : undefined,
                        }
                      );
                      setIsSubmitting(false);

                      if (success) {
                        // Sincroniza pacientes em segundo plano sem bloquear a interface de agendamento da recepcionista!
                        useClinicStore.getState().fetchPatients();
                        setNewApt({ phone: '', name: '', dentist: 'Dr. Paulo', serviceId: '', date: '', time: '' });
                        closeNewAptModal();
                        
                        // Exibe feedback visual não-bloqueante na tela principal
                        setSuccessToast('Agendamento salvo com sucesso!');
                        setTimeout(() => setSuccessToast(null), 2500);
                      } else {
                        Alert.alert('Erro', 'Não foi possível salvar o agendamento. Tente novamente.');
                      }
                    }} 
                    activeOpacity={0.8}
                  >
                    {isSubmitting ? (
                      <ActivityIndicator size="small" color={colors.onPrimary} style={{ marginRight: 8 }} />
                    ) : (
                      <Check size={20} color={colors.onPrimary} />
                    )}
                    <Text style={s.saveBtnTxt}>
                      {isSubmitting ? 'Salvando...' : 'Salvar Agendamento'}
                    </Text>
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
                    const hasAptOnDay = appointments.some(a => a.date === dayStr && a.status !== 'CANCELLED');

                    return (
                      <TouchableOpacity
                        key={dayStr}
                        style={s.dayCell}
                        onPress={() => {
                          const dayStr = formatDateStr(day);
                          if (calendarTarget === 'main') {
                            setSelectedDate(dayStr);
                            setCenterDate(dayStr);
                          } else {
                            const parts = dayStr.split('-');
                            setNewApt({...newApt, date: `${parts[2]}/${parts[1]}/${parts[0]}`});
                            setValidationErrors(prev => ({ ...prev, date: false }));
                          }
                          setIsModalVisible(false);
                        }}
                        activeOpacity={0.7}
                      >
                        <View
                          style={[
                            s.dayCircle,
                            isSelected && s.dayCircleSelected,
                            isToday && !isSelected && s.dayCircleToday,
                          ]}
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
                          {hasAptOnDay && (
                            <View
                              style={[
                                s.gridGreenDot,
                                isSelected && s.gridGreenDotSelected,
                              ]}
                            />
                          )}
                        </View>
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

      {/* Modal Central de Lembretes Pendentes */}
      <Modal
        visible={isNotificationModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsNotificationModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setIsNotificationModalVisible(false)}>
          <View style={s.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={s.modalContentNotification}>
                <View style={s.modalHeaderRow}>
                  <Text style={s.modalTitleNotification}>Lembretes Pendentes</Text>
                  <TouchableOpacity style={s.closeBtnNotification} onPress={() => setIsNotificationModalVisible(false)}>
                    <X size={20} color={colors.outline} />
                  </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 300 }}>
                  {pendingReminders.length > 0 ? (
                    pendingReminders.map((apt) => {
                      const patient = apt.user ?? (apt.userId ? getPatientByPhone(apt.phone) : undefined);
                      const patientName = patient?.name ?? apt.phone;
                      const diffDays = getDaysDifference(apt.date);
                      const labelDias = diffDays === 0 
                        ? 'hoje' 
                        : diffDays === 1 
                        ? 'amanhã' 
                        : `daqui a ${diffDays} dias`;
                      return (
                        <TouchableOpacity
                          key={apt.id}
                          style={s.notificationItem}
                          onPress={() => {
                            const pData = patient || { name: patientName, phone: apt.phone, email: 'sem-email-' };
                            setSelectedPatientForContact(pData);
                            setSelectedAptForContact(apt);
                            setSelectedTemplateType('confirmation');
                            setIsRefAptsExpanded(false);
                            
                            setIsNotificationModalVisible(false);
                            setIsContactModalVisible(true);
                          }}
                        >
                          <View style={s.notificationBullet} />
                          <View style={{ flex: 1 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                              <Text style={s.notificationName}>{patientName}</Text>
                              {apt.notes?.toUpperCase().includes('URGENTE') && (
                                <View style={{ backgroundColor: colors.errorContainer, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>
                                  <Text style={{ color: colors.error, fontFamily: fonts.label, fontSize: 10, fontWeight: '700' }}>URGENTE</Text>
                                </View>
                              )}
                            </View>
                            <Text style={s.notificationSub}>Consulta {labelDias} às {apt.time}</Text>
                          </View>
                          <ChevronRight size={16} color={colors.primary} />
                        </TouchableOpacity>
                      );
                    })
                  ) : (
                    <Text style={s.noNotificationsTxt}>Nenhum lembrete pendente nos prazos configurados.</Text>
                  )}
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Modal de Contato WhatsApp */}
      <Modal
        visible={isContactModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsContactModalVisible(false)}
      >
        <View style={s.modalOverlay}>
          <TouchableOpacity 
            style={StyleSheet.absoluteFill} 
            activeOpacity={1} 
            onPress={() => setIsContactModalVisible(false)} 
          />
          <View style={s.contactModalContent}>
            <View style={s.modalDragHandle} />
            
            {selectedPatientForContact && (
              <>
                <View style={s.contactHeader}>
                  <View style={s.contactInfo}>
                    <Text style={s.contactName}>{selectedPatientForContact.name}</Text>
                    <Text style={s.contactPhone}>{selectedPatientForContact.phone}</Text>
                  </View>
                  <TouchableOpacity style={s.closeBtn} onPress={() => setIsContactModalVisible(false)}>
                    <X size={20} color={colors.outline} />
                  </TouchableOpacity>
                </View>

                {patientHistory.length > 0 && (
                  <View style={{ marginBottom: spacing.md }}>
                    <Text style={s.contactDatesTitle}>Consulta de Referência</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 4 }}>
                      {patientHistory.slice(0, 2).map((apt) => {
                        const isSelected = selectedAptForContact?.id === apt.id;
                        const formattedDate = new Date(apt.date + 'T12:00:00').toLocaleDateString('pt-BR');
                        return (
                          <TouchableOpacity
                            key={apt.id}
                            style={[
                              s.refAptChip,
                              isSelected && s.refAptChipActive
                            ]}
                            onPress={() => setSelectedAptForContact(apt)}
                          >
                            <Text style={[s.refAptChipTxt, isSelected && s.refAptChipTxtActive]}>
                              {formattedDate} às {apt.time}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                      {patientHistory.length > 2 && (
                        <TouchableOpacity
                          style={s.refAptPlusChip}
                          onPress={() => setIsRefAptsExpanded(!isRefAptsExpanded)}
                          activeOpacity={0.7}
                        >
                          <Text style={s.refAptPlusTxt}>
                            {isRefAptsExpanded ? 'Recolher' : `+${patientHistory.length - 2}`}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </ScrollView>

                    {isRefAptsExpanded && patientHistory.length > 2 && (
                      <View style={s.expandedListContainer}>
                        {patientHistory.map((apt) => {
                          const isSelected = selectedAptForContact?.id === apt.id;
                          const formattedDate = new Date(apt.date + 'T12:00:00').toLocaleDateString('pt-BR');
                          return (
                            <TouchableOpacity
                              key={apt.id}
                              style={[s.expandedRow, isSelected && s.expandedRowActive]}
                              onPress={() => {
                                setSelectedAptForContact(apt);
                                setIsRefAptsExpanded(false);
                              }}
                            >
                              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Text style={[s.expandedDateTxt, isSelected && s.expandedDateTxtActive]}>
                                  {formattedDate} às {apt.time}
                                </Text>
                                {isSelected && <Check size={16} color={colors.primary} />}
                              </View>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    )}
                  </View>
                )}

                <Text style={s.contactDatesTitle}>Mensagens Disponíveis</Text>
                
                <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
                  <TouchableOpacity 
                    style={[
                      s.msgTemplateTab, 
                      selectedTemplateType === 'confirmation' && s.msgTemplateTabActive
                    ]} 
                    activeOpacity={0.7} 
                    onPress={() => {
                      setSelectedTemplateType('confirmation');
                      const raw = config.confirmationTemplate || 'Olá [NOME], confirmamos sua consulta em [DATA] às [HORA].';
                      const formatted = formatTemplate(raw, selectedPatientForContact.name, selectedAptForContact?.date, selectedAptForContact?.time);
                      setEditedMessageText(formatted);
                    }}
                  >
                    <Clock size={16} color={selectedTemplateType === 'confirmation' ? colors.onPrimary : colors.primary} />
                    <Text style={[
                      s.msgTemplateTabTxt, 
                      selectedTemplateType === 'confirmation' && s.msgTemplateTabTxtActive
                    ]}>Lembrete</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[
                      s.msgTemplateTab, 
                      selectedTemplateType === 'cancellation' && s.msgTemplateTabActive,
                      selectedTemplateType !== 'cancellation' && { borderColor: colors.error + '40' }
                    ]} 
                    activeOpacity={0.7} 
                    onPress={() => {
                      setSelectedTemplateType('cancellation');
                      const raw = config.cancellationTemplate || 'Olá [NOME], lamentamos informar que sua consulta em [DATA] às [HORA] foi cancelada.';
                      const formatted = formatTemplate(raw, selectedPatientForContact.name, selectedAptForContact?.date, selectedAptForContact?.time);
                      setEditedMessageText(formatted);
                    }}
                  >
                    <AlertTriangle size={16} color={selectedTemplateType === 'cancellation' ? colors.onPrimary : colors.error} />
                    <Text style={[
                      s.msgTemplateTabTxt, 
                      selectedTemplateType === 'cancellation' && s.msgTemplateTabTxtActive,
                      selectedTemplateType !== 'cancellation' && { color: colors.error }
                    ]}>Cancelamento</Text>
                  </TouchableOpacity>
                </View>

                <Text style={s.contactDatesTitle}>Mensagem de Notificação</Text>
                <View style={s.editorContainer}>
                  <TextInput
                    style={s.editorInput}
                    multiline
                    numberOfLines={5}
                    value={editedMessageText}
                    onChangeText={setEditedMessageText}
                    placeholder="Escreva a mensagem aqui..."
                    placeholderTextColor={colors.outline}
                  />
                </View>

                <View style={s.actionRow}>
                  <TouchableOpacity
                    style={[s.waBtn, { flex: 1 }]}
                    activeOpacity={0.8}
                    onPress={() => {
                      const cleanPhone = selectedPatientForContact.phone.replace(/\D/g, '');
                      const waPhone = cleanPhone.startsWith('55') ? cleanPhone : '55' + cleanPhone;
                      Linking.openURL(`https://wa.me/${waPhone}?text=${encodeURIComponent(editedMessageText)}`);
                      // Marca o lembrete como dispensado: sininho e banner atualizam instantaneamente
                      if (selectedAptForContact?.id) {
                        setDismissedReminderIds(prev => new Set([...prev, selectedAptForContact.id]));
                      }
                      setIsContactModalVisible(false);
                    }}
                  >
                    <Phone size={18} color={colors.onPrimary} style={{ marginRight: 6 }} />
                    <Text style={s.waBtnTxt}>Enviar WhatsApp</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Toast de Feedback Rápido */}
      {successToast && (
        <View style={s.toastContainer}>
          <Check size={18} color="#2E7D32" />
          <Text style={s.toastText}>{successToast}</Text>
        </View>
      )}

      {/* Botão Flutuante de Novo Agendamento (FAB) */}
      <TouchableOpacity 
        style={s.fab} 
        onPress={() => {
          const parts = selectedDate.split('-');
          const initialDate = parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : '';
          setNewApt({ phone: '', name: '', dentist: 'Dr. Paulo', serviceId: '', date: initialDate, time: '' });
          setIsNewAptModalVisible(true);
        }}
        activeOpacity={0.85}
      >
        <Plus size={28} color={colors.onPrimary} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  title: { fontFamily: fonts.headline, fontSize: fontSizes.headlineMd, fontWeight: '700', color: colors.onSurface },
  
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

  dateRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 10,
    width: '100%',
  },
  dateChip: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: 58,
    height: 78,
    borderRadius: 20,
    backgroundColor: colors.surfaceContainer,
    borderWidth: 1.5,
    borderColor: colors.surfaceContainerHigh,
  },
  dateChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  dateDay: { fontFamily: fonts.label, fontSize: fontSizes.labelSm, color: colors.onSurfaceVariant, marginBottom: 6, marginTop: 2 },
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
  dayCell: { width: `${100 / 7}%`, aspectRatio: 1, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  dayCircle: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', position: 'relative', marginLeft: 1 },
  dayCircleSelected: { backgroundColor: colors.primary },
  dayCircleToday: { borderWidth: 1.5, borderColor: colors.primaryFixedDim },
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
  textInputError: {
    borderWidth: 1.5,
    borderColor: colors.error,
    backgroundColor: '#FFEBEE',
  },
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
  orphanWarning: {
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: '#FFE0B2',
  },
  orphanWarningTxt: {
    fontFamily: fonts.body,
    fontSize: fontSizes.bodySm,
    color: '#E65100',
    flex: 1,
    lineHeight: 18,
  },
  greenDot: {
    position: 'absolute',
    bottom: 8,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4CAF50',
    alignSelf: 'center',
  },
  greenDotActive: {
    backgroundColor: colors.onPrimary,
  },
  gridGreenDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#4CAF50',
    position: 'absolute',
    bottom: 4,
    alignSelf: 'center',
  },
  gridGreenDotSelected: {
    backgroundColor: colors.onPrimary,
  },
  
  // Novos Estilos: Header, Sino e Banner Inteligente
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    marginBottom: 24,
  },
  bellBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.surfaceContainerHigh,
  },
  bellBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: colors.error,
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  bellBadgeTxt: {
    fontFamily: fonts.label,
    fontSize: 10,
    color: colors.onPrimary,
    fontWeight: '700',
  },
  smartBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFF3E0',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: spacing.lg,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FFE0B2',
  },
  smartBannerTitle: {
    fontFamily: fonts.headline,
    fontSize: fontSizes.bodyMd,
    fontWeight: '700',
    color: '#E65100',
  },
  smartBannerSub: {
    fontFamily: fonts.body,
    fontSize: fontSizes.bodySm,
    color: '#E65100',
    marginTop: 2,
  },
  smartBannerSuccess: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#E8F5E9',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: spacing.lg,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  smartBannerSuccessTitle: {
    fontFamily: fonts.headline,
    fontSize: fontSizes.bodyMd,
    fontWeight: '700',
    color: '#2E7D32',
  },
  smartBannerSuccessSub: {
    fontFamily: fonts.body,
    fontSize: fontSizes.bodySm,
    color: '#2E7D32',
    marginTop: 2,
  },
  
  // Estilos da Central de Notificações
  modalContentNotification: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  modalTitleNotification: {
    fontFamily: fonts.headline,
    fontSize: fontSizes.titleMd,
    fontWeight: '700',
    color: colors.onSurface,
  },
  closeBtnNotification: {
    padding: 6,
    borderRadius: 12,
    backgroundColor: colors.surfaceContainer,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceContainerHigh,
  },
  notificationBullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginRight: 12,
  },
  notificationName: {
    fontFamily: fonts.headline,
    fontSize: fontSizes.bodyMd,
    fontWeight: '600',
    color: colors.onSurface,
  },
  notificationSub: {
    fontFamily: fonts.body,
    fontSize: fontSizes.bodySm,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
  noNotificationsTxt: {
    fontFamily: fonts.body,
    fontSize: fontSizes.bodyMd,
    color: colors.outline,
    textAlign: 'center',
    paddingVertical: 20,
  },

  // Estilos do Modal de Contatos
  contactModalContent: {
    backgroundColor: colors.surfaceContainerLowest,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  contactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontFamily: fonts.headline,
    fontSize: fontSizes.titleMd,
    fontWeight: '700',
    color: colors.onSurface,
  },
  contactPhone: {
    fontFamily: fonts.body,
    fontSize: fontSizes.bodySm,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
  closeBtn: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: colors.surfaceContainerLow,
  },
  contactDatesTitle: {
    fontFamily: fonts.label,
    fontSize: fontSizes.labelSm,
    color: colors.outline,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginTop: 12,
  },
  refAptChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: colors.surfaceContainerLow,
    borderWidth: 1.5,
    borderColor: colors.outlineVariant,
  },
  refAptChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  refAptChipTxt: {
    fontFamily: fonts.label,
    fontSize: fontSizes.labelSm,
    color: colors.onSurface,
    fontWeight: '500',
  },
  refAptChipTxtActive: {
    color: colors.onPrimary,
    fontWeight: '600',
  },
  refAptPlusChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: colors.primaryFixed + '30',
    borderWidth: 1.5,
    borderColor: colors.primaryFixedDim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  refAptPlusTxt: {
    fontFamily: fonts.label,
    fontSize: fontSizes.labelSm,
    color: colors.primary,
    fontWeight: '700',
  },
  expandedListContainer: {
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: 12,
    marginTop: 8,
    padding: 8,
    gap: 4,
    borderWidth: 1,
    borderColor: colors.surfaceContainerHigh,
  },
  expandedRow: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
  expandedRowActive: {
    backgroundColor: colors.surfaceContainerLowest,
  },
  expandedDateTxt: {
    fontFamily: fonts.bodyMedium,
    fontSize: fontSizes.bodySm,
    color: colors.onSurfaceVariant,
  },
  expandedDateTxtActive: {
    fontFamily: fonts.label,
    color: colors.primary,
    fontWeight: '600',
  },
  msgTemplateTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.primary + '40',
    backgroundColor: colors.surfaceContainerLowest,
  },
  msgTemplateTabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  msgTemplateTabTxt: {
    fontFamily: fonts.label,
    fontSize: fontSizes.labelSm,
    color: colors.primary,
    fontWeight: '600',
  },
  msgTemplateTabTxtActive: {
    color: colors.onPrimary,
    fontWeight: '700',
  },
  editorContainer: {
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1.5,
    borderColor: colors.surfaceContainerHigh,
    marginBottom: spacing.xl,
  },
  editorInput: {
    fontFamily: fonts.body,
    fontSize: fontSizes.bodyMd,
    color: colors.onSurface,
    textAlignVertical: 'top',
    height: 100,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  waBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
  },
  waBtnTxt: {
    fontFamily: fonts.label,
    fontSize: fontSizes.labelLg,
    color: colors.onPrimary,
    fontWeight: '700',
  },
  stickyTopBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 54,
    backgroundColor: colors.background + 'FA', // quase opaco para sobrepor os cards
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceContainerHigh,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 99,
  },
  goToTopBtn: {
    padding: 10,
    borderRadius: 20,
    backgroundColor: colors.primaryFixed + '40',
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toastContainer: {
    position: 'absolute',
    bottom: 90,
    left: 20,
    right: 20,
    backgroundColor: '#E8F5E9',
    borderColor: '#C8E6C9',
    borderWidth: 1.5,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
    zIndex: 9999,
  },
  toastText: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: '600',
  },
});
