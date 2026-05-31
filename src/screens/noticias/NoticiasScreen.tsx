import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Image,
  TouchableOpacity,
} from 'react-native';
import { colors, radius, typography } from '../../theme';

interface Noticia {
  id: number;
  titulo: string;
  contenido: string;
  fecha: string;
  imagen?: string;
}

export default function NoticiasScreen() {
  const [noticias, setNoticias] = useState<Noticia[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadNoticias = async () => {
    try {
      // Por ahora noticias mock - luego conectar al endpoint real
      const mockNoticias: Noticia[] = [
        { id: 1, titulo: 'Torneo de Básquet 2026', contenido: 'Se viene el torneo anual de básquet. ¡Inscribite ya!', fecha: new Date().toISOString() },
        { id: 2, titulo: 'Nuevas Instalaciones', contenido: 'Estrenamos cancha de voleibol renovada.', fecha: new Date().toISOString() },
        { id: 3, titulo: 'Clases de Zumba', contenido: 'Nuevos horarios disponibles para clases de zumba.', fecha: new Date().toISOString() },
      ];
      setNoticias(mockNoticias);
      // Cuando tengas el endpoint real:
      // const response = await api.get('/noticias');
      // setNoticias(response.data);
    } catch (error: any) {
      console.error('[NOTICIAS] Error:', error);
      Alert.alert('Error', 'No se pudieron cargar las noticias');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadNoticias(); }, []);

  const onRefresh = () => { setRefreshing(true); loadNoticias(); };

  const formatFecha = (fecha: string) =>
    new Date(fecha).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' });

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.red} />
        <Text style={styles.loadingText}>Cargando noticias...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.red]} tintColor={colors.red} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>NOTICIAS</Text>
        <Text style={styles.headerSubtitle}>Novedades del club</Text>
      </View>

      {noticias.map((noticia) => (
        <TouchableOpacity key={noticia.id} style={styles.noticiaCard}>
          {noticia.imagen && (
            <Image source={{ uri: noticia.imagen }} style={styles.imagen} />
          )}
          <View style={styles.noticiaContent}>
            <Text style={styles.titulo}>{noticia.titulo}</Text>
            <Text style={styles.fecha}>{formatFecha(noticia.fecha)}</Text>
            <Text style={styles.contenido} numberOfLines={3}>{noticia.contenido}</Text>
            <TouchableOpacity style={styles.leerMasButton}>
              <Text style={styles.leerMasText}>Leer más →</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg },
  loadingText: { ...typography.body, marginTop: 10, fontSize: 16, color: colors.muted },
  header: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
  },
  headerTitle: { ...typography.display, fontSize: 36, color: colors.red },
  headerSubtitle: { ...typography.body, fontSize: 14, color: colors.muted, marginTop: 2 },
  noticiaCard: {
    backgroundColor: colors.surface,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    overflow: 'hidden',
  },
  imagen: { width: '100%', height: 200, backgroundColor: colors.surface2 },
  noticiaContent: { padding: 16 },
  titulo: { ...typography.bodySemiBold, fontSize: 18, color: colors.text, marginBottom: 5 },
  fecha: { ...typography.body, fontSize: 12, color: colors.muted, marginBottom: 10 },
  contenido: { ...typography.body, fontSize: 14, color: colors.muted, lineHeight: 20, marginBottom: 10 },
  leerMasButton: { alignSelf: 'flex-start' },
  leerMasText: { ...typography.bodySemiBold, color: colors.red, fontSize: 14 },
});
