// OdontoSync — Admin: Patients (Stitch: ca2b18e4)
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Phone, Mail, ChevronRight } from 'lucide-react-native';
import { Card } from '@/src/components/ui/Card';
import { Avatar } from '@/src/components/ui/Avatar';
import { useClinicStore } from '@/src/stores/clinicStore';
import { useAppointmentStore } from '@/src/stores/appointmentStore';
import { colors, fonts, fontSizes, spacing } from '@/src/styles/tokens';

export default function PatientsScreen() {
  const { patients, searchPatients } = useClinicStore();
  const { appointments } = useAppointmentStore();
  const [query, setQuery] = useState('');

  const filtered = query ? searchPatients(query) : patients;

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
            <TouchableOpacity key={p.id} activeOpacity={0.7}>
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
                      <Text style={s.pEmail}>{p.email}</Text>
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
});
