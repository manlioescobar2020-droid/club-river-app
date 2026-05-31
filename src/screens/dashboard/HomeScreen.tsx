import React from "react"
import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import { useAuth } from "../../context/AuthContext"
import { colors, radius, typography } from "../../theme"

export function HomeScreen() {
  const { user, signOut: logout } = useAuth()

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
  container: { flex: 1, backgroundColor: colors.bg, padding: 24 },
  header: { marginTop: 16, marginBottom: 24 },
  greeting: { ...typography.bodyBold, fontSize: 22, color: colors.text },
  rol: { ...typography.body, fontSize: 14, color: colors.muted, marginTop: 4 },

  card: {
    backgroundColor: colors.red,
    borderRadius: radius.lg,
    padding: 24,
    marginBottom: 24,
  },
  cardTitle: { ...typography.bodyBold, fontSize: 20, color: colors.text },
  cardSub: { ...typography.body, fontSize: 14, color: colors.text, opacity: 0.8, marginTop: 4 },

  logoutBtn: {
    borderWidth: 1.5,
    borderColor: colors.red,
    borderRadius: radius.md,
    padding: 14,
    alignItems: "center",
  },
  logoutText: { ...typography.bodySemiBold, color: colors.red, fontSize: 15 },
})
