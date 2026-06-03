import { Platform, Linking } from 'react-native';
import { downloadAsync, documentDirectory } from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import api, { BASE_URL, TOKEN_KEY } from './api';

export interface Cuota {
  id: number;
  monto: string;
  fechaVencimiento: string;
  estado: 'PENDIENTE' | 'PAGADA' | 'VENCIDA';
  mesAnio: string;
  disciplina?: { nombre: string };
  reciboId?: number;
}

async function getCuotas(): Promise<Cuota[]> {
  const response = await api.get('/mi-cuenta/cuotas');
  return response.data?.cuotas ?? response.data ?? [];
}

async function pagarMultiplesCuotas(cuotaIds: number[]): Promise<{ initPoint: string }> {
  const response = await api.post('/mi-cuenta/pago', { cuotaIds, origen: 'app' });
  return response.data;
}

async function descargarRecibo(reciboId: number): Promise<void> {
  const url = `${BASE_URL}/recibos/${reciboId}`;

  if (Platform.OS === 'web') {
    await Linking.openURL(url);
    return;
  }

  let token: string | null = null;
  try {
    const SecureStore = await import('expo-secure-store');
    token = await SecureStore.getItemAsync(TOKEN_KEY);
  } catch {}

  const fileUri = documentDirectory! + `recibo-${reciboId}.pdf`;
  const { uri } = await downloadAsync(url, fileUri, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  const canShare = await Sharing.isAvailableAsync();
  if (canShare) {
    await Sharing.shareAsync(uri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf' });
  } else {
    await Linking.openURL(uri);
  }
}

export default { getCuotas, pagarMultiplesCuotas, descargarRecibo };
