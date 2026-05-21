import React, { useState } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
  Alert,
} from "react-native"
import { StatusBar } from "expo-status-bar"
import { useAuth } from "../../context/AuthContext"

export function LoginScreen() {
  const { login } = useAuth()

  const [email, setEmail]       = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)

  async function handleLogin() {
    if (!email.trim() || !password.trim()) {
      setError("Completá todos los campos")
      return
    }
    setError(null)
    setLoading(true)
    const result = await login(email.trim().toLowerCase(), password)
    setLoading(false)
    if (!result.ok) {
      setError(result.error ?? "Credenciales incorrectas")
    }
    // Si ok=true, el AuthContext actualiza `session` y el navigator redirige automáticamente
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo / header */}
        <View style={styles.header}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>RP</Text>
          </View>
          <Text style={styles.clubName}>River Plate</Text>
          <Text style={styles.clubSub}>Santo Tomé</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.title}>Iniciar sesión</Text>
          <Text style={styles.subtitle}>Ingresá con tu cuenta del club</Text>

          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, error ? styles.inputError : null]}
              placeholder="tu@email.com"
              placeholderTextColor="#aaa"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={email}
              onChangeText={(t) => { setEmail(t); setError(null) }}
              editable={!loading}
            />
          </View>

          {/* Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Contraseña</Text>
            <TextInput
              style={[styles.input, error ? styles.inputError : null]}
              placeholder="••••••••"
              placeholderTextColor="#aaa"
              secureTextEntry
              value={password}
              onChangeText={(t) => { setPassword(t); setError(null) }}
              editable={!loading}
              onSubmitEditing={handleLogin}
              returnKeyType="done"
            />
          </View>

          {/* Error */}
          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Botón */}
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.buttonText}>Ingresar</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.helpText}>
            ¿Olvidaste tu contraseña?{" "}
            <Text style={styles.helpLink}>Contactá al administrador</Text>
          </Text>
        </View>

        <Text style={styles.footer}>Club River Plate Santo Tomé © 2025</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const RED = "#DC2626"

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: RED },

  container: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 48,
  },

  header: { alignItems: "center", marginBottom: 32 },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.4)",
  },
  logoText:  { fontSize: 26, fontWeight: "800", color: "#fff" },
  clubName:  { fontSize: 24, fontWeight: "700", color: "#fff" },
  clubSub:   { fontSize: 14, color: "rgba(255,255,255,0.75)", marginTop: 2 },

  card: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  title:    { fontSize: 22, fontWeight: "700", color: "#111", marginBottom: 4 },
  subtitle: { fontSize: 14, color: "#666", marginBottom: 24 },

  inputGroup: { marginBottom: 16 },
  label:  { fontSize: 13, fontWeight: "600", color: "#444", marginBottom: 6 },
  input: {
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#111",
    backgroundColor: "#fafafa",
  },
  inputError: { borderColor: RED },

  errorBox: {
    backgroundColor: "#fef2f2",
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: RED,
  },
  errorText: { color: RED, fontSize: 13, fontWeight: "500" },

  button: {
    backgroundColor: RED,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 4,
    marginBottom: 16,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "700" },

  helpText: { textAlign: "center", fontSize: 13, color: "#888" },
  helpLink: { color: RED, fontWeight: "600" },

  footer: { marginTop: 32, fontSize: 12, color: "rgba(255,255,255,0.5)" },
})
