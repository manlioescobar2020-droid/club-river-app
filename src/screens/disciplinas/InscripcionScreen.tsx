import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Disciplina } from '../../types/disciplinas';
import { colors, radius, typography } from '../../theme';

export default function InscripcionScreen({ route, navigation }: any) {
  const disciplina: Disciplina = route.params.disciplina;
  const [mostrarCondiciones, setMostrarCondiciones] = useState(false);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.titulo}>{disciplina.nombre}</Text>
        <Text style={styles.pregunta}>¿Sos mayor de 18 años?</Text>
        <Text style={styles.subtitulo}>
          Necesitamos saberlo para completar la inscripción correctamente.
        </Text>

        <TouchableOpacity
          onPress={() => setMostrarCondiciones(true)}
          style={styles.condicionesLink}
          activeOpacity={0.7}
        >
          <Text style={styles.condicionesLinkText}>Leer condiciones de inscripción</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btnMayor}
          onPress={() => navigation.navigate('FormularioMayor', { disciplina })}
          activeOpacity={0.8}
        >
          <Text style={styles.btnMayorText}>Sí, soy mayor</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btnMenor}
          onPress={() => navigation.navigate('FormularioMenor', { disciplina })}
          activeOpacity={0.8}
        >
          <Text style={styles.btnMenorText}>No, soy menor</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={mostrarCondiciones}
        animationType="slide"
        transparent
        onRequestClose={() => setMostrarCondiciones(false)}
      >
        <View style={styles.modalOverlay}>
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitulo}>Condiciones de Inscripción</Text>
              <TouchableOpacity
                onPress={() => setMostrarCondiciones(false)}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <Ionicons name="close-outline" size={24} color={colors.muted} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalScroll}
              contentContainerStyle={styles.modalScrollContent}
              showsVerticalScrollIndicator={false}
            >
              <Seccion titulo="REQUISITOS GENERALES">
                <Item text="Completar formulario con datos personales" />
                <Item text="Presentar DNI (fotocopia)" />
                <Item text="Certificado médico de aptitud física vigente" />
                <Item text="Foto carnet (2 unidades)" />
              </Seccion>
              <Seccion titulo="MENORES DE 18 AÑOS">
                <Item text="Autorización firmada por padre, madre o tutor legal" />
                <Item text="DNI del tutor responsable (fotocopia)" />
                <Item text="Ficha médica actualizada" />
                <Item text="El tutor debe presentarse en secretaría para firmar" />
              </Seccion>
              <Seccion titulo="CUOTAS Y PAGOS">
                <Item text="Primera cuota: se abona al momento de la inscripción" />
                <Item text="Vencimiento: día 10 de cada mes" />
                <Item text="Formas de pago: Mercado Pago o efectivo en secretaría" />
                <Item text="Recargo del 20% por pago fuera de término" />
              </Seccion>
              <Seccion titulo="REGLAMENTO">
                <Item text="Asistencia mínima del 75% para mantener la inscripción activa" />
                <Item text="Obligatorio el uso de indumentaria deportiva adecuada" />
                <Item text="Respetar los horarios y las instalaciones del club" />
                <Item text="Cualquier lesión debe ser comunicada al profesor/coordinador" />
              </Seccion>
              <Seccion titulo="CONTACTO E INFORMACIÓN">
                <Item text="Secretaría: Lunes a Viernes 9:00–12:00 y 16:00–20:00" />
                <Item text="Tel: (03756) XXX-XXXX" />
                <Item text="Email: info@clubriverplate.com.ar" />
              </Seccion>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.btnCerrar}
                onPress={() => setMostrarCondiciones(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.btnCerrarText}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>
      </Modal>
    </View>
  );
}

function Seccion({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <View style={styles.seccion}>
      <Text style={styles.seccionTitulo}>{titulo}</Text>
      {children}
    </View>
  );
}

function Item({ text }: { text: string }) {
  return (
    <View style={styles.itemRow}>
      <Text style={styles.itemBullet}>•</Text>
      <Text style={styles.itemText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  titulo: { ...typography.display, fontSize: 24, color: colors.text, marginBottom: 24, textAlign: 'center' },
  pregunta: { ...typography.bodyBold, fontSize: 20, color: colors.text, marginBottom: 10, textAlign: 'center' },
  subtitulo: { ...typography.body, fontSize: 14, color: colors.muted, textAlign: 'center', lineHeight: 20, marginBottom: 20 },

  condicionesLink: { marginBottom: 28 },
  condicionesLinkText: { ...typography.bodySemiBold, color: colors.red, fontSize: 14, textDecorationLine: 'underline' },

  btnMayor: {
    width: '100%',
    backgroundColor: colors.red,
    borderRadius: radius.md,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 14,
  },
  btnMayorText: { ...typography.bodyBold, color: colors.text, fontSize: 16 },
  btnMenor: {
    width: '100%',
    backgroundColor: 'transparent',
    borderRadius: radius.md,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.red,
  },
  btnMenorText: { ...typography.bodyBold, color: colors.red, fontSize: 16 },

  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    maxHeight: '85%',
    borderTopWidth: 1,
    borderColor: colors.glassBorder,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitulo: { ...typography.bodySemiBold, fontSize: 18, color: colors.text },
  modalScroll: { flex: 1 },
  modalScrollContent: { padding: 20, paddingBottom: 8 },

  seccion: { marginBottom: 20 },
  seccionTitulo: { ...typography.display, fontSize: 12, color: colors.red, letterSpacing: 2, marginBottom: 10 },
  itemRow: { flexDirection: 'row', marginBottom: 6, paddingLeft: 4 },
  itemBullet: { ...typography.bodyBold, fontSize: 14, color: colors.red, marginRight: 8, lineHeight: 20 },
  itemText: { ...typography.body, flex: 1, fontSize: 14, color: colors.muted, lineHeight: 20 },

  modalFooter: { padding: 16, borderTopWidth: 1, borderTopColor: colors.border },
  btnCerrar: {
    backgroundColor: colors.red,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: 'center',
  },
  btnCerrarText: { ...typography.bodyBold, color: colors.text, fontSize: 16 },
});
