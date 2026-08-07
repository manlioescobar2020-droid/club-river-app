import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  Alert,
  Linking,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../context/AuthContext';
import cuotasService, { Cuota } from '../../services/cuotasService';
import CuotaCard from '../../components/cuotas/CuotaCard';
import { colors, radius, typography } from '../../theme';

type FiltroTab = 'TODAS' | 'PENDIENTE' | 'PAGADA' | 'VENCIDA';

const FILTROS: { value: FiltroTab; label: string }[] = [
  { value: 'TODAS',     label: 'Todas'      },
  { value: 'PENDIENTE', label: 'Pendientes' },
  { value: 'PAGADA',    label: 'Pagadas'    },
  { value: 'VENCIDA',   label: 'Vencidas'   },
];

const ROLES_CON_CUOTAS = ['SOCIO', 'PARTICIPANTE', 'TUTOR_RESPONSABLE'];

export default function CuotasScreen() {
  const { user }   = useAuth();
  const insets     = useSafeAreaInsets();

  const [cuotas, setCuotas]               = useState<Cuota[]>([]);
  const [loading, setLoading]             = useState(false);
  const [refreshing, setRefreshing]       = useState(false);
  const [error, setError]                 = useState<string | null>(null);
  const [filtroActivo, setFiltroActivo]   = useState<FiltroTab>('TODAS');
  const [seleccionadas, setSeleccionadas] = useState<number[]>([]);
  const [pagando, setPagando]             = useState(false);
  const [descargando, setDescargando]     = useState<number | null>(null);
  const loadCuotasRef = useRef<(() => void) | null>(null);

  const rolTieneCuotas = user?.rol && ROLES_CON_CUOTAS.includes(user.rol);

  /* ── Data ──────────────────────────────────────── */

  const loadCuotas = async () => {
    if (!rolTieneCuotas) return;
    setError(null);
    setLoading(true);
    try {
      const lista = await cuotasService.getCuotas();
      setCuotas(lista);
    } catch (err: any) {
      setError(err.message || 'No se pudieron cargar las cuotas');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadCuotas(); }, [user?.rol]);
  useFocusEffect(useCallback(() => { loadCuotas(); }, [user?.rol]));

  useEffect(() => { loadCuotasRef.current = loadCuotas; });

  useEffect(() => {
    const subscription = Linking.addEventListener('url', ({ url }) => {
      if (!url.startsWith('clubriver://cuotas')) return;
      const status = new URL(url).searchParams.get('status');
      if (status === 'failure') {
        Alert.alert('Pago no completado', 'El pago no pudo procesarse. Podés intentarlo nuevamente.');
        return;
      }
      setSeleccionadas([]);
      loadCuotasRef.current?.();
    });
    return () => subscription.remove();
  }, []);

  const onRefresh = () => { setRefreshing(true); setSeleccionadas([]); loadCuotas(); };

  /* ── Derived ────────────────────────────────────── */

  const counts = useMemo(() => ({
    pendientes: cuotas.filter(c => c.estado === 'PENDIENTE').length,
    pagadas:    cuotas.filter(c => c.estado === 'PAGADA').length,
    vencidas:   cuotas.filter(c => c.estado === 'VENCIDA').length,
  }), [cuotas]);

  const filteredCuotas = useMemo(() =>
    filtroActivo === 'TODAS' ? cuotas : cuotas.filter(c => c.estado === filtroActivo),
    [cuotas, filtroActivo]
  );

  const totalSeleccionado = useMemo(() =>
    cuotas
      .filter(c => seleccionadas.includes(c.id))
      .reduce((sum, c) => sum + parseFloat(c.monto || '0'), 0),
    [cuotas, seleccionadas]
  );

  /* ── Handlers ───────────────────────────────────── */

  const toggleSeleccion    = (id: number) =>
    setSeleccionadas(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const handleCambioFiltro = (tab: FiltroTab) => { setFiltroActivo(tab); setSeleccionadas([]); };

  const handlePagar = async () => {
    if (seleccionadas.length === 0 || pagando) return;
    setPagando(true);
    try {
      const { initPoint } = await cuotasService.pagarMultiplesCuotas(seleccionadas);
      await Linking.openURL(initPoint);
      Alert.alert(
        'Pago iniciado',
        'Serás redirigido de vuelta al finalizar el pago.',
        [{ text: 'Entendido' }]
      );
    } catch (err: any) {
      Alert.alert('Error al pagar', err.message || 'No se pudo iniciar el pago.');
    } finally {
      setPagando(false);
    }
  };

  const handleVerRecibo = async (reciboId: number) => {
    setDescargando(reciboId);
    try {
      await cuotasService.descargarRecibo(reciboId);
    } catch {
      Alert.alert('Error', 'No se pudo descargar el recibo.');
    } finally {
      setDescargando(null);
    }
  };

  /* ── Acceso restringido ─────────────────────────── */

  if (!rolTieneCuotas) {
    return (
      <View style={styles.root}>
        <View style={[styles.headerGradient, { paddingTop: insets.top + 12 }]}>
          <Text style={styles.headerTitle}>MIS CUOTAS</Text>
        </View>
        <View style={styles.centered}>
          <Text style={styles.emptyEmoji}>🏛️</Text>
          <Text style={styles.emptyTitle}>Sección no disponible</Text>
          <Text style={styles.emptyText}>
            Esta sección es exclusiva para socios y participantes del club.
          </Text>
        </View>
      </View>
    );
  }

  /* ── Loading inicial ────────────────────────────── */

  if (loading && !refreshing && cuotas.length === 0) {
    return (
      <View style={styles.root}>
        <View style={[styles.headerGradient, { paddingTop: insets.top + 12 }]}>
          <Text style={styles.headerTitle}>MIS CUOTAS</Text>
        </View>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.red} />
          <Text style={styles.loadingText}>Cargando cuotas...</Text>
        </View>
      </View>
    );
  }

  /* ── List header ────────────────────────────────── */

  const ListHeader = () => (
    <>
      {/* Summary strip */}
      {!error && (
        <View style={styles.summaryRow}>
          {[
            { label: 'Pendientes', value: counts.pendientes, color: colors.redBright },
            { label: 'Pagadas',    value: counts.pagadas,    color: colors.green     },
            { label: 'Vencidas',   value: counts.vencidas,   color: colors.yellow    },
          ].map(chip => (
            <View key={chip.label} style={styles.chip}>
              <Text style={[styles.chipValue, { color: chip.color }]}>
                {chip.value}
              </Text>
              <Text style={styles.chipLabel}>{chip.label}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Filter pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtrosContent}
        style={styles.filtrosScroll}
      >
        {FILTROS.map(f => {
          const active = filtroActivo === f.value;
          return (
            <TouchableOpacity
              key={f.value}
              onPress={() => handleCambioFiltro(f.value)}
              style={[styles.filtroPill, active && styles.filtroPillActive]}
              activeOpacity={0.75}
            >
              <Text style={[styles.filtroText, active && styles.filtroTextActive]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Error */}
      {error && (
        <View style={styles.errorBox}>
          <MaterialCommunityIcons name="alert-circle-outline" size={20} color={colors.redBright} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={loadCuotas}>
            <Text style={styles.retryText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      )}
    </>
  );

  /* ── Main render ────────────────────────────────── */

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={[styles.headerGradient, { paddingTop: insets.top + 12 }]}>
        <Text style={styles.headerTitle}>MIS CUOTAS</Text>
        {!error && (
          <Text style={styles.headerSub}>
            {cuotas.length} {cuotas.length === 1 ? 'cuota registrada' : 'cuotas registradas'}
          </Text>
        )}
      </View>

      <FlatList
        data={filteredCuotas}
        keyExtractor={item => item.id.toString()}
        ListHeaderComponent={<ListHeader />}
        ListEmptyComponent={
          !error ? (
            <View style={styles.centered}>
              <Text style={styles.emptyEmoji}>📋</Text>
              <Text style={styles.emptyTitle}>
                {filtroActivo === 'TODAS' ? 'Sin cuotas registradas' : 'Sin cuotas en este filtro'}
              </Text>
              <Text style={styles.emptyText}>
                {filtroActivo === 'TODAS'
                  ? 'No se encontraron cuotas asociadas a tu cuenta.'
                  : 'Probá con otro filtro.'}
              </Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <CuotaCard
            cuota={item}
            seleccionable={item.estado === 'PENDIENTE' || item.estado === 'VENCIDA'}
            seleccionada={seleccionadas.includes(item.id)}
            onToggleSeleccion={toggleSeleccion}
            onVerRecibo={descargando === null ? handleVerRecibo : undefined}
          />
        )}
        contentContainerStyle={[
          styles.listContent,
          seleccionadas.length > 0 && { paddingBottom: 100 },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.red]}
            tintColor={colors.red}
          />
        }
      />

      {/* Barra flotante de pago */}
      {seleccionadas.length > 0 && (
        <View style={styles.floatingBar}>
          <View style={styles.floatingInfo}>
            <Text style={styles.floatingCount}>
              {seleccionadas.length} {seleccionadas.length === 1 ? 'cuota' : 'cuotas'} seleccionadas
            </Text>
            <Text style={styles.floatingMonto}>
              ${totalSeleccionado.toLocaleString('es-AR')}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.floatingBtn, pagando && styles.floatingBtnDisabled]}
            onPress={handlePagar}
            disabled={pagando}
            activeOpacity={0.85}
          >
            {pagando
              ? <ActivityIndicator color={colors.text} size="small" />
              : <Text style={styles.floatingBtnText}>Pagar</Text>
            }
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

/* ─── Styles ─────────────────────────────────────────── */

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },

  /* Header */
  headerGradient: {
    paddingHorizontal: 20,
    paddingBottom:     20,
    backgroundColor:   colors.redDim,
  },
  headerTitle: {
    ...typography.display,
    fontSize:     36,
    color:        colors.text,
    marginBottom: 2,
  },
  headerSub: {
    ...typography.body,
    fontSize: 13,
    color:    colors.muted,
  },

  /* Summary strip */
  summaryRow: {
    flexDirection:    'row',
    marginHorizontal: 16,
    marginTop:        4,
    marginBottom:     12,
    gap:              10,
  },
  chip: {
    flex:              1,
    backgroundColor:   colors.surface,
    borderWidth:       1,
    borderColor:       colors.glassBorder,
    borderRadius:      16,
    paddingVertical:   12,
    alignItems:        'center',
  },
  chipValue: {
    ...typography.display,
    fontSize:     22,
    marginBottom: 2,
  },
  chipLabel: {
    ...typography.body,
    fontSize: 10,
    color:    colors.muted,
  },

  /* Filters */
  filtrosScroll:  { marginBottom: 10 },
  filtrosContent: { paddingHorizontal: 16, gap: 8 },
  filtroPill: {
    paddingHorizontal: 18,
    paddingVertical:   8,
    borderRadius:      radius.pill,
    borderWidth:       1,
    borderColor:       colors.glassBorder,
    backgroundColor:   colors.surface,
  },
  filtroPillActive: {
    backgroundColor: colors.red,
    borderColor:     colors.red,
  },
  filtroText: {
    ...typography.bodyMedium,
    fontSize: 13,
    color:    colors.muted,
  },
  filtroTextActive: { color: colors.text },

  /* Error */
  errorBox: {
    marginHorizontal: 16,
    marginBottom:     12,
    padding:          16,
    backgroundColor:  colors.redDim,
    borderRadius:     radius.md,
    borderLeftWidth:  3,
    borderLeftColor:  colors.red,
    alignItems:       'center',
    gap:              8,
  },
  errorText: {
    ...typography.body,
    fontSize:   13,
    color:      colors.redBright,
    textAlign:  'center',
  },
  retryBtn: {
    borderWidth:       1,
    borderColor:       colors.red,
    borderRadius:      radius.sm,
    paddingHorizontal: 16,
    paddingVertical:   7,
  },
  retryText: { ...typography.bodyMedium, fontSize: 13, color: colors.red },

  /* Empty / loading */
  listContent: { paddingBottom: 24 },
  centered:    { paddingVertical: 60, paddingHorizontal: 40, alignItems: 'center' },
  emptyEmoji:  { fontSize: 48, marginBottom: 16 },
  emptyTitle: {
    ...typography.bodyBold,
    fontSize:    16,
    color:       colors.text,
    marginBottom: 8,
    textAlign:   'center',
  },
  emptyText: {
    ...typography.body,
    fontSize:   13,
    color:      colors.muted,
    textAlign:  'center',
    lineHeight: 20,
  },
  loadingText: { ...typography.body, fontSize: 14, color: colors.muted, marginTop: 12 },

  /* Floating payment bar */
  floatingBar: {
    position:         'absolute',
    bottom:           16,
    left:             16,
    right:            16,
    backgroundColor:  colors.surface2,
    borderRadius:     radius.lg,
    flexDirection:    'row',
    alignItems:       'center',
    paddingVertical:  14,
    paddingHorizontal: 18,
    borderWidth:      1,
    borderColor:      colors.glassBorder,
    shadowColor:      colors.red,
    shadowOffset:     { width: 0, height: 4 },
    shadowOpacity:    0.3,
    shadowRadius:     12,
    elevation:        8,
  },
  floatingInfo:  { flex: 1 },
  floatingCount: { ...typography.body, fontSize: 12, color: colors.muted, marginBottom: 2 },
  floatingMonto: { ...typography.display, fontSize: 20, color: colors.text },
  floatingBtn: {
    backgroundColor:   colors.red,
    paddingHorizontal: 20,
    paddingVertical:   10,
    borderRadius:      radius.sm,
    minWidth:          80,
    alignItems:        'center',
  },
  floatingBtnDisabled: { opacity: 0.6 },
  floatingBtnText: { ...typography.bodyBold, color: colors.text, fontSize: 15 },
});
