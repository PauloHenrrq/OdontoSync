// ============================================================
// OdontoSync — Serviço de Notificações Push Mobile
// Gerencia permissões, canais de áudio/vibração do Android e tokens de envio.
// ============================================================

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Define o comportamento das notificações em primeiro plano (Foreground)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Solicita a permissão do usuário e registra o aparelho para Push Notifications.
 * Cria canais prioritários específicos para o Android.
 */
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  let token: string | null = null;

  // 1. Configurações essenciais para dispositivos Android (canais de notificação)
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#006C84',
      enableVibrate: true,
      showBadge: true,
    });
  }

  // 2. Verifica permissões de notificação existentes
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  // 3. Se não concedido previamente, solicita a permissão
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  // 4. Se o usuário recusar a permissão
  if (finalStatus !== 'granted') {
    return null;
  }

  // 5. Busca o token dinâmico da conta EAS do Expo
  try {
    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ??
      Constants.easConfig?.projectId;

    const expoToken = await Notifications.getExpoPushTokenAsync({
      projectId,
    });
    token = expoToken.data;
  } catch (error) {
    // Falha silenciosa comum em simuladores
  }

  return token;
}
