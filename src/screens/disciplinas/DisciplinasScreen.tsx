import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Modal,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Disciplina } from '../../types/disciplinas';
import { disciplinasService } from '../../services/disciplinasService';
import { colors, radius, typography } from '../../theme';

// ─── Config visual por disciplina ─────────────────────────────────────────
type IconName = React.ComponentProps<typeof Ionicons>['name'];

const DISCIPLINAS_CONFIG: Record<string, IconName> = {
  'Básquet':   'basketball-outline',
  'Basquet':   'basketball-outline',
  'Básket':    'basketball-outline',
  'Newcom':    'tennisball-outline',
  'Voleibol':  'tennisball-outline',
  'Voley':     'tennisball-outline',
  'Vóley':     'tennisball-outline',
  'Zumba':     'musical-notes-outline',
  'Fútbol':    'football-outline',
  'Futbol':    'football-outline',
  'Natación':  'water-outline',
  'Tenis':     'tennisball-outline',
  'Atletismo': 'walk-outline',
  'Taekwondo': 'body-outline',
};

function getIcono(nombre: string): IconName {
  return DISCIPLINAS_CONFIG[nombre] ?? 'ribbon-outline';
}

// ─── Card ─────────────────────────────────────────────────────────────────
function DisciplinaCard({ item, onPress }: { item: Disciplina; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.75}>
      <View style={styles.iconCircle}>
        <Ionicons name={getIcono(item.nombre)} size={26} color={colors.red} />
      </View>

      <View style={styles.cardInfo}>
        <Text style={styles.cardNombre}>{item.nombre}</Text>
        {!!item.descripcion && (
          <Text style={styles.cardDesc} numberOfLines={1}>{item.descripcion}</Text>
        )}
        <View style={styles.precioBadge}>
          <Text style={styles.cardPrecio}>
            ${item.cuotaMensual.toLocaleString('es-AR')}/mes
          </Text>
        </View>
      </View>

      <View style={styles.inscribirseBtn}>
        <Text style={styles.inscribirseBtnText}>Inscribirse</Text>
        <Ionicons name="arrow-forward-outline" size={14} color={colors.red} />
      </View>
    </TouchableOpacity>
  );
}

// ─── Helpers condiciones ───────────────────────────────────────────────────
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

// ─── Pantalla principal ────────────────────────────────────────────────────
export default function DisciplinasScreen({ navigation }: any) {
  const [disciplinas, setDisciplinas]               = useState<Disciplina[]>([]);
  const [loading, setLoading]                       = useState(true);
  const [refreshing, setRefreshing]                 = useState(false);
  const [error, setError]                           = useState<string | null>(null);
  const [disciplinaSeleccionada, setDisciplinaSeleccionada] = useState<Disciplina | null>(null);
  const [mostrarEdadDialog, setMostrarEdadDialog]   = useState(false);
  const [mostrarCondiciones, setMostrarCondiciones] = useState(false);

  const cargar = useCallback(async () => {
    setError(null);
    try {
      const data = await disciplinasService.obtenerDisciplinas();
      setDisciplinas(data.filter((d) => d.activa));
    } catch (e: any) {
      setError(e.message || 'No se pudieron cargar las disciplinas');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const onRefresh = () => { setRefreshing(true); cargar(); };

  const handleInscribirse = (disciplina: Disciplina) => {
    setDisciplinaSeleccionada(disciplina);
    setMostrarEdadDialog(true);
  };

  const cerrarEdadDialog = () => {
    setMostrarEdadDialog(false);
    setDisciplinaSeleccionada(null);
  };

  const handleMayor = () => {
    setMostrarEdadDialog(false);
    navigation.navigate('FormularioMayor', { disciplina: disciplinaSeleccionada });
  };

  const handleMenor = () => {
    setMostrarEdadDialog(false);
    navigation.navigate('FormularioMenor', { disciplina: disciplinaSeleccionada });
  };

  if (loading) {
    return (
      <View style={styles.fullCenter}>
        <ActivityIndicator size="large" color={colors.red} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>DEPORTES</Text>
        </View>
        <View style={styles.fullCenter}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={cargar}>
            <Text style={styles.retryBtnText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>DEPORTES</Text>
        <Text style={styles.headerSubtitle}>Inscribite a nuestras actividades</Text>
      </View>

      <FlatList
        data={disciplinas}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.red]}
            tintColor={colors.red}
          />
        }
        ListHeaderComponent={
          <Text style={styles.sectionTitle}>DISCIPLINAS DISPONIBLES</Text>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="ribbon-outline" size={48} color={colors.muted} />
            <Text style={styles.emptyTitle}>Sin disciplinas disponibles</Text>
            <Text style={styles.emptyText}>No hay disciplinas activas en este momento.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <DisciplinaCard item={item} onPress={() => handleInscribirse(item)} />
        )}
      />

      {/* ── Modal: ¿Sos mayor de 18 años? ── */}
      <Modal
        visible={mostrarEdadDialog}
        transparent
        animationType="fade"
        onRequestClose={cerrarEdadDialog}
      >
        <View style={styles.overlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>
              {disciplinaSeleccionada?.nombre ?? 'Inscripción'}
            </Text>
            <Text style={styles.modalSubtitle}>¿Sos mayor de 18 años?</Text>
            <Text style={styles.modalBody}>
              Necesitamos saberlo para completar la inscripción correctamente.
            </Text>

            <TouchableOpacity
              onPress={() => { setMostrarEdadDialog(false); setMostrarCondiciones(true); }}
              style={styles.condicionesLink}
              activeOpacity={0.7}
            >
              <Text style={styles.condicionesLinkText}>Leer condiciones de inscripción</Text>
            </TouchableOpacity>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.btnSecondary} onPress={cerrarEdadDialog}>
                <Text style={styles.btnSecondaryText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnOutline} onPress={handleMenor}>
                <Text style={styles.btnOutlineText}>No, soy menor</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnPrimary} onPress={handleMayor}>
                <Text style={styles.btnPrimaryText}>Sí, soy mayor</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── Modal: Condiciones de inscripción ── */}
      <Modal
        visible={mostrarCondiciones}
        transparent
        animationType="slide"
        onRequestClose={() => { setMostrarCondiciones(false); setMostrarEdadDialog(true); }}
      >
        <View style={styles.overlay}>
          <View style={styles.condicionesBox}>
            <View style={styles.condicionesHeader}>
              <Text style={styles.modalTitle}>Condiciones de Inscripción</Text>
              <TouchableOpacity
                onPress={() => { setMostrarCondiciones(false); setMostrarEdadDialog(true); }}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <Ionicons name="close-outline" size={24} color={colors.muted} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.condicionesScroll}
              contentContainerStyle={styles.condicionesContent}
              showsVerticalScrollIndicator={false}
            >
              <Seccion titulo="REQUISITOS GENERALES">
                <Item text="Completar formulario con datos personales" />
                <Item text="Presentar DNI (fotocopia)" />
                <Item text="Certificado médico de aptitud física vigente" />
                <Item text="2 fotos carnet actualizadas" />
              </Seccion>
              <Seccion titulo="MENORES DE 18 AÑOS">
                <Item text="Autorización firmada por padre, madre o tutor legal" />
                <Item text="DNI del tutor responsable (fotocopia)" />
                <Item text="Ficha médica actualizada" />
                <Item text="Contacto de emergencia obligatorio" />
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
              <Seccion titulo="ATENCIÓN E INFORMACIÓN">
                <Item text="Secretaría: Lunes a Viernes 9:00–12:00 y 16:00–20:00" />
                <Item text="Tel: (03756) XXX-XXXX" />
                <Item text="Email: info@clubriverplate.com.ar" />
              </Seccion>
            </ScrollView>

            <View style={styles.condicionesFooter}>
              <TouchableOpacity
                style={styles.btnPrimary}
                onPress={() => { setMostrarCondiciones(false); setMostrarEdadDialog(true); }}
              >
                <Text style={styles.btnPrimaryText}>Entendido</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ─── Estilos ───────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  fullCenter: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
  },
  headerTitle: {
    ...typography.display,
    fontSize: 36,
    color: colors.red,
  },
  headerSubtitle: {
    ...typography.body,
    fontSize: 14,
    color: colors.muted,
    marginTop: 2,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    gap: 12,
  },
  sectionTitle: {
    ...typography.display,
    fontSize: 13,
    color: colors.muted,
    letterSpacing: 2,
    marginBottom: 4,
  },

  // ── Card ──────────────────────────────────────────────────────────────
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    padding: 16,
    gap: 14,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.redDim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: {
    flex: 1,
    gap: 3,
  },
  cardNombre: {
    ...typography.bodySemiBold,
    fontSize: 16,
    color: colors.text,
  },
  cardDesc: {
    ...typography.body,
    fontSize: 13,
    color: colors.muted,
  },
  precioBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.redDim,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginTop: 4,
  },
  cardPrecio: {
    ...typography.bodyBold,
    fontSize: 11,
    color: colors.red,
  },
  inscribirseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    paddingVertical: 8,
    paddingHorizontal: 10,
    gap: 4,
  },
  inscribirseBtnText: {
    ...typography.bodySemiBold,
    fontSize: 12,
    color: colors.red,
  },

  // ── Empty / Error ──────────────────────────────────────────────────────
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    gap: 10,
  },
  emptyTitle: {
    ...typography.bodySemiBold,
    fontSize: 16,
    color: colors.text,
  },
  emptyText: {
    ...typography.body,
    fontSize: 14,
    color: colors.muted,
    textAlign: 'center',
  },
  errorText: {
    ...typography.body,
    fontSize: 15,
    color: colors.red,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryBtn: {
    backgroundColor: colors.red,
    borderRadius: radius.md,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  retryBtnText: {
    ...typography.bodyBold,
    fontSize: 14,
    color: colors.text,
  },

  // ── Overlay / Modal base ───────────────────────────────────────────────
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalBox: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    padding: 24,
  },
  modalTitle: {
    ...typography.bodySemiBold,
    fontSize: 18,
    color: colors.text,
    marginBottom: 12,
  },
  modalSubtitle: {
    ...typography.bodyBold,
    fontSize: 16,
    color: colors.text,
    marginBottom: 8,
  },
  modalBody: {
    ...typography.body,
    fontSize: 14,
    color: colors.muted,
    lineHeight: 20,
    marginBottom: 16,
  },
  condicionesLink: { marginBottom: 20 },
  condicionesLinkText: {
    ...typography.bodySemiBold,
    fontSize: 14,
    color: colors.red,
    textDecorationLine: 'underline',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
  },
  btnSecondary: { paddingVertical: 10, paddingHorizontal: 14 },
  btnSecondaryText: {
    ...typography.body,
    fontSize: 14,
    color: colors.muted,
  },
  btnOutline: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.red,
  },
  btnOutlineText: {
    ...typography.bodySemiBold,
    fontSize: 14,
    color: colors.red,
  },
  btnPrimary: {
    backgroundColor: colors.red,
    borderRadius: radius.md,
    paddingVertical: 12,
    paddingHorizontal: 18,
    alignItems: 'center',
  },
  btnPrimaryText: {
    ...typography.bodyBold,
    fontSize: 14,
    color: colors.text,
  },

  // ── Modal condiciones ──────────────────────────────────────────────────
  condicionesBox: {
    width: '100%',
    maxHeight: '85%',
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    overflow: 'hidden',
  },
  condicionesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  condicionesScroll: { flex: 1 },
  condicionesContent: { padding: 20 },
  condicionesFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },

  // ── Secciones condiciones ──────────────────────────────────────────────
  seccion: { marginBottom: 20 },
  seccionTitulo: {
    ...typography.display,
    fontSize: 12,
    color: colors.red,
    letterSpacing: 2,
    marginBottom: 10,
  },
  itemRow: { flexDirection: 'row', marginBottom: 6, paddingLeft: 4 },
  itemBullet: {
    ...typography.bodyBold,
    fontSize: 13,
    color: colors.red,
    marginRight: 8,
    lineHeight: 20,
  },
  itemText: {
    ...typography.body,
    flex: 1,
    fontSize: 13,
    color: colors.muted,
    lineHeight: 20,
  },
});
