import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  ListRenderItem,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { TOKEN_KEY } from '../../services/api';
import { sociosService } from '../../services/sociosService';
import { Recibo } from '../../types/socios';
import { colors, radius, typography } from '../../theme';

const MESES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

function formatFecha(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getUTCDate()} ${MESES[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

function formatMonto(monto: string): string {
  return `$${Math.round(parseFloat(monto)).toLocaleString('es-AR')}`;
}

export default function RecibosScreen() {
  const [recibos, setRecibos] = useState<Recibo[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [descargando, setDescargando] = useState<number | null>(null);

  const cargar = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const data = await sociosService.obtenerRecibos();
      setRecibos(data);
    } catch {
      setError('No se pudieron cargar los recibos. Intentá de nuevo.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { cargar(); }, [cargar]));

  const handleDescargar = async (reciboId: number, numeroRecibo: string) => {
    if (!FileSystem.documentDirectory) {
      Alert.alert('Error', 'Descarga no disponible en esta plataforma');
      return;
    }
    try {
      setDescargando(reciboId);
      const reciboUrl = sociosService.descargarReciboPDF(reciboId);
      const fileUri = `${FileSystem.documentDirectory}recibo_${numeroRecibo}.pdf`;

      let token: string | null = null;
      try {
        const SecureStore = await import('expo-secure-store');
        token = await SecureStore.getItemAsync(TOKEN_KEY);
      } catch {}

      const result = await FileSystem.downloadAsync(reciboUrl, fileUri, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(result.uri, { mimeType: 'application/pdf' });
      } else {
        Alert.alert('Descargado', `Recibo guardado en: ${result.uri}`);
      }
    } catch {
      Alert.alert('Error', 'No se pudo descargar el recibo');
    } finally {
      setDescargando(null);
    }
  };

  const renderItem: ListRenderItem<Recibo> = ({ item }) => {
    const esCuota = item.tipo === 'CUOTA';
    const isBusy  = descargando === item.id;

    return (
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <View style={styles.cardInfo}>
            <Text style={styles.numeroRecibo}>#{item.numero}</Text>
            <Text style={styles.fecha}>{formatFecha(item.fecha)}</Text>
          </View>
          <View style={[styles.badge, esCuota ? styles.badgeCuota : styles.badgeAlquiler]}>
            <Text style={[styles.badgeText, esCuota ? styles.badgeTextCuota : styles.badgeTextAlquiler]}>
              {esCuota ? 'Cuota' : 'Alquiler'}
            </Text>
          </View>
        </View>

        {esCuota && item.cuotas && item.cuotas.length > 0 && (
          <Text style={styles.cuotasText}>
            Cuotas {item.cuotas.map((c) => `${c.mes} ${c.anio}`).join(', ')}
          </Text>
        )}

        <View style={styles.cardBottom}>
          <Text style={styles.monto}>{formatMonto(item.monto)}</Text>
          <TouchableOpacity
            style={[styles.descargarBtn, isBusy && styles.descargarBtnDisabled]}
            onPress={() => handleDescargar(item.id, item.numero)}
            disabled={isBusy || descargando !== null}
          >
            {isBusy ? (
              <ActivityIndicator size="small" color={colors.red} />
            ) : (
              <>
                <Ionicons name="download-outline" size={16} color={colors.red} />
                <Text style={styles.descargarText}>Descargar PDF</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return <View style={styles.centered}><ActivityIndicator size="large" color={colors.red} /></View>;
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Ionicons name="alert-circle-outline" size={48} color={colors.muted} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => cargar()}>
          <Text style={styles.retryButtonText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      data={recibos}
      keyExtractor={(item) => String(item.id)}
      renderItem={renderItem}
      contentContainerStyle={recibos.length === 0 ? styles.emptyContainer : styles.listContent}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => cargar(true)} colors={[colors.red]} tintColor={colors.red} />
      }
      ListEmptyComponent={
        <View style={styles.emptyState}>
          <Ionicons name="document-outline" size={48} color={colors.muted} />
          <Text style={styles.emptyTitle}>Sin recibos</Text>
          <Text style={styles.emptySubtitle}>No tenés recibos generados</Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: colors.bg },
  listContent: { padding: 16, gap: 12 },
  emptyContainer: { flexGrow: 1 },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, gap: 10 },
  emptyTitle: { ...typography.bodySemiBold, fontSize: 18, color: colors.text },
  emptySubtitle: { ...typography.body, fontSize: 14, color: colors.muted, textAlign: 'center' },
  errorText: { ...typography.body, fontSize: 15, color: colors.muted, textAlign: 'center', marginTop: 12, marginBottom: 20 },
  retryButton: { borderColor: colors.red, borderWidth: 1, paddingHorizontal: 24, paddingVertical: 10, borderRadius: radius.sm },
  retryButtonText: { ...typography.bodySemiBold, color: colors.red, fontSize: 15 },
  card: {
    backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1,
    borderColor: colors.glassBorder, padding: 16,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  cardInfo: { flex: 1, marginRight: 8 },
  numeroRecibo: { ...typography.bodyBold, fontSize: 16, color: colors.text, marginBottom: 2 },
  fecha: { ...typography.body, fontSize: 13, color: colors.muted },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill },
  badgeCuota: { backgroundColor: colors.redDim },
  badgeAlquiler: { backgroundColor: colors.greenDim },
  badgeText: { ...typography.bodyBold, fontSize: 12 },
  badgeTextCuota: { color: colors.red },
  badgeTextAlquiler: { color: colors.green },
  cuotasText: { ...typography.body, fontSize: 13, color: colors.muted, marginBottom: 4 },
  cardBottom: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.border,
  },
  monto: { ...typography.bodyBold, fontSize: 20, color: colors.text },
  descargarBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: radius.sm, borderWidth: 1, borderColor: colors.red,
    minWidth: 140, justifyContent: 'center',
  },
  descargarBtnDisabled: { opacity: 0.6 },
  descargarText: { ...typography.bodySemiBold, fontSize: 13, color: colors.red },
});
