import React, { useEffect, useRef } from 'react';
import { View, ActivityIndicator, Linking } from 'react-native';
import { setupNotificationListeners } from './src/services/notificationsService';
import { AlquilerProvider } from './src/context/AlquilerContext';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { ChatProvider, useChatContext } from './src/context/ChatContext';
import AppNavigator, { navigationRef } from './src/navigation/AppNavigator';
import ChatButton from './src/components/chat/ChatButton';
import ChatModal from './src/components/chat/ChatModal';
import WhatsAppMenuButton from './src/components/whatsapp/WhatsAppMenuButton';
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
  const { isAuthenticated } = useAuth();
  const handledInitialUrl   = useRef(false);

  useEffect(() => {
    const handleUrl = ({ url }: { url: string }) => {
      if (!url.startsWith('clubriver://cuotas')) return;
      if (!isAuthenticated || !navigationRef.isReady()) return;
      navigationRef.navigate('Cuotas' as never);
    };

    if (!handledInitialUrl.current && isAuthenticated) {
      handledInitialUrl.current = true;
      Linking.getInitialURL().then(url => { if (url) handleUrl({ url }); });
    }

    const subscription = Linking.addEventListener('url', handleUrl);
    return () => subscription.remove();
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
          <ChatButton />
          <ChatModal />
          <WhatsAppMenuButton />
        </AuthProvider>
      </AlquilerProvider>
    </ChatProvider>
  );
}

export default function App() {
  useEffect(() => {
    const cleanup = setupNotificationListeners(
      (notification) => { console.log('[Push] Recibida:', notification.request.content.title); },
      (response) => { console.log('[Push] Tocada:', response.notification.request.content.title); }
    );
    return cleanup;
  }, []);

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
