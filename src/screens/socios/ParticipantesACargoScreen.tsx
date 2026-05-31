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
import { ParticipanteACargo } from '../../types/socios';
import { colors, radius, typography } from '../../theme';

function calcularEdad(fechaNacimiento: string): number {
  const today = new Date();
  const birth  = new Date(fechaNacimiento);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

export default function ParticipantesACargoScreen() {
  const [participantes, setParticipantes] = useState<ParticipanteACargo[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const data = await sociosService.obtenerParticipantesACargo();
      setParticipantes(data);
    } catch {
      setError('No se pudieron cargar los participantes. Intentá de nuevo.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { cargar(); }, [cargar]));

  const renderItem: ListRenderItem<ParticipanteACargo> = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.nombre[0]?.toUpperCase()}</Text>
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.nombreCompleto}>{item.nombre} {item.apellido}</Text>
          <Text style={styles.dniEdad}>DNI {item.dni} · {calcularEdad(item.fechaNacimiento)} años</Text>
        </View>
      </View>

      <View style={styles.categoriasList}>
        {item.categorias.length === 0 ? (
          <Text style={styles.sinCategorias}>Sin disciplinas asignadas</Text>
        ) : (
          item.categorias.map((c, idx) => (
            <View key={idx} style={styles.categoriaChip}>
              <Ionicons name="bookmark-outline" size={12} color={colors.red} />
              <Text style={styles.categoriaText}>
                {c.categoria.disciplina.nombre} - {c.categoria.nombre}
              </Text>
            </View>
          ))
        )}
      </View>
    </View>
  );

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
      data={participantes}
      keyExtractor={(item) => String(item.id)}
      renderItem={renderItem}
      contentContainerStyle={participantes.length === 0 ? styles.emptyContainer : styles.listContent}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => cargar(true)} colors={[colors.red]} tintColor={colors.red} />
      }
      ListEmptyComponent={
        <View style={styles.emptyState}>
          <Ionicons name="people-outline" size={48} color={colors.muted} />
          <Text style={styles.emptyTitle}>Sin participantes</Text>
          <Text style={styles.emptySubtitle}>No tenés participantes a cargo</Text>
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
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  avatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: colors.redDim,
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  avatarText: { ...typography.bodyBold, fontSize: 18, color: colors.red },
  headerInfo: { flex: 1 },
  nombreCompleto: { ...typography.bodyBold, fontSize: 16, color: colors.text, marginBottom: 2 },
  dniEdad: { ...typography.body, fontSize: 13, color: colors.muted },
  categoriasList: { gap: 6 },
  categoriaChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: colors.redDim,
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: radius.sm,
  },
  categoriaText: { ...typography.body, fontSize: 13, color: colors.text, flex: 1 },
  sinCategorias: { ...typography.body, fontSize: 13, color: colors.muted, fontStyle: 'italic' },
});
