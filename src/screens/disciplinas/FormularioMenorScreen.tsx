import React, { useState } from 'react';
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
import { Disciplina, InscripcionMenor } from '../../types/disciplinas';
import { disciplinasService } from '../../services/disciplinasService';
import { colors, radius, typography } from '../../theme';

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

export default function FormularioMenorScreen({ route, navigation }: any) {
  const disciplina: Disciplina = route.params.disciplina;

  const [nombreMenor, setNombreMenor] = useState('');
  const [apellidoMenor, setApellidoMenor] = useState('');
  const [dniMenor, setDniMenor] = useState('');
  const [fechaMenor, setFechaMenor] = useState('');

  const [nombreTutor, setNombreTutor] = useState('');
  const [apellidoTutor, setApellidoTutor] = useState('');
  const [dniTutor, setDniTutor] = useState('');
  const [emailTutor, setEmailTutor] = useState('');
  const [telefonoTutor, setTelefonoTutor] = useState('');

  const [loading, setLoading] = useState(false);

  const handleEnviar = async () => {
    if (!nombreMenor.trim() || !apellidoMenor.trim()) {
      Alert.alert('Error', 'Completá el nombre y apellido del menor');
      return;
    }
    if (!validarDni(dniMenor)) {
      Alert.alert('Error', 'El DNI del menor debe tener 7 u 8 dígitos numéricos');
      return;
    }
    const fechaMenorParsed = parseFecha(fechaMenor);
    if (!fechaMenorParsed) {
      Alert.alert('Error', 'Ingresá la fecha de nacimiento del menor en formato DD/MM/AAAA');
      return;
    }
    const edadMenor = calcularEdad(fechaMenorParsed);
    if (edadMenor >= 18) {
      Alert.alert('Error', `La persona tiene ${edadMenor} años. Usá el formulario de mayor de edad.`);
      return;
    }
    if (!nombreTutor.trim() || !apellidoTutor.trim()) {
      Alert.alert('Error', 'Completá el nombre y apellido del tutor');
      return;
    }
    if (!validarDni(dniTutor)) {
      Alert.alert('Error', 'El DNI del tutor debe tener 7 u 8 dígitos numéricos');
      return;
    }
    if (!validarEmail(emailTutor)) {
      Alert.alert('Error', 'Ingresá un email válido para el tutor');
      return;
    }
    if (!telefonoTutor.trim()) {
      Alert.alert('Error', 'El teléfono del tutor es requerido');
      return;
    }

    const payload: InscripcionMenor = {
      menorNombre: nombreMenor.trim(),
      menorApellido: apellidoMenor.trim(),
      menorDni: dniMenor.replace(/\./g, '').trim(),
      menorFechaNacimiento: fechaMenorParsed.toISOString().split('T')[0],
      tutorNombre: nombreTutor.trim(),
      tutorApellido: apellidoTutor.trim(),
      tutorDni: dniTutor.replace(/\./g, '').trim(),
      tutorEmail: emailTutor.trim(),
      ...(telefonoTutor.trim() ? { tutorTelefono: telefonoTutor.trim() } : {}),
    };

    setLoading(true);
    try {
      await disciplinasService.inscribirMenor(payload);
      Alert.alert(
        '¡Inscripción enviada!',
        `La solicitud de inscripción a ${disciplina.nombre} fue enviada correctamente. Nos contactaremos con el tutor a la brevedad.`,
        [{ text: 'Aceptar', onPress: () => navigation.navigate('DisciplinasHome') }]
      );
    } catch (e: any) {
      Alert.alert('Error', e.message || 'No se pudo enviar la inscripción');
    } finally {
      setLoading(false);
    }
  };

  type FieldDef = {
    label: string;
    value: string;
    setter: (v: string) => void;
    placeholder: string;
    keyboard: 'default' | 'email-address' | 'numeric' | 'phone-pad';
    cap: 'none' | 'words';
  };

  const camposMenor: FieldDef[] = [
    { label: 'Nombre *', value: nombreMenor, setter: setNombreMenor, placeholder: 'Ej: Sofía', keyboard: 'default', cap: 'words' },
    { label: 'Apellido *', value: apellidoMenor, setter: setApellidoMenor, placeholder: 'Ej: García', keyboard: 'default', cap: 'words' },
    { label: 'DNI * (7-8 dígitos)', value: dniMenor, setter: setDniMenor, placeholder: '43210987', keyboard: 'numeric', cap: 'none' },
    { label: 'Fecha de nacimiento * (DD/MM/AAAA)', value: fechaMenor, setter: setFechaMenor, placeholder: '15/03/2012', keyboard: 'numeric', cap: 'none' },
  ];

  const camposTutor: FieldDef[] = [
    { label: 'Nombre *', value: nombreTutor, setter: setNombreTutor, placeholder: 'Ej: Carlos', keyboard: 'default', cap: 'words' },
    { label: 'Apellido *', value: apellidoTutor, setter: setApellidoTutor, placeholder: 'Ej: García', keyboard: 'default', cap: 'words' },
    { label: 'DNI * (7-8 dígitos)', value: dniTutor, setter: setDniTutor, placeholder: '25678901', keyboard: 'numeric', cap: 'none' },
    { label: 'Email *', value: emailTutor, setter: setEmailTutor, placeholder: 'tutor@email.com', keyboard: 'email-address', cap: 'none' },
    { label: 'Teléfono *', value: telefonoTutor, setter: setTelefonoTutor, placeholder: 'Ej: 3756 123456', keyboard: 'phone-pad', cap: 'none' },
  ];

  const renderCampos = (campos: FieldDef[]) =>
    campos.map(({ label, value, setter, placeholder, keyboard, cap }) => (
      <View key={label} style={styles.inputGroup}>
        <Text style={styles.inputLabel}>{label}</Text>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={setter}
          placeholder={placeholder}
          placeholderTextColor={colors.muted}
          keyboardType={keyboard}
          autoCapitalize={cap}
          editable={!loading}
        />
      </View>
    ));

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
          <Text style={styles.cardTitle}>Datos del menor</Text>
          {renderCampos(camposMenor)}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Datos del tutor responsable</Text>
          {renderCampos(camposTutor)}
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
  enviarBtn: {
    backgroundColor: colors.red,
    borderRadius: radius.md,
    paddingVertical: 16,
    alignItems: 'center',
  },
  enviarBtnDisabled: { opacity: 0.6 },
  enviarBtnText: { ...typography.bodyBold, color: colors.text, fontSize: 16 },
});
