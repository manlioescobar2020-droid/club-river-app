import axios from 'axios';
import { Platform } from 'react-native';

export const BASE_URL = 'https://sistema-club-deportivo.vercel.app/api';

export const TOKEN_KEY = 'auth_token';
export const SESSION_KEY = 'club_river_session';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

api.interceptors.request.use(async (config) => {
  console.log(`[API] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);

  if (config.url?.includes('suscripcion')) {
    console.log('[DEBUG-SUSCRIP] interceptor config.data =', config.data);
  }

  try {
    // SecureStore solo funciona en nativo; en web usar localStorage
    let token: string | null = null;
    if (Platform.OS === 'web') {
      token = localStorage.getItem(TOKEN_KEY);
    } else {
      const SecureStore = await import('expo-secure-store');
      token = await SecureStore.getItemAsync(TOKEN_KEY);
    }

    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
      console.log('[API] Token adjuntado');
    }
  } catch (e) {
    console.warn('[API] No se pudo leer el token:', e);
  }

  return config;
});

api.interceptors.response.use(
  (response) => {
    console.log(`[API] Respuesta ${response.status}:`, response.data);
    return response;
  },
  (error) => {
    const status = error?.response?.status;
    const data = error?.response?.data;
    const message =
      data?.error ??
      data?.message ??
      error?.message ??
      'Error de red';

    console.error(`[API] Error ${status}:`, data ?? error?.message);

    // Re-throw con toda la info accesible
    const enriched = new Error(message) as any;
    enriched.status = status;
    enriched.data = data;
    enriched.raw = error;
    return Promise.reject(enriched);
  }
);

export default api;
