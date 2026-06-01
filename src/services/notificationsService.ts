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

export async function registerForPushNotificationsAsync(): Promise<string | undefined> {
  if (!Device.isDevice) return undefined;

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

  if (finalStatus !== 'granted') return undefined;

  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  if (!projectId) return undefined;

  const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId });
  return token;
}

export async function sendTokenToBackend(token: string, authToken: string): Promise<void> {
  await fetch(`${BASE_URL}/usuarios/push-token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({ token }),
  });
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
