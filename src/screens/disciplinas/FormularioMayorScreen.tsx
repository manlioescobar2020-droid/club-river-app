import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Disciplina, InscripcionMayor, InscripcionResultado } from '../../types/disciplinas';
import { disciplinasService } from '../../services/disciplinasService';
import { colors, radius, typography } from '../../theme';

function avisoCuota(resultado: InscripcionResultado | null): string | null {
  if (!resultado) return null;
  if (resultado.cuotaGenerada) return 'Se generó tu primera cuota de este mes.';
  if (resultado.periodoPrueba) return 'Estás en período de prueba: tu primera cuota se genera el mes que viene.';
  return null;
}

function parseFecha(valor: string): Date | null {
  const parts = valor.split('/');
  if (parts.length !== 3) return null;
  const [dd, mm, yyyy] = parts.map(Number);
  if (!dd || !mm || !yyyy || yyyy < 1900) return null;
  const d = new Date(yyyy, mm - 1, dd);
  if (d.getFullYear() !== yyyy || d.getMonth() !== mm - 1 || d.getDate() !== dd) return null;
  return d;
}

function calcularEdad(fechaNac: Date): number {
  const hoy = new Date();
  let edad = hoy.getFullYear() - fechaNac.getFullYear();
  const m = hoy.getMonth() - fechaNac.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < fechaNac.getDate())) edad--;
  return edad;
}

function validarDni(dni: string): boolean {
  return /^\d{7,8}$/.test(dni.replace(/\./g, ''));
}

function validarEmail(email: string): boolean {
  return /\S+@\S+\.\S+/.test(email);
}

interface Campo {
  label: string;
  value: string;
  setter: (v: string) => void;
  placeholder: string;
  keyboard: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  requerido: boolean;
  autoCapitalize?: 'none' | 'words';
}

export default function FormularioMayorScreen({ route, navigation }: any) {
  const disciplina: Disciplina = route.params.disciplina;

  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [dni, setDni] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [dd, setDd] = useState('');
  const [mm, setMm] = useState('');
  const [aaaa, setAaaa] = useState('');
  const [loading, setLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [resultado, setResultado] = useState<InscripcionResultado | null>(null);

  const mmRef = useRef<TextInput>(null);
  const aaaaRef = useRef<TextInput>(null);

  const campos: Campo[] = [
    { label: 'Nombre *', value: nombre, setter: setNombre, placeholder: 'Ej: Juan', keyboard: 'default', requerido: true, autoCapitalize: 'words' },
    { label: 'Apellido *', value: apellido, setter: setApellido, placeholder: 'Ej: Pérez', keyboard: 'default', requerido: true, autoCapitalize: 'words' },
    { label: 'DNI * (7-8 dígitos)', value: dni, setter: setDni, placeholder: '12345678', keyboard: 'numeric', requerido: true },
    { label: 'Email *', value: email, setter: setEmail, placeholder: 'tu@email.com', keyboard: 'email-address', requerido: true, autoCapitalize: 'none' },
    { label: 'Teléfono', value: telefono, setter: setTelefono, placeholder: 'Ej: 3756 123456', keyboard: 'phone-pad', requerido: false },
  ];

  const handleEnviar = async () => {
    if (!nombre.trim() || !apellido.trim()) {
      Alert.alert('Error', 'Completá nombre y apellido');
      return;
    }
    if (!validarDni(dni)) {
      Alert.alert('Error', 'El DNI debe tener 7 u 8 dígitos numéricos');
      return;
    }
    if (!validarEmail(email)) {
      Alert.alert('Error', 'Ingresá un email válido');
      return;
    }
    const fechaStr = `${dd}/${mm}/${aaaa}`;
    const fechaParsed = parseFecha(fechaStr);
    if (!fechaParsed) {
      Alert.alert('Error', 'Ingresá una fecha de nacimiento válida');
      return;
    }
    const edad = calcularEdad(fechaParsed);
    if (edad < 18) {
      Alert.alert('Error', `Tu edad (${edad} años) no cumple el mínimo de 18 años para este formulario`);
      return;
    }

    const payload: InscripcionMayor = {
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      dni: dni.replace(/\./g, '').trim(),
      email: email.trim(),
      aceptaTerminos: true,
      ...(telefono.trim() ? { telefono: telefono.trim() } : {}),
    };

    setLoading(true);
    try {
      const data = await disciplinasService.inscribirMayor(payload);
      setResultado(data);
      setEnviado(true);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'No se pudo enviar la inscripción');
    } finally {
      setLoading(false);
    }
  };

  if (enviado) {
    const aviso = avisoCuota(resultado);
    return (
      <View style={styles.successContainer}>
        <Ionicons name="checkmark-circle" size={72} color={colors.green} />
        <Text style={styles.successTitle}>¡Inscripción enviada!</Text>
        <Text style={styles.successBody}>
          Tu solicitud de inscripción a {disciplina.nombre} fue enviada correctamente. Nos contactaremos pronto.
        </Text>
        {aviso && (
          <View style={styles.avisoBox}>
            <Text style={styles.avisoText}>{aviso}</Text>
          </View>
        )}
        <TouchableOpacity
          style={styles.volverBtn}
          onPress={() => navigation.navigate('DisciplinasHome')}
          activeOpacity={0.8}
        >
          <Text style={styles.volverBtnText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.kav}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content}>
        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>Disciplina seleccionada</Text>
          <Text style={styles.infoNombre}>{disciplina.nombre}</Text>
          <Text style={styles.infoCuota}>
            Cuota: ${disciplina.cuotaMensual.toLocaleString('es-AR')}/mes
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Tus datos personales</Text>

          {campos.map(({ label, value, setter, placeholder, keyboard, autoCapitalize }) => (
            <View key={label} style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{label}</Text>
              <TextInput
                style={styles.input}
                value={value}
                onChangeText={setter}
                placeholder={placeholder}
                placeholderTextColor={colors.muted}
                keyboardType={keyboard}
                autoCapitalize={autoCapitalize ?? 'none'}
                editable={!loading}
              />
            </View>
          ))}

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Fecha de nacimiento *</Text>
            <View style={styles.dateRow}>
              <TextInput
                style={[styles.dateInput, styles.dateInputDD]}
                value={dd}
                onChangeText={(v) => {
                  const clean = v.replace(/\D/g, '').slice(0, 2);
                  setDd(clean);
                  if (clean.length === 2) mmRef.current?.focus();
                }}
                placeholder="DD"
                placeholderTextColor={colors.muted}
                keyboardType="numeric"
                maxLength={2}
                editable={!loading}
                returnKeyType="next"
              />
              <Text style={styles.dateSep}>/</Text>
              <TextInput
                ref={mmRef}
                style={[styles.dateInput, styles.dateInputMM]}
                value={mm}
                onChangeText={(v) => {
                  const clean = v.replace(/\D/g, '').slice(0, 2);
                  setMm(clean);
                  if (clean.length === 2) aaaaRef.current?.focus();
                }}
                placeholder="MM"
                placeholderTextColor={colors.muted}
                keyboardType="numeric"
                maxLength={2}
                editable={!loading}
                returnKeyType="next"
              />
              <Text style={styles.dateSep}>/</Text>
              <TextInput
                ref={aaaaRef}
                style={[styles.dateInput, styles.dateInputAAAA]}
                value={aaaa}
                onChangeText={(v) => {
                  const clean = v.replace(/\D/g, '').slice(0, 4);
                  setAaaa(clean);
                }}
                placeholder="AAAA"
                placeholderTextColor={colors.muted}
                keyboardType="numeric"
                maxLength={4}
                editable={!loading}
                returnKeyType="done"
              />
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.enviarBtn, loading && styles.enviarBtnDisabled]}
          onPress={handleEnviar}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color={colors.text} />
          ) : (
            <Text style={styles.enviarBtnText}>Enviar solicitud</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  kav: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16, gap: 16, paddingBottom: 40 },
  infoBox: {
    borderRadius: radius.md,
    padding: 16,
    backgroundColor: colors.redDim,
    borderLeftWidth: 4,
    borderLeftColor: colors.red,
  },
  infoLabel: { ...typography.body, fontSize: 12, color: colors.muted, marginBottom: 4 },
  infoNombre: { ...typography.bodyBold, fontSize: 18, color: colors.text, marginBottom: 2 },
  infoCuota: { ...typography.bodySemiBold, fontSize: 14, color: colors.green },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    padding: 18,
    gap: 14,
  },
  cardTitle: { ...typography.bodySemiBold, fontSize: 16, color: colors.text, marginBottom: 4 },
  inputGroup: { gap: 6 },
  inputLabel: { ...typography.bodyMedium, fontSize: 13, color: colors.muted },
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
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dateInput: {
    ...typography.body,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: radius.sm,
    padding: 12,
    fontSize: 15,
    color: colors.text,
    backgroundColor: colors.surface2,
    textAlign: 'center',
  },
  dateInputDD: { width: 56 },
  dateInputMM: { width: 56 },
  dateInputAAAA: { width: 80 },
  dateSep: { ...typography.bodyBold, fontSize: 18, color: colors.muted },
  enviarBtn: {
    backgroundColor: colors.red,
    borderRadius: radius.md,
    paddingVertical: 16,
    alignItems: 'center',
  },
  enviarBtnDisabled: { opacity: 0.6 },
  enviarBtnText: { ...typography.bodyBold, color: colors.text, fontSize: 16 },

  successContainer: {
    flex: 1,
    backgroundColor: colors.bg,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    gap: 16,
  },
  successTitle: {
    ...typography.bodyBold,
    fontSize: 26,
    color: colors.text,
    textAlign: 'center',
  },
  successBody: {
    ...typography.body,
    fontSize: 15,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 24,
  },
  avisoBox: {
    borderRadius: radius.md,
    padding: 14,
    backgroundColor: colors.redDim,
    borderLeftWidth: 4,
    borderLeftColor: colors.red,
  },
  avisoText: {
    ...typography.bodyMedium,
    fontSize: 14,
    color: colors.text,
    textAlign: 'center',
  },
  volverBtn: {
    marginTop: 8,
    backgroundColor: colors.red,
    borderRadius: radius.md,
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  volverBtnText: { ...typography.bodyBold, color: colors.text, fontSize: 16 },
});
