import React, { useEffect, useRef } from 'react';
import { View, ActivityIndicator, Linking } from 'react-native';
import type { NotificationResponse } from 'expo-notifications';
import {
  setupNotificationListeners,
  getLastNotificationResponse,
  clearLastNotificationResponse,
} from './src/services/notificationsService';
import { AlquilerProvider } from './src/context/AlquilerContext';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { ChatProvider, useChatContext } from './src/context/ChatContext';
import AppNavigator from './src/navigation/AppNavigator';
import { navigationRef, abrirAgenda } from './src/navigation/navigationRef';
import ChatButton from './src/components/chat/ChatButton';
import ChatModal from './src/components/chat/ChatModal';
import { useFonts } from 'expo-font';
import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
  DMSans_700Bold,
} from '@expo-google-fonts/dm-sans';
import { BebasNeue_400Regular } from '@expo-google-fonts/bebas-neue';
import Ionicons from '@expo/vector-icons/Ionicons';

function DeepLinkHandler() {
  const { isAuthenticated, user } = useAuth();
  const handledInitialUrl   = useRef(false);

  useEffect(() => {
    const handleUrl = ({ url }: { url: string }) => {
      if (!url.startsWith('clubriver://cuotas')) return;
      if (!isAuthenticated || !navigationRef.isReady() || user?.rol === 'PORTERO') return;
      navigationRef.navigate('Tabs', { screen: 'Cuotas' });
    };

    if (!handledInitialUrl.current && isAuthenticated) {
      handledInitialUrl.current = true;
      Linking.getInitialURL().then(url => { if (url) handleUrl({ url }); });
    }

    const subscription = Linking.addEventListener('url', handleUrl);
    return () => subscription.remove();
  }, [isAuthenticated, user?.rol]);

  return null;
}

const NAV_RETRY_MS    = 300;
const NAV_MAX_RETRIES = 20;

// Tocar un aviso con data.alquilerId abre la agenda de llaves en ese alquiler.
// Vive dentro de AuthProvider para saber si hay sesión; navega con navigationRef.
function NotificationHandler() {
  const { isAuthenticated } = useAuth();
  const procesadasRef       = useRef<Set<string>>(new Set());
  const inicialRevisadaRef  = useRef(false);

  useEffect(() => {
    if (!isAuthenticated) return;

    let activo = true;
    const timers: ReturnType<typeof setTimeout>[] = [];

    const manejarRespuesta = (response: NotificationResponse) => {
      const respuestaId = response.notification.request.identifier;
      if (procesadasRef.current.has(respuestaId)) return;

      // Procesada: se limpia para que getLastNotificationResponse no la devuelva otra vez.
      const marcarProcesada = () => {
        procesadasRef.current.add(respuestaId);
        clearLastNotificationResponse().catch(() => {});
      };

      const alquilerId = (response.notification.request.content.data as any)?.alquilerId;
      if (alquilerId == null) {
        marcarProcesada();
        return;
      }

      const intentar = (restantes: number) => {
        if (!activo) return;
        if (navigationRef.isReady()) {
          marcarProcesada();
          abrirAgenda(alquilerId);
        } else if (restantes > 0) {
          timers.push(setTimeout(() => intentar(restantes - 1), NAV_RETRY_MS));
        }
      };
      intentar(NAV_MAX_RETRIES);
    };

    const cleanup = setupNotificationListeners(() => {}, manejarRespuesta);

    // App abierta desde cerrada tocando el aviso: se revisa una sola vez.
    if (!inicialRevisadaRef.current) {
      inicialRevisadaRef.current = true;
      getLastNotificationResponse()
        .then(response => { if (response) manejarRespuesta(response); })
        .catch(() => {});
    }

    return () => {
      activo = false;
      timers.forEach(clearTimeout);
      cleanup();
    };
  }, [isAuthenticated]);

  return null;
}

function AuthChatBridge() {
  const { isAuthenticated } = useAuth();
  const { clearHistory } = useChatContext();
  const prevAuth = useRef(isAuthenticated);

  useEffect(() => {
    if (prevAuth.current && !isAuthenticated) clearHistory();
    prevAuth.current = isAuthenticated;
  }, [isAuthenticated]);

  return null;
}

function AppContent() {
  return (
    <ChatProvider>
      <AlquilerProvider>
        <AuthProvider>
          <AppNavigator />
          <AuthChatBridge />
          <DeepLinkHandler />
          <NotificationHandler />
          <ChatButton />
          <ChatModal />
        </AuthProvider>
      </AlquilerProvider>
    </ChatProvider>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSans_700Bold,
    BebasNeue_400Regular,
    ...Ionicons.font,
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0A0A0F' }}>
        <ActivityIndicator color="#DC2626" />
      </View>
    );
  }

  return <AppContent />;
}
