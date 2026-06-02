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
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { participantesService } from '../../services/participantesService';
import { CategoriaInscripta } from '../../types/participantes';
import { colors, radius, typography } from '../../theme';

function getBarColor(porcentaje: number): string {
  if (porcentaje >= 75) return colors.green;
  if (porcentaje >= 50) return colors.yellow;
  return colors.red;
}

function CategoriaCard({ item }: { item: CategoriaInscripta }) {
  const stats = item.estadisticasAsistencia;
  const porcentaje = stats?.porcentaje ?? 0;

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardTitles}>
          <Text style={styles.categoriaNombre}>{item.categoria.nombre}</Text>
          <Text style={styles.disciplinaNombre}>{item.categoria.disciplina.nombre}</Text>
        </View>
        <View style={[styles.badge, item.activo ? styles.badgeActivo : styles.badgeInactivo]}>
          <Text style={[styles.badgeText, item.activo ? styles.badgeTextoActivo : styles.badgeTextoInactivo]}>
            {item.activo ? 'Activo' : 'Inactivo'}
          </Text>
        </View>
      </View>

      {item.profesor && (
        <View style={styles.profesorRow}>
          <Ionicons name="person-outline" size={14} color={colors.muted} />
          <Text style={styles.profesorText}>
            {item.profesor.nombre} {item.profesor.apellido}
          </Text>
        </View>
      )}

      {stats && (
        <View style={styles.asistenciaContainer}>
          <View style={styles.barraFondo}>
            <View
              style={[
                styles.barraFill,
                { width: `${Math.min(porcentaje, 100)}%` as any, backgroundColor: getBarColor(porcentaje) },
              ]}
            />
          </View>
          <Text style={styles.statsText}>
            {stats.presentes} presentes de {stats.totalClases} clases ({Math.round(porcentaje)}%)
          </Text>
        </View>
      )}
    </View>
  );
}

export default function MisCategoriasScreen() {
  const navigation = useNavigation<any>();
  const [categorias, setCategorias] = useState<CategoriaInscripta[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const data = await participantesService.obtenerMisCategorias();
      setCategorias(data);
    } catch (e: any) {
      setError(
        e.status === 404
          ? 'No se encontró información de participante.'
          : 'No se pudieron cargar las categorías. Intentá de nuevo.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { cargar(); }, [cargar]));

  const renderItem: ListRenderItem<CategoriaInscripta> = ({ item }) => <CategoriaCard item={item} />;

  if (loading) {
    return (
      <SafeAreaView style={styles.centered} edges={['top']}>
        <ActivityIndicator size="large" color={colors.red} />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.centered} edges={['top']}>
        <Ionicons name="alert-circle-outline" size={48} color={colors.muted} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => cargar()}>
          <Text style={styles.retryButtonText}>Reintentar</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Ionicons name="book-outline" size={24} color={colors.red} />
        <Text style={styles.headerTitle}>MIS CATEGORÍAS</Text>
      </View>

      <FlatList
        data={categorias}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={categorias.length === 0 ? styles.emptyContainer : styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => cargar(true)} colors={[colors.red]} tintColor={colors.red} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="book-outline" size={48} color={colors.muted} />
            <Text style={styles.emptyTitle}>Sin inscripciones</Text>
            <Text style={styles.emptySubtitle}>No estás inscripto en ninguna disciplina</Text>
            <TouchableOpacity style={styles.verDisciplinasButton} onPress={() => navigation.navigate('DisciplinasStack')}>
              <Text style={styles.verDisciplinasText}>Ver Disciplinas</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 16, paddingVertical: 14,
    backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  headerTitle: { ...typography.display, fontSize: 18, color: colors.text },
  listContent: { padding: 16, gap: 12 },
  emptyContainer: { flexGrow: 1 },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, gap: 10 },
  emptyTitle: { ...typography.bodySemiBold, fontSize: 18, color: colors.text },
  emptySubtitle: { ...typography.body, fontSize: 14, color: colors.muted, textAlign: 'center' },
  verDisciplinasButton: { backgroundColor: colors.red, paddingHorizontal: 24, paddingVertical: 12, borderRadius: radius.sm, marginTop: 4 },
  verDisciplinasText: { ...typography.bodyBold, color: colors.text, fontSize: 15 },
  errorText: { ...typography.body, fontSize: 15, color: colors.muted, textAlign: 'center', marginTop: 12, marginBottom: 20 },
  retryButton: { borderColor: colors.red, borderWidth: 1, paddingHorizontal: 24, paddingVertical: 10, borderRadius: radius.sm },
  retryButtonText: { ...typography.bodySemiBold, color: colors.red, fontSize: 15 },
  card: {
    backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1,
    borderColor: colors.glassBorder, padding: 16,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  cardTitles: { flex: 1, marginRight: 8 },
  categoriaNombre: { ...typography.bodySemiBold, fontSize: 16, color: colors.text, marginBottom: 2 },
  disciplinaNombre: { ...typography.body, fontSize: 13, color: colors.muted },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill },
  badgeActivo: { backgroundColor: colors.greenDim },
  badgeInactivo: { backgroundColor: colors.surface2 },
  badgeText: { ...typography.bodyBold, fontSize: 12 },
  badgeTextoActivo: { color: colors.green },
  badgeTextoInactivo: { color: colors.muted },
  profesorRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 12 },
  profesorText: { ...typography.body, fontSize: 13, color: colors.muted },
  asistenciaContainer: { marginTop: 8 },
  barraFondo: { height: 8, backgroundColor: colors.border, borderRadius: 4, overflow: 'hidden', marginBottom: 6 },
  barraFill: { height: '100%', borderRadius: 4 },
  statsText: { ...typography.body, fontSize: 12, color: colors.muted },
});
