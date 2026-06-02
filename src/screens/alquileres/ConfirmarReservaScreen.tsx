import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Linking,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAlquiler } from '../../context/AlquilerContext';
import { labelTipoEspacio, labelDeporte } from '../../types/alquileres';
import { alquileresService } from '../../services/alquileresService';
import ProgressSteps from '../../components/alquileres/ProgressSteps';
import { colors, radius, typography } from '../../theme';

const STEPS = [
  { number: 1, label: 'Espacio' },
  { number: 2, label: 'Categoría' },
  { number: 3, label: 'Fecha y hora' },
  { number: 4, label: 'Datos' },
];

export default function ConfirmarReservaScreen({ navigation }: any) {
  const { state, calcularPrecioTotal, resetWizard } = useAlquiler();

  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [aceptaTerminos, setAceptaTerminos] = useState(false);
  const [loading, setLoading] = useState(false);
  const [esperandoPago, setEsperandoPago] = useState(false);
  const [alquilerId, setAlquilerId] = useState<string | null>(null);

  // Refs para evitar leaks y stale closures en el polling
  const esperandoRef  = useRef(false);
  const intervaloRef  = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef    = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (intervaloRef.current) clearInterval(intervaloRef.current);
      if (timeoutRef.current)   clearTimeout(timeoutRef.current);
    };
  }, []);

  const precioTotal = calcularPrecioTotal();

  const horasDuracion = (() => {
    if (!state.horaInicio || !state.horaFin) return 0;
    const inicio = parseInt(state.horaInicio);
    const fin    = parseInt(state.horaFin);
    return fin <= inicio ? (24 - inicio) + fin : fin - inicio;
  })();

  const esHoraDelDiaSiguiente = (horaFin: string | null): boolean =>
    horaFin !== null && parseInt(horaFin.split(':')[0]) <= 7;

  const labelFecha = state.fecha
    ? state.fecha.toLocaleDateString('es-AR', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
      })
    : '';

  const iniciarPollingPago = (id: string) => {
    esperandoRef.current = true;

    intervaloRef.current = setInterval(async () => {
      try {
        const estado = await alquileresService.verificarEstadoAlquiler(id);
        console.log('[POLLING] Estado alquiler', id, ':', estado);
        if (estado === 'PAGADO') {
          clearInterval(intervaloRef.current!);
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
          esperandoRef.current = false;
          setEsperandoPago(false);
          Alert.alert(
            '¡Pago exitoso!',
            'Tu reserva fue confirmada.',
            [{
              text: 'Volver al inicio',
              onPress: () => { resetWizard(); navigation.navigate('AlquileresHome'); },
            }]
          );
        }
      } catch {
        // error puntual — seguir intentando
      }
    }, 3000);

    // Timeout de 5 minutos
    timeoutRef.current = setTimeout(() => {
      clearInterval(intervaloRef.current!);
      if (!esperandoRef.current) return;
      esperandoRef.current = false;
      setEsperandoPago(false);
      Alert.alert(
        'Tiempo agotado',
        'No pudimos verificar tu pago automáticamente. Si completaste el pago, la reserva aparecerá confirmada en breve.',
        [{ text: 'OK', onPress: () => { resetWizard(); navigation.navigate('AlquileresHome'); } }]
      );
    }, 300_000);
  };

  const generarArrayHoras = (inicio: string, fin: string): string[] => {
    const horas: string[] = [];
    const horaInicioNum = parseInt(inicio.split(':')[0]);
    const horaFinNum    = parseInt(fin.split(':')[0]);
    if (horaFinNum <= horaInicioNum) {
      for (let i = horaInicioNum; i <= 23; i++) horas.push(`${i.toString().padStart(2, '0')}:00`);
      for (let i = 0; i < horaFinNum; i++)      horas.push(`${i.toString().padStart(2, '0')}:00`);
    } else {
      for (let i = horaInicioNum; i < horaFinNum; i++) horas.push(`${i.toString().padStart(2, '0')}:00`);
    }
    return horas;
  };

  const handlePagar = async () => {
    console.log('[PAGAR] ========== BTN CLICKED ==========');
    if (esperandoPago || loading) return;

    if (!nombre.trim()) { Alert.alert('Error', 'Por favor ingresá tu nombre y apellido'); return; }
    if (!telefono.trim()) { Alert.alert('Error', 'Por favor ingresá tu teléfono'); return; }
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) { Alert.alert('Error', 'Por favor ingresá un email válido'); return; }
    if (!aceptaTerminos) { Alert.alert('Error', 'Debés aceptar los términos y condiciones'); return; }

    setLoading(true);
    try {
      const horasArray = generarArrayHoras(state.horaInicio!, state.horaFin!);
      console.log('[PAGAR DEBUG] horasArray generado:', horasArray);

      const payload = {
        tipoEspacio:      state.tipoEspacio!,
        ...(state.deporte ? { deporte: state.deporte } : {}),
        categoriaEvento:  state.categoriaEvento!,
        fecha:            state.fecha!.toISOString(),
        horaInicio:       state.horaInicio!,
        horaFin:          state.horaFin!,
        nombreCliente:    nombre.trim(),
        telefonoCliente:  telefono.trim(),
        emailCliente:     email.trim(),
      };
      console.log('[PAGAR DEBUG] Payload completo:', JSON.stringify(payload));

      const response = await alquileresService.crearReserva(payload);
      console.log('[PAGAR DEBUG] Response completa:', JSON.stringify(response));

      if (response.init_point && response.alquilerId) {
        setAlquilerId(response.alquilerId);
        const canOpen = await Linking.canOpenURL(response.init_point);
        if (canOpen) {
          await Linking.openURL(response.init_point);
          setEsperandoPago(true);
          iniciarPollingPago(response.alquilerId);
        } else {
          Alert.alert('Error', 'No se pudo abrir Mercado Pago');
        }
      } else {
        Alert.alert('Error', 'No se pudo generar el link de pago');
      }
    } catch (error: any) {
      console.error('[PAGAR ERROR] Exception:', error);
      Alert.alert('Error', error.message || 'Error al crear la reserva');
    } finally {
      setLoading(false);
    }
  };

  if (esperandoPago) {
    return (
      <View style={styles.container}>
        <ProgressSteps currentStep={4} steps={STEPS} />
        <View style={styles.esperandoContainer}>
          <ActivityIndicator size="large" color={colors.red} />
          <Text style={styles.esperandoTitulo}>Esperando confirmación del pago...</Text>
          <Text style={styles.esperandoSubtitulo}>
            Completá el pago en Mercado Pago y volvé a la app.{'\n'}
            Confirmaremos tu reserva automáticamente.
          </Text>
          <Text style={styles.esperandoId}>Reserva #{alquilerId?.slice(0, 8)}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ProgressSteps currentStep={4} steps={STEPS} />

      <ScrollView style={styles.content}>
        <Text style={styles.title}>Confirmá tu reserva</Text>
        <Text style={styles.subtitle}>Completá tus datos para finalizar.</Text>

        {/* Resumen */}
        <View style={styles.resumenCard}>
          <View style={styles.resumenHeader}>
            <Ionicons name="calendar-outline" size={22} color={colors.red} />
            <Text style={styles.resumenHeaderText}>Resumen de reserva</Text>
          </View>

          {[
            { label: 'Espacio', value: state.tipoEspacio ? `${labelTipoEspacio(state.tipoEspacio)}${state.deporte ? ' — ' + labelDeporte(state.deporte) : ''}` : undefined },
            { label: 'Tipo de evento',   value: state.categoriaEvento },
            { label: 'Fecha',            value: labelFecha },
            { label: 'Hora de inicio',   value: state.horaInicio },
            {
              label: 'Hora de fin',
              value: esHoraDelDiaSiguiente(state.horaFin)
                ? `${state.horaFin} (día siguiente)`
                : state.horaFin,
            },
          ].map(({ label, value }) => (
            <View key={label} style={styles.resumenRow}>
              <Text style={styles.resumenLabel}>{label}</Text>
              <Text style={styles.resumenValue}>{value}</Text>
            </View>
          ))}

          <View style={styles.divider} />

          <View style={styles.resumenRow}>
            <Text style={styles.resumenLabel}>
              {horasDuracion} h × ${state.precioPorHora.toLocaleString('es-AR')}/h
            </Text>
            <Text style={styles.resumenPrecioTotal}>
              ${precioTotal.toLocaleString('es-AR')}
            </Text>
          </View>
        </View>

        {/* Formulario */}
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Datos de contacto</Text>

          {[
            { label: 'Nombre y apellido *', value: nombre, setter: setNombre, placeholder: 'Ej: Juan Pérez', keyboard: 'default' as const },
            { label: 'Teléfono *', value: telefono, setter: setTelefono, placeholder: 'Ej: 3756 123456', keyboard: 'phone-pad' as const },
            { label: 'Email *', value: email, setter: setEmail, placeholder: 'tu@email.com', keyboard: 'email-address' as const },
          ].map(({ label, value, setter, placeholder, keyboard }) => (
            <View key={label} style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{label}</Text>
              <TextInput
                style={styles.input}
                placeholder={placeholder}
                placeholderTextColor={colors.muted}
                value={value}
                onChangeText={setter}
                keyboardType={keyboard}
                autoCapitalize={keyboard === 'email-address' ? 'none' : 'words'}
                editable={!loading}
              />
            </View>
          ))}
        </View>

        {/* Términos */}
        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => setAceptaTerminos(p => !p)}
          disabled={loading}
        >
          <View style={[styles.checkbox, aceptaTerminos && styles.checkboxChecked]}>
            {aceptaTerminos && <Ionicons name="checkmark-outline" size={16} color={colors.text} />}
          </View>
          <Text style={styles.checkboxText}>
            Leí y acepto los{' '}
            <Text style={styles.checkboxLink}>términos y condiciones de alquiler</Text>
          </Text>
        </TouchableOpacity>

        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={20} color={colors.red} />
          <Text style={styles.infoText}>
            Al confirmar aceptás las condiciones de uso de los espacios del Club River Plate.
            El evento debe ser responsable; cualquier daño deberá ser reparado por el cliente.
            No se permite el ingreso de vidrios, objetos de alquiler ni elementos pinchables.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} disabled={loading}>
          <Text style={styles.backButtonText}>← Volver</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.payButton, (loading || esperandoPago) && styles.payButtonDisabled]}
          onPress={handlePagar}
          disabled={loading || esperandoPago}
        >
          {loading || esperandoPago ? (
            <ActivityIndicator color={colors.text} />
          ) : (
            <>
              <Ionicons name="card-outline" size={20} color={colors.text} style={{ marginRight: 8 }} />
              <Text style={styles.payButtonText}>
                Pagar ${precioTotal.toLocaleString('es-AR')}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { flex: 1, padding: 20 },
  title: { ...typography.display, fontSize: 22, color: colors.text, marginBottom: 4 },
  subtitle: { ...typography.body, fontSize: 14, color: colors.muted, marginBottom: 20 },

  resumenCard: { backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.glassBorder, padding: 16, marginBottom: 16 },
  resumenHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  resumenHeaderText: { ...typography.bodySemiBold, fontSize: 16, color: colors.text, marginLeft: 8 },
  resumenRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 7 },
  resumenLabel: { ...typography.body, fontSize: 14, color: colors.muted },
  resumenValue: { ...typography.bodyMedium, fontSize: 14, color: colors.text, textTransform: 'capitalize' },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 10 },
  resumenPrecioTotal: { ...typography.bodyBold, fontSize: 22, color: colors.red },

  formCard: { backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.glassBorder, padding: 16, marginBottom: 16 },
  formTitle: { ...typography.bodySemiBold, fontSize: 16, color: colors.text, marginBottom: 16 },
  inputGroup: { marginBottom: 14 },
  inputLabel: { ...typography.bodyMedium, fontSize: 13, color: colors.muted, marginBottom: 6 },
  input: {
    ...typography.body,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: radius.sm,
    padding: 12,
    fontSize: 15,
    color: colors.text,
    backgroundColor: colors.surface2,
  },

  checkboxContainer: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 14 },
  checkbox: {
    width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: colors.glassBorder,
    justifyContent: 'center', alignItems: 'center', marginRight: 12, marginTop: 1,
  },
  checkboxChecked: { backgroundColor: colors.red, borderColor: colors.red },
  checkboxText: { ...typography.body, flex: 1, fontSize: 13, color: colors.muted, lineHeight: 18 },
  checkboxLink: { color: colors.red, fontWeight: '500' },

  infoBox: {
    flexDirection: 'row',
    backgroundColor: colors.redDim,
    borderRadius: radius.sm,
    padding: 12,
    marginBottom: 24,
  },
  infoText: { ...typography.body, flex: 1, fontSize: 12, color: colors.muted, lineHeight: 18, marginLeft: 8 },

  footer: {
    flexDirection: 'row', padding: 20,
    backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border, gap: 12,
  },
  backButton: { flex: 1, padding: 16, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.glassBorder, alignItems: 'center' },
  backButtonText: { ...typography.bodySemiBold, fontSize: 16, color: colors.muted },
  payButton: {
    flex: 2, flexDirection: 'row', padding: 16,
    borderRadius: radius.sm, backgroundColor: colors.red,
    alignItems: 'center', justifyContent: 'center',
  },
  payButtonDisabled: { opacity: 0.6 },
  payButtonText: { ...typography.bodyBold, fontSize: 16, color: colors.text },

  esperandoContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  esperandoTitulo: { ...typography.bodyBold, fontSize: 18, color: colors.text, textAlign: 'center', marginTop: 24, marginBottom: 12 },
  esperandoSubtitulo: { ...typography.body, fontSize: 14, color: colors.muted, textAlign: 'center', lineHeight: 22 },
  esperandoId: { ...typography.body, fontSize: 12, color: colors.muted, marginTop: 32, fontFamily: 'monospace' },
});
