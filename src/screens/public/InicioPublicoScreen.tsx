import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { colors, radius, typography } from '../../theme';

export default function InicioPublicoScreen() {
  const { user } = useAuth();
  const navigation = useNavigation<any>();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Image source={require('../../../assets/icon.png')} style={styles.logo} />
        <Text style={styles.clubName}>Club River Plate</Text>
        <Text style={styles.location}>Santo Tomé, Corrientes</Text>
      </View>

      {user ? (
        <View style={styles.welcomeBanner}>
          <View>
            <Text style={styles.welcomeText}>Hola, {user.nombre}!</Text>
            <Text style={styles.welcomeSub}>Bienvenido de nuevo</Text>
          </View>
          <View style={styles.rolBadge}>
            <Text style={styles.rolText}>{user.rol}</Text>
          </View>
        </View>
      ) : (
        <View style={styles.loginBanner}>
          <Ionicons name="lock-closed-outline" size={36} color={colors.red} style={{ marginBottom: 12 }} />
          <Text style={styles.loginBannerTitle}>Accedé a tu cuenta</Text>
          <Text style={styles.loginBannerText}>
            Iniciá sesión para ver tus categorías, cuotas y más funcionalidades exclusivas.
          </Text>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>DESCUBRÍ EL CLUB</Text>

        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('InfoClub')}
          activeOpacity={0.7}
        >
          <View style={styles.cardIcon}>
            <Ionicons name="information-circle-outline" size={28} color={colors.red} />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Información del Club</Text>
            <Text style={styles.cardSubtitle}>Horarios, contacto y ubicación</Text>
          </View>
          <Ionicons name="chevron-forward-outline" size={20} color={colors.muted} />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { paddingBottom: 32 },

  header: {
    backgroundColor: colors.red,
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 36,
    paddingHorizontal: 20,
  },
  logo: {
    width: 88,
    height: 88,
    borderRadius: 44,
    marginBottom: 14,
    borderWidth: 3,
    borderColor: colors.glassBorder,
  },
  clubName: { ...typography.display, fontSize: 28, color: colors.text, marginBottom: 4 },
  location: { ...typography.body, fontSize: 15, color: colors.text, opacity: 0.75 },

  welcomeBanner: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: radius.lg,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  welcomeText: { ...typography.bodySemiBold, fontSize: 17, color: colors.text },
  welcomeSub: { ...typography.body, fontSize: 13, color: colors.muted, marginTop: 2 },
  rolBadge: {
    backgroundColor: colors.redDim,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.sm,
  },
  rolText: { ...typography.bodyMedium, fontSize: 12, color: colors.red },

  loginBanner: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: radius.lg,
    padding: 24,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  loginBannerTitle: { ...typography.bodyBold, fontSize: 18, color: colors.text, marginBottom: 8 },
  loginBannerText: {
    ...typography.body,
    fontSize: 14,
    color: colors.muted,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 21,
  },
  loginButton: {
    backgroundColor: colors.red,
    paddingVertical: 13,
    paddingHorizontal: 40,
    borderRadius: radius.md,
  },
  loginButtonText: { ...typography.bodyBold, color: colors.text, fontSize: 16 },

  section: { marginTop: 20, paddingHorizontal: 16 },
  sectionTitle: {
    ...typography.display,
    fontSize: 13,
    color: colors.muted,
    letterSpacing: 2,
    marginBottom: 12,
  },
  card: {
    borderRadius: radius.lg,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    backgroundColor: colors.redDim,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  cardContent: { flex: 1 },
  cardTitle: { ...typography.bodySemiBold, fontSize: 15, color: colors.text, marginBottom: 2 },
  cardSubtitle: { ...typography.body, fontSize: 13, color: colors.muted },
});
