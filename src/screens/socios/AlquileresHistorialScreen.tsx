import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  ListRenderItem,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import { sociosService } from '../../services/sociosService';
import { AlquilerHistorial } from '../../types/socios';
import { colors, radius, typography } from '../../theme';

const DIAS  = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
const MESES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

function formatFechaLarga(dateStr: string): string {
  const d = new Date(dateStr);
  return `${DIAS[d.getUTCDay()]} ${d.getUTCDate()} ${MESES[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

function calcularDuracion(inicio: string, fin: string): string {
  const [h1, m1] = inicio.split(':').map(Number);
  const [h2, m2] = fin.split(':').map(Number);
  const minutos = h2 * 60 + m2 - (h1 * 60 + m1);
  const horas = Math.floor(minutos / 60);
  const mins  = minutos % 60;
  return mins === 0 ? `${horas}h` : `${horas}h ${mins}min`;
}

function formatMonto(monto: string): string {
  return `$${Math.round(parseFloat(monto)).toLocaleString('es-AR')}`;
}

const TIPO_ESPACIO: Record<string, string> = {
  SALON: 'Salón', CANCHA: 'Cancha', SALON_CANCHA: 'Salón + Cancha',
};

const ESTADO_CONFIG: Record<string, { bg: string; color: string; label: string }> = {
  PAGADO:    { bg: colors.greenDim,  color: colors.green,  label: 'Pagado'    },
  RESERVADO: { bg: colors.yellowDim, color: colors.yellow, label: 'Reservado' },
  CANCELADO: { bg: colors.redDim,            color: colors.red,    label: 'Cancelado' },
};

export default function AlquileresHistorialScreen() {
  const [alquileres, setAlquileres] = useState<AlquilerHistorial[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const data = await sociosService.obtenerHistorialAlquileres();
      setAlquileres(data);
    } catch {
      setError('No se pudieron cargar los alquileres. Intentá de nuevo.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { cargar(); }, [cargar]));

  const renderItem: ListRenderItem<AlquilerHistorial> = ({ item }) => {
    const estado = ESTADO_CONFIG[item.estado] ?? ESTADO_CONFIG.RESERVADO;
    const esPrivado = item.categoriaEvento === 'PRIVADO';

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.fecha}>{formatFechaLarga(item.fecha)}</Text>
          <View style={[styles.estadoBadge, { backgroundColor: estado.bg }]}>
            <Text style={[styles.estadoText, { color: estado.color }]}>{estado.label}</Text>
          </View>
        </View>

        <View style={styles.horarioRow}>
          <Ionicons name="time-outline" size={14} color={colors.muted} />
          <Text style={styles.horarioText}>
            {item.horaInicio} - {item.horaFin} · {calcularDuracion(item.horaInicio, item.horaFin)}
          </Text>
        </View>

        <View style={styles.detallesRow}>
          <Text style={styles.tipoEspacio}>{TIPO_ESPACIO[item.tipoEspacio] ?? item.tipoEspacio}</Text>
          <View style={[styles.categBadge, esPrivado ? styles.categPrivado : styles.categPublico]}>
            <Text style={[styles.categText, esPrivado ? styles.categTextPrivado : styles.categTextPublico]}>
              {esPrivado ? 'Evento Privado' : 'Evento Público'}
            </Text>
          </View>
        </View>

        <Text style={styles.monto}>{formatMonto(item.monto)}</Text>
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
      data={alquileres}
      keyExtractor={(item) => String(item.id)}
      renderItem={renderItem}
      contentContainerStyle={alquileres.length === 0 ? styles.emptyContainer : styles.listContent}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => cargar(true)} colors={[colors.red]} tintColor={colors.red} />
      }
      ListEmptyComponent={
        <View style={styles.emptyState}>
          <Ionicons name="calendar-outline" size={48} color={colors.muted} />
          <Text style={styles.emptyTitle}>Sin alquileres</Text>
          <Text style={styles.emptySubtitle}>No tenés alquileres registrados</Text>
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
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  fecha: { ...typography.bodySemiBold, fontSize: 15, color: colors.text, flex: 1, marginRight: 8 },
  estadoBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill },
  estadoText: { ...typography.bodyBold, fontSize: 12 },
  horarioRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 10 },
  horarioText: { ...typography.body, fontSize: 13, color: colors.muted },
  detallesRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  tipoEspacio: { ...typography.bodySemiBold, fontSize: 14, color: colors.text },
  categBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill },
  categPublico: { backgroundColor: colors.greenDim },
  categPrivado: { backgroundColor: colors.purpleDim },
  categText: { ...typography.bodyBold, fontSize: 12 },
  categTextPublico: { color: colors.green },
  categTextPrivado: { color: colors.purple },
  monto: { ...typography.bodyBold, fontSize: 20, color: colors.text },
});
