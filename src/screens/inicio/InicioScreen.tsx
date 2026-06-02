import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '../../context/AuthContext';
import cuotasService, { Cuota } from '../../services/cuotasService';
import { disciplinasService } from '../../services/disciplinasService';
import { Disciplina } from '../../types/disciplinas';
import { colors, radius, typography } from '../../theme';

/* ─── Helpers ──────────────────────────────────────────── */

const SPORT_EMOJI: Record<string, string> = {
  futbol: '⚽', fútbol: '⚽',
  tenis: '🎾',
  basquet: '🏀', básquet: '🏀',
  natacion: '🏊', natación: '🏊',
  voley: '🏐', vóley: '🏐',
  handball: '🤾',
  atletismo: '🏃',
  karate: '🥋', judo: '🥋',
  hockey: '🏑',
  rugby: '🏉',
  padel: '🎾', pádel: '🎾',
  yoga: '🧘',
  gimnasia: '🤸',
};

function sportEmoji(nombre: string): string {
  const lower = nombre.toLowerCase();
  for (const [k, v] of Object.entries(SPORT_EMOJI)) {
    if (lower.includes(k)) return v;
  }
  return '🏅';
}

function formatFecha(str: string): string {
  const [yyyy, mm, dd] = str.slice(0, 10).split('-');
  return `${dd}/${mm}/${yyyy}`;
}

const ESTADO_COLOR: Record<string, string> = {
  PENDIENTE: colors.yellow,
  VENCIDA:   colors.redBright,
  PAGADA:    colors.green,
};

/* ─── Animation hook ───────────────────────────────────── */

function useSectionAnim(delay: number) {
  const fade  = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(20)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade,  { toValue: 1, duration: 400, delay, useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 400, delay, useNativeDriver: true }),
    ]).start();
  }, []);
  return { opacity: fade, transform: [{ translateY: slide }] };
}

/* ─── Quick access items ───────────────────────────────── */

type QuickItem = {
  label:     string;
  icon:      React.ComponentProps<typeof Ionicons>['name'];
  highlight: boolean;   // true = fondo rojo (Cuotas)
  route:     string | null;
};

const QUICK: QuickItem[] = [
  { label: 'Cuotas',      icon: 'card-outline',                 highlight: true,  route: 'Cuotas'      },
  { label: 'Alquilar',    icon: 'calendar-outline',             highlight: false, route: 'Alquileres'  },
  { label: 'Disciplinas', icon: 'trophy-outline',               highlight: false, route: 'Disciplinas' },
  { label: 'Asistente',   icon: 'chatbubble-ellipses-outline',  highlight: false, route: null          },
];

/* ─── Screen ───────────────────────────────────────────── */

export default function InicioScreen() {
  const { user }   = useAuth();
  const navigation = useNavigation<any>();
  const insets     = useSafeAreaInsets();

  const [cuota, setCuota]               = useState<Cuota | null>(null);
  const [disciplinas, setDisciplinas]   = useState<Disciplina[]>([]);
  const [loadingDisc, setLoadingDisc]   = useState(true);

  const heroAnim = useSectionAnim(0);
  const gridAnim = useSectionAnim(100);
  const discAnim = useSectionAnim(200);
  const alqAnim  = useSectionAnim(300);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      setLoadingDisc(true);
      disciplinasService.obtenerDisciplinas()
        .then(data => {
          if (!active) return;
          setDisciplinas(data.filter(d => d.activa));
        })
        .catch(() => {})
        .finally(() => { if (active) setLoadingDisc(false); });

      if (user) {
        cuotasService.getCuotas()
          .then(data => {
            if (!active) return;
            const next = data.find(c => c.estado === 'PENDIENTE' || c.estado === 'VENCIDA');
            setCuota(next ?? null);
          })
          .catch(() => {});
      } else {
        setCuota(null);
      }

      return () => { active = false; };
    }, [user])
  );

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >

        {/* ── Sección 1: Hero ──────────────────────────── */}
        <Animated.View style={[styles.section, heroAnim]}>
          <Text style={styles.saludo}>
            {user ? `Bienvenido, ${user.nombre} 👋` : 'Bienvenido 👋'}
          </Text>
          <Text style={styles.heroTitle}>
            RIVER <Text style={styles.heroRed}>PLATE</Text>
          </Text>

          {/* Card roja — siempre visible */}
          <View style={styles.cuotaCard}>
            <View style={styles.cuotaInner}>
              <Text style={styles.cuotaLabel}>TU PRÓXIMO VENCIMIENTO</Text>

              {!user ? (
                <TouchableOpacity
                  style={styles.loginPromptRow}
                  onPress={() => navigation.navigate('Login')}
                  activeOpacity={0.8}
                >
                  <Ionicons name="lock-closed-outline" size={22} color={colors.text} />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.loginPromptTitle}>Iniciá sesión para ver tus cuotas</Text>
                    <Text style={styles.loginPromptSub}>Tocá aquí para acceder →</Text>
                  </View>
                </TouchableOpacity>
              ) : cuota ? (
                <>
                  <Text style={styles.cuotaTitulo}>
                    {cuota.disciplina?.nombre ?? cuota.mesAnio}
                  </Text>
                  <View style={styles.cuotaRow}>
                    <Text style={styles.cuotaMonto}>
                      ${Number(cuota.monto).toLocaleString('es-AR')}
                    </Text>
                    <Text style={styles.cuotaFecha}>
                      Vence: {formatFecha(cuota.fechaVencimiento)}
                    </Text>
                  </View>
                  <View style={styles.cuotaActions}>
                    <TouchableOpacity
                      style={styles.pagarBtn}
                      onPress={() => navigation.navigate('Cuotas')}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.pagarBtnText}>💳 Pagar ahora</Text>
                    </TouchableOpacity>
                    <View style={[
                      styles.estadoBadge,
                      { borderColor: ESTADO_COLOR[cuota.estado] ?? colors.muted },
                    ]}>
                      <Text style={[
                        styles.estadoText,
                        { color: ESTADO_COLOR[cuota.estado] ?? colors.muted },
                      ]}>
                        {cuota.estado}
                      </Text>
                    </View>
                  </View>
                </>
              ) : (
                <Text style={styles.cuotaAlDia}>✅ Sin cuotas pendientes</Text>
              )}
            </View>
          </View>
        </Animated.View>

        {/* ── Sección 2: Accesos rápidos ───────────────── */}
        <Animated.View style={[styles.section, gridAnim]}>
          <Text style={styles.sectionTitle}>ACCESOS RÁPIDOS</Text>
          <View style={styles.quickGrid}>
            {QUICK.map(item => (
              <TouchableOpacity
                key={item.label}
                style={styles.quickItem}
                onPress={() => { if (item.route) navigation.navigate(item.route); }}
                activeOpacity={0.7}
              >
                <View style={[
                  styles.quickIcon,
                  item.highlight ? styles.quickIconHighlight : styles.quickIconDefault,
                ]}>
                  <Ionicons name={item.icon} size={24} color={colors.text} />
                </View>
                <Text style={styles.quickLabel}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* ── Sección 3: Disciplinas ────────────────────── */}
        <Animated.View style={[styles.section, discAnim]}>
          <Text style={styles.sectionTitle}>DISCIPLINAS</Text>

          {loadingDisc ? (
            <ActivityIndicator color={colors.red} style={{ marginVertical: 20 }} />
          ) : disciplinas.length === 0 ? (
            <View style={styles.discEmpty}>
              <Text style={styles.discEmptyText}>Sin disciplinas disponibles</Text>
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.discScroll}
            >
              {disciplinas.map(d => (
                <TouchableOpacity
                  key={d.id}
                  style={styles.discCard}
                  onPress={() => navigation.navigate('Disciplinas')}
                  activeOpacity={0.75}
                >
                  <Text style={styles.discEmoji}>{sportEmoji(d.nombre)}</Text>
                  <Text style={styles.discName} numberOfLines={2}>{d.nombre}</Text>
                  <Text style={styles.discPrecio}>
                    ${d.cuotaMensual.toLocaleString('es-AR')}/mes
                  </Text>
                  <View style={styles.discBadge}>
                    <Text style={styles.discBadgeText}>ACTIVO</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </Animated.View>

        {/* ── Sección 4: Próximo alquiler ───────────────── */}
        <Animated.View style={[styles.section, alqAnim]}>
          <Text style={styles.sectionTitle}>PRÓXIMO ALQUILER</Text>
          <TouchableOpacity
            style={styles.alqCard}
            onPress={() => navigation.navigate('Alquileres')}
            activeOpacity={0.8}
          >
            <View style={styles.alqIconBox}>
              <Ionicons name="calendar-outline" size={26} color={colors.red} />
            </View>
            <View style={styles.alqText}>
              <Text style={styles.alqTitle}>Reservá un espacio</Text>
              <Text style={styles.alqSub}>Cancha · Salón · Salón + Cancha</Text>
            </View>
            <Ionicons name="chevron-forward-outline" size={20} color={colors.muted} />
          </TouchableOpacity>
        </Animated.View>

        <View style={{ height: 12 }} />
      </ScrollView>
    </View>
  );
}

/* ─── Styles ────────────────────────────────────────────── */

const styles = StyleSheet.create({
  root:    { flex: 1, backgroundColor: colors.bg },
  scroll:  { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 32 },
  section: { marginBottom: 28 },

  /* Hero */
  saludo:    { ...typography.bodyMedium, fontSize: 14, color: colors.muted, marginBottom: 4 },
  heroTitle: { ...typography.display,   fontSize: 32, color: colors.text,  marginBottom: 20 },
  heroRed:   { color: colors.red },

  /* Cuota card */
  cuotaCard:  { borderRadius: radius.xl, overflow: 'hidden' },
  cuotaInner: { borderRadius: radius.xl, padding: 20, backgroundColor: colors.red },
  cuotaLabel: {
    ...typography.display,
    fontSize:      11,
    color:         colors.text,
    letterSpacing: 2,
    marginBottom:  12,
  },

  /* Login prompt */
  loginPromptRow:   { flexDirection: 'row', alignItems: 'center', paddingVertical: 4 },
  loginPromptTitle: { ...typography.bodySemiBold, fontSize: 15, color: colors.text, marginBottom: 2 },
  loginPromptSub:   { ...typography.body, fontSize: 12, color: colors.text },

  /* Cuota data */
  cuotaTitulo:  { ...typography.display, fontSize: 22, color: colors.text, marginBottom: 10 },
  cuotaRow:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  cuotaMonto:   { ...typography.bodyBold, fontSize: 24, color: colors.text },
  cuotaFecha:   { ...typography.body,     fontSize: 13, color: colors.text },
  cuotaActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  pagarBtn: {
    backgroundColor:   colors.glass,
    borderWidth:       1,
    borderColor:       colors.glassBorder,
    borderRadius:      radius.sm,
    paddingHorizontal: 16,
    paddingVertical:   8,
  },
  pagarBtnText: { ...typography.bodyBold, fontSize: 14, color: colors.text },
  estadoBadge: {
    borderWidth:       1,
    borderRadius:      radius.sm,
    paddingHorizontal: 10,
    paddingVertical:   6,
  },
  estadoText: { ...typography.bodyBold, fontSize: 11, letterSpacing: 1 },
  cuotaAlDia: { ...typography.bodyMedium, fontSize: 15, color: colors.text, marginTop: 4 },

  /* Section title */
  sectionTitle: {
    ...typography.display,
    fontSize:      12,
    color:         colors.muted,
    letterSpacing: 2,
    marginBottom:  14,
  },

  /* Quick access grid */
  quickGrid: { flexDirection: 'row', gap: 8 },
  quickItem: { flex: 1, alignItems: 'center', gap: 8 },
  quickIcon: {
    width:          56,
    height:         56,
    borderRadius:   18,
    alignItems:     'center',
    justifyContent: 'center',
  },
  quickIconDefault: {
    backgroundColor: colors.surface2,
    borderWidth:     1,
    borderColor:     colors.glassBorder,
  },
  quickIconHighlight: {
    backgroundColor: colors.red,
  },
  quickLabel: { ...typography.body, fontSize: 11, color: colors.muted, textAlign: 'center' },

  /* Disciplinas */
  discScroll: { gap: 10, paddingRight: 4 },
  discCard: {
    width:           120,
    backgroundColor: colors.surface,
    borderRadius:    radius.lg,
    padding:         14,
    borderWidth:     1,
    borderColor:     colors.border,
    gap:             6,
  },
  discEmoji:     { fontSize: 26 },
  discName:      { ...typography.bodyMedium, fontSize: 13, color: colors.text },
  discPrecio:    { ...typography.body,       fontSize: 11, color: colors.muted },
  discBadge: {
    alignSelf:         'flex-start',
    backgroundColor:   colors.greenDim,
    borderRadius:      6,
    paddingHorizontal: 6,
    paddingVertical:   3,
  },
  discBadgeText: { ...typography.bodyBold, fontSize: 9, color: colors.green, letterSpacing: 1 },
  discEmpty: {
    backgroundColor: colors.surface,
    borderRadius:    radius.md,
    padding:         20,
    alignItems:      'center',
    borderWidth:     1,
    borderColor:     colors.border,
  },
  discEmptyText: { ...typography.body, fontSize: 13, color: colors.muted },

  /* Alquiler CTA */
  alqCard: {
    flexDirection:   'row',
    alignItems:      'center',
    backgroundColor: colors.surface,
    borderWidth:     1,
    borderColor:     colors.glassBorder,
    borderRadius:    radius.md,
    padding:         18,
  },
  alqIconBox: {
    width:           52,
    height:          52,
    borderRadius:    radius.sm,
    backgroundColor: colors.redDim,
    alignItems:      'center',
    justifyContent:  'center',
  },
  alqText:  { flex: 1, marginLeft: 14 },
  alqTitle: { ...typography.bodySemiBold, fontSize: 15, color: colors.text },
  alqSub:   { ...typography.body,         fontSize: 12, color: colors.muted, marginTop: 3 },
});
