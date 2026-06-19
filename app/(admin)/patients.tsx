// OdontoSync — Admin: Patients (Stitch: ca2b18e4)
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Modal, TouchableWithoutFeedback, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Search, Phone, Mail, ChevronRight, ChevronLeft, Check, X, Calendar, Plus, Clock, FileText, AlertTriangle } from 'lucide-react-native';
import { Card } from '@/src/components/ui/Card';
import { Avatar } from '@/src/components/ui/Avatar';
import { Badge } from '@/src/components/ui/Badge';
import { useClinicStore } from '@/src/stores/clinicStore';
import { useAppointmentStore } from '@/src/stores/appointmentStore';
import { User, AppointmentStatus } from '@/src/types';
import { colors, fonts, fontSizes, spacing } from '@/src/styles/tokens';
import { Alert } from '@/src/components/ui/Alert';

const formatDateStr = (date: Date): string => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const isPastDate = (dateStr: string): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const aptDate = new Date(dateStr + 'T12:00:00');
  aptDate.setHours(0, 0, 0, 0);
  return aptDate < today;
};

const getDaysInMonth = (year: number, month: number): number => {
  return new Date(year, month + 1, 0).getDate();
};

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

export default function PatientsScreen() {
  const router = useRouter();
  const { patients, searchPatients, config, services } = useClinicStore();
  const { appointments } = useAppointmentStore();
  const [query, setQuery] = useState('');

  // Sincroniza pacientes e agendamentos sempre que a tela recebe foco
  useFocusEffect(
    useCallback(() => {
      useClinicStore.getState().fetchPatients(true);
      useAppointmentStore.getState().fetchAppointments(true);
    }, [])
  );
  const [selectedPatient, setSelectedPatient] = useState<User | null>(null);
  const [isContactModalVisible, setIsContactModalVisible] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const itemRefs = useRef<Record<string, number>>({});
  
  const [selectedAptForContact, setSelectedAptForContact] = useState<typeof appointments[0] | null>(null);
  const [selectedTemplateType, setSelectedTemplateType] = useState<'confirmation' | 'cancellation' | null>(null);
  const [editedMessageText, setEditedMessageText] = useState('');
  const [isRefAptsExpanded, setIsRefAptsExpanded] = useState(false);

  const openContactModal = () => {
    const upcoming = selectedPatientHistory.filter(a => new Date(a.date + 'T12:00:00') >= new Date());
    if (upcoming.length > 0) {
      setSelectedAptForContact(upcoming[0]);
    } else if (selectedPatientHistory.length > 0) {
      setSelectedAptForContact(selectedPatientHistory[0]);
    } else {
      setSelectedAptForContact(null);
    }
    setSelectedTemplateType('confirmation');
    setIsRefAptsExpanded(false);
    setIsContactModalVisible(true);
  };

  useEffect(() => {
    if (selectedPatient && selectedTemplateType) {
      const template = selectedTemplateType === 'confirmation' 
        ? config.confirmationTemplate 
        : config.cancellationTemplate;
      
      const formatted = formatTemplate(
        template,
        selectedPatient.name,
        selectedAptForContact?.date,
        selectedAptForContact?.time
      );
      setEditedMessageText(formatted);
    } else {
      setEditedMessageText('');
    }
  }, [selectedTemplateType, selectedAptForContact, selectedPatient, config]);

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

  const filtered = query ? searchPatients(query) : patients;
  
  // Agendamentos do paciente selecionado (ordenados do mais recente para o mais antigo)
  const selectedPatientHistory = selectedPatient 
    ? appointments.filter(a => a.userId === selectedPatient.id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    : [];

  // Estados e Funções do Calendário do Paciente
  const [currentMonthRef, setCurrentMonthRef] = useState(() => new Date());

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
      <Text style={s.title}>Pacientes</Text>
      <Text style={s.sub}>{patients.length} pacientes cadastrados</Text>

      <View style={s.searchWrap}>
        <Search size={20} color={colors.outline} />
        <TextInput style={s.searchInput} placeholder="Buscar por nome, telefone ou email..." placeholderTextColor={colors.outline} value={query} onChangeText={setQuery} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {filtered.length > 0 ? filtered.map((p) => {
          const aptCount = appointments.filter((a) => a.userId === p.id).length;
          return (
            <TouchableOpacity key={p.id} activeOpacity={0.7} onPress={() => setSelectedPatient(p)}>
              <Card style={s.pCard} padding="md">
                <View style={s.pRow}>
                  <Avatar name={p.name} size={48} />
                  <View style={s.pInfo}>
                    <Text style={s.pName}>{p.name}</Text>
                    <View style={s.pDetail}>
                      <Phone size={12} color={colors.primary} />
                      <Text style={s.pPhone}>{p.phone}</Text>
                    </View>
                    <View style={s.pDetail}>
                      <Mail size={12} color={colors.outline} />
                      <Text style={s.pEmail}>{p.email.startsWith('sem-email-') ? 'Sem e-mail' : p.email}</Text>
                    </View>
                  </View>
                  <View style={s.pRight}>
                    <View style={s.aptBadge}><Text style={s.aptBadgeTxt}>{aptCount}</Text></View>
                    <ChevronRight size={18} color={colors.outline} />
                  </View>
                </View>
              </Card>
            </TouchableOpacity>
          );
        }) : (
          <View style={s.empty}><Text style={s.emptyTxt}>Nenhum paciente encontrado</Text></View>
        )}
      </ScrollView>

      {/* Bottom Sheet Modal do Paciente */}
      <Modal
        visible={!!selectedPatient}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedPatient(null)}
      >
        <View style={s.modalOverlay}>
          <TouchableOpacity 
            style={StyleSheet.absoluteFill} 
            activeOpacity={1} 
            onPress={() => setSelectedPatient(null)} 
          />
          <View style={s.modalContent}>
                {selectedPatient && (
                  <>
                    <View style={s.modalDragHandle} />
                    
                    <ScrollView ref={scrollRef} style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={s.historyScroll}>
                    
                    {/* Header do Perfil */}
                    <View style={s.profileHeader}>
                      <Avatar name={selectedPatient.name} size={64} showBorder />
                      <View style={s.profileInfo}>
                        <Text style={s.profileName}>{selectedPatient.name}</Text>
                        <Text style={s.profilePhone}>{selectedPatient.phone}</Text>
                        <Text style={s.profileEmail}>{selectedPatient.email.startsWith('sem-email-') ? 'Sem e-mail' : selectedPatient.email}</Text>
                      </View>
                      <TouchableOpacity style={s.closeBtn} onPress={() => setSelectedPatient(null)}>
                        <X size={20} color={colors.outline} />
                      </TouchableOpacity>
                    </View>

                    {/* Ações Rápidas do Paciente */}
                    <View style={s.quickActionsRow}>
                      <TouchableOpacity 
                        style={s.btnPrimary} 
                        activeOpacity={0.8}
                        onPress={() => {
                          setSelectedPatient(null);
                          router.push(`/(admin)/agenda?openNew=true&phone=${encodeURIComponent(selectedPatient.phone)}&name=${encodeURIComponent(selectedPatient.name)}`);
                        }}
                      >
                        <Plus size={18} color={colors.onPrimary} />
                        <Text style={s.btnPrimaryTxt}>Novo Agendamento</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={s.btnSecondary} 
                        activeOpacity={0.8}
                        onPress={openContactModal}
                      >
                        <Phone size={18} color={colors.primary} />
                      </TouchableOpacity>
                    </View>

                    {/* Calendário de Presença */}
                    <View style={s.calendarWrap}>
                      <View style={s.calendarHeader}>
                        <TouchableOpacity onPress={handlePrevMonth} style={s.monthNavBtn} activeOpacity={0.7}>
                          <ChevronLeft size={16} color={colors.primary} />
                        </TouchableOpacity>
                        <Text style={s.calendarMonthTxt}>
                          {currentMonthRef.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                        </Text>
                        <TouchableOpacity onPress={handleNextMonth} style={s.monthNavBtn} activeOpacity={0.7}>
                          <ChevronRight size={16} color={colors.primary} />
                        </TouchableOpacity>
                      </View>
                      <View style={s.weekdayRow}>
                        {weekdays.map((w, idx) => (
                          <Text key={idx} style={s.weekdayTxt}>{w}</Text>
                        ))}
                      </View>
                      <View style={s.daysGrid}>
                        {monthDays.map((day, idx) => {
                          if (!day) return <View key={`empty-${idx}`} style={s.dayCellEmpty} />;
                          const dayStr = formatDateStr(day);
                          
                          // Verifica se o paciente teve agendamento neste dia
                          const hasHistory = selectedPatientHistory.some(a => a.date === dayStr);
                          return (
                            <TouchableOpacity 
                              key={dayStr} 
                              style={s.dayCell}
                              activeOpacity={hasHistory ? 0.7 : 1}
                              onPress={() => {
                                if (hasHistory) {
                                  const apt = selectedPatientHistory.find(a => a.date === dayStr);
                                  if (apt && itemRefs.current[apt.id] !== undefined) {
                                    scrollRef.current?.scrollTo({ y: itemRefs.current[apt.id] - 20, animated: true });
                                  }
                                }
                              }}
                            >
                              <View style={[
                                s.dayCellInner,
                                hasHistory && s.dayCellHasHistory
                              ]}>
                                <Text style={[s.dayCellTxt, hasHistory && s.dayCellTxtHasHistory]}>
                                  {day.getDate()}
                                </Text>
                              </View>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </View>

                    {/* Timeline / Histórico Clínico */}
                    <Text style={s.historyTitle}>Histórico de Consultas</Text>
                      {selectedPatientHistory.length > 0 ? (
                        selectedPatientHistory.map(apt => {
                          const svc = services.find(s => s.id === apt.serviceId) || apt.service;
                          const isOverdue = (apt.status === AppointmentStatus.PENDING || apt.status === AppointmentStatus.CONFIRMED) && isPastDate(apt.date);
                          return (
                            <View key={apt.id} style={s.timelineItem} onLayout={(e) => { itemRefs.current[apt.id] = e.nativeEvent.layout.y; }}>
                              <View style={s.timelineLine} />
                              <View style={s.timelineDot} />
                              <View style={s.timelineContent}>
                                <View style={s.timelineHeader}>
                                  <View style={{ flex: 1, alignItems: 'flex-start' }}>
                                    <Text style={s.timelineDate}>
                                      {new Date(apt.date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </Text>
                                    {isOverdue && (
                                      <Text style={s.overdueHeaderTxt}>Prazo Excedido</Text>
                                    )}
                                  </View>
                                  <Badge variant="status" status={apt.status} />
                                </View>
                                <Text style={s.timelineSvc}>{svc?.name ?? 'Consulta'}</Text>
                                <View style={s.timelineDetails}>
                                  <Clock size={12} color={colors.outline} />
                                  <Text style={s.timelineMetaTxt}>{apt.time}</Text>
                                  <View style={s.dotDivider} />
                                  <FileText size={12} color={colors.outline} />
                                  <Text style={s.timelineMetaTxt}>{apt.dentistName}</Text>
                                </View>
                              </View>
                            </View>
                          );
                        })
                      ) : (
                        <Text style={s.emptyHistory}>Este paciente ainda não possui consultas no histórico.</Text>
                      )}
                    </ScrollView>
                  </>
                )}
              </View>
        </View>
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
                
                {selectedPatient && (
                  <>
                    <View style={s.contactHeader}>
                      <Avatar name={selectedPatient.name} size={48} />
                      <View style={s.contactInfo}>
                        <Text style={s.contactName}>{selectedPatient.name}</Text>
                        <Text style={s.contactPhone}>{selectedPatient.phone}</Text>
                      </View>
                      <TouchableOpacity style={s.closeBtn} onPress={() => setIsContactModalVisible(false)}>
                        <X size={20} color={colors.outline} />
                      </TouchableOpacity>
                    </View>

                    {selectedPatientHistory.length > 0 && (
                      <View style={{ marginBottom: spacing.md }}>
                        <Text style={s.contactDatesTitle}>Consulta de Referência</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 4 }}>
                          {selectedPatientHistory.slice(0, 2).map((apt) => {
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
                          {selectedPatientHistory.length > 2 && (
                            <TouchableOpacity
                              style={s.refAptPlusChip}
                              onPress={() => setIsRefAptsExpanded(!isRefAptsExpanded)}
                              activeOpacity={0.7}
                            >
                              <Text style={s.refAptPlusTxt}>
                                {isRefAptsExpanded ? 'Recolher' : `+${selectedPatientHistory.length - 2}`}
                              </Text>
                            </TouchableOpacity>
                          )}
                        </ScrollView>

                        {isRefAptsExpanded && selectedPatientHistory.length > 2 && (
                          <View style={s.expandedListContainer}>
                            {selectedPatientHistory.map((apt) => {
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
                        onPress={() => setSelectedTemplateType('confirmation')}
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
                        onPress={() => setSelectedTemplateType('cancellation')}
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
                          const cleanPhone = selectedPatient.phone.replace(/\D/g, '');
                          const waPhone = cleanPhone.startsWith('55') ? cleanPhone : '55' + cleanPhone;
                          Linking.openURL(`https://wa.me/${waPhone}?text=${encodeURIComponent(editedMessageText)}`);
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

    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  title: { fontFamily: fonts.headline, fontSize: fontSizes.headlineMd, fontWeight: '700', color: colors.onSurface, paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  sub: { fontFamily: fonts.body, fontSize: fontSizes.bodyMd, color: colors.onSurfaceVariant, paddingHorizontal: spacing.lg, marginBottom: spacing.md },
  searchWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceContainerLow, borderRadius: 16, marginHorizontal: spacing.lg, paddingHorizontal: 14, marginBottom: spacing.lg, gap: 10 },
  searchInput: { flex: 1, fontFamily: fonts.body, fontSize: fontSizes.bodyMd, color: colors.onSurface, paddingVertical: 12 },
  scroll: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl, gap: 10 },
  pCard: { marginBottom: 0 },
  pRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  pInfo: { flex: 1 },
  pName: { fontFamily: fonts.body, fontSize: fontSizes.bodyLg, fontWeight: '600', color: colors.onSurface },
  pDetail: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3 },
  pPhone: { fontFamily: fonts.label, fontSize: fontSizes.labelMd, color: colors.primary },
  pEmail: { fontFamily: fonts.label, fontSize: fontSizes.labelSm, color: colors.outline },
  pRight: { alignItems: 'center', gap: 6 },
  aptBadge: { backgroundColor: colors.primaryFixed + '40', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 },
  aptBadgeTxt: { fontFamily: fonts.label, fontSize: fontSizes.labelSm, color: colors.primary, fontWeight: '600' },
  empty: { alignItems: 'center', paddingTop: spacing['2xl'] },
  emptyTxt: { fontFamily: fonts.body, fontSize: fontSizes.bodyMd, color: colors.outline },

  // --- Estilos do Modal Bottom Sheet ---
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.45)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: colors.surfaceContainerLowest, borderTopLeftRadius: 28, borderTopRightRadius: 28, height: '85%', paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.xl },
  modalDragHandle: { width: 40, height: 4, backgroundColor: colors.outlineVariant, borderRadius: 2, alignSelf: 'center', marginBottom: spacing.lg },
  
  // Perfil Header
  profileHeader: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: spacing.xl },
  profileInfo: { flex: 1 },
  profileName: { fontFamily: fonts.headline, fontSize: fontSizes.headlineSm, fontWeight: '700', color: colors.onSurface },
  profilePhone: { fontFamily: fonts.body, fontSize: fontSizes.bodyMd, color: colors.onSurfaceVariant, marginTop: 4 },
  profileEmail: { fontFamily: fonts.body, fontSize: fontSizes.bodySm, color: colors.outline, marginTop: 2 },
  closeBtn: { padding: 8, borderRadius: 20, backgroundColor: colors.surfaceContainerLow },
  
  // Ações Rápidas
  quickActionsRow: { flexDirection: 'row', gap: 12, marginBottom: spacing.xl },
  btnPrimary: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: colors.primary, paddingVertical: 14, borderRadius: 16 },
  btnPrimaryTxt: { fontFamily: fonts.label, fontSize: fontSizes.labelLg, color: colors.onPrimary, fontWeight: '600' },
  btnSecondary: { width: 56, height: 56, borderRadius: 16, backgroundColor: colors.primaryFixed + '30', alignItems: 'center', justifyContent: 'center' },

  // Timeline (Histórico Clínico)
  historyTitle: { fontFamily: fonts.headline, fontSize: fontSizes.titleLg, fontWeight: '700', color: colors.onSurface, marginBottom: spacing.md },
  historyScroll: { paddingBottom: spacing.xl },
  emptyHistory: { fontFamily: fonts.body, fontSize: fontSizes.bodyMd, color: colors.outline, textAlign: 'center', marginTop: spacing.xl },
  
  timelineItem: { flexDirection: 'row', marginBottom: spacing.lg, paddingLeft: 8 },
  timelineLine: { position: 'absolute', left: 14, top: 24, bottom: -spacing.lg, width: 2, backgroundColor: colors.surfaceContainerHigh },
  timelineDot: { width: 14, height: 14, borderRadius: 7, backgroundColor: colors.primary, marginTop: 6, zIndex: 2 },
  timelineContent: { flex: 1, marginLeft: 16, backgroundColor: colors.surfaceContainerLow, borderRadius: 16, padding: 16 },
  timelineHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  timelineDate: { fontFamily: fonts.label, fontSize: fontSizes.labelMd, color: colors.primary, fontWeight: '600' },
  timelineSvc: { fontFamily: fonts.headline, fontSize: fontSizes.titleMd, fontWeight: '700', color: colors.onSurface, marginBottom: 8 },
  timelineDetails: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  timelineMetaTxt: { fontFamily: fonts.label, fontSize: fontSizes.labelSm, color: colors.outline },
  dotDivider: { width: 4, height: 4, borderRadius: 2, backgroundColor: colors.outlineVariant, marginHorizontal: 2 },

  // Calendário de Presença
  calendarWrap: { backgroundColor: colors.surfaceContainer, borderRadius: 20, padding: 16, marginBottom: spacing.xl },
  calendarHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  calendarMonthTxt: { fontFamily: fonts.headline, fontSize: fontSizes.titleMd, fontWeight: '700', color: colors.onSurface, textTransform: 'capitalize' },
  monthNavBtn: { padding: 6, borderRadius: 12, backgroundColor: colors.surfaceContainerLow },
  weekdayRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  weekdayTxt: { flex: 1, textAlign: 'center', fontFamily: fonts.label, fontSize: 11, color: colors.outline, fontWeight: '600' },
  daysGrid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 6 },
  dayCell: { width: `${100 / 7}%`, aspectRatio: 1, alignItems: 'center', justifyContent: 'center' },
  dayCellInner: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCellHasHistory: { backgroundColor: colors.primaryFixed },
  dayCellEmpty: { width: `${100 / 7}%`, aspectRatio: 1 },
  dayCellTxt: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.onSurface },
  dayCellTxtHasHistory: { color: colors.onPrimaryFixed, fontWeight: '700' },

  // --- Estilos do Modal de Contato ---
  contactModalContent: { backgroundColor: colors.surfaceContainerLowest, borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.xl },
  contactHeader: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: spacing.xl },
  contactInfo: { flex: 1 },
  contactName: { fontFamily: fonts.headline, fontSize: fontSizes.titleMd, fontWeight: '700', color: colors.onSurface },
  contactPhone: { fontFamily: fonts.body, fontSize: fontSizes.bodySm, color: colors.onSurfaceVariant, marginTop: 2 },
  
  msgTemplateBtn: { borderWidth: 1, borderColor: colors.outlineVariant, borderRadius: 16, padding: 14, marginBottom: 12, backgroundColor: colors.surfaceContainerLow },
  msgTemplateHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  msgTemplateTitle: { fontFamily: fonts.headline, fontSize: fontSizes.labelLg, fontWeight: '700', color: colors.primary },
  msgTemplateText: { fontFamily: fonts.body, fontSize: fontSizes.bodySm, color: colors.onSurfaceVariant, lineHeight: 18 },

  msgTemplateTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderWidth: 1.5,
    borderColor: colors.outlineVariant,
    borderRadius: 12,
    backgroundColor: colors.surfaceContainerLow,
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
  },

  editorContainer: {
    borderWidth: 1.5,
    borderColor: colors.outlineVariant,
    borderRadius: 16,
    backgroundColor: colors.surfaceContainerLow,
    padding: 12,
    marginBottom: 16,
  },
  editorInput: {
    fontFamily: fonts.body,
    fontSize: fontSizes.bodySm,
    color: colors.onSurface,
    textAlignVertical: 'top',
    minHeight: 100,
    lineHeight: 18,
  },

  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: spacing.md,
  },
  waBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2E7D32', // Verde WhatsApp
    paddingVertical: 14,
    borderRadius: 16,
  },
  waBtnTxt: {
    fontFamily: fonts.label,
    fontSize: fontSizes.labelMd,
    color: colors.onPrimary,
    fontWeight: '700',
  },
  emailBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 16,
  },
  emailBtnTxt: {
    fontFamily: fonts.label,
    fontSize: fontSizes.labelMd,
    color: colors.onPrimary,
    fontWeight: '700',
  },

  contactDatesPanel: { backgroundColor: colors.surfaceContainerHigh, borderRadius: 16, padding: 14, marginTop: spacing.md },
  contactDatesTitle: { fontFamily: fonts.headline, fontSize: fontSizes.labelLg, fontWeight: '700', color: colors.onSurface, marginBottom: 10 },
  contactDateRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  contactDateTxt: { flex: 1, fontFamily: fonts.body, fontSize: fontSizes.bodySm, color: colors.onSurface, fontWeight: '500' },
  contactDateEmpty: { fontFamily: fonts.body, fontSize: fontSizes.bodySm, color: colors.outline, fontStyle: 'italic' },
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
  overdueHeaderTxt: {
    fontFamily: fonts.label,
    fontSize: 11,
    color: colors.error,
    fontWeight: '700',
    marginTop: 4,
  },
});
