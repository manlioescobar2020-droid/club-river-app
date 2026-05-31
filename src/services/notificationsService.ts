// expo-notifications eliminado — requería Firebase (FCM) en Android.
// Las funciones son no-ops para no romper los imports existentes.

export async function registerForPushNotificationsAsync(): Promise<string | undefined> {
  return undefined;
}

export async function sendTokenToBackend(_token: string, _userId: number): Promise<void> {}

export function setupNotificationListeners(
  _onReceived: (n: any) => void,
  _onTapped: (r: any) => void
): () => void {
  return () => {};
}
