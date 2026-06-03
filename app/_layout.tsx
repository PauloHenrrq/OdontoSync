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
import { useNotificationStore } from '@/src/stores/notificationStore';
import { useAppointmentStore } from '@/src/stores/appointmentStore';
import { useClinicStore } from '@/src/stores/clinicStore';
import { UserRole } from '@/src/types';
import { registerForPushNotificationsAsync } from '@/src/services/notificationService';
import { AuthService } from '@/src/services/authService';

import 'react-native-reanimated';

export { ErrorBoundary } from 'expo-router';

SplashScreen.preventAutoHideAsync();

import { useState } from 'react';

function useProtectedRoute(hydrated: boolean) {
  const { isAuthenticated, user } = useAuthStore();
  const { fetchAppointments } = useAppointmentStore();
  const { fetchConfig, fetchPatients, fetchServices } = useClinicStore();
  const segments = useSegments();
  const router = useRouter();

  // 1. Controle de Segurança de Rotas (RBAC) — Roda em cada mudança de rota
  useEffect(() => {
    if (!hydrated) return;

    const inAuthGroup = (segments as string[]).includes('(auth)');
    const inAdminGroup = (segments as string[]).includes('(admin)');
    const inClientGroup = (segments as string[]).includes('(client)');

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (isAuthenticated) {
      if (inAuthGroup) {
        if (user?.role === UserRole.ADMIN) {
          router.replace('/(admin)');
        } else {
          router.replace('/(client)');
        }
      } else if (inAdminGroup && user?.role !== UserRole.ADMIN) {
        // Redireciona paciente tentando acessar rotas de admin
        router.replace('/(client)');
      } else if (inClientGroup && user?.role === UserRole.ADMIN) {
        // Redireciona admin tentando acessar rotas de cliente
        router.replace('/(admin)');
      }
    }
  }, [isAuthenticated, segments, user, hydrated]);

  // 2. Sincronização Inicial de Dados — Executado apenas na autenticação, NUNCA na navegação
  useEffect(() => {
    if (isAuthenticated && hydrated) {
      fetchAppointments();
      fetchServices();
      
      if (user?.role === UserRole.ADMIN) {
        fetchPatients();
        fetchConfig();
      }

      // Registrar push token e enviar ao servidor
      registerForPushNotificationsAsync().then((token) => {
        if (token) {
          AuthService.savePushToken(token).catch(() => {});
        }
      });
    }
  }, [isAuthenticated, user?.role, hydrated]);
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

  const [hydrated, setHydrated] = useState(false);

  // Monitora a hidratação do Zustand persistido no AsyncStorage
  useEffect(() => {
    let authHydrated = useAuthStore.persist.hasHydrated();
    let notifHydrated = useNotificationStore.persist.hasHydrated();

    const checkHydration = () => {
      if (authHydrated && notifHydrated) {
        setHydrated(true);
      }
    };

    const unsubAuth = useAuthStore.persist.onFinishHydration(() => {
      authHydrated = true;
      checkHydration();
    });

    const unsubNotif = useNotificationStore.persist.onFinishHydration(() => {
      notifHydrated = true;
      checkHydration();
    });

    checkHydration();

    return () => {
      unsubAuth();
      unsubNotif();
    };
  }, []);

  useEffect(() => {
    if (manropeLoaded && interLoaded && hydrated) {
      SplashScreen.hideAsync();
    }
  }, [manropeLoaded, interLoaded, hydrated]);

  if (!manropeLoaded || !interLoaded || !hydrated) {
    return null;
  }

  return <RootLayoutNav hydrated={hydrated} />;
}

function RootLayoutNav({ hydrated }: { hydrated: boolean }) {
  useProtectedRoute(hydrated);

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
