import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Image,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, radius, typography } from '../../theme';
import api from '../../services/api';

interface Autor {
  nombre: string;
  apellido: string;
}

interface Noticia {
  id: number;
  titulo: string;
  subtitulo?: string;
  categoria: string;
  imagenPrincipal?: string | null;
  destacada: boolean;
  fechaPublicacion: string;
  autor: Autor;
}

export default function NoticiasScreen() {
  const navigation = useNavigation<any>();
  const [noticias, setNoticias] = useState<Noticia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNoticias = useCallback(async (pageNum: number, isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/noticias', { params: { page: pageNum } });
      setNoticias(data.noticias ?? []);
      setTotal(data.total ?? 0);
      setPage(data.page ?? pageNum);
      setPageSize(data.pageSize ?? 10);
    } catch (e: any) {
      setError(e.message ?? 'No se pudieron cargar las noticias');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchNoticias(1); }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchNoticias(1, true);
  };

  const totalPages = pageSize > 0 ? Math.ceil(total / pageSize) : 1;

  const formatFecha = (fecha: string) =>
    new Date(fecha).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

  const renderItem = ({ item }: { item: Noticia }) => (
    <TouchableOpacity
      style={[styles.noticiaCard, item.destacada && styles.noticiaDestacada]}
      onPress={() => navigation.navigate('NoticiaDetalle', { id: item.id, titulo: item.titulo })}
      activeOpacity={0.8}
    >
      {item.imagenPrincipal ? (
        <Image source={{ uri: item.imagenPrincipal }} style={styles.imagen} resizeMode="cover" />
      ) : (
        <View style={[styles.imagen, styles.imagenFallback]}>
          <Text style={styles.imagenFallbackText}>RIVER PLATE</Text>
        </View>
      )}
      <View style={styles.noticiaContent}>
        <View style={styles.badgeRow}>
          <View style={styles.categoriaBadge}>
            <Text style={styles.categoriaText}>{item.categoria.toUpperCase()}</Text>
          </View>
          {item.destacada && (
            <View style={styles.destacadaBadge}>
              <Text style={styles.destacadaText}>★ DESTACADA</Text>
            </View>
          )}
        </View>
        <Text style={styles.titulo}>{item.titulo}</Text>
        {!!item.subtitulo && <Text style={styles.subtitulo}>{item.subtitulo}</Text>}
        <Text style={styles.metaText}>
          {formatFecha(item.fechaPublicacion)} · {item.autor.nombre} {item.autor.apellido}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>NOTICIAS</Text>
      <Text style={styles.headerSubtitle}>Novedades del club</Text>
    </View>
  );

  const renderFooter = () => (
    <View>
      {loading ? (
        <ActivityIndicator color={colors.red} style={styles.inlineLoader} />
      ) : totalPages > 1 ? (
        <View style={styles.pagination}>
          <TouchableOpacity
            style={[styles.pageButton, page <= 1 && styles.pageButtonDisabled]}
            onPress={() => fetchNoticias(page - 1)}
            disabled={page <= 1}
          >
            <Text style={[styles.pageButtonText, page <= 1 && styles.pageButtonTextDisabled]}>
              ← Anterior
            </Text>
          </TouchableOpacity>
          <Text style={styles.pageIndicator}>{page} / {totalPages}</Text>
          <TouchableOpacity
            style={[styles.pageButton, page >= totalPages && styles.pageButtonDisabled]}
            onPress={() => fetchNoticias(page + 1)}
            disabled={page >= totalPages}
          >
            <Text style={[styles.pageButtonText, page >= totalPages && styles.pageButtonTextDisabled]}>
              Siguiente →
            </Text>
          </TouchableOpacity>
        </View>
      ) : null}
      <View style={styles.bottomSpacing} />
    </View>
  );

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No hay noticias disponibles</Text>
      </View>
    );
  };

  if (loading && noticias.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.red} />
        <Text style={styles.loadingText}>Cargando noticias...</Text>
      </View>
    );
  }

  if (error && noticias.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => fetchNoticias(page)}>
          <Text style={styles.retryText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <FlatList
      data={noticias}
      keyExtractor={(item) => String(item.id)}
      renderItem={renderItem}
      ListHeaderComponent={renderHeader}
      ListFooterComponent={renderFooter}
      ListEmptyComponent={renderEmpty}
      style={styles.container}
      contentContainerStyle={noticias.length === 0 ? styles.emptyFlex : undefined}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[colors.red]}
          tintColor={colors.red}
        />
      }
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.bg,
    gap: 12,
  },
  loadingText: { ...typography.body, fontSize: 16, color: colors.muted },
  errorText: {
    ...typography.body,
    fontSize: 16,
    color: colors.muted,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: colors.red,
    borderRadius: radius.pill,
  },
  retryText: { ...typography.bodySemiBold, color: colors.text, fontSize: 14 },
  header: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 20 },
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
  noticiaDestacada: {
    borderColor: colors.red,
    borderWidth: 1.5,
  },
  imagen: { width: '100%', height: 200 },
  imagenFallback: {
    backgroundColor: colors.surface2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagenFallbackText: { ...typography.display, fontSize: 20, color: colors.muted, letterSpacing: 4 },
  noticiaContent: { padding: 16 },
  badgeRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  categoriaBadge: {
    backgroundColor: colors.redDim,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  categoriaText: { ...typography.bodySemiBold, fontSize: 11, color: colors.red },
  destacadaBadge: {
    backgroundColor: colors.yellowDim,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  destacadaText: { ...typography.bodySemiBold, fontSize: 11, color: colors.yellow },
  titulo: { ...typography.bodySemiBold, fontSize: 18, color: colors.text, marginBottom: 6 },
  subtitulo: { ...typography.body, fontSize: 14, color: colors.muted, lineHeight: 20, marginBottom: 8 },
  metaText: { ...typography.body, fontSize: 12, color: colors.muted },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 16,
  },
  pageButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  pageButtonDisabled: { opacity: 0.4 },
  pageButtonText: { ...typography.bodySemiBold, fontSize: 14, color: colors.red },
  pageButtonTextDisabled: { color: colors.muted },
  pageIndicator: { ...typography.body, fontSize: 13, color: colors.muted },
  inlineLoader: { marginVertical: 20 },
  bottomSpacing: { height: 24 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60 },
  emptyText: { ...typography.body, fontSize: 16, color: colors.muted },
  emptyFlex: { flexGrow: 1 },
});
