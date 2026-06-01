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
  signIn: (user: AuthUser) => Promise<void>;
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
    // Limpiar sesión guardada al iniciar para siempre arrancar sin usuario.
    // Para restaurar el auto-login, reemplazar este bloque por restoreSession().
    const clearAndInit = async () => {
      try { await authService.logout(); } catch {}
      setIsLoading(false);
    };
    clearAndInit();
  }, []);

  async function signIn(userData: AuthUser) {
    setUser(userData);
    setIsAuthenticated(true);

    // Las notificaciones son opcionales — nunca deben bloquear ni crashear el login
    registerForPushNotificationsAsync()
      .then(async pushToken => {
        if (pushToken) {
          const session = await authService.getStoredSession();
          if (session?.token) sendTokenToBackend(pushToken, session.token).catch(() => {});
        }
      })
      .catch(() => {});
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
