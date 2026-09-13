import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, radius, typography } from '../../theme';

interface SuccessModalProps {
  visible: boolean;
  titulo: string;
  mensaje: string;
  textoBoton?: string;
  onClose: () => void;
}

export default function SuccessModal({
  visible,
  titulo,
  mensaje,
  textoBoton = 'Volver al inicio',
  onClose,
}: SuccessModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.iconCircle}>
            <Text style={styles.iconCheck}>✓</Text>
          </View>

          <Text style={styles.titulo}>{titulo}</Text>
          <Text style={styles.mensaje}>{mensaje}</Text>

          <TouchableOpacity style={styles.boton} onPress={onClose}>
            <Text style={styles.botonText}>{textoBoton}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: colors.bg,
    borderRadius: radius.lg,
    padding: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.green,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconCheck: {
    color: colors.bg,
    fontSize: 32,
    fontWeight: '700',
  },
  titulo: {
    ...typography.display,
    fontSize: 22,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  mensaje: {
    ...typography.body,
    fontSize: 15,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  boton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: radius.sm,
    backgroundColor: colors.red,
    alignItems: 'center',
  },
  botonText: {
    ...typography.bodyBold,
    fontSize: 16,
    color: colors.text,
  },
});
