import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Alert,
  ListRenderItem,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { profesoresService } from '../../services/profesoresService';
import { ParticipanteCategoria } from '../../types/profesores';
import { colors, radius, typography } from '../../theme';

function calcularEdad(fechaNacimiento: string): number {
  const hoy = new Date();
  const nac = new Date(fechaNacimiento);
  let edad = hoy.getFullYear() - nac.getFullYear();
  const m = hoy.getMonth() - nac.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) edad--;
  return edad;
}

export default function ParticipantesListaScreen({ route }: any) {
  const { categoriaId, categoriaNombre, disciplinaNombre } = route.params;
  const [participantes, setParticipantes] = useState<ParticipanteCategoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const cargar = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const data = await profesoresService.obtenerParticipantesCategoria(categoriaId);
      setParticipantes(data);
    } catch {
      Alert.alert('Error', 'No se pudieron cargar los participantes');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [categoriaId]);

  useFocusEffect(useCallback(() => { cargar(); }, [cargar]));

  const renderItem: ListRenderItem<ParticipanteCategoria> = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.avatar}>
        <Text style={styles.avatarTexto}>{item.nombre.charAt(0).toUpperCase()}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.nombre}>{item.nombre} {item.apellido}</Text>
        <Text style={styles.detalle}>DNI: {item.dni}</Text>
        <Text style={styles.detalle}>{calcularEdad(item.fechaNacimiento)} años</Text>
      </View>
    </View>
  );

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
      data={participantes}
      renderItem={renderItem}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={participantes.length === 0 ? styles.emptyContainer : styles.lista}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => cargar(true)} colors={[colors.red]} tintColor={colors.red} />
      }
      ListHeaderComponent={
        <View style={styles.header}>
          <Text style={styles.headerTitulo}>{categoriaNombre}</Text>
          <Text style={styles.headerSubtitulo}>{disciplinaNombre}</Text>
        </View>
      }
      ListEmptyComponent={
        <View style={styles.emptyState}>
          <Text style={styles.emptyTexto}>Esta categoría no tiene participantes</Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg },
  header: {
    backgroundColor: colors.surface, padding: 16, marginBottom: 8,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  headerTitulo: { ...typography.bodyBold, fontSize: 20, color: colors.text, marginBottom: 4 },
  headerSubtitulo: { ...typography.body, fontSize: 14, color: colors.muted },
  lista: { padding: 16, gap: 12 },
  emptyContainer: { flexGrow: 1 },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  emptyTexto: { ...typography.body, fontSize: 16, color: colors.muted },
  card: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.surface, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.glassBorder, padding: 16,
  },
  avatar: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: colors.redDim,
    justifyContent: 'center', alignItems: 'center', marginRight: 16,
  },
  avatarTexto: { ...typography.bodyBold, color: colors.red, fontSize: 20 },
  info: { flex: 1 },
  nombre: { ...typography.bodySemiBold, fontSize: 16, color: colors.text, marginBottom: 4 },
  detalle: { ...typography.body, fontSize: 14, color: colors.muted },
});
