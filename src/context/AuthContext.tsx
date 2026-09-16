import React, { createContext, useContext, useState, useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { authService } from '../services/authService';
import { colors } from '../theme';
import { registerForPushNotificationsAsync, sendTokenToBackend } from '../services/notificationsService';

interface AuthUser {
  id: number;
  email: string;
  nombre: string;
  apellido: string;
  rol: string;
  esTutor?: boolean;
  debe_cambiar_password?: boolean;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: AuthUser | null;
  signIn: (user: AuthUser, token?: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  signIn: async () => {},
  signOut: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const session = await authService.getStoredSession();
        if (session?.token && session?.user) {
          setUser(session.user);
          setIsAuthenticated(true);
          registerForPushNotificationsAsync()
            .then(pushToken => {
              if (pushToken) {
                sendTokenToBackend(pushToken, session.token).catch(() => {});
              }
            })
            .catch(() => {});
        }
      } catch {
        // Sesión guardada corrupta o error de storage: arrancar deslogueado,
        // limpiando lo que haya para no reintentar leer basura en cada arranque.
        try { await authService.logout(); } catch {}
      } finally {
        setIsLoading(false);
      }
    };
    restoreSession();
  }, []);

  async function signIn(userData: AuthUser, token?: string) {
    setUser(userData);
    setIsAuthenticated(true);

    // Las notificaciones son opcionales — nunca deben bloquear ni crashear el login
    registerForPushNotificationsAsync()
      .then(async pushToken => {
        if (pushToken && token) {
          sendTokenToBackend(pushToken, token).catch(() => {});
        }
      })
      .catch((error) => console.warn('[PUSH] Error al registrar:', error));
  }

  function signOut() {
    authService.logout().catch(() => {});
    setUser(null);
    setIsAuthenticated(false);
  }

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg }}>
        <ActivityIndicator size="large" color={colors.red} />
      </View>
    );
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
