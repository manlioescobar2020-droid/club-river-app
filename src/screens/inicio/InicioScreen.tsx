import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
  StatusBar,
  Alert,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';

import { useAuth } from '../../context/AuthContext';
import cuotasService, { Cuota } from '../../services/cuotasService';
import { disciplinasService } from '../../services/disciplinasService';
import suscripcionService from '../../services/suscripcionService';
import { Disciplina } from '../../types/disciplinas';
import { Suscripcion, SuscripcionPreview } from '../../types/suscripcion';
import { colors, radius, typography } from '../../theme';
import { getDisciplinaImage } from '../../constants/disciplinasImages';

/* ─── Helpers ──────────────────────────────────────────── */

function formatFecha(str: string): string {
  const [yyyy, mm, dd] = str.slice(0, 10).split('-');
  return `${dd}/${mm}/${yyyy}`;
}

function formatMonto(monto: number): string {
  return `$${monto.toLocaleString('es-AR')}`;
}

const ESTADO_COLOR: Record<string, string> = {
  PENDIENTE: colors.yellow,
  VENCIDA:   colors.redBright,
  PAGADA:    colors.green,
};

const SUSC_BADGE: Record<string, { color: string; bg: string; label: string }> = {
  AUTHORIZED: { color: colors.green,  bg: colors.greenDim,  label: 'ACTIVO'    },
  PENDING:    { color: colors.yellow, bg: colors.yellowDim, label: 'PENDIENTE' },
  PAUSED:     { color: colors.yellow, bg: colors.yellowDim, label: 'PAUSADA'   },
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
  { label: 'Cuotas',      icon: 'card-outline',      highlight: true,  route: 'Cuotas'      },
  { label: 'Alquilar',    icon: 'calendar-outline',  highlight: false, route: 'Alquileres'  },
  { label: 'Disciplinas', icon: 'trophy-outline',    highlight: false, route: 'Disciplinas' },
];

/* ─── Screen ───────────────────────────────────────────── */

export default function InicioScreen() {
  const { user }   = useAuth();
  const navigation = useNavigation<any>();
  const insets     = useSafeAreaInsets();

  const [cuota, setCuota]               = useState<Cuota | null>(null);
  const [cuotaError, setCuotaError]     = useState(false);
  const [disciplinas, setDisciplinas]   = useState<Disciplina[]>([]);
  const [loadingDisc, setLoadingDisc]   = useState(true);

  const [suscripcion, setSuscripcion]         = useState<Suscripcion | null>(null);
  const [suscPreview, setSuscPreview]         = useState<SuscripcionPreview | null>(null);
  const [suscError, setSuscError]             = useState<'session' | 'generic' | null>(null);
  const [loadingSusc, setLoadingSusc]         = useState(true);
  const [incluyeDisciplinas, setIncluyeDisc]  = useState(false);
  const [accionSuscCargando, setAccionSusc]   = useState(false);

  const mountedRef = useRef(true);
  useEffect(() => () => { mountedRef.current = false; }, []);

  const heroAnim = useSectionAnim(0);
  const gridAnim = useSectionAnim(100);
  const discAnim = useSectionAnim(200);
  const alqAnim  = useSectionAnim(300);
  const suscAnim = useSectionAnim(400);

  const cargarCuotas = useCallback(async () => {
    try {
      const data = await cuotasService.getCuotas();
      if (!mountedRef.current) return;
      const next = data
        .filter(c => c.estado === 'PENDIENTE' || c.estado === 'VENCIDA')
        .sort((a, b) => new Date(a.fechaVencimiento).getTime() - new Date(b.fechaVencimiento).getTime())[0];
      setCuota(next ?? null);
      setCuotaError(false);
    } catch {
      if (!mountedRef.current) return;
      setCuota(null);
      setCuotaError(true);
    }
  }, []);

  const cargarSuscripcion = useCallback(async () => {
    try {
      const { suscripcion, preview } = await suscripcionService.getSuscripcion();
      if (!mountedRef.current) return;
      setSuscripcion(suscripcion);
      setSuscPreview(preview);
      setSuscError(null);
    } catch (err: any) {
      if (!mountedRef.current) return;
      setSuscError(err?.status === 401 || err?.status === 403 ? 'session' : 'generic');
    }
  }, []);

  function handleReintentarSusc() {
    setLoadingSusc(true);
    cargarSuscripcion().finally(() => { if (mountedRef.current) setLoadingSusc(false); });
  }

  async function handleAdherirse() {
    setAccionSusc(true);
    try {
      const { init_point } = await suscripcionService.crearSuscripcion(incluyeDisciplinas);
      if (!init_point) {
        Alert.alert('Error', 'No se recibió el link de autorización. Intentá de nuevo.');
        return;
      }
      await WebBrowser.openBrowserAsync(init_point);
      await cargarSuscripcion();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'No se pudo iniciar la adhesión.');
    } finally {
      setAccionSusc(false);
    }
  }

  async function handleContinuarMp() {
    if (!suscripcion?.initPoint) return;
    setAccionSusc(true);
    try {
      await WebBrowser.openBrowserAsync(suscripcion.initPoint);
      await cargarSuscripcion();
    } finally {
      setAccionSusc(false);
    }
  }

  async function ejecutarCancelacion() {
    setAccionSusc(true);
    try {
      await suscripcionService.cancelarSuscripcion();
      await cargarSuscripcion();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'No se pudo cancelar el pago automático.');
    } finally {
      setAccionSusc(false);
    }
  }

  function handleCancelarSusc() {
    Alert.alert(
      'Cancelar pago automático',
      '¿Confirmás que querés cancelar el débito automático? Vas a seguir siendo socio pero tendrás que pagar las cuotas manualmente.',
      [
        { text: 'Volver', style: 'cancel' },
        { text: 'Sí, cancelar', style: 'destructive', onPress: ejecutarCancelacion },
      ]
    );
  }

  useFocusEffect(
    useCallback(() => {
      let active = true;

      setLoadingDisc(true);
      disciplinasService.obtenerDisciplinas()
        .then(data => {
          if (!active) return;
          const unicas = data.filter(d => d.activa)
            .filter((d, index, self) =>
              index === self.findIndex(x => x.id === d.id)
            );
          setDisciplinas(unicas);
        })
        .catch(() => {})
        .finally(() => { if (active) setLoadingDisc(false); });

      if (user) {
        cargarCuotas();

        setLoadingSusc(true);
        cargarSuscripcion().finally(() => { if (active) setLoadingSusc(false); });
      } else {
        setCuota(null);
        setCuotaError(false);
        setSuscripcion(null);
        setSuscError(null);
        setLoadingSusc(false);
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
              ) : cuotaError ? (
                <Text style={styles.cuotaAlDia}>⚠️ No pudimos cargar tus cuotas</Text>
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
                  <Image
                    source={d.imagenUrl ? { uri: d.imagenUrl } : getDisciplinaImage(d.nombre)}
                    style={{ width: 80, height: 80, borderRadius: 12 }}
                    resizeMode="cover"
                  />
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
            <Image
              source={require('../../../assets/images/card_asociarse.png')}
              style={{ width: 56, height: 56, borderRadius: 10 }}
              resizeMode="cover"
            />
            <View style={styles.alqText}>
              <Text style={styles.alqTitle}>Reservá un espacio</Text>
              <Text style={styles.alqSub}>Cancha · Salón · Salón + Cancha</Text>
            </View>
            <Ionicons name="chevron-forward-outline" size={20} color={colors.muted} />
          </TouchableOpacity>
        </Animated.View>

        {/* ── Sección 5: Pago automático ─────────────────── */}
        {user && (
          <Animated.View style={[styles.section, suscAnim]}>
            <Text style={styles.sectionTitle}>PAGO AUTOMÁTICO</Text>

            {loadingSusc ? (
              <ActivityIndicator color={colors.red} style={{ marginVertical: 20 }} />
            ) : suscError === 'session' ? (
              <View style={styles.suscCard}>
                <View style={styles.suscHeaderRow}>
                  <View style={styles.suscIconBox}>
                    <Ionicons name="alert-circle-outline" size={20} color={colors.yellow} />
                  </View>
                  <View style={{ flex: 1, marginLeft: 14 }}>
                    <Text style={styles.suscTitle}>No pudimos verificar tu suscripción</Text>
                    <Text style={styles.suscSub}>
                      Cerrá sesión y volvé a ingresar para actualizar tus datos.
                    </Text>
                  </View>
                </View>
              </View>
            ) : suscError === 'generic' ? (
              <View style={styles.suscCard}>
                <View style={styles.suscHeaderRow}>
                  <View style={styles.suscIconBox}>
                    <Ionicons name="cloud-offline-outline" size={20} color={colors.muted} />
                  </View>
                  <View style={{ flex: 1, marginLeft: 14 }}>
                    <Text style={styles.suscTitle}>No pudimos cargar tu pago automático</Text>
                    <Text style={styles.suscSub}>Revisá tu conexión e intentá de nuevo.</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.suscBtnPrimary}
                  onPress={handleReintentarSusc}
                  activeOpacity={0.85}
                >
                  <Text style={styles.suscBtnPrimaryText}>Reintentar</Text>
                </TouchableOpacity>
              </View>
            ) : !suscripcion || suscripcion.estado === 'CANCELLED' ? (
              <View style={styles.suscCard}>
                <View style={styles.suscHeaderRow}>
                  <View style={styles.suscIconBox}>
                    <Ionicons name="flash-outline" size={20} color={colors.red} />
                  </View>
                  <View style={{ flex: 1, marginLeft: 14 }}>
                    <Text style={styles.suscTitle}>Activá el pago automático</Text>
                    <Text style={styles.suscSub}>
                      Débito mensual vía Mercado Pago — no te olvides más de pagar la cuota.
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.suscCheckRow}
                  onPress={() => setIncluyeDisc(v => !v)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={incluyeDisciplinas ? 'checkbox' : 'checkbox-outline'}
                    size={22}
                    color={incluyeDisciplinas ? colors.red : colors.muted}
                  />
                  <Text style={styles.suscCheckLabel}>Incluir cuotas de disciplinas</Text>
                </TouchableOpacity>

                {suscPreview && (
                  <View style={styles.suscDataBox}>
                    <View style={styles.suscDataRow}>
                      <Text style={styles.suscDataLabel}>Total a debitar</Text>
                      <Text style={styles.suscDataValue}>
                        {formatMonto(
                          suscPreview.montoBase + (incluyeDisciplinas ? suscPreview.montoDisciplinas : 0)
                        )}/mes
                      </Text>
                    </View>
                    {incluyeDisciplinas && suscPreview.montoDisciplinas > 0 && (
                      <Text style={styles.suscSub}>
                        {suscPreview.disciplinas
                          .map(d => `${d.nombre} ${formatMonto(d.monto)}`)
                          .join(' + ')}
                      </Text>
                    )}
                  </View>
                )}

                <TouchableOpacity
                  style={[styles.suscBtnPrimary, accionSuscCargando && styles.suscBtnDisabled]}
                  onPress={handleAdherirse}
                  disabled={accionSuscCargando}
                  activeOpacity={0.85}
                >
                  {accionSuscCargando ? (
                    <ActivityIndicator color={colors.text} size="small" />
                  ) : (
                    <Text style={styles.suscBtnPrimaryText}>Adherirme al pago automático</Text>
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              <View style={[styles.suscCard, { backgroundColor: SUSC_BADGE[suscripcion.estado].bg }]}>
                <View style={styles.suscHeaderRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.suscTitle}>
                      {suscripcion.estado === 'AUTHORIZED'
                        ? 'Pago automático activo'
                        : suscripcion.estado === 'PENDING'
                        ? 'Falta autorizar en Mercado Pago'
                        : 'Pago automático pausado'}
                    </Text>
                  </View>
                  <View style={[styles.suscBadge, { borderColor: SUSC_BADGE[suscripcion.estado].color }]}>
                    <Text style={[styles.suscBadgeText, { color: SUSC_BADGE[suscripcion.estado].color }]}>
                      {SUSC_BADGE[suscripcion.estado].label}
                    </Text>
                  </View>
                </View>

                <View style={styles.suscDataBox}>
                  <View style={styles.suscDataRow}>
                    <Text style={styles.suscDataLabel}>Monto mensual</Text>
                    <Text style={styles.suscDataValue}>
                      ${Number(suscripcion.montoMensual).toLocaleString('es-AR')}
                    </Text>
                  </View>
                  <View style={styles.suscDataRow}>
                    <Text style={styles.suscDataLabel}>Incluye</Text>
                    <Text style={styles.suscDataValue}>
                      {[
                        suscripcion.incluyeSocietaria  ? 'Cuota societaria' : null,
                        suscripcion.incluyeDisciplinas ? 'Disciplinas'      : null,
                      ].filter(Boolean).join(' + ')}
                    </Text>
                  </View>
                  {suscripcion.ultimoPagoFecha && (
                    <View style={styles.suscDataRow}>
                      <Text style={styles.suscDataLabel}>Último débito</Text>
                      <Text style={styles.suscDataValue}>{formatFecha(suscripcion.ultimoPagoFecha)}</Text>
                    </View>
                  )}
                </View>

                {suscripcion.estado !== 'AUTHORIZED' && suscripcion.initPoint && (
                  <TouchableOpacity
                    style={[styles.suscBtnPrimary, accionSuscCargando && styles.suscBtnDisabled]}
                    onPress={handleContinuarMp}
                    disabled={accionSuscCargando}
                    activeOpacity={0.85}
                  >
                    {accionSuscCargando ? (
                      <ActivityIndicator color={colors.text} size="small" />
                    ) : (
                      <Text style={styles.suscBtnPrimaryText}>
                        {suscripcion.estado === 'PENDING' ? 'Completar autorización' : 'Reactivar en Mercado Pago'}
                      </Text>
                    )}
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={styles.suscBtnSecondary}
                  onPress={handleCancelarSusc}
                  disabled={accionSuscCargando}
                  activeOpacity={0.7}
                >
                  <Text style={styles.suscBtnSecondaryText}>Cancelar pago automático</Text>
                </TouchableOpacity>
              </View>
            )}
          </Animated.View>
        )}

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

  /* Pago automático */
  suscCard: {
    backgroundColor: colors.surface,
    borderWidth:     1,
    borderColor:     colors.glassBorder,
    borderRadius:    radius.md,
    padding:         18,
  },
  suscHeaderRow: { flexDirection: 'row', alignItems: 'flex-start' },
  suscIconBox: {
    width:           40,
    height:          40,
    borderRadius:    radius.sm,
    backgroundColor: colors.redDim,
    alignItems:      'center',
    justifyContent:  'center',
  },
  suscTitle: { ...typography.bodySemiBold, fontSize: 15, color: colors.text },
  suscSub:   { ...typography.body,         fontSize: 12, color: colors.muted, marginTop: 3 },
  suscBadge: {
    borderWidth:       1,
    borderRadius:      radius.sm,
    paddingHorizontal: 10,
    paddingVertical:   4,
    marginLeft:        10,
  },
  suscBadgeText: { ...typography.bodyBold, fontSize: 10, letterSpacing: 1 },

  suscCheckRow:   { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 16 },
  suscCheckLabel: { ...typography.body, fontSize: 13, color: colors.text },

  suscBtnPrimary: {
    marginTop:        16,
    backgroundColor:  colors.red,
    borderRadius:     radius.sm,
    paddingVertical:  13,
    alignItems:       'center',
    justifyContent:   'center',
  },
  suscBtnDisabled:     { opacity: 0.6 },
  suscBtnPrimaryText:  { ...typography.bodyBold, fontSize: 14, color: colors.text },

  suscBtnSecondary: {
    marginTop:        10,
    alignItems:       'center',
    justifyContent:   'center',
    paddingVertical:  8,
  },
  suscBtnSecondaryText: { ...typography.bodyMedium, fontSize: 12, color: colors.muted },

  suscDataBox: {
    marginTop:         16,
    backgroundColor:   colors.glass,
    borderRadius:      radius.sm,
    paddingHorizontal: 14,
    paddingVertical:   12,
    gap:               8,
  },
  suscDataRow:   { flexDirection: 'row', justifyContent: 'space-between' },
  suscDataLabel: { ...typography.body,     fontSize: 12, color: colors.muted },
  suscDataValue: { ...typography.bodyBold, fontSize: 13, color: colors.text },
});
