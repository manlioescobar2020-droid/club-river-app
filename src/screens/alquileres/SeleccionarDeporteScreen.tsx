import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAlquiler } from '../../context/AlquilerContext';
import { DeporteMultiusos } from '../../types/alquileres';
import { colors, radius, typography } from '../../theme';

interface DeporteCard {
  deporte: DeporteMultiusos;
  titulo: string;
  icono: React.ComponentProps<typeof Ionicons>['name'];
}

const DEPORTES: DeporteCard[] = [
  { deporte: 'BASQUET',      titulo: 'Básquet',          icono: 'basketball-outline' },
  { deporte: 'VOLEY',        titulo: 'Vóley',             icono: 'tennisball-outline' },
  { deporte: 'NEWCOM',       titulo: 'Newcom',            icono: 'disc-outline'       },
  { deporte: 'FUTBOL_SALON', titulo: 'Fútbol de Salón',  icono: 'football-outline'   },
];

export default function SeleccionarDeporteScreen({ navigation }: any) {
  const { setDeporte } = useAlquiler();

  const handleSeleccionar = (deporte: DeporteMultiusos) => {
    setDeporte(deporte);
    navigation.navigate('SeleccionarCategoria');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>¿Para qué deporte?</Text>
        <Text style={styles.headerSubtitle}>Cancha Multiusos</Text>
      </View>

      <View style={styles.section}>
        {DEPORTES.map((card) => (
          <TouchableOpacity
            key={card.deporte}
            style={styles.card}
            onPress={() => handleSeleccionar(card.deporte)}
            activeOpacity={0.75}
          >
            <View style={styles.iconCircle}>
              <Ionicons name={card.icono} size={28} color={colors.red} />
            </View>
            <Text style={styles.cardNombre}>{card.titulo}</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.muted} />
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content:   { paddingBottom: 32 },
  header: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 20 },
  headerTitle:    { ...typography.display, fontSize: 22, color: colors.text, marginBottom: 4 },
  headerSubtitle: { ...typography.body, fontSize: 14, color: colors.muted },
  section: { paddingHorizontal: 16, gap: 12 },
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
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: colors.redDim,
    justifyContent: 'center', alignItems: 'center',
  },
  cardNombre: { ...typography.bodySemiBold, flex: 1, fontSize: 16, color: colors.text },
});
