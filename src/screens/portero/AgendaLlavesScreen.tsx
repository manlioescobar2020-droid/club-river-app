import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  SectionList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Linking,
  SectionListRenderItem,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import { porteroService } from '../../services/porteroService';
import { AgendaLlaveItem } from '../../types/portero';
import { colors, radius, typography } from '../../theme';
import { extraerHoraMinuto, finInstante } from '../../utils/fechas';

const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

const TIPO_ESPACIO: Record<string, string> = {
  SALON: 'Salón', CANCHA: 'Cancha', SALON_CANCHA: 'Salón + Cancha',
};

const pad = (n: number) => n.toString().padStart(2, '0');

// Día del alquiler: componentes UTC (T00:00Z y T03:00Z caen en el mismo día).
function claveDiaAlquiler(fecha: string): string {
  const d = new Date(fecha);
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

// Hoy / mañana según el reloj local del dispositivo.
function claveDiaLocal(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function tituloDia(clave: string, hoy: string, manana: string): string {
  if (clave === hoy) return 'Hoy';
  if (clave === manana) return 'Mañana';
  const [y, m, d] = clave.split('-').map(Number);
  const diaSemana = DIAS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
  return `${diaSemana} ${pad(d)}/${pad(m)}`;
}

function formatDeporte(deporte: string): string {
  const texto = deporte.replace(/_/g, ' ').toLowerCase();
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function describirEspacio(item: AgendaLlaveItem): string {
  const espacio = TIPO_ESPACIO[item.tipoEspacio] ?? item.tipoEspacio;
  const tieneCancha = item.tipoEspacio === 'CANCHA' || item.tipoEspacio === 'SALON_CANCHA';
  return tieneCancha && item.deporteCancha ? `${espacio} · ${formatDeporte(item.deporteCancha)}` : espacio;
}

interface Grupo {
  title: string;
  esHoy: boolean;
  data: AgendaLlaveItem[];
}

function agrupar(items: AgendaLlaveItem[]): Grupo[] {
  const ahora  = new Date();
  const hoy    = claveDiaLocal(ahora);
  const manana = claveDiaLocal(new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate() + 1));

  const porDia = new Map<string, AgendaLlaveItem[]>();
  for (const item of items) {
    const clave = claveDiaAlquiler(item.fecha);
    if (!porDia.has(clave)) porDia.set(clave, []);
    porDia.get(clave)!.push(item);
  }

  return [...porDia.keys()].sort().map(clave => ({
    title: tituloDia(clave, hoy, manana),
    esHoy: clave === hoy,
    data: porDia.get(clave)!.sort((a, b) =>
      extraerHoraMinuto(a.horaInicio).localeCompare(extraerHoraMinuto(b.horaInicio))),
  }));
}

type Estado = 'ok' | 'sin-acceso' | 'error';

export default function AgendaLlavesScreen() {
  const route = useRoute<any>();
  const alquilerId: string | undefined = route.params?.alquilerId;
  const paramsTs: number | undefined   = route.params?.ts;

  const [items, setItems]           = useState<AgendaLlaveItem[]>([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [estado, setEstado]         = useState<Estado>('ok');

  const listRef       = useRef<SectionList<AgendaLlaveItem, Grupo>>(null);
  const scrolleadoRef = useRef<string | null>(null);

  const cargar = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const data = await porteroService.getAgenda();
      setItems(data);
      setEstado('ok');
    } catch (err: any) {
      setEstado(err?.status === 403 ? 'sin-acceso' : 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { cargar(); }, [cargar]));

  const sections = agrupar(items);

  // Scrollear una vez por apertura (alquilerId + ts) hasta el item resaltado.
  useEffect(() => {
    if (!alquilerId || loading || estado !== 'ok') return;
    const clave = `${alquilerId}-${paramsTs ?? ''}`;
    if (scrolleadoRef.current === clave) return;

    for (let s = 0; s < sections.length; s++) {
      const itemIndex = sections[s].data.findIndex(i => String(i.id) === alquilerId);
      if (itemIndex >= 0) {
        scrolleadoRef.current = clave;
        setTimeout(() => {
          listRef.current?.scrollToLocation({ sectionIndex: s, itemIndex, viewPosition: 0.3, animated: true });
        }, 150);
        return;
      }
    }
  }, [alquilerId, paramsTs, loading, estado, sections]);

  const renderItem: SectionListRenderItem<AgendaLlaveItem, Grupo> = ({ item, section }) => {
    const terminada  = section.esHoy && finInstante(item) < new Date();
    const resaltado  = !!alquilerId && String(item.id) === alquilerId;
    const telefono   = item.clienteTelefono?.trim();

    return (
      <View style={[styles.card, terminada && styles.cardTerminada, resaltado && styles.cardResaltada]}>
        <View style={styles.cardHeader}>
          <Text style={styles.espacio}>{describirEspacio(item)}</Text>
          <View style={styles.horarioRow}>
            <Ionicons name="time-outline" size={14} color={colors.muted} />
            <Text style={styles.horarioText}>
              {extraerHoraMinuto(item.horaInicio)} – {extraerHoraMinuto(item.horaFin)}
            </Text>
          </View>
        </View>

        <View style={styles.clienteRow}>
          <View style={styles.clienteInfo}>
            <Text style={styles.clienteNombre}>{item.clienteNombre}</Text>
            {!!telefono && <Text style={styles.clienteTelefono}>{telefono}</Text>}
          </View>
          {!!telefono && (
            <TouchableOpacity
              style={styles.llamarButton}
              onPress={() => Linking.openURL(`tel:${telefono.replace(/[^\d+]/g, '')}`)}
              activeOpacity={0.75}
            >
              <Ionicons name="call-outline" size={16} color={colors.red} />
              <Text style={styles.llamarText}>Llamar</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  if (loading && !refreshing && items.length === 0 && estado === 'ok') {
    return <View style={styles.centered}><ActivityIndicator size="large" color={colors.red} /></View>;
  }

  if (estado === 'sin-acceso') {
    return (
      <View style={styles.centered}>
        <Ionicons name="lock-closed-outline" size={48} color={colors.muted} />
        <Text style={styles.errorText}>Tu usuario no tiene acceso a la agenda de llaves</Text>
      </View>
    );
  }

  if (estado === 'error') {
    return (
      <View style={styles.centered}>
        <Ionicons name="cloud-offline-outline" size={48} color={colors.muted} />
        <Text style={styles.errorText}>No se pudo cargar la agenda. Revisá tu conexión.</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => cargar()} disabled={loading}>
          {loading
            ? <ActivityIndicator size="small" color={colors.red} />
            : <Text style={styles.retryButtonText}>Reintentar</Text>}
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SectionList
      ref={listRef}
      style={styles.container}
      sections={sections}
      keyExtractor={(item) => String(item.id)}
      renderItem={renderItem}
      renderSectionHeader={({ section }) => (
        <Text style={styles.sectionHeader}>{section.title}</Text>
      )}
      contentContainerStyle={items.length === 0 ? styles.emptyContainer : styles.listContent}
      stickySectionHeadersEnabled={false}
      onScrollToIndexFailed={() => {}}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => cargar(true)} colors={[colors.red]} tintColor={colors.red} />
      }
      ListEmptyComponent={
        <View style={styles.emptyState}>
          <Ionicons name="key-outline" size={48} color={colors.muted} />
          <Text style={styles.emptyTitle}>Sin reservas</Text>
          <Text style={styles.emptySubtitle}>No hay reservas en los próximos 14 días</Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: colors.bg },
  listContent: { padding: 16, gap: 12 },
  emptyContainer: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  emptyState: { alignItems: 'center', gap: 8 },
  emptyTitle: { ...typography.bodySemiBold, fontSize: 18, color: colors.text },
  emptySubtitle: { ...typography.body, fontSize: 14, color: colors.muted, textAlign: 'center' },
  errorText: { ...typography.body, fontSize: 15, color: colors.muted, textAlign: 'center', marginTop: 12, marginBottom: 20 },
  retryButton: { borderColor: colors.red, borderWidth: 1, paddingHorizontal: 24, paddingVertical: 10, borderRadius: radius.sm, minWidth: 130, alignItems: 'center' },
  retryButtonText: { ...typography.bodySemiBold, color: colors.red, fontSize: 15 },
  sectionHeader: {
    ...typography.bodyBold, fontSize: 13, color: colors.muted,
    textTransform: 'uppercase', letterSpacing: 1, marginTop: 4, marginBottom: 2,
  },
  card: {
    backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1,
    borderColor: colors.glassBorder, padding: 16,
  },
  cardTerminada: { opacity: 0.5 },
  cardResaltada: { borderColor: colors.red, borderWidth: 2, backgroundColor: colors.redDim },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10, gap: 8 },
  espacio: { ...typography.bodySemiBold, fontSize: 15, color: colors.text, flex: 1 },
  horarioRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  horarioText: { ...typography.bodySemiBold, fontSize: 14, color: colors.text },
  clienteRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  clienteInfo: { flex: 1 },
  clienteNombre: { ...typography.body, fontSize: 14, color: colors.text },
  clienteTelefono: { ...typography.body, fontSize: 13, color: colors.muted, marginTop: 2 },
  llamarButton: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderColor: colors.red, borderWidth: 1, borderRadius: radius.sm,
    paddingHorizontal: 14, paddingVertical: 8,
  },
  llamarText: { ...typography.bodySemiBold, color: colors.red, fontSize: 14 },
});
