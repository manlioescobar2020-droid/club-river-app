import React from "react"
import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import { useAuth } from "../../context/AuthContext"

export function HomeScreen() {
  const { session, logout } = useAuth()
  const user = session?.usuario

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>
          Hola, {user?.nombre} {user?.apellido} 👋
        </Text>
        <Text style={styles.rol}>{user?.rol}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Club River Plate</Text>
        <Text style={styles.cardSub}>Santo Tomé · App oficial</Text>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb", padding: 24 },
  header: { marginTop: 16, marginBottom: 24 },
  greeting: { fontSize: 22, fontWeight: "700", color: "#111" },
  rol: { fontSize: 14, color: "#666", marginTop: 4 },

  card: {
    backgroundColor: "#DC2626",
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
  },
  cardTitle: { fontSize: 20, fontWeight: "700", color: "#fff" },
  cardSub: { fontSize: 14, color: "rgba(255,255,255,0.8)", marginTop: 4 },

  logoutBtn: {
    borderWidth: 1.5,
    borderColor: "#DC2626",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
  },
  logoutText: { color: "#DC2626", fontWeight: "600", fontSize: 15 },
})
