import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAlquiler } from '../../context/AlquilerContext';
import { alquileresService } from '../../services/alquileresService';
import { TipoEspacio, PrecioAlquiler } from '../../types/alquileres';
import { colors, radius, typography } from '../../theme';

interface DeporteCard {
  icono: React.ComponentProps<typeof Ionicons>['name'];
  nombre: string;
  descripcion: string;
  tipo: TipoEspacio;
}

const DEPORTES: DeporteCard[] = [
  { icono: 'football-outline',   nombre: 'Fútbol',   descripcion: 'Cancha de grass sintético, iluminada',          tipo: 'CANCHA' },
  { icono: 'basketball-outline', nombre: 'Básquet',  descripcion: 'Cancha techada, parquet de madera',             tipo: 'CANCHA' },
  { icono: 'tennisball-outline', nombre: 'Vóley',    descripcion: 'Cancha exterior, césped natural',               tipo: 'CANCHA' },
  { icono: 'business-outline',   nombre: 'Salón',    descripcion: 'Eventos, fiestas y reuniones — hasta 150 personas', tipo: 'SALON' },
];

export default function AlquileresScreen({ navigation }: any) {
  const { setTipoEspacio, setPrecios: savePrecios, resetWizard } = useAlquiler();
  const [precios, setPrecios] = useState<PrecioAlquiler[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    resetWizard();
    loadPrecios();
  }, []);

  const loadPrecios = async () => {
    try {
      const data = await alquileresService.getPrecios();
      savePrecios(data);
      setPrecios(data);
    } catch {
      Alert.alert('Error', 'No se pudieron cargar los precios. Intentá de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const getPrecioBase = (tipo: TipoEspacio): number => {
    const activos = precios.filter(p => p.tipoEspacio === tipo && p.activo);
    if (activos.length === 0) return 0;
    return Math.min(...activos.map(p => Number(p.precioPorHora)));
  };

  const handleSeleccionar = (tipo: TipoEspacio) => {
    setTipoEspacio(tipo, getPrecioBase(tipo));
    navigation.navigate('SeleccionarCategoria');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>RESERVAR</Text>
        <Text style={styles.headerSubtitle}>Elegí tu espacio</Text>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.red} />
        </View>
      ) : (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ESPACIOS DISPONIBLES</Text>

          {DEPORTES.map((deporte) => {
            const precio = getPrecioBase(deporte.tipo);
            return (
              <TouchableOpacity
                key={deporte.nombre}
                onPress={() => handleSeleccionar(deporte.tipo)}
                activeOpacity={0.75}
                style={styles.card}
              >
                <View style={styles.iconCircle}>
                  <Ionicons name={deporte.icono} size={28} color={colors.red} />
                </View>

                <View style={styles.cardInfo}>
                  <Text style={styles.cardNombre}>{deporte.nombre}</Text>
                  <Text style={styles.cardDesc}>{deporte.descripcion}</Text>
                </View>

                <View style={styles.cardRight}>
                  {precio > 0 && (
                    <View style={styles.precioBadge}>
                      <Text style={styles.precioText}>
                        desde ${precio.toLocaleString('es-AR')}/h
                      </Text>
                    </View>
                  )}
                  <Ionicons name="chevron-forward" size={20} color={colors.muted} />
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    paddingBottom: 32,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
  },
  headerTitle: {
    ...typography.display,
    fontSize: 36,
    color: colors.red,
  },
  headerSubtitle: {
    ...typography.body,
    fontSize: 14,
    color: colors.muted,
    marginTop: 2,
  },
  centered: {
    paddingVertical: 80,
    alignItems: 'center',
  },
  section: {
    paddingHorizontal: 16,
    gap: 12,
  },
  sectionTitle: {
    ...typography.display,
    fontSize: 13,
    color: colors.muted,
    letterSpacing: 2,
    marginBottom: 4,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    padding: 16,
    gap: 14,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.redDim,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardInfo: {
    flex: 1,
  },
  cardNombre: {
    ...typography.bodySemiBold,
    fontSize: 16,
    color: colors.text,
    marginBottom: 3,
  },
  cardDesc: {
    ...typography.body,
    fontSize: 13,
    color: colors.muted,
    lineHeight: 18,
  },
  cardRight: {
    alignItems: 'flex-end',
    gap: 6,
  },
  precioBadge: {
    backgroundColor: colors.redDim,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  precioText: {
    ...typography.bodyBold,
    fontSize: 11,
    color: colors.red,
  },
});
