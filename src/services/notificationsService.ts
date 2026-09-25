import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { BASE_URL } from './api';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export type PushRegistrationStep =
  | 'not-device'
  | 'permission-denied'
  | 'no-project-id'
  | 'token-error'
  | 'backend-error';

export type PushRegistrationResult =
  | { ok: true; token: string }
  | { ok: false; step: PushRegistrationStep; detail: string };

export async function registerForPushNotificationsAsync(): Promise<PushRegistrationResult> {
  if (!Device.isDevice) {
    return { ok: false, step: 'not-device', detail: 'La app no está corriendo en un dispositivo físico' };
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#DC2626',
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return { ok: false, step: 'permission-denied', detail: `Estado del permiso: ${finalStatus}` };
  }

  const projectId =
    Constants.easConfig?.projectId ??
    Constants.expoConfig?.extra?.eas?.projectId;

  if (!projectId) {
    return { ok: false, step: 'no-project-id', detail: 'No se encontró projectId en la config de Expo' };
  }

  try {
    const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId });
    return { ok: true, token };
  } catch (error: any) {
    return { ok: false, step: 'token-error', detail: error?.message ?? String(error) };
  }
}

const RETRY_DELAYS_MS = [800, 1600];

async function sendTokenToBackendOnce(token: string, authToken: string): Promise<void> {
  const response = await fetch(`${BASE_URL}/usuarios/push-token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({ token }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`HTTP ${response.status}: ${body}`);
  }
}

export async function sendTokenToBackend(token: string, authToken: string): Promise<void> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt++) {
    try {
      await sendTokenToBackendOnce(token, authToken);
      return;
    } catch (error: any) {
      lastError = error;
      // Errores HTTP (4xx/5xx) del server no se reintentan: reintentar no los arregla.
      // Solo se reintenta ante fallos de red/timeout del propio fetch.
      const isHttpError = error instanceof Error && /^HTTP \d+:/.test(error.message);
      if (isHttpError || attempt === RETRY_DELAYS_MS.length) break;
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAYS_MS[attempt]));
    }
  }

  throw lastError;
}

export async function registerAndSendPushToken(authToken: string): Promise<PushRegistrationResult> {
  const registration = await registerForPushNotificationsAsync();
  if (!registration.ok) return registration;

  try {
    await sendTokenToBackend(registration.token, authToken);
    return registration;
  } catch (error: any) {
    return { ok: false, step: 'backend-error', detail: error?.message ?? String(error) };
  }
}

export function setupNotificationListeners(
  onReceived: (notification: Notifications.Notification) => void,
  onTapped: (response: Notifications.NotificationResponse) => void
): () => void {
  const receivedSub = Notifications.addNotificationReceivedListener(onReceived);
  const tappedSub = Notifications.addNotificationResponseReceivedListener(onTapped);
  return () => {
    receivedSub.remove();
    tappedSub.remove();
  };
}

export function getLastNotificationResponse(): Promise<Notifications.NotificationResponse | null> {
  return Notifications.getLastNotificationResponseAsync();
}
