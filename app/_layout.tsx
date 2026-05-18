// ============================================================
// OdontoSync — Root Layout
// Navegação condicional por autenticação e role (RBAC).
// Carrega fontes Manrope + Inter do Design System.
// ============================================================

import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useFonts as useManrope, Manrope_400Regular, Manrope_500Medium, Manrope_600SemiBold, Manrope_700Bold } from '@expo-google-fonts/manrope';
import { useFonts as useInter, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { useAuthStore } from '@/src/stores/authStore';
import { UserRole } from '@/src/types';

import 'react-native-reanimated';

export { ErrorBoundary } from 'expo-router';

SplashScreen.preventAutoHideAsync();

function useProtectedRoute() {
  const { isAuthenticated, user } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const inAuthGroup = segments[0] === '(auth)';
    const inClientGroup = segments[0] === '(client)';
    const inAdminGroup = segments[0] === '(admin)';

    if (!isAuthenticated && !inAuthGroup) {
      // Não autenticado → redireciona para login
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      // Autenticado mas está na tela de auth → redireciona por role
      if (user?.role === UserRole.ADMIN) {
        router.replace('/(admin)');
      } else {
        router.replace('/(client)');
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
