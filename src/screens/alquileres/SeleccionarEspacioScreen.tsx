import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useAlquiler } from '../../context/AlquilerContext';
import { alquileresService } from '../../services/alquileresService';
import { ESPACIOS } from '../../constants/alquileres';
import ProgressSteps from '../../components/alquileres/ProgressSteps';
import OptionCard from '../../components/alquileres/OptionCard';
import { colors, radius, typography } from '../../theme';
import { TipoEspacio, PrecioAlquiler } from '../../types/alquileres';

const STEPS = [
  { number: 1, label: 'Espacio' },
  { number: 2, label: 'Categoría' },
  { number: 3, label: 'Fecha y hora' },
  { number: 4, label: 'Datos' },
];

export default function SeleccionarEspacioScreen({ navigation }: any) {
  const { state, setTipoEspacio } = useAlquiler();
  const [precios, setPrecios] = useState<PrecioAlquiler[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEspacio, setSelectedEspacio] = useState<TipoEspacio | null>(state.tipoEspacio);

  useEffect(() => { loadPrecios(); }, []);

  const loadPrecios = async () => {
    try {
      const data = await alquileresService.getPrecios();
      setPrecios(data);
    } catch {
      Alert.alert('Error', 'No se pudieron cargar los precios');
    } finally {
      setLoading(false);
    }
  };

  const getPrecioBase = (tipo: TipoEspacio) => {
    const preciosEspacio = precios.filter(p => p.tipoEspacio === tipo && p.activo);
    if (preciosEspacio.length === 0) return 0;
    return Math.min(...preciosEspacio.map(p => Number(p.precioPorHora)));
  };

  const handleContinuar = () => {
    if (!selectedEspacio) {
      Alert.alert('Atención', 'Por favor seleccioná un espacio');
      return;
    }
    setTipoEspacio(selectedEspacio, getPrecioBase(selectedEspacio));
    navigation.navigate('SeleccionarCategoria');
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.red} />
        <Text style={styles.loadingText}>Cargando espacios...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ProgressSteps currentStep={1} steps={STEPS} />

      <ScrollView style={styles.content}>
        <Text style={styles.title}>¿Qué espacio querés reservar?</Text>
        <Text style={styles.subtitle}>Seleccioná el tipo de espacio para tu evento.</Text>

        <View style={styles.optionsContainer}>
          {ESPACIOS.map((espacio) => {
            const precio = getPrecioBase(espacio.tipo);
            return (
              <OptionCard
                key={espacio.tipo}
                title={espacio.nombre}
                description={espacio.descripcion}
                icon={espacio.icono}
                price={precio > 0 ? `$${precio.toLocaleString('es-AR')}/h` : undefined}
                selected={selectedEspacio === espacio.tipo}
                onPress={() => setSelectedEspacio(espacio.tipo)}
              />
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← Volver</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.continueButton, !selectedEspacio && styles.continueButtonDisabled]}
          onPress={handleContinuar}
          disabled={!selectedEspacio}
        >
          <Text style={styles.continueButtonText}>Continuar →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg },
  loadingText: { ...typography.body, marginTop: 10, fontSize: 16, color: colors.muted },
  content: { flex: 1, padding: 20 },
  title: { ...typography.display, fontSize: 22, color: colors.text, marginBottom: 8 },
  subtitle: { ...typography.body, fontSize: 14, color: colors.muted, marginBottom: 24 },
  optionsContainer: { marginBottom: 20 },
  footer: {
    flexDirection: 'row', padding: 20,
    backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border, gap: 12,
  },
  backButton: { flex: 1, padding: 16, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.glassBorder, alignItems: 'center' },
  backButtonText: { ...typography.bodySemiBold, fontSize: 16, color: colors.muted },
  continueButton: { flex: 2, padding: 16, borderRadius: radius.sm, backgroundColor: colors.red, alignItems: 'center' },
  continueButtonDisabled: { opacity: 0.5 },
  continueButtonText: { ...typography.bodyBold, fontSize: 16, color: colors.text },
});
