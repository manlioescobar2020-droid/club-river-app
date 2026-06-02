import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useAlquiler } from '../../context/AlquilerContext';
import { CATEGORIAS_EVENTO } from '../../constants/alquileres';
import ProgressSteps from '../../components/alquileres/ProgressSteps';
import OptionCard from '../../components/alquileres/OptionCard';
import { colors, radius, typography } from '../../theme';
import { CategoriaEvento, labelTipoEspacio, labelDeporte } from '../../types/alquileres';

const STEPS = [
  { number: 1, label: 'Espacio' },
  { number: 2, label: 'Categoría' },
  { number: 3, label: 'Fecha y hora' },
  { number: 4, label: 'Datos' },
];

export default function SeleccionarCategoriaScreen({ navigation }: any) {
  const { state, setCategoriaEvento, setTipoEspacio } = useAlquiler();
  const [selectedCategoria, setSelectedCategoria] = useState<CategoriaEvento | null>(
    state.categoriaEvento
  );

  const getPrecioCategoria = (categoria: CategoriaEvento): number | null => {
    if (!state.tipoEspacio) return null;
    const registro = state.precios.find(
      p => p.tipoEspacio === state.tipoEspacio && p.categoriaEvento === categoria && p.activo
    );
    return registro ? Number(registro.precioPorHora) : null;
  };

  const handleContinuar = () => {
    if (!selectedCategoria) {
      Alert.alert('Atención', 'Por favor seleccioná una categoría de evento');
      return;
    }
    const precioExacto = getPrecioCategoria(selectedCategoria);
    if (precioExacto !== null) {
      setTipoEspacio(state.tipoEspacio!, precioExacto);
    }
    setCategoriaEvento(selectedCategoria);
    navigation.navigate('SeleccionarFechaHora');
  };

  return (
    <View style={styles.container}>
      <ProgressSteps currentStep={2} steps={STEPS} />

      <ScrollView style={styles.content}>
        <Text style={styles.title}>¿Qué tipo de evento es?</Text>
        <Text style={styles.subtitle}>El precio varía según el tipo de evento.</Text>

        {state.tipoEspacio && (
          <View style={styles.resumenPaso1}>
            <Text style={styles.resumenLabel}>Espacio seleccionado</Text>
            <Text style={styles.resumenValor}>
              {labelTipoEspacio(state.tipoEspacio)}
              {state.deporte ? ` — ${labelDeporte(state.deporte)}` : ''}
            </Text>
          </View>
        )}

        <View style={styles.optionsContainer}>
          {CATEGORIAS_EVENTO.map((categoria) => {
            const precio = getPrecioCategoria(categoria.tipo);
            return (
              <OptionCard
                key={categoria.tipo}
                title={categoria.nombre}
                description={categoria.descripcion}
                icon={categoria.icono}
                price={precio ? `$${Math.round(precio).toLocaleString('es-AR')}/h` : undefined}
                selected={selectedCategoria === categoria.tipo}
                onPress={() => setSelectedCategoria(categoria.tipo)}
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
          style={[styles.continueButton, !selectedCategoria && styles.continueButtonDisabled]}
          onPress={handleContinuar}
          disabled={!selectedCategoria}
        >
          <Text style={styles.continueButtonText}>Continuar →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { flex: 1, padding: 20 },
  title: { ...typography.display, fontSize: 22, color: colors.text, marginBottom: 8 },
  subtitle: { ...typography.body, fontSize: 14, color: colors.muted, marginBottom: 16 },
  resumenPaso1: {
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    padding: 14,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: colors.red,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  resumenLabel: { ...typography.body, fontSize: 11, color: colors.muted, marginBottom: 2 },
  resumenValor: { ...typography.bodySemiBold, fontSize: 15, color: colors.text },
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
