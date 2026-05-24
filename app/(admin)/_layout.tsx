// OdontoSync — Admin Layout (Tab Navigator)
import { Tabs } from 'expo-router';
import { LayoutDashboard, CalendarCheck, Users, Settings } from 'lucide-react-native';
import { colors, fonts } from '@/src/styles/tokens';

export default function AdminLayout() {
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
          height: 80,
          paddingBottom: 16,
          paddingTop: 8,
        },
        tabBarLabelStyle: { fontFamily: fonts.label, fontSize: 11, fontWeight: '500' },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Início', tabBarIcon: ({ color, size }) => <LayoutDashboard size={size} color={color} /> }} />
      <Tabs.Screen name="agenda" options={{ title: 'Agenda', tabBarIcon: ({ color, size }) => <CalendarCheck size={size} color={color} /> }} />
      <Tabs.Screen name="patients" options={{ title: 'Pacientes', tabBarIcon: ({ color, size }) => <Users size={size} color={color} /> }} />
      <Tabs.Screen name="settings" options={{ title: 'Perfil', tabBarIcon: ({ color, size }) => <Settings size={size} color={color} /> }} />
    </Tabs>
  );
}
