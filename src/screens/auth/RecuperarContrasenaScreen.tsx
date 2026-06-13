import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { BASE_URL } from '../../services/api';

export default function RecuperarContrasenaScreen({ navigation }: any) {
  const [email, setEmail]     = useState('');
  const [loading, setLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);

  const handleEnviar = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Ingresá tu email');
      return;
    }
    setLoading(true);
    try {
      await fetch(`${BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      setEnviado(true);
    } catch {
      Alert.alert('Error', 'No se pudo enviar el email. Intentá de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  if (enviado) {
    return (
      <View style={styles.container}>
        <Text style={styles.titulo}>Revisá tu correo</Text>
        <Text style={styles.subtitulo}>
          Si el email {email} está registrado, recibirás un enlace para
          restablecer tu contraseña en los próximos minutos.
        </Text>
        <Text style={styles.hint}>
          El enlace expira en 1 hora. Revisá también spam.
        </Text>
        <TouchableOpacity style={styles.btn} onPress={() => navigation.goBack()}>
          <Text style={styles.btnText}>Volver al inicio de sesión</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Recuperar contraseña</Text>
      <Text style={styles.subtitulo}>
        Ingresá tu email y te enviaremos un enlace para restablecer tu contraseña.
      </Text>
      <TextInput
        style={styles.input}
        placeholder="correo@ejemplo.com"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TouchableOpacity style={styles.btn} onPress={handleEnviar} disabled={loading}>
        {loading
          ? <ActivityIndicator color="white" />
          : <Text style={styles.btnText}>Enviar enlace de recuperación</Text>
        }
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.link}>← Volver al inicio de sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#111',
  },
  subtitulo: {
    fontSize: 15,
    color: '#666',
    marginBottom: 24,
    lineHeight: 22,
  },
  hint: {
    fontSize: 13,
    color: '#999',
    marginBottom: 24,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    marginBottom: 16,
  },
  btn: {
    backgroundColor: '#DC2626',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  btnText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  link: {
    color: '#DC2626',
    textAlign: 'center',
    fontSize: 14,
  },
});
