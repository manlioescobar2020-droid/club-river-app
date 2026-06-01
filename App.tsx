import React, { useEffect, useRef } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { setupNotificationListeners } from './src/services/notificationsService';
import { AlquilerProvider } from './src/context/AlquilerContext';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { ChatProvider, useChatContext } from './src/context/ChatContext';
import AppNavigator from './src/navigation/AppNavigator';
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
          <ChatButton />
          <ChatModal />
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
