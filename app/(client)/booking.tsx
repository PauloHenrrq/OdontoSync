import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Check } from 'lucide-react-native';
import { Button } from '@/src/components/ui/Button';
import { Alert } from '@/src/components/ui/Alert';
import { useAuthStore } from '@/src/stores/authStore';
import { useAppointmentStore } from '@/src/stores/appointmentStore';
import { useClinicStore } from '@/src/stores/clinicStore';
import { mockDentists, mockTimeSlots } from '@/src/mocks/services';
import { colors, fonts, fontSizes, spacing } from '@/src/styles/tokens';

export default function BookingScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { bookAppointment, isLoading } = useAppointmentStore();
  const { services } = useClinicStore();
  const [step, setStep] = useState(0);
  const [selectedService, setSelectedService] = useState('');
  const [selectedDentist, setSelectedDentist] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  useEffect(() => {
    useClinicStore.getState().fetchServices();
  }, []);

  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    return { full: d.toISOString().split('T')[0]!, label: d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', weekday: 'short' }) };
  });

  const handleBook = async () => {
    if (!user) return;
    const success = await bookAppointment(user.id, user.phone, { serviceId: selectedService, dentistName: selectedDentist, date: selectedDate, time: selectedTime });
    if (success) { Alert.alert('Sucesso!', 'Consulta agendada com sucesso.', [{ text: 'OK', onPress: () => router.back() }]); }
  };

  const steps = ['Serviço', 'Dentista', 'Data', 'Horário'];

  return (
    <SafeAreaView style={s.container}>
      <View style={s.hdr}>
        <TouchableOpacity onPress={() => step > 0 ? setStep(step - 1) : router.back()} style={s.back}>
          <ArrowLeft size={24} color={colors.onSurface} />
        </TouchableOpacity>
        <Text style={s.title}>Agendar Consulta</Text>
        <View style={{ width: 44 }} />
      </View>

      <View style={s.progress}>
        {steps.map((label, i) => (
          <View key={label} style={s.stepRow}>
            <View style={[s.dot, i <= step && s.dotActive]} />
            <Text style={[s.stepLabel, i <= step && s.stepLabelActive]}>{label}</Text>
          </View>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {step === 0 && (
          <View style={s.grid}>
            {services.map((svc) => (
              <TouchableOpacity key={svc.id} style={[s.chip, selectedService === svc.id && s.chipActive]} onPress={() => setSelectedService(svc.id)}>
                {selectedService === svc.id && <Check size={16} color={colors.onPrimaryFixed} />}
                <Text style={[s.chipTxt, selectedService === svc.id && s.chipTxtActive]}>{svc.name}</Text>
                <Text style={[s.chipSub, selectedService === svc.id && { color: colors.onPrimaryFixed }]}>{svc.duration}min</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
        {step === 1 && (
          <View style={{ gap: 12 }}>
            {mockDentists.map((d) => (
              <TouchableOpacity key={d} style={[s.listItem, selectedDentist === d && s.listItemActive]} onPress={() => setSelectedDentist(d)}>
                <Text style={[s.listTxt, selectedDentist === d && { color: colors.onPrimaryFixed }]}>{d}</Text>
                {selectedDentist === d && <Check size={20} color={colors.onPrimaryFixed} />}
              </TouchableOpacity>
            ))}
          </View>
        )}
        {step === 2 && (
          <View style={{ gap: 12 }}>
            {dates.map((d) => (
              <TouchableOpacity key={d.full} style={[s.listItem, selectedDate === d.full && s.listItemActive]} onPress={() => setSelectedDate(d.full)}>
                <Text style={[s.listTxt, selectedDate === d.full && { color: colors.onPrimaryFixed }]}>{d.label}</Text>
                {selectedDate === d.full && <Check size={20} color={colors.onPrimaryFixed} />}
              </TouchableOpacity>
            ))}
          </View>
        )}
        {step === 3 && (
          <View style={s.timeGrid}>
            {mockTimeSlots.map((t) => (
              <TouchableOpacity key={t} style={[s.timeSlot, selectedTime === t && s.timeSlotActive]} onPress={() => setSelectedTime(t)}>
                <Text style={[s.timeTxt, selectedTime === t && { color: colors.onPrimary }]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      <View style={s.footer}>
        {step < 3 ? (
          <Button title="Próximo" onPress={() => setStep(step + 1)} fullWidth disabled={
            (step === 0 && !selectedService) || (step === 1 && !selectedDentist) || (step === 2 && !selectedDate)
          } />
        ) : (
          <Button title="Confirmar Agendamento" onPress={handleBook} fullWidth loading={isLoading} disabled={!selectedTime} />
        )}
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  hdr: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  back: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.surfaceContainerLow, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: fonts.headline, fontSize: fontSizes.titleLg, fontWeight: '600', color: colors.onSurface },
  progress: { flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: spacing.lg, marginBottom: spacing.lg },
  stepRow: { alignItems: 'center', gap: 4 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.surfaceContainerHigh },
  dotActive: { backgroundColor: colors.primary },
  stepLabel: { fontFamily: fonts.label, fontSize: fontSizes.labelSm, color: colors.outline },
  stepLabelActive: { color: colors.primary, fontWeight: '600' },
  scroll: { paddingHorizontal: spacing.lg, paddingBottom: 120 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: { backgroundColor: colors.surfaceContainerHigh, borderRadius: 12, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 8, flexBasis: '47%', flexGrow: 1 },
  chipActive: { backgroundColor: colors.primaryFixed },
  chipTxt: { fontFamily: fonts.label, fontSize: fontSizes.labelLg, color: colors.onSurface, fontWeight: '500', flex: 1 },
  chipTxtActive: { color: colors.onPrimaryFixed },
  chipSub: { fontFamily: fonts.label, fontSize: fontSizes.labelSm, color: colors.outline },
  listItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.surfaceContainerLow, borderRadius: 16, padding: 16 },
  listItemActive: { backgroundColor: colors.primaryFixed },
  listTxt: { fontFamily: fonts.body, fontSize: fontSizes.bodyLg, color: colors.onSurface, fontWeight: '500' },
  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  timeSlot: { backgroundColor: colors.surfaceContainerLow, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 20, minWidth: 80, alignItems: 'center' },
  timeSlotActive: { backgroundColor: colors.primary },
  timeTxt: { fontFamily: fonts.label, fontSize: fontSizes.labelLg, color: colors.onSurface, fontWeight: '500' },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: spacing.lg, paddingBottom: 32, backgroundColor: colors.background },
});
