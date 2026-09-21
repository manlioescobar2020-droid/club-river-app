import React, { createContext, useContext, useState, useEffect } from 'react';
import { ActivityIndicator, Alert, View } from 'react-native';
import { authService } from '../services/authService';
import { colors } from '../theme';
import { registerAndSendPushToken, PushRegistrationResult } from '../services/notificationsService';

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
  pushDiag: PushRegistrationResult | null;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  signIn: async () => {},
  signOut: () => {},
  pushDiag: null,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pushDiag, setPushDiag] = useState<PushRegistrationResult | null>(null);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const session = await authService.getStoredSession();
        if (session?.token && session?.user) {
          setUser(session.user);
          setIsAuthenticated(true);
          // Re-registra el token en cada arranque con sesión guardada (no solo en login
          // explícito), porque muchos usuarios nunca vuelven a loguearse manualmente.
          registerAndSendPushToken(session.token)
            .then(result => setPushDiag(result))
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
    if (token) {
      registerAndSendPushToken(token)
        .then(result => {
          setPushDiag(result);
          // TEMPORAL: diagnóstico push — sacar después de confirmar que el registro
          // funciona en producción (ver conversación sobre push tokens no registrados).
          if (result.ok) {
            Alert.alert('Push OK', 'Token de notificaciones registrado correctamente.');
          } else {
            Alert.alert('Push falló', `Paso: ${result.step}\nDetalle: ${result.detail}`);
          }
        })
        .catch((error) => {
          const detail = error?.message ?? String(error);
          setPushDiag({ ok: false, step: 'backend-error', detail });
          // TEMPORAL: diagnóstico push — sacar después
          Alert.alert('Push falló', `Error inesperado: ${detail}`);
        });
    }
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
    <AuthContext.Provider value={{ isAuthenticated, user, signIn, signOut, pushDiag }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
