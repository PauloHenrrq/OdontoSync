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
import * as Notifications from 'expo-notifications';

import 'react-native-reanimated';
import { AppState, AppStateStatus } from 'react-native';

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
      // Força o primeiro carregamento completo ao inicializar a autenticação
      fetchAppointments(true);
      fetchServices();
      
      if (user?.role === UserRole.ADMIN) {
        fetchPatients();
        fetchConfig();
      }

      // Registrar push token e enviar ao servidor
      const updateToken = () => {
        registerForPushNotificationsAsync().then((token) => {
          if (token) {
            AuthService.savePushToken(token).catch(() => {});
          }
        });
      };

      updateToken();

      // Configuração de Polling (Sincronização em segundo plano a cada 30 segundos)
      let pollingInterval: any = null;

      const startPolling = () => {
        if (pollingInterval) clearInterval(pollingInterval);
        
        pollingInterval = setInterval(() => {
          // Busca novos dados em segundo plano de forma forçada bypassando cache
          useAppointmentStore.getState().fetchAppointments(true).catch(() => {});
          useClinicStore.getState().fetchServices().catch(() => {});

          if (user?.role === UserRole.ADMIN) {
            useClinicStore.getState().fetchPatients().catch(() => {});
            useClinicStore.getState().fetchConfig().catch(() => {});
          } else {
            useNotificationStore.getState().fetchNotifications().catch(() => {});
          }
        }, 30000); // Intervalo de 30 segundos
      };

      const stopPolling = () => {
        if (pollingInterval) {
          clearInterval(pollingInterval);
          pollingInterval = null;
        }
      };

      // Inicia polling inicial
      startPolling();

      // Atualizar o push token e gerenciar polling quando o app retornar ao primeiro plano (foreground)
      const handleAppStateChange = (nextAppState: AppStateStatus) => {
        if (nextAppState === 'active') {
          updateToken();
          startPolling();
          // Realiza sincronização imediata ao retornar ao app
          useAppointmentStore.getState().fetchAppointments(true).catch(() => {});
          useClinicStore.getState().fetchServices().catch(() => {});
        } else {
          stopPolling();
        }
      };

      const appStateSubscription = AppState.addEventListener('change', handleAppStateChange);

      // Ouvintes para capturar notificações e salvar no sininho local (Zustand)
      // + Sincronização reativa: quando o backend envia um push com dados tipados,
      // o app do paciente atualiza automaticamente os agendamentos em tempo real.
      const handleIncomingNotificationData = (data: Record<string, any> | undefined) => {
        if (data?.type === 'NEW_APPOINTMENT' || data?.type === 'STATUS_CHANGED') {
          useAppointmentStore.getState().fetchAppointments(true);
        }
      };

      const receivedSubscription = Notifications.addNotificationReceivedListener((notification) => {
        const title = notification.request.content.title ?? '';
        const message = notification.request.content.body ?? '';

        // Só salva no sininho se a notificação tiver conteúdo real (evita entradas em branco)
        if (title.trim() || message.trim()) {
          useNotificationStore.getState().addNotification(
            title || 'Notificação',
            message
          );
        }

        // Sincronização reativa baseada no tipo de push recebido
        handleIncomingNotificationData(notification.request.content.data);
      });

      const responseSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
        const title = response.notification.request.content.title ?? '';
        const message = response.notification.request.content.body ?? '';

        // Só salva no sininho se a notificação tiver conteúdo real (evita entradas em branco)
        if (title.trim() || message.trim()) {
          useNotificationStore.getState().addNotification(
            title || 'Notificação',
            message
          );
        }

        // Sincronização reativa quando o usuário toca na notificação
        handleIncomingNotificationData(response.notification.request.content.data);
      });

      return () => {
        stopPolling();
        appStateSubscription.remove();
        receivedSubscription.remove();
        responseSubscription.remove();
      };
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
