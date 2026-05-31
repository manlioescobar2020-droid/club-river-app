import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { useAlquiler } from '../../context/AlquilerContext';
import { alquileresService } from '../../services/alquileresService';
import { HORARIOS_DISPONIBLES } from '../../constants/alquileres';
import ProgressSteps from '../../components/alquileres/ProgressSteps';
import { colors, radius, typography } from '../../theme';

LocaleConfig.locales['es'] = {
  monthNames: ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'],
  monthNamesShort: ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'],
  dayNames: ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'],
  dayNamesShort: ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'],
  today: 'Hoy',
};
LocaleConfig.defaultLocale = 'es';

const STEPS = [
  { number: 1, label: 'Espacio' },
  { number: 2, label: 'Categoría' },
  { number: 3, label: 'Fecha y hora' },
  { number: 4, label: 'Datos' },
];

export default function SeleccionarFechaHoraScreen({ navigation }: any) {
  const { state, setFechaHora } = useAlquiler();
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedHoraInicio, setSelectedHoraInicio] = useState<string | null>(null);
  const [selectedHoraFin, setSelectedHoraFin] = useState<string | null>(null);
  const [loadingHorarios, setLoadingHorarios] = useState(false);
  const [horariosOcupados, setHorariosOcupados] = useState<string[]>([]);

  // Usar UTC-3 para que "hoy" siempre refleje la fecha argentina, no la UTC del servidor
  const today = new Date(new Date().getTime() - 3 * 60 * 60 * 1000).toISOString().split('T')[0];

  useEffect(() => {
    if (selectedDate) loadDisponibilidad();
  }, [selectedDate]);

  const loadDisponibilidad = async () => {
    setLoadingHorarios(true);
    try {
      const disponibilidad = await alquileresService.getDisponibilidad(selectedDate, state.tipoEspacio ?? undefined);
      const ocupados = disponibilidad.filter(h => !h.disponible).map(h => h.hora);
      console.log('[HORARIOS DEBUG] Fecha seleccionada:', selectedDate);
      console.log('[HORARIOS DEBUG] Respuesta cruda del backend:', JSON.stringify(disponibilidad));
      console.log('[HORARIOS DEBUG] Ocupados del backend:', ocupados);
      setHorariosOcupados(ocupados);
    } catch {
      setHorariosOcupados([]);
    } finally {
      setLoadingHorarios(false);
    }
  };

  const getArgentinaHour = (): number => {
    // Argentina = UTC-3, sin horario de verano desde 2008
    return ((new Date().getUTCHours() - 3) + 24) % 24;
  };

  const isHorarioPasado = (hora: string): boolean => {
    if (selectedDate !== today) return false;
    return parseInt(hora) <= getArgentinaHour();
  };

  const isDisponible = (hora: string) => !horariosOcupados.includes(hora) && !isHorarioPasado(hora);

  const generarHorasFin = (horaInicio: string): string[] => {
    const horaInicioNum = parseInt(horaInicio.split(':')[0]);
    const opciones: string[] = [];
    for (let i = horaInicioNum + 1; i <= 23; i++) opciones.push(`${i.toString().padStart(2, '0')}:00`);
    // Madrugada del día siguiente (00:00 a 07:00)
    for (let i = 0; i <= 7; i++) opciones.push(`${i.toString().padStart(2, '0')}:00`);
    return opciones;
  };

  const calcularHoras = (inicio: string, fin: string): number => {
    const horaInicio = parseInt(inicio.split(':')[0]);
    const horaFin    = parseInt(fin.split(':')[0]);
    return horaFin <= horaInicio ? (24 - horaInicio) + horaFin : horaFin - horaInicio;
  };

  const esDiaSiguiente = (hora: string): boolean => parseInt(hora.split(':')[0]) <= 7;

  const handleSelectInicio = (hora: string) => {
    if (!isDisponible(hora)) { Alert.alert('No disponible', 'Este horario ya está reservado'); return; }
    setSelectedHoraInicio(hora);
    setSelectedHoraFin(null);
  };

  const horas = selectedHoraInicio && selectedHoraFin ? calcularHoras(selectedHoraInicio, selectedHoraFin) : 0;
  const precioTotal = state.precioPorHora * horas;

  const handleContinuar = () => {
    if (!selectedDate || !selectedHoraInicio || !selectedHoraFin) {
      Alert.alert('Atención', 'Seleccioná fecha, hora de inicio y hora de fin');
      return;
    }
    setFechaHora(new Date(selectedDate + 'T00:00:00'), selectedHoraInicio, selectedHoraFin);
    navigation.navigate('ConfirmarReserva');
  };

  const labelFecha = selectedDate
    ? new Date(selectedDate + 'T00:00:00').toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })
    : '';

  return (
    <View style={styles.container}>
      <ProgressSteps currentStep={3} steps={STEPS} />

      <ScrollView style={styles.content}>
        <Text style={styles.title}>Elegí fecha y hora</Text>
        <Text style={styles.subtitle}>{state.tipoEspacio?.replace('_', ' + ')} • {state.categoriaEvento}</Text>

        <View style={styles.calendarContainer}>
          <Calendar
            minDate={today}
            onDayPress={(day: { dateString: string }) => {
              setSelectedDate(day.dateString);
              setSelectedHoraInicio(null);
              setSelectedHoraFin(null);
            }}
            markedDates={{ [selectedDate]: { selected: true, selectedColor: colors.red } }}
            theme={{
              calendarBackground: colors.surface,
              todayTextColor: colors.red,
              selectedDayBackgroundColor: colors.red,
              arrowColor: colors.red,
              dayTextColor: colors.text,
              textDisabledColor: colors.muted,
              monthTextColor: colors.text,
              textSectionTitleColor: colors.muted,
            }}
          />
        </View>

        {selectedDate && (
          <>
            <Text style={styles.sectionTitle}>{labelFecha}</Text>

            {loadingHorarios ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color={colors.red} />
                <Text style={styles.loadingText}>Cargando disponibilidad...</Text>
              </View>
            ) : (
              <>
                <Text style={styles.horarioLabel}>Hora de inicio</Text>
                <View style={styles.grid}>
                  {HORARIOS_DISPONIBLES.filter(h => !isHorarioPasado(h)).map((hora) => {
                    const libre = isDisponible(hora);
                    const sel = selectedHoraInicio === hora;
                    return (
                      <TouchableOpacity
                        key={`ini-${hora}`}
                        style={[styles.slot, !libre && styles.slotOcupado, sel && styles.slotSelected]}
                        onPress={() => handleSelectInicio(hora)}
                        disabled={!libre}
                      >
                        <Text style={[styles.slotText, !libre && styles.slotTextOcupado, sel && styles.slotTextSelected]}>
                          {hora}
                        </Text>
                        <Text style={[styles.slotSub, sel && styles.slotSubSelected]}>
                          {libre ? 'Libre' : 'Ocupado'}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {selectedHoraInicio && (
                  <>
                    <Text style={styles.horarioLabel}>Hora de fin</Text>
                    <View style={styles.grid}>
                      {generarHorasFin(selectedHoraInicio).map((hora) => {
                        const sel    = selectedHoraFin === hora;
                        const diaSig = esDiaSiguiente(hora);
                        return (
                          <TouchableOpacity
                            key={`fin-${hora}`}
                            style={[styles.slot, sel && styles.slotSelected]}
                            onPress={() => setSelectedHoraFin(hora)}
                          >
                            <Text style={[styles.slotText, sel && styles.slotTextSelected]}>{hora}</Text>
                            <Text style={[styles.slotSub, sel && styles.slotSubSelected]}>
                              {diaSig ? 'día sig.' : ''}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </>
                )}

                {selectedHoraInicio && selectedHoraFin && (
                  <View style={styles.resumenCard}>
                    <View style={styles.resumenRow}>
                      <Text style={styles.resumenLabel}>Duración</Text>
                      <Text style={styles.resumenValor}>{horas} hora{horas !== 1 ? 's' : ''}</Text>
                    </View>
                    <View style={styles.resumenRow}>
                      <Text style={styles.resumenLabel}>Precio estimado</Text>
                      <Text style={styles.resumenPrecio}>${precioTotal.toLocaleString('es-AR')}</Text>
                    </View>
                  </View>
                )}
              </>
            )}
          </>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← Volver</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.continueButton, !(selectedDate && selectedHoraInicio && selectedHoraFin) && styles.continueButtonDisabled]}
          onPress={handleContinuar}
          disabled={!(selectedDate && selectedHoraInicio && selectedHoraFin)}
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
  title: { ...typography.display, fontSize: 22, color: colors.text, marginBottom: 4 },
  subtitle: { ...typography.body, fontSize: 14, color: colors.muted, marginBottom: 20, textTransform: 'capitalize' },
  calendarContainer: { backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.glassBorder, overflow: 'hidden', marginBottom: 24 },
  sectionTitle: { ...typography.bodySemiBold, fontSize: 16, color: colors.text, marginBottom: 16, textTransform: 'capitalize' },
  loadingContainer: { padding: 40, alignItems: 'center' },
  loadingText: { ...typography.body, marginTop: 10, color: colors.muted },
  horarioLabel: { ...typography.bodySemiBold, fontSize: 14, color: colors.muted, marginBottom: 10 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
  slot: {
    width: '18%', paddingVertical: 10,
    backgroundColor: colors.surface, borderRadius: radius.sm,
    borderWidth: 1, borderColor: colors.glassBorder, alignItems: 'center',
  },
  slotOcupado: { backgroundColor: colors.surface2, borderColor: colors.border, opacity: 0.5 },
  slotSelected: { backgroundColor: colors.red, borderColor: colors.red },
  slotText: { ...typography.bodySemiBold, fontSize: 13, color: colors.text },
  slotTextOcupado: { color: colors.muted },
  slotTextSelected: { color: colors.text },
  slotSub: { ...typography.body, fontSize: 9, color: colors.muted, marginTop: 2 },
  slotSubSelected: { color: colors.glassBorder },
  resumenCard: {
    backgroundColor: colors.surface, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.glassBorder,
    padding: 16, marginTop: 4, marginBottom: 20,
  },
  resumenRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  resumenLabel: { ...typography.body, fontSize: 14, color: colors.muted },
  resumenValor: { ...typography.bodySemiBold, fontSize: 16, color: colors.text },
  resumenPrecio: { ...typography.bodyBold, fontSize: 22, color: colors.red },
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
