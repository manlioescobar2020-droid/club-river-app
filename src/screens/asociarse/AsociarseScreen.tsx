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
  ActivityIndicator,
  Switch,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors, radius, typography } from '../../theme';
import api from '../../services/api';

function validarEmail(email: string): boolean {
  return /\S+@\S+\.\S+/.test(email);
}

function validarDni(dni: string): boolean {
  return /^\d{7,8}$/.test(dni.replace(/\./g, ''));
}

export default function AsociarseScreen() {
  const navigation = useNavigation<any>();

  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [dni, setDni] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [aceptaTerminos, setAceptaTerminos] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enviado, setEnviado] = useState(false);

  const handleEnviar = async () => {
    setError(null);

    if (!nombre.trim() || !apellido.trim()) {
      setError('Completá nombre y apellido');
      return;
    }
    if (!validarDni(dni)) {
      setError('El DNI debe tener 7 u 8 dígitos numéricos');
      return;
    }
    if (!validarEmail(email)) {
      setError('Ingresá un email válido');
      return;
    }
    if (!aceptaTerminos) {
      setError('Debés aceptar los términos');
      return;
    }

    setLoading(true);
    try {
      await api.post('/inscripcion/solicitar', {
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        dni: dni.replace(/\./g, '').trim(),
        email: email.trim().toLowerCase(),
        aceptaTerminos: true,
        ...(telefono.trim() ? { telefono: telefono.trim() } : {}),
      });
      setEnviado(true);
    } catch (e: any) {
      const status = e.status;
      const data = e.data ?? {};
      const campo = (data?.campo ?? data?.field ?? e.message ?? '').toLowerCase();

      if (status === 409) {
        if (campo.includes('dni')) {
          setError('Ya existe un socio registrado con ese DNI');
        } else if (campo.includes('email')) {
          setError('Ya existe una cuenta con ese email');
        } else {
          setError('Ya existe una cuenta con esos datos');
        }
      } else if (status === 400) {
        setError('Completá todos los campos correctamente');
      } else {
        setError('Error al enviar la solicitud. Intentá de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (enviado) {
    return (
      <View style={styles.successContainer}>
        <Ionicons name="checkmark-circle" size={72} color={colors.green} />
        <Text style={styles.successTitle}>¡Solicitud enviada!</Text>
        <Text style={styles.successBody}>
          Tu solicitud fue recibida. El club revisará tus datos y recibirás un email con tus credenciales de acceso cuando sea aprobada.
        </Text>
        <TouchableOpacity
          style={styles.volverBtn}
          onPress={() => navigation.navigate('InicioPublico')}
          activeOpacity={0.8}
        >
          <Text style={styles.volverBtnText}>Volver al inicio</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.kav}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Asociate al club</Text>
          <Text style={styles.infoDesc}>
            Completá el formulario y el equipo del club revisará tu solicitud.
            Recibirás un email con tus credenciales cuando sea aprobada.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Tus datos personales</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Nombre *</Text>
            <TextInput
              style={[styles.input, loading && styles.inputDisabled]}
              value={nombre}
              onChangeText={setNombre}
              placeholder="Ej: Juan"
              placeholderTextColor={colors.muted}
              autoCapitalize="words"
              editable={!loading}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Apellido *</Text>
            <TextInput
              style={[styles.input, loading && styles.inputDisabled]}
              value={apellido}
              onChangeText={setApellido}
              placeholder="Ej: Pérez"
              placeholderTextColor={colors.muted}
              autoCapitalize="words"
              editable={!loading}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>DNI * (7-8 dígitos)</Text>
            <TextInput
              style={[styles.input, loading && styles.inputDisabled]}
              value={dni}
              onChangeText={setDni}
              placeholder="12345678"
              placeholderTextColor={colors.muted}
              keyboardType="numeric"
              editable={!loading}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email *</Text>
            <TextInput
              style={[styles.input, loading && styles.inputDisabled]}
              value={email}
              onChangeText={setEmail}
              placeholder="tu@email.com"
              placeholderTextColor={colors.muted}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Teléfono</Text>
            <TextInput
              style={[styles.input, loading && styles.inputDisabled]}
              value={telefono}
              onChangeText={setTelefono}
              placeholder="Ej: 3756 123456"
              placeholderTextColor={colors.muted}
              keyboardType="phone-pad"
              editable={!loading}
            />
          </View>
        </View>

        <View style={styles.terminosRow}>
          <Switch
            value={aceptaTerminos}
            onValueChange={setAceptaTerminos}
            trackColor={{ false: colors.surface2, true: colors.red }}
            thumbColor={aceptaTerminos ? colors.text : colors.muted}
            disabled={loading}
          />
          <Text style={styles.terminosText}>
            Acepto los términos y condiciones del club
          </Text>
        </View>

        {error && (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle-outline" size={16} color={colors.red} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

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
  infoTitle: { ...typography.bodyBold, fontSize: 16, color: colors.text, marginBottom: 6 },
  infoDesc: { ...typography.body, fontSize: 13, color: colors.muted, lineHeight: 20 },

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
  inputDisabled: { opacity: 0.6 },

  terminosRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    padding: 14,
  },
  terminosText: { ...typography.body, flex: 1, fontSize: 14, color: colors.muted },

  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.redDim,
    borderRadius: radius.sm,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.redDim,
  },
  errorText: { ...typography.body, flex: 1, fontSize: 14, color: colors.red },

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
