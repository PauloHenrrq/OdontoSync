// ============================================================
// OdontoSync — Root Layout
// Navegação condicional por autenticação e role (RBAC).
// Carrega fontes Manrope + Inter do Design System.
// ============================================================

// Desabilitar console logs fora do ambiente de desenvolvimento (__DEV__)
if (typeof __DEV__ !== 'undefined' ? !__DEV__ : process.env.NODE_ENV === 'production') {
  console.log = () => {};
  console.error = () => {};
  console.warn = () => {};
  console.info = () => {};
  console.debug = () => {};
}

import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useFonts as useManrope, Manrope_400Regular, Manrope_500Medium, Manrope_600SemiBold, Manrope_700Bold } from '@expo-google-fonts/manrope';
import { useFonts as useInter, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { useAuthStore } from '@/src/stores/authStore';
import { useAppointmentStore } from '@/src/stores/appointmentStore';
import { useClinicStore } from '@/src/stores/clinicStore';
import { UserRole } from '@/src/types';
import { registerForPushNotificationsAsync } from '@/src/services/notificationService';

import 'react-native-reanimated';

export { ErrorBoundary } from 'expo-router';

SplashScreen.preventAutoHideAsync();

function useProtectedRoute() {
  const { isAuthenticated, user } = useAuthStore();
  const { fetchAppointments } = useAppointmentStore();
  const { fetchConfig, fetchPatients, fetchServices } = useClinicStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const inAuthGroup = (segments as string[]).includes('(auth)');
    const inClientGroup = (segments as string[]).includes('(client)');
    const inAdminGroup = (segments as string[]).includes('(admin)');

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (isAuthenticated) {
      fetchAppointments();
      fetchServices();
      
      if (user?.role === UserRole.ADMIN) {
        fetchPatients();
        fetchConfig();
      }
      
      if (inAuthGroup) {
        if (user?.role === UserRole.ADMIN) {
          router.replace('/(admin)');
        } else {
          router.replace('/(client)');
        }
      }
    }
  }, [isAuthenticated, segments, user]);
}

export default function RootLayout() {
  const [manropeLoaded] = useManrope({
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
  });

  const [interLoaded] = useInter({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (manropeLoaded && interLoaded) {
      SplashScreen.hideAsync();
      registerForPushNotificationsAsync().catch((err) => {
        console.log('Falha segura ao inicializar canais de notificações:', err);
      });
    }
  }, [manropeLoaded, interLoaded]);

  if (!manropeLoaded || !interLoaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  useProtectedRoute();

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(client)" />
        <Stack.Screen name="(admin)" />
      </Stack>
    </>
  );
}
