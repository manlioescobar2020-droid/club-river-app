import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAuth } from '../../context/AuthContext';
import { colors, radius, typography } from '../../theme';
import { waLink, construirOpcionesConsulta } from '../../constants/whatsapp';

const ICONOS: Record<string, keyof typeof Ionicons.glyphMap> = {
  BAJA: 'log-out-outline',
  CUOTA: 'cash-outline',
  BENEFICIOS: 'gift-outline',
  OTRA: 'chatbubble-ellipses-outline',
};

export default function WhatsAppMenuButton() {
  const { user } = useAuth();
  const [visible, setVisible] = useState(false);

  const usuario = user ? { nombre: `${user.nombre} ${user.apellido}`.trim(), dni: null } : null;
  const opciones = construirOpcionesConsulta(usuario);

  function abrirOpcion(texto: string) {
    setVisible(false);
    Linking.openURL(waLink(texto)).catch(() => {});
  }

  return (
    <>
      <TouchableOpacity
        testID="whatsapp-open-btn"
        style={styles.fab}
        onPress={() => setVisible(true)}
        activeOpacity={0.85}
        accessibilityLabel="Consultar por WhatsApp"
      >
        <Ionicons name="logo-whatsapp" size={28} color="#FFFFFF" />
      </TouchableOpacity>

      <Modal visible={visible} animationType="fade" transparent onRequestClose={() => setVisible(false)}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={() => setVisible(false)}
        >
          <TouchableOpacity activeOpacity={1} style={styles.sheet} onPress={() => {}}>
            <Text style={styles.title}>Consultar por WhatsApp</Text>
            {opciones.map((op) => (
              <TouchableOpacity
                key={op.key}
                style={styles.opcion}
                onPress={() => abrirOpcion(op.texto)}
                activeOpacity={0.7}
              >
                <Ionicons name={ICONOS[op.key]} size={20} color={colors.red} />
                <Text style={styles.opcionLabel}>{op.label}</Text>
                <Ionicons name="chevron-forward" size={18} color={colors.muted} />
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.cancelar} onPress={() => setVisible(false)}>
              <Text style={styles.cancelarLabel}>Cancelar</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 60,
    height: 60,
    borderRadius: radius.pill,
    backgroundColor: '#25D366',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9998,
    elevation: 8,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.bg,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 32,
  },
  title: {
    ...typography.bodySemiBold,
    fontSize: 16,
    color: colors.text,
    marginBottom: 12,
  },
  opcion: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  opcionLabel: {
    ...typography.body,
    flex: 1,
    fontSize: 15,
    color: colors.text,
  },
  cancelar: {
    marginTop: 8,
    paddingVertical: 14,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  cancelarLabel: {
    ...typography.bodyMedium,
    fontSize: 15,
    color: colors.muted,
  },
});
