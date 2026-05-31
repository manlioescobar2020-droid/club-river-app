import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  ListRenderItem,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import { profesoresService } from '../../services/profesoresService';
import { CategoriaProfesor } from '../../types/profesores';
import { colors, radius, typography } from '../../theme';

export default function MisCategoriasProfesorScreen({ navigation }: any) {
  const [categorias, setCategorias] = useState<CategoriaProfesor[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const cargar = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const data = await profesoresService.obtenerMisCategorias();
      setCategorias(data);
    } catch {
      Alert.alert('Error', 'No se pudieron cargar las categorías');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { cargar(); }, [cargar]));

  const renderItem: ListRenderItem<CategoriaProfesor> = ({ item }) => {
    const cantidad = item._count?.participantes ?? item.participantes.length;
    const cupoMax = item.categoria.cupoMaximo ?? 0;
    const porcentaje = cupoMax > 0 ? (cantidad / cupoMax) * 100 : 0;
    const cupoCompleto = cupoMax > 0 && cantidad >= cupoMax;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.categoriaInfo}>
            <Text style={styles.categoriaNombre}>{item.categoria.nombre}</Text>
            <Text style={styles.disciplinaNombre}>{item.categoria.disciplina.nombre}</Text>
          </View>
          {cupoCompleto && (
            <View style={styles.badgeCompleto}>
              <Text style={styles.badgeTexto}>Completo</Text>
            </View>
          )}
        </View>

        <View style={styles.cupoContainer}>
          <Text style={styles.cupoTexto}>
            {cantidad} de {cupoMax > 0 ? cupoMax : '∞'} participantes
          </Text>
          {cupoMax > 0 && (
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${Math.min(porcentaje, 100)}%` as any }]} />
            </View>
          )}
        </View>

        <TouchableOpacity
          style={styles.botonVerParticipantes}
          onPress={() => navigation.navigate('ParticipantesLista', {
            categoriaId: item.categoria.id,
            categoriaNombre: item.categoria.nombre,
            disciplinaNombre: item.categoria.disciplina.nombre,
          })}
        >
          <Ionicons name="people-outline" size={20} color={colors.red} />
          <Text style={styles.botonVerParticipantesTexto}>Ver participantes</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.red} />
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      data={categorias}
      renderItem={renderItem}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={categorias.length === 0 ? styles.emptyContainer : styles.lista}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => cargar(true)} colors={[colors.red]} tintColor={colors.red} />
      }
      ListEmptyComponent={
        <View style={styles.emptyState}>
          <Ionicons name="book-outline" size={48} color={colors.muted} />
          <Text style={styles.emptyTexto}>No tenés categorías asignadas</Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg },
  lista: { padding: 16, gap: 16 },
  emptyContainer: { flexGrow: 1 },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, gap: 12 },
  emptyTexto: { ...typography.body, fontSize: 16, color: colors.muted, textAlign: 'center' },
  card: {
    backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1,
    borderColor: colors.glassBorder, padding: 16,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  categoriaInfo: { flex: 1 },
  categoriaNombre: { ...typography.bodyBold, fontSize: 18, color: colors.text, marginBottom: 4 },
  disciplinaNombre: { ...typography.body, fontSize: 14, color: colors.muted },
  badgeCompleto: { backgroundColor: colors.redDim, paddingHorizontal: 12, paddingVertical: 4, borderRadius: radius.pill },
  badgeTexto: { ...typography.bodySemiBold, color: colors.red, fontSize: 12 },
  cupoContainer: { marginBottom: 16 },
  cupoTexto: { ...typography.body, fontSize: 14, color: colors.muted, marginBottom: 8 },
  progressBar: { height: 8, backgroundColor: colors.border, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: colors.red },
  botonVerParticipantes: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 12, paddingHorizontal: 16,
    borderRadius: radius.md, borderWidth: 1, borderColor: colors.red, gap: 8,
  },
  botonVerParticipantesTexto: { ...typography.bodySemiBold, color: colors.red, fontSize: 14 },
});
