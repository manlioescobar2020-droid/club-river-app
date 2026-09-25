import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  SectionList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  SectionListRenderItem,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import { sociosService } from '../../services/sociosService';
import { AlquilerHistorial, MovimientoSaldo } from '../../types/socios';
import { colors, radius, typography } from '../../theme';
import { extraerHoraMinuto, finInstante } from '../../utils/fechas';

const DIAS  = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
const MESES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

function formatFechaLarga(dateStr: string): string {
  const d = new Date(dateStr);
  return `${DIAS[d.getUTCDay()]} ${d.getUTCDate()} ${MESES[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

function formatFechaCorta(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getUTCDate().toString().padStart(2, '0')}/${(d.getUTCMonth() + 1).toString().padStart(2, '0')}`;
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

interface Grupo {
  title: string;
  pasada: boolean;
  data: AlquilerHistorial[];
}

export default function AlquileresHistorialScreen() {
  const [alquileres, setAlquileres] = useState<AlquilerHistorial[]>([]);
  const [saldo, setSaldo] = useState(0);
  const [movimientos, setMovimientos] = useState<MovimientoSaldo[]>([]);
  const [mostrarMovimientos, setMostrarMovimientos] = useState(false);
  const [cancelandoId, setCancelandoId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const [alquileresData, saldoData] = await Promise.all([
        sociosService.obtenerHistorialAlquileres(),
        sociosService.obtenerSaldo().catch(() => ({ saldo: 0, movimientos: [] })),
      ]);
      setAlquileres(alquileresData);
      setSaldo(saldoData.saldo);
      setMovimientos(saldoData.movimientos);
    } catch {
      setError('No se pudieron cargar los alquileres. Intentá de nuevo.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { cargar(); }, [cargar]));

  function ejecutarCancelacion(id: string) {
    setCancelandoId(id);
    sociosService.cancelarAlquiler(id)
      .then(response => {
        Alert.alert('', response.mensaje);
        cargar();
      })
      .catch((err: any) => {
        Alert.alert('Error', err.message || 'No se pudo cancelar la reserva.');
      })
      .finally(() => setCancelandoId(null));
  }

  function handleCancelar(item: AlquilerHistorial) {
    const mensaje = item.devolucion?.aplicaDevolucion
      ? `Si cancelás ahora recuperás $${item.devolucion.montoDevuelto.toLocaleString('es-AR')} como saldo a favor (${item.devolucion.porcentaje}% del total). ¿Confirmás?`
      : 'Podés cancelar, pero no corresponde saldo a favor por el plazo o porque no está pagada. Se libera la fecha. ¿Confirmás?';

    Alert.alert('Cancelar reserva', mensaje, [
      { text: 'No', style: 'cancel' },
      { text: 'Sí, cancelar', style: 'destructive', onPress: () => ejecutarCancelacion(item.id) },
    ]);
  }

  const renderItem: SectionListRenderItem<AlquilerHistorial, Grupo> = ({ item, section }) => {
    const estado = ESTADO_CONFIG[item.estado] ?? ESTADO_CONFIG.RESERVADO;
    const esPrivado = item.categoriaEvento === 'PRIVADO';
    const pasada = section.pasada;

    return (
      <View style={[styles.card, pasada && styles.cardPasada]}>
        <View style={styles.cardHeader}>
          <Text style={styles.fecha}>{formatFechaLarga(item.fecha)}</Text>
          <View style={[styles.estadoBadge, { backgroundColor: estado.bg }]}>
            <Text style={[styles.estadoText, { color: estado.color }]}>{estado.label}</Text>
          </View>
        </View>

        <View style={styles.horarioRow}>
          <Ionicons name="time-outline" size={14} color={colors.muted} />
          <Text style={styles.horarioText}>
            {extraerHoraMinuto(item.horaInicio)} - {extraerHoraMinuto(item.horaFin)} · {calcularDuracion(extraerHoraMinuto(item.horaInicio), extraerHoraMinuto(item.horaFin))}
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

        {item.estado !== 'CANCELADO' && !pasada && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => handleCancelar(item)}
            disabled={cancelandoId === item.id}
          >
            {cancelandoId === item.id ? (
              <ActivityIndicator size="small" color={colors.red} />
            ) : (
              <Text style={styles.cancelButtonText}>Cancelar reserva</Text>
            )}
          </TouchableOpacity>
        )}
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

  const renderSaldoHeader = () => {
    if (saldo <= 0) return null;
    return (
      <View style={styles.saldoCard}>
        <View style={styles.saldoHeader}>
          <Ionicons name="wallet-outline" size={22} color={colors.green} />
          <Text style={styles.saldoTitle}>Saldo a favor</Text>
        </View>
        <Text style={styles.saldoMonto}>${saldo.toLocaleString('es-AR')}</Text>
        <TouchableOpacity onPress={() => setMostrarMovimientos(p => !p)}>
          <Text style={styles.verMovimientosText}>
            {mostrarMovimientos ? 'Ocultar movimientos' : 'Ver movimientos'}
          </Text>
        </TouchableOpacity>
        {mostrarMovimientos && (
          <View style={styles.movimientosList}>
            {movimientos.map((m, i) => (
              <View key={i} style={styles.movimientoRow}>
                <View style={styles.movimientoInfo}>
                  <Text style={styles.movimientoFecha}>{formatFechaCorta(m.creadoEn)}</Text>
                  <Text style={styles.movimientoDescripcion}>{m.descripcion}</Text>
                </View>
                <Text style={[styles.movimientoMonto, m.monto >= 0 ? styles.movimientoPositivo : styles.movimientoNegativo]}>
                  {m.monto >= 0 ? '+' : ''}${m.monto.toLocaleString('es-AR')}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  const ahora = new Date();
  const proximas   = alquileres.filter(item => finInstante(item) >= ahora)
    .sort((a, b) => finInstante(a).getTime() - finInstante(b).getTime());
  const anteriores = alquileres.filter(item => finInstante(item) < ahora)
    .sort((a, b) => finInstante(b).getTime() - finInstante(a).getTime());

  const sections: Grupo[] = [
    ...(proximas.length   ? [{ title: 'Próximas',   pasada: false, data: proximas   }] : []),
    ...(anteriores.length ? [{ title: 'Anteriores', pasada: true,  data: anteriores }] : []),
  ];

  return (
    <SectionList
      style={styles.container}
      sections={sections}
      keyExtractor={(item) => String(item.id)}
      renderItem={renderItem}
      renderSectionHeader={({ section }) => (
        <Text style={styles.sectionHeader}>{section.title}</Text>
      )}
      ListHeaderComponent={renderSaldoHeader}
      contentContainerStyle={alquileres.length === 0 ? styles.emptyContainer : styles.listContent}
      stickySectionHeadersEnabled={false}
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
  sectionHeader: {
    ...typography.bodyBold, fontSize: 13, color: colors.muted,
    textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2,
  },
  card: {
    backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1,
    borderColor: colors.glassBorder, padding: 16,
  },
  cardPasada: { opacity: 0.55 },
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
  cancelButton: {
    borderColor: colors.red, borderWidth: 1, borderRadius: radius.sm,
    paddingVertical: 10, alignItems: 'center', marginTop: 12,
  },
  cancelButtonText: { ...typography.bodySemiBold, color: colors.red, fontSize: 14 },
  saldoCard: { backgroundColor: colors.greenDim, borderRadius: radius.lg, padding: 16 },
  saldoHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  saldoTitle: { ...typography.bodySemiBold, fontSize: 15, color: colors.green },
  saldoMonto: { ...typography.bodyBold, fontSize: 28, color: colors.green, marginBottom: 10 },
  verMovimientosText: { ...typography.bodySemiBold, fontSize: 13, color: colors.green, textDecorationLine: 'underline' },
  movimientosList: { marginTop: 12, gap: 10 },
  movimientoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  movimientoInfo: { flex: 1, marginRight: 8 },
  movimientoFecha: { ...typography.body, fontSize: 11, color: colors.muted },
  movimientoDescripcion: { ...typography.body, fontSize: 13, color: colors.text },
  movimientoMonto: { ...typography.bodyBold, fontSize: 14 },
  movimientoPositivo: { color: colors.green },
  movimientoNegativo: { color: colors.red },
});
