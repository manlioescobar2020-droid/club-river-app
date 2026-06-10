import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { colors, radius, typography } from '../../theme';

export default function CambiarContrasenaScreen() {
  const { user }   = useAuth();
  const navigation = useNavigation();

  const [passwordActual,    setPasswordActual]    = useState('');
  const [passwordNueva,     setPasswordNueva]     = useState('');
  const [passwordConfirmar, setPasswordConfirmar] = useState('');
  const [loading,           setLoading]           = useState(false);

  const handleGuardar = async () => {
    if (!passwordActual || !passwordNueva || !passwordConfirmar) {
      Alert.alert('Error', 'Completá todos los campos.');
      return;
    }
    if (passwordNueva !== passwordConfirmar) {
      Alert.alert('Error', 'La nueva contraseña no coincide con la confirmación.');
      return;
    }

    setLoading(true);
    try {
      await api.put('/mi-cuenta/password', {
        passwordActual,
        passwordNueva,
      });
      Alert.alert('Listo', 'Contraseña actualizada correctamente.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message ?? 'No se pudo actualizar la contraseña.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.label}>Contraseña actual</Text>
      <TextInput
        style={styles.input}
        secureTextEntry
        value={passwordActual}
        onChangeText={setPasswordActual}
        placeholder="••••••••"
        placeholderTextColor={colors.muted}
        autoCapitalize="none"
      />

      <Text style={styles.label}>Nueva contraseña</Text>
      <TextInput
        style={styles.input}
        secureTextEntry
        value={passwordNueva}
        onChangeText={setPasswordNueva}
        placeholder="••••••••"
        placeholderTextColor={colors.muted}
        autoCapitalize="none"
      />

      <Text style={styles.label}>Confirmar contraseña</Text>
      <TextInput
        style={styles.input}
        secureTextEntry
        value={passwordConfirmar}
        onChangeText={setPasswordConfirmar}
        placeholder="••••••••"
        placeholderTextColor={colors.muted}
        autoCapitalize="none"
      />

      <TouchableOpacity
        style={[styles.btn, loading && styles.btnDisabled]}
        onPress={handleGuardar}
        disabled={loading}
        activeOpacity={0.8}
      >
        {loading
          ? <ActivityIndicator color={colors.text} />
          : <Text style={styles.btnText}>Guardar</Text>
        }
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    padding: 24,
    paddingTop: 32,
  },
  label: {
    ...typography.bodyMedium,
    fontSize: 13,
    color: colors.muted,
    marginBottom: 6,
    marginTop: 16,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.text,
  },
  btn: {
    marginTop: 32,
    backgroundColor: colors.red,
    borderRadius: radius.lg,
    paddingVertical: 16,
    alignItems: 'center',
  },
  btnDisabled: {
    opacity: 0.6,
  },
  btnText: {
    ...typography.bodyBold,
    fontSize: 16,
    color: colors.text,
  },
});
