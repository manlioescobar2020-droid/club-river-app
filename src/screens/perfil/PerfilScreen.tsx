import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { authService } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import { colors, radius, typography } from '../../theme';

// ─── Helper: fila de lista ─────────────────────────────────────────────────
function InfoRow({
  icon,
  label,
  value,
  onPress,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  value?: string;
  onPress?: () => void;
}) {
  const Container = onPress ? TouchableOpacity : View;
  return (
    <Container style={styles.row} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.rowIcon}>
        <Ionicons name={icon} size={20} color={colors.red} />
      </View>
      <View style={styles.rowContent}>
        <Text style={styles.rowLabel}>{label}</Text>
        {!!value && <Text style={styles.rowValue}>{value}</Text>}
      </View>
      {onPress && (
        <Ionicons name="chevron-forward-outline" size={18} color={colors.muted} />
      )}
    </Container>
  );
}

// ─── Pantalla ──────────────────────────────────────────────────────────────
export default function PerfilScreen() {
  const { user, signOut } = useAuth();
  const navigation = useNavigation<any>();

  const doLogout = async () => {
    try { await authService.logout(); } catch {}
    signOut();
  };

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('¿Estás seguro que querés cerrar sesión?')) doLogout();
      return;
    }
    Alert.alert('Cerrar Sesión', '¿Estás seguro que querés salir?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Salir', style: 'destructive', onPress: doLogout },
    ]);
  };

  // ── Sin sesión ────────────────────────────────────────────────────────
  if (!user) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.noSesionContent}>
        <View style={styles.avatarCircle}>
          <Ionicons name="person-outline" size={36} color={colors.red} />
        </View>

        <Text style={styles.noSesionTitle}>Sin sesión activa</Text>
        <Text style={styles.noSesionText}>
          Iniciá sesión para ver tu perfil y acceder a todas las funcionalidades.
        </Text>

        <TouchableOpacity
          style={styles.loginBtn}
          onPress={() => navigation.navigate('Login')}
          activeOpacity={0.8}
        >
          <Text style={styles.loginBtnText}>Iniciar Sesión</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  // ── Con sesión ────────────────────────────────────────────────────────
  const inicial = (user.nombre?.[0] ?? '').toUpperCase();
  const esSocio = user.rol === 'SOCIO';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>

      {/* Header: avatar + nombre + email + rol */}
      <View style={styles.headerCard}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{inicial}</Text>
        </View>
        <Text style={styles.nombre}>{user.nombre} {user.apellido}</Text>
        <Text style={styles.email}>{user.email}</Text>
        <View style={styles.rolBadge}>
          <Text style={styles.rolText}>{user.rol}</Text>
        </View>
      </View>

      {/* Información Personal */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>INFORMACIÓN PERSONAL</Text>
        <View style={styles.sectionCard}>
          <InfoRow
            icon="person-outline"
            label={`${user.nombre} ${user.apellido}`}
            value="Nombre completo"
          />
          <View style={styles.rowDivider} />
          <InfoRow
            icon="mail-outline"
            label={user.email}
            value="Email"
          />
          <View style={styles.rowDivider} />
          <InfoRow
            icon="shield-checkmark-outline"
            label={user.rol}
            value="Rol"
          />
        </View>
      </View>

      {/* Mi Cuenta — solo SOCIO */}
      {esSocio && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>MI CUENTA</Text>
          <View style={styles.sectionCard}>
            <InfoRow
              icon="calendar-outline"
              label="Mis Alquileres"
              onPress={() => navigation.navigate('AlquileresHistorial')}
            />
            {user.esTutor && (
              <>
                <View style={styles.rowDivider} />
                <InfoRow
                  icon="people-outline"
                  label="Participantes a cargo"
                  onPress={() => navigation.navigate('ParticipantesACargo')}
                />
              </>
            )}
          </View>
        </View>
      )}

      {/* Configuración */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>CONFIGURACIÓN</Text>
        <View style={styles.sectionCard}>
          <InfoRow
            icon="lock-closed-outline"
            label="Cambiar Contraseña"
            onPress={() => navigation.navigate('CambiarContrasena')}
          />
          <View style={styles.rowDivider} />
          <InfoRow
            icon="notifications-outline"
            label="Notificaciones"
            onPress={() => Alert.alert(
              'Notificaciones',
              'Las notificaciones push se configuran desde los ajustes de tu dispositivo.'
            )}
          />
          <View style={styles.rowDivider} />
          <InfoRow
            icon="help-circle-outline"
            label="Ayuda y Soporte"
            onPress={() => Linking.openURL(
              'https://wa.me/5493756415586?text=Hola,%20necesito%20ayuda%20con%20la%20app'
            )}
          />
        </View>
      </View>

      {/* Cerrar sesión */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.75}>
        <Ionicons name="log-out-outline" size={20} color={colors.red} />
        <Text style={styles.logoutText}>Cerrar Sesión</Text>
      </TouchableOpacity>

      <Text style={styles.version}>Versión 1.0.0</Text>
    </ScrollView>
  );
}

// ─── Estilos ───────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scrollContent: {
    paddingBottom: 40,
  },

  // ── Sin sesión ────────────────────────────────────────────────────────
  noSesionContent: {
    alignItems: 'center',
    padding: 32,
    paddingTop: 72,
  },
  noSesionTitle: {
    ...typography.display,
    fontSize: 24,
    color: colors.text,
    marginBottom: 10,
    textAlign: 'center',
  },
  noSesionText: {
    ...typography.body,
    fontSize: 14,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  loginBtn: {
    backgroundColor: colors.red,
    paddingHorizontal: 36,
    paddingVertical: 14,
    borderRadius: radius.lg,
    minWidth: 200,
    alignItems: 'center',
  },
  loginBtnText: {
    ...typography.bodyBold,
    fontSize: 16,
    color: colors.text,
  },

  // ── Header con sesión ─────────────────────────────────────────────────
  headerCard: {
    alignItems: 'center',
    paddingTop: 36,
    paddingBottom: 28,
    paddingHorizontal: 20,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.redDim,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    ...typography.display,
    fontSize: 36,
    color: colors.red,
  },
  nombre: {
    ...typography.display,
    fontSize: 24,
    color: colors.text,
    marginBottom: 4,
  },
  email: {
    ...typography.body,
    fontSize: 14,
    color: colors.muted,
    marginBottom: 12,
  },
  rolBadge: {
    backgroundColor: colors.redDim,
    borderRadius: radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 4,
  },
  rolText: {
    ...typography.bodyMedium,
    fontSize: 13,
    color: colors.red,
  },

  // ── Secciones ─────────────────────────────────────────────────────────
  section: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    ...typography.display,
    fontSize: 13,
    color: colors.muted,
    letterSpacing: 2,
    marginBottom: 8,
  },
  sectionCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    overflow: 'hidden',
  },

  // ── InfoRow ───────────────────────────────────────────────────────────
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 14,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: colors.redDim,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowContent: {
    flex: 1,
  },
  rowLabel: {
    ...typography.body,
    fontSize: 15,
    color: colors.muted,
  },
  rowValue: {
    ...typography.bodySemiBold,
    fontSize: 13,
    color: colors.text,
    marginTop: 2,
  },
  rowDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: 16,
  },

  // ── Logout ────────────────────────────────────────────────────────────
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginTop: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: radius.lg,
    paddingVertical: 14,
    gap: 8,
  },
  logoutText: {
    ...typography.bodySemiBold,
    fontSize: 16,
    color: colors.red,
  },

  // ── Versión ───────────────────────────────────────────────────────────
  version: {
    ...typography.body,
    textAlign: 'center',
    fontSize: 12,
    color: colors.muted,
  },
});
