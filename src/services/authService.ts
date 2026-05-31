import api from './api';
import { Platform } from 'react-native';

interface LoginResponse {
  token: string;
  user: {
    id: number;
    email: string;
    nombre: string;
    apellido: string;
    rol: string;
    debe_cambiar_password: boolean;
  };
}

async function saveItem(key: string, value: string) {
  if (Platform.OS === 'web') {
    localStorage.setItem(key, value);
  } else {
    const SecureStore = await import('expo-secure-store');
    await SecureStore.setItemAsync(key, value);
  }
}

async function getItem(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    return localStorage.getItem(key);
  }
  const SecureStore = await import('expo-secure-store');
  return SecureStore.getItemAsync(key);
}

async function deleteItem(key: string) {
  if (Platform.OS === 'web') {
    localStorage.removeItem(key);
  } else {
    const SecureStore = await import('expo-secure-store');
    await SecureStore.deleteItemAsync(key);
  }
}

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    console.log('[AUTH] Intentando login con:', email);
    console.log('[AUTH] Endpoint:', 'POST /auth/mobile-login');

    try {
      const response = await api.post('/auth/mobile-login', { email, password });

      console.log('[AUTH] Respuesta recibida:', response.status);
      console.log('[AUTH] Data:', JSON.stringify(response.data));

      const { token, user } = response.data;

      if (!token) {
        throw new Error('El servidor no devolvió un token');
      }

      await saveItem('auth_token', token);
      await saveItem('user', JSON.stringify(user));

      console.log('[AUTH] Sesión guardada correctamente');
      return response.data;
    } catch (error: any) {
      console.error('[AUTH] Error en login:');
      console.error('  message:', error.message);
      console.error('  status:', error.status);
      console.error('  data:', JSON.stringify(error.data));
      throw error;
    }
  },

  async logout() {
    await deleteItem('auth_token');
    await deleteItem('user');
    console.log('[AUTH] Sesión eliminada');
  },

  async getStoredSession() {
    const token = await getItem('auth_token');
    const userStr = await getItem('user');

    if (token && userStr) {
      return { token, user: JSON.parse(userStr) };
    }

    return null;
  },
};
