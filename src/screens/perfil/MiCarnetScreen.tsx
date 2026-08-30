import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import { carnetService } from '../../services/carnetService';
import { Carnet } from '../../types/carnet';
import { colors, radius, typography } from '../../theme';

export default function MiCarnetScreen() {
  const [carnet, setCarnet] = useState<Carnet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await carnetService.obtenerMiCarnet();
      setCarnet(data);
    } catch {
      setError('No se pudo cargar tu carnet. Intentá de nuevo.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { cargar(); }, [cargar]));

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.red} />
      </View>
    );
  }

  if (error || !carnet) {
    return (
      <View style={styles.centered}>
        <Ionicons name="alert-circle-outline" size={48} color={colors.muted} />
        <Text style={styles.errorText}>{error ?? 'No se pudo cargar tu carnet.'}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={cargar}>
          <Text style={styles.retryButtonText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const alDia = carnet.estado.alDia;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.headerClub}>Club River Plate</Text>
          <Text style={styles.headerTitle}>Carnet digital</Text>
        </View>

        <View style={styles.body}>
          <View style={styles.qrWrapper}>
            <QRCode value={carnet.verificarUrl} size={180} />
          </View>

          <Text style={styles.nombre}>{carnet.nombre} {carnet.apellido}</Text>
          <Text style={styles.dni}>DNI {carnet.dni}</Text>
          <Text style={styles.tipo}>{carnet.tipo === 'socio' ? 'Socio' : 'Participante'}</Text>

          {alDia ? (
            <View style={[styles.badge, styles.badgeAlDia]}>
              <Ionicons name="checkmark-circle" size={18} color={colors.green} />
              <Text style={[styles.badgeText, { color: colors.green }]}>AL DÍA</Text>
            </View>
          ) : (
            <View style={[styles.badge, styles.badgeDeuda]}>
              <Ionicons name="alert-circle" size={18} color="#FFFFFF" />
              <Text style={[styles.badgeText, { color: '#FFFFFF' }]}>CON DEUDA</Text>
            </View>
          )}

          <Text style={styles.hint}>
            Presentá este QR en portería para verificar tu estado de cuenta.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scrollContent: { padding: 20, paddingBottom: 40, flexGrow: 1, justifyContent: 'center' },
  centered: {
    flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, gap: 12,
    backgroundColor: colors.bg,
  },
  errorText: { ...typography.body, fontSize: 15, color: colors.muted, textAlign: 'center' },
  retryButton: {
    borderColor: colors.red, borderWidth: 1, paddingHorizontal: 24, paddingVertical: 10,
    borderRadius: radius.sm, marginTop: 8,
  },
  retryButtonText: { ...typography.bodySemiBold, color: colors.red, fontSize: 15 },

  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    overflow: 'hidden',
  },
  header: {
    backgroundColor: colors.red,
    paddingVertical: 20,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  headerClub: {
    ...typography.display,
    fontSize: 13,
    letterSpacing: 3,
    color: colors.text,
    textTransform: 'uppercase',
  },
  headerTitle: {
    ...typography.bodySemiBold,
    fontSize: 14,
    color: colors.text,
    marginTop: 2,
  },
  body: {
    alignItems: 'center',
    paddingVertical: 28,
    paddingHorizontal: 24,
    gap: 6,
  },
  qrWrapper: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: radius.md,
    marginBottom: 16,
  },
  nombre: { ...typography.display, fontSize: 22, color: colors.text },
  dni: { ...typography.body, fontSize: 14, color: colors.muted, marginTop: 2 },
  tipo: {
    ...typography.bodySemiBold,
    fontSize: 12,
    color: colors.muted,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginTop: 4,
    marginBottom: 12,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: radius.pill,
  },
  badgeAlDia: { backgroundColor: colors.greenDim },
  badgeDeuda: { backgroundColor: colors.red },
  badgeText: { ...typography.bodyBold, fontSize: 14, color: colors.text },
  hint: {
    ...typography.body,
    fontSize: 12,
    color: colors.muted,
    textAlign: 'center',
    marginTop: 16,
  },
});
