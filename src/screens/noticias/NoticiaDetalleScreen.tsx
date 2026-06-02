import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  ActivityIndicator,
  Image,
  TouchableOpacity,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import ImageViewing from 'react-native-image-viewing';
import { colors, radius, typography } from '../../theme';
import api from '../../services/api';

interface Autor {
  nombre: string;
  apellido: string;
}

interface GaleriaItem {
  url: string;
  descripcion: string | null;
  orden: number;
}

interface NoticiaDetalle {
  id: number;
  titulo: string;
  subtitulo?: string;
  categoria: string;
  imagenPrincipal?: string | null;
  destacada: boolean;
  fechaPublicacion: string;
  autor: Autor;
  contenido: string;
  galeria: GaleriaItem[];
}

export default function NoticiaDetalleScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { id } = route.params as { id: number; titulo: string };

  const [noticia, setNoticia] = useState<NoticiaDetalle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lightboxVisible, setLightboxVisible] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const fetchNoticia = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get(`/noticias/${id}`);
      setNoticia(data);
      navigation.setOptions({ title: data.titulo });
    } catch (e: any) {
      setError(e.message ?? 'No se pudo cargar la noticia');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNoticia(); }, []);

  const formatFecha = (fecha: string) =>
    new Date(fecha).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.red} />
      </View>
    );
  }

  if (error || !noticia) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error ?? 'No se pudo cargar la noticia'}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchNoticia}>
          <Text style={styles.retryText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const imagenesGaleria = noticia.galeria.map((img) => ({ uri: img.url }));
  const imagenPrincipalArray = noticia.imagenPrincipal ? [{ uri: noticia.imagenPrincipal }] : [];

  return (
    <>
    <ScrollView style={styles.container}>
      {noticia.imagenPrincipal ? (
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => { setLightboxIndex(0); setLightboxVisible(true); }}
        >
          <Image
            source={{ uri: noticia.imagenPrincipal }}
            style={styles.imagen}
            resizeMode="cover"
          />
        </TouchableOpacity>
      ) : (
        <View style={[styles.imagen, styles.imagenFallback]}>
          <Text style={styles.imagenFallbackText}>RIVER PLATE</Text>
        </View>
      )}
      <View style={styles.content}>
        <View style={styles.badgeRow}>
          <View style={styles.categoriaBadge}>
            <Text style={styles.categoriaText}>{noticia.categoria.toUpperCase()}</Text>
          </View>
          {noticia.destacada && (
            <View style={styles.destacadaBadge}>
              <Text style={styles.destacadaText}>★ DESTACADA</Text>
            </View>
          )}
        </View>
        <Text style={styles.titulo}>{noticia.titulo}</Text>
        {!!noticia.subtitulo && (
          <Text style={styles.subtitulo}>{noticia.subtitulo}</Text>
        )}
        <Text style={styles.meta}>
          {formatFecha(noticia.fechaPublicacion)} · {noticia.autor.nombre} {noticia.autor.apellido}
        </Text>
        <View style={styles.separator} />
        <Text style={styles.contenido}>{noticia.contenido}</Text>
        {noticia.galeria.length > 0 && (
          <View style={styles.galeriaSection}>
            <Text style={styles.galeriaTitulo}>Galería de imágenes</Text>
            <FlatList
              data={noticia.galeria}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item, index) => String(item.orden ?? index)}
              renderItem={({ item, index }) => (
                <TouchableOpacity
                  style={styles.galeriaItem}
                  activeOpacity={0.85}
                  onPress={() => { setLightboxIndex(index); setLightboxVisible(true); }}
                >
                  <Image
                    source={{ uri: item.url }}
                    style={styles.galeriaImagen}
                    resizeMode="cover"
                  />
                  {item.descripcion !== null && (
                    <Text style={styles.galeriaDescripcion}>{item.descripcion}</Text>
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        )}
      </View>
    </ScrollView>
    <ImageViewing
      images={imagenesGaleria.length > 0 ? imagenesGaleria : imagenPrincipalArray}
      imageIndex={lightboxIndex}
      visible={lightboxVisible}
      onRequestClose={() => setLightboxVisible(false)}
    />
    </>
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
  imagen: { width: '100%', height: 260 },
  imagenFallback: {
    backgroundColor: colors.surface2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagenFallbackText: { ...typography.display, fontSize: 24, color: colors.muted, letterSpacing: 4 },
  content: { padding: 20 },
  badgeRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  categoriaBadge: {
    backgroundColor: colors.redDim,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  categoriaText: { ...typography.bodySemiBold, fontSize: 11, color: colors.red },
  destacadaBadge: {
    backgroundColor: colors.yellowDim,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  destacadaText: { ...typography.bodySemiBold, fontSize: 11, color: colors.yellow },
  titulo: {
    ...typography.bodySemiBold,
    fontSize: 24,
    color: colors.text,
    marginBottom: 10,
    lineHeight: 32,
  },
  subtitulo: {
    ...typography.body,
    fontSize: 16,
    color: colors.muted,
    lineHeight: 24,
    marginBottom: 12,
  },
  meta: { ...typography.body, fontSize: 13, color: colors.muted, marginBottom: 20 },
  separator: { height: 1, backgroundColor: colors.glassBorder, marginBottom: 20 },
  contenido: { ...typography.body, fontSize: 16, color: colors.text, lineHeight: 26 },
  galeriaSection: { marginTop: 28 },
  galeriaTitulo: {
    ...typography.bodySemiBold,
    fontSize: 16,
    color: colors.text,
    marginBottom: 14,
  },
  galeriaItem: { marginRight: 12 },
  galeriaImagen: {
    width: 200,
    height: 150,
    borderRadius: 8,
    backgroundColor: colors.surface2,
  },
  galeriaDescripcion: {
    ...typography.body,
    fontSize: 12,
    color: colors.muted,
    marginTop: 6,
    width: 200,
  },
});
