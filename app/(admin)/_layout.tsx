// OdontoSync — Admin Layout (Tab Navigator)
import { Tabs } from 'expo-router';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LayoutDashboard, CalendarCheck, Users, Settings } from 'lucide-react-native';
import { colors, fonts } from '@/src/styles/tokens';
import { useAppointmentStore } from '@/src/stores/appointmentStore';

export default function AdminLayout() {
  const { appointments } = useAppointmentStore();
  const hasApts = appointments.some(a => a.status !== 'CANCELLED');
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.outline,
        tabBarStyle: {
          backgroundColor: colors.surfaceContainerLowest,
          borderTopWidth: 0,
          elevation: 0,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: { fontFamily: fonts.label, fontSize: 11, fontWeight: '500' },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Início', tabBarIcon: ({ color, size }) => <LayoutDashboard size={size} color={color} /> }} />
      <Tabs.Screen 
        name="agenda" 
        options={{ 
          title: 'Agenda', 
          tabBarIcon: ({ color, size }) => (
            <View style={{ width: size, height: size }}>
              <CalendarCheck size={size} color={color} />
              {hasApts && (
                <View style={{
                  position: 'absolute',
                  right: -2,
                  top: -2,
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: '#4CAF50',
                  borderWidth: 1.5,
                  borderColor: colors.surfaceContainerLowest
                }} />
              )}
            </View>
          )
        }} 
      />
      <Tabs.Screen name="patients" options={{ title: 'Pacientes', tabBarIcon: ({ color, size }) => <Users size={size} color={color} /> }} />
      <Tabs.Screen name="settings" options={{ title: 'Perfil', tabBarIcon: ({ color, size }) => <Settings size={size} color={color} /> }} />
    </Tabs>
  );
}
