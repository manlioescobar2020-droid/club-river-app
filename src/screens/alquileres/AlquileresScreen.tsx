import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAlquiler } from '../../context/AlquilerContext';
import { alquileresService } from '../../services/alquileresService';
import { TipoEspacio, PrecioAlquiler } from '../../types/alquileres';
import { colors } from '../../theme';

interface EspacioCard {
  icono: React.ComponentProps<typeof Ionicons>['name'];
  nombre: string;
  descripcion: string;
  tipo: TipoEspacio;
}

const ESPACIOS: EspacioCard[] = [
  { icono: 'football-outline',  nombre: 'Cancha de Fútbol 5', descripcion: 'Cancha exterior de fútbol 5',                   tipo: 'CANCHA_FUTBOL'    },
  { icono: 'basketball-outline', nombre: 'Cancha Multiusos',   descripcion: 'Básquet · Vóley · Newcom · Fútbol de Salón',    tipo: 'CANCHA_MULTIUSOS' },
  { icono: 'business-outline',  nombre: 'Salón de Eventos',   descripcion: 'Salón techado para eventos y reuniones',         tipo: 'SALON'            },
  { icono: 'grid-outline',      nombre: 'Salón + Cancha',     descripcion: 'Todo el predio disponible',                     tipo: 'SALON_CANCHA'     },
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
    if (tipo === 'CANCHA_MULTIUSOS') {
      navigation.navigate('SeleccionarDeporte');
    } else {
      navigation.navigate('SeleccionarCategoria');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Reservar un espacio</Text>
        <Text style={styles.headerSubtitle}>Elegí el espacio para tu evento</Text>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.red} />
        </View>
      ) : (
        <>
          <Text style={styles.sectionTitle}>ESPACIOS DISPONIBLES</Text>

          {ESPACIOS.map((espacio) => {
            const precio = getPrecioBase(espacio.tipo);
            return (
              <TouchableOpacity
                key={espacio.tipo}
                onPress={() => handleSeleccionar(espacio.tipo)}
                activeOpacity={0.75}
                style={styles.card}
              >
                <View style={styles.iconBox}>
                  <Ionicons name={espacio.icono} size={22} color={colors.red} />
                </View>

                <View style={styles.cardInfo}>
                  <Text style={styles.cardNombre} numberOfLines={1}>{espacio.nombre}</Text>
                  <Text style={styles.cardDesc} numberOfLines={1}>{espacio.descripcion}</Text>
                </View>

                <View style={styles.cardRight}>
                  {precio > 0 && (
                    <Text style={styles.precioText}>
                      desde ${precio.toLocaleString('es-AR')}/h
                    </Text>
                  )}
                  <Ionicons name="chevron-forward" size={16} color={colors.muted} />
                </View>
              </TouchableOpacity>
            );
          })}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content:   { paddingBottom: 32 },

  header: {
    backgroundColor:   colors.red,
    paddingHorizontal: 20,
    paddingTop:        52,
    paddingBottom:     20,
  },
  headerTitle: {
    fontSize:    22,
    fontWeight:  '700',
    color:       colors.bg,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color:    colors.bg,
  },

  centered: { paddingVertical: 80, alignItems: 'center' },

  sectionTitle: {
    fontSize:       11,
    fontWeight:     '600',
    color:          colors.muted,
    letterSpacing:  2,
    marginTop:      20,
    marginBottom:   12,
    marginHorizontal: 16,
  },

  card: {
    flexDirection:   'row',
    alignItems:      'center',
    backgroundColor: colors.surface,
    borderRadius:    12,
    marginHorizontal: 16,
    marginBottom:    12,
    padding:         16,
    borderLeftWidth: 4,
    borderLeftColor: colors.red,
  },
  iconBox: {
    width:           44,
    height:          44,
    borderRadius:    10,
    backgroundColor: colors.redDim,
    justifyContent:  'center',
    alignItems:      'center',
  },
  cardInfo: {
    flex:              1,
    marginHorizontal:  12,
  },
  cardNombre: {
    fontSize:   16,
    fontWeight: '700',
    color:      colors.text,
  },
  cardDesc: {
    fontSize:  13,
    color:     colors.muted,
    marginTop: 2,
  },
  cardRight: {
    alignItems: 'flex-end',
    gap:        4,
  },
  precioText: {
    fontSize:   13,
    fontWeight: '600',
    color:      colors.red,
  },
});
